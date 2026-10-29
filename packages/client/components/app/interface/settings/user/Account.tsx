import { useClient } from "@revolt/client";
import { createOwnProfileResource } from "@revolt/client/resources";
import { Column } from "@revolt/ui";

import { useSettingsNavigation } from "../Settings";

import { UserSummary } from "./account/index";
import { KeepAccount } from "../../../../../src/awakyn/KeepAccount";

/**
 * Account Page
 */
export function MyAccount() {
  const client = useClient();
  const profile = createOwnProfileResource();
  const { navigate } = useSettingsNavigation();

  return (
    <Column gap="lg">
      <UserSummary
        user={client().user!}
        bannerUrl={profile.data?.animatedBannerURL}
        onEdit={() => navigate("profile")}
        showBadges
      />
      {/* Awakyn: Google looks after sign-in, so Stoat's email, password and two-step settings don't apply */}
      <KeepAccount />
    </Column>
  );
}
