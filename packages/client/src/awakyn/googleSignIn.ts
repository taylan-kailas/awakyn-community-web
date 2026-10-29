import type { Joined } from "./gateway";
import { gateway } from "./gatewayClient";

type Controller = { loginWithSession(session: Joined["session"]): void };

/**
 * What Continue with Google does with Google's token: signs the person in
 * (making their account first when `code` is an invite they came with).
 */
export function signInWithToken(controller: Controller, code?: string, then?: (joined: Joined) => void) {
  return async (idToken: string) => {
    const joined = await gateway.googleSignIn(idToken, code);
    controller.loginWithSession(joined.session);
    then?.(joined);
  };
}
