import { CONFIGURATION } from "@revolt/common";

import { createGateway, gatewayUrl } from "./gateway";

/** The app's one gateway connection, beside the community's server. */
export const gateway = createGateway(gatewayUrl(CONFIGURATION.DEFAULT_API_URL));
