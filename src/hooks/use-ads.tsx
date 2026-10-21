import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AppState, Keyboard, Platform } from 'react-native';
import type { RewardedAd } from 'react-native-google-mobile-ads';

import { REWARDED_AD_UNIT_IDS, USE_TEST_ADS } from '@/constants/admob';
import { questionCredits } from '@/data/question-credits';
import { useAuthSession } from '@/hooks/use-auth-session';
import { getAdsSdk } from '@/services/ad-sdk';
import { getGoldStatus, subscribeGoldStatus } from '@/services/gold-subscription';

type RewardState = 'idle' | 'loading' | 'ready' | 'showing' | 'error';
type Plan = 'checking' | 'free' | 'gold' | 'error';
const AdsContext = createContext<ReturnType<typeof useAdsController> | null>(null);
const noSubscribe = () => () => {};
const webSnapshot = { remaining: 2, pending: [], completed: [], rewards: [] };
const getWebSnapshot = () => webSnapshot;
let initialization: Promise<boolean> | null = null;
async function initializeAds() {
  const sdk = getAdsSdk();
  if (!sdk) return false;
  if (!initialization) initialization = (async () => {
    // Sara targets ages 13+: keep ad creative suitable for a general audience and
    // disable publisher-side personalization before initializing either ad format.
    await sdk.default().setRequestConfiguration({
      maxAdContentRating: sdk.MaxAdContentRating.G,
      publisherPrivacyPersonalizationState: 'disabled',
    });
    try { await sdk.AdsConsent.gatherConsent(); } catch { /* Check the prior consent if the update is offline. */ }
    const consent = await sdk.AdsConsent.getConsentInfo();
    if (!consent.canRequestAds) return false;
    await sdk.default().initialize();
    return true;
  })().catch(() => false).then((ready) => { if (!ready) initialization = null; return ready; });
  return initialization;
}

