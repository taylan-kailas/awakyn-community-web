/**
 * "Continue with Google" through Firebase project awakyn, the sign-in every
 * Awakyn app shares. Gives back a Google sign-in token for the gateway.
 * A blocked pop-up falls back to a full-page redirect.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
} from "firebase/auth";

// The browser wouldn't open Google's window: go via Google's page instead.
const REDIRECT_FALLBACK_CODES = ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"];
// The person closed Google's window (or pressed twice): not an error, just "not now".
const CANCELLED_CODES = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
const NOT_SET_UP = "Google sign-in isn't set up for this app yet.";
const DID_NOT_FINISH = "Google sign-in didn't finish. Please try again.";
const SIGNED_OUT_OF_GOOGLE = "Google sign-in was cancelled.";

let auth: Auth | null = null;

function firebaseAuth(): Auth {
  if (auth) return auth;
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) throw new Error(NOT_SET_UP);
  const app: FirebaseApp = initializeApp(config);
  auth = getAuth(app);
  return auth;
}

function errorCode(error: unknown): string {
  return (error as { code?: string })?.code ?? "";
}

/** Signs in with Google: a token, "redirecting" when the page is leaving for Google, or null if cancelled. */
export async function signInWithGoogle(): Promise<string | "redirecting" | null> {
  const firebase = firebaseAuth();
  const provider = new GoogleAuthProvider();
  try {
    const { user } = await signInWithPopup(firebase, provider);
    return await user.getIdToken();
  } catch (error) {
    if (CANCELLED_CODES.includes(errorCode(error))) return null;
    if (!REDIRECT_FALLBACK_CODES.includes(errorCode(error))) {
      console.error("Google sign-in failed:", error);
      throw new Error(DID_NOT_FINISH);
    }
  }
  await signInWithRedirect(firebase, provider);
  return "redirecting";
}

/** After coming back from Google's page: its token, or null when nobody went. */
export async function takeRedirectResult(): Promise<string | null> {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) return null;
  try {
    const result = await getRedirectResult(firebaseAuth());
    return result ? await result.user.getIdToken() : null;
  } catch (error) {
    console.error("Google sign-in (redirect) failed:", error);
    throw new Error(errorCode(error) === "auth/user-cancelled" ? SIGNED_OUT_OF_GOOGLE : DID_NOT_FINISH);
  }
}
