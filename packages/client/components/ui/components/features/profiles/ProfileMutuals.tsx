import { For, Show } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { ServerMember, User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";

import { Avatar, Ripple, Text } from "../../design";

import { ProfileCard } from "./ProfileCard";

export function ProfileMutuals(props: { user: User; member?: ServerMember }) {
  const client = useClient();
  const { openModal } = useModals();

  const query = useQuery(() => ({
    queryKey: ["mutual", props.user.id],
    queryFn: async () => {
      if (props.user.self || props.user.bot) {
        return {
          groups: [],
        };
      }

      const clnt = client();
      const { servers } = await props.user.fetchMutual();

      return {
        groups: [
          ...servers
            .map((serverId) => clnt.servers.get(serverId)!)
            .filter((server) => server),
          ...clnt.channels.filter(
            (channel) =>
              channel.type === "Group" &&
              channel.recipientIds.has(props.user.id),
          ),
        ],
      };
    },
  }));

  /**
   * Open groups modal
   */
  function openGroups() {
    openModal({
      type: "user_profile_mutual_groups",
      groups: query.data!.groups,
    });
  }

  return (
    <>
      {/* Awakyn: no mutual friends card; everyone in the community is connected */}
      <Show when={query.data?.groups.length}>
        <ProfileCard isLink onClick={openGroups}>
          <Ripple />

          <Text class="title" size="large">
            Groups
          </Text>
          <Grid>
            <For each={query.data?.groups}>
              {(group) => (
                <Avatar
                  src={group.animatedIconURL}
                  fallback={group.name}
                  size={20}
                />
              )}
            </For>
          </Grid>
        </ProfileCard>
      </Show>
    </>
  );
}

const Grid = styled("div", {
  base: {
    gap: "var(--gap-md)",
    display: "flex",
    flexWrap: "wrap",
  },
});
