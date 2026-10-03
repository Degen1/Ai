import { getApp, getApps, initializeApp } from 'firebase/app';
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
} from 'firebase/auth';

import type { AuthErrorListener, AuthListener, AuthUser } from '@/services/auth-types';

function webAuth() {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_WEB_APP_ID;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !appId || !projectId) throw new Error('AUTH_NOT_CONFIGURED');

  const app = getApps().length ? getApp() : initializeApp({
    apiKey,
    appId,
    projectId,
    authDomain: `${projectId}.firebaseapp.com`,
  });
  return getAuth(app);
}

function projectUser(user: { uid: string; email: string | null; displayName: string | null }): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}

export function subscribeAuth(onChange: AuthListener, onError: AuthErrorListener) {
  try {
    return onAuthStateChanged(webAuth(), (user) => onChange(user ? projectUser(user) : null), onError);
  } catch (error) {
    onError(error);
    return () => {};
  }
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(webAuth(), email, password);
}

export async function register(email: string, password: string) {
  await createUserWithEmailAndPassword(webAuth(), email, password);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(webAuth(), email);
}

export async function updateAccountName(name: string) {
  const user = webAuth().currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  await updateProfile(user, { displayName: name });
}

async function reauthenticateAccount(currentPassword: string) {
  const user = webAuth().currentUser;
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
  await signOut(webAuth());
}

export async function deleteAccount() {
  const user = webAuth().currentUser;
  if (!user) throw new Error('AUTH_REQUIRED');
  await deleteUser(user);
}
