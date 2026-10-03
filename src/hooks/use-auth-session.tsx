import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { subscribeAuth } from '@/services/auth-service';
import type { AuthUser } from '@/services/auth-types';
import { syncGoldCustomer } from '@/services/gold-subscription';

type AuthSession = {
  status: 'loading' | 'signedOut' | 'signedIn' | 'unavailable';
  user: AuthUser | null;
};

const AuthSessionContext = createContext<AuthSession>({ status: 'loading', user: null });

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ status: 'loading', user: null });

  useEffect(() => subscribeAuth(
    (user) => {
      void syncGoldCustomer(user?.uid ?? null).catch(() => {});
      setSession({ status: user ? 'signedIn' : 'signedOut', user });
    },
    () => setSession({ status: 'unavailable', user: null }),
  ), []);

  return <AuthSessionContext.Provider value={session}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
