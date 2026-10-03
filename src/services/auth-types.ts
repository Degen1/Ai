export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type AuthListener = (user: AuthUser | null) => void;
export type AuthErrorListener = (error: unknown) => void;
