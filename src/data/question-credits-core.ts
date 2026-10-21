type Storage = { read: () => string | null; write: (value: string) => void };
type Credits = { remaining: number; pending: string[]; completed: string[]; rewards: string[] };
const initial = (): Credits => ({ remaining: 2, pending: [], completed: [], rewards: [] });

// Local allowance is shared across chats and sign-ins on this installation.
export function createQuestionCredits(storage: Storage) {
  let state = initial();
  const listeners = new Set<() => void>();
  try {
    const raw = storage.read();
    if (raw !== null) {
      const saved = JSON.parse(raw) as Credits;
      if (!Number.isInteger(saved.remaining) || saved.remaining < 0 || !Array.isArray(saved.pending) ||
          !Array.isArray(saved.completed) || !Array.isArray(saved.rewards)) throw new Error('INVALID_CREDITS');
      // An interrupted request did not deliver a response; return its reserved credit.
      state = { ...saved, remaining: saved.remaining + saved.pending.length, pending: [] };
    }
  } catch {
    state = { ...initial(), remaining: 0 };
  }
  const save = (next: Credits) => {
    storage.write(JSON.stringify(next));
    state = next;
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    reserve(id: string) {
      if (state.pending.includes(id)) return false;
      if (state.completed.includes(id)) return true;
      if (state.remaining < 1) return false;
      save({ ...state, remaining: state.remaining - 1, pending: [...state.pending, id] });
      return true;
    },
    complete(id: string) {
      if (!state.pending.includes(id)) return;
      save({ ...state, pending: state.pending.filter((item) => item !== id), completed: [...state.completed, id].slice(-200) });
    },
    refund(id: string) {
      if (!state.pending.includes(id)) return;
      save({ ...state, remaining: state.remaining + 1, pending: state.pending.filter((item) => item !== id) });
    },
    reward(id: string) {
      if (state.rewards.includes(id)) return;
      save({ ...state, remaining: state.remaining + 2, rewards: [...state.rewards, id].slice(-64) });
    },
    grantAdFallback(id: string) {
      // Grant only when the previous batch is fully used. Background failures
      // and duplicate callbacks must never accumulate unused free questions.
      if (state.remaining > 0 || state.pending.length > 0 || state.rewards.includes(id)) return false;
      save({ ...state, remaining: 2, rewards: [...state.rewards, id].slice(-64) });
      return true;
    },
  };
}