function useAdsController() {
  const native = Platform.OS === 'ios' || Platform.OS === 'android';
  const store = native ? questionCredits() : null;
  const credits = useSyncExternalStore(store?.subscribe ?? noSubscribe, store?.getSnapshot ?? getWebSnapshot, getWebSnapshot);
  const { status, user } = useAuthSession();
  const [planAttempt, setPlanAttempt] = useState(0);
  const identity = `${status}:${user?.uid ?? 'guest'}:${planAttempt}`;
  const [planResult, setPlanResult] = useState<{ identity: string; value: Plan } | null>(null);
  const plan: Plan = !native ? 'gold' : planResult?.identity === identity ? planResult.value : 'checking';
  const [adsReady, setAdsReady] = useState(false);
  const [privacyRequired, setPrivacyRequired] = useState(false);
  const [rewardState, setRewardState] = useState<RewardState>('loading');
  const [adUnavailable, setAdUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const rewarded = useRef<RewardedAd | null>(null);
  const showing = useRef(false);
  const pendingReward = useRef<string | null>(null);
  const loadedAt = useRef(0);

  useEffect(() => {
    if (!native || status === 'loading') return;
    let current = true;
    let revision = 0;
    const setPlan = (value: Plan) => setPlanResult({ identity, value });
    const unsubscribe = subscribeGoldStatus((active) => {
      revision += 1;
      if (current) setPlan(active ? 'gold' : 'free');
    });
    const requestedRevision = revision;
    void getGoldStatus().then((active) => {
      if (current && revision === requestedRevision) setPlan(active ? 'gold' : 'free');
    }).catch((error) => {
      if (!current || revision !== requestedRevision) return;
      setPlan(error instanceof Error && error.message === 'REVENUECAT_NOT_CONFIGURED' ? 'free' : 'error');
    });
    const foreground = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const requested = revision;
      void getGoldStatus().then((active) => {
        if (current && requested === revision) setPlan(active ? 'gold' : 'free');
      }).catch(() => {});
    });
    return () => { current = false; unsubscribe(); foreground.remove(); };
  }, [native, status, identity]);

  useEffect(() => {
    if (plan !== 'free' || !native) return;
    let current = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let ad: RewardedAd | null = null;
    let earned = false;
    let failed = false;
    const removers: (() => void)[] = [];
    const markUnavailable = () => {
      if (!current || failed || earned) return;
      failed = true;
      clearTimeout(timer);
      rewarded.current = null;
      showing.current = false;
      ad?.destroy();
      setAdUnavailable(true);
      setRewardState('error');
      setMessage(null);
      // Keep trying quietly while the user spends the next free batch.
      retryTimer = setTimeout(() => {
        if (current) setAttempt((value) => value + 1);
      }, 30000);
    };
    void (async () => {
      const ready = await initializeAds();
      if (!current) return;
      const sdk = getAdsSdk();
      if (!sdk) throw new Error('ADS_NOT_READY');
      const info = await sdk.AdsConsent.getConsentInfo();
      if (!current) return;
      setPrivacyRequired(info.privacyOptionsRequirementStatus === sdk.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED);
      if (!ready) throw new Error('ADS_NOT_READY');
      setAdsReady(true);
      setRewardState('loading');
      const unit = USE_TEST_ADS ? sdk.TestIds.REWARDED : REWARDED_AD_UNIT_IDS[Platform.OS === 'ios' ? 'ios' : 'android'];
      ad = sdk.RewardedAd.createForAdRequest(unit, { requestNonPersonalizedAdsOnly: true });
      rewarded.current = ad;
      const rewardId = `reward-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      removers.push(ad.addAdEventListener(sdk.RewardedAdEventType.LOADED, () => {
        if (!current || failed) return;
        clearTimeout(timer);
        loadedAt.current = Date.now();
        setAdUnavailable(false);
        setRewardState('ready');
      }));
      removers.push(ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => {
        if (!current || failed || earned) return;
        earned = true;
        pendingReward.current = rewardId;
        try {
          store?.reward(rewardId);
          pendingReward.current = null;
          setMessage(null);
        } catch { setMessage('እተን 2 ሕቶታት ክዕቀባ ኣይከኣላን። ቦታ መዕቀቢኻ ፈትሽ።'); }
      }));
      removers.push(ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
        if (!current || failed) return;
        showing.current = false;
        setRewardState('loading');
        if (!earned) setMessage('2 ተወሰኽቲ ሕቶታት ንምርካብ ነቲ ማስታወቂያ ክሳዕ መወዳእታ ርአ።');
        // Prepare the next ad without asking the user to retry a closed one.
        rewarded.current = null;
        setAttempt((value) => value + 1);
      }));
      removers.push(ad.addAdEventListener(sdk.AdEventType.ERROR, markUnavailable));
      timer = setTimeout(markUnavailable, 20000);
      ad.load();
    })().catch(markUnavailable);
    return () => {
      current = false;
      clearTimeout(timer);
      clearTimeout(retryTimer);
      removers.forEach((remove) => remove());
      rewarded.current = null;
      showing.current = false;
      ad?.destroy();
    };
  }, [plan, native, store, attempt]);

  const authorizeQuestion = useCallback((id: string) => {
    if (!native || plan === 'gold') return true;
    if (plan !== 'free') return false;
    try {
      if (pendingReward.current) {
        store!.reward(pendingReward.current);
        pendingReward.current = null;
      }
      if (adUnavailable && !showing.current) store!.grantAdFallback(`unavailable-${id}`);
      const allowed = store!.reserve(id);
      if (allowed) setQuestionError(null);
      return allowed;
    }
    catch { setQuestionError('ሕቶኻ ክዕቀብ ኣይከኣለን። ቦታ መዕቀቢኻ ፈትሽ።'); return false; }
  }, [adUnavailable, native, plan, store]);
  const completeQuestion = useCallback((id: string) => {
    try { store?.complete(id); } catch { setQuestionError('ሓበሬታ ሕቶኻ ክዕቀብ ኣይከኣለን።'); }
  }, [store]);
  const refundQuestion = useCallback((id: string) => {
    try { store?.refund(id); } catch { setQuestionError('ሓበሬታ ሕቶኻ ክዕቀብ ኣይከኣለን።'); }
  }, [store]);

  const watchReward = async () => {
    if (plan !== 'free' || credits.remaining > 0 || credits.pending.length > 0 || showing.current) return;
    if (pendingReward.current) {
      try { store?.reward(pendingReward.current); pendingReward.current = null; setMessage(null); }
      catch { setMessage('እተን 2 ሕቶታት ክዕቀባ ኣይከኣላን። ቦታ መዕቀቢኻ ፈትሽ።'); }
      return;
    }
    if (rewardState !== 'ready' || !rewarded.current || Date.now() - loadedAt.current > 55 * 60 * 1000) { setRewardState('loading'); setMessage(null); setAttempt((value) => value + 1); return; }
    showing.current = true;
    setRewardState('showing');
    setMessage(null);
    Keyboard.dismiss();
    try { await rewarded.current.show(); }
    catch {
      showing.current = false;
      rewarded.current = null;
      setAdUnavailable(true);
      setRewardState('loading');
      setMessage(null);
      setAttempt((value) => value + 1);
    }
  };

  const showPrivacyOptions = async () => {
    const sdk = getAdsSdk();
    if (!sdk) return;
    setAdsReady(false);
    setRewardState('loading');
    Keyboard.dismiss();
    try {
      await sdk.AdsConsent.showPrivacyOptionsForm();
      initialization = null;
      setAttempt((value) => value + 1);
    } catch {
      setMessage('ምርጫታት ብሕትውና ክኽፈታ ኣይከኣላን።');
      setAttempt((value) => value + 1);
    }
  };

  return {
    gold: plan === 'gold', native, plan, remaining: credits.remaining,
    adsReady: plan === 'free' && adsReady, privacyRequired, rewardState, adUnavailable,
    canAsk: !native || plan === 'gold' || (plan === 'free' && (credits.remaining > 0 || adUnavailable)),
    message: questionError ?? (!adUnavailable && credits.remaining === 0 ? message : null),
    canWatch: credits.pending.length === 0, authorizeQuestion, completeQuestion, refundQuestion,
    watchReward, showPrivacyOptions, retryPlan: () => setPlanAttempt((value) => value + 1),
  };
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const value = useAdsController();
  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}
export function useAds() {
  const value = useContext(AdsContext);
  if (!value) throw new Error('AdsProvider is required');
  return value;
}
