import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from '@react-native-firebase/auth';

import type { AuthErrorListener, AuthListener, AuthUser } from '@/services/auth-types';

function projectUser(user: { uid: string; email: string | null; displayName: string | null }): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}

export function subscribeAuth(onChange: AuthListener, onError: AuthErrorListener) {
  try {
    return onAuthStateChanged(getAuth(), (user) => onChange(user ? projectUser(user) : null), onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(getAuth(), email, password);
}

export async function register(email: string, password: string) {
  await createUserWithEmailAndPassword(getAuth(), email, password);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getAuth(), email);
}

export async function updateAccountName(name: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  await updateProfile(user, { displayName: name });
}

async function reauthenticateAccount(currentPassword: string) {
  const user = getAuth().currentUser;
  if (!user?.email) throw new Error('AUTH_REQUIRED');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
  return user;
}

export async function requestAccountEmailChange(email: string, currentPassword: string) {
  const user = await reauthenticateAccount(currentPassword);
  await verifyBeforeUpdateEmail(user, email);
}

export async function changeAccountPassword(password: string, currentPassword: string) {
  const user = await reauthenticateAccount(currentPassword);
  await updatePassword(user, password);
}

export async function logout() {
  await signOut(getAuth());
}

export async function deleteAccount() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  await deleteUser(user);
}
