import { Match, Show, Switch, splitProps } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import { TextWithEmoji } from "@revolt/markdown";
import { useModals } from "@revolt/modal";
import {
  Avatar,
  Deferred,
  MenuButton,
  OverflowingText,
  Tooltip,
  UserStatus,
  iconSize,
  typography,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import MdClose from "@material-design-icons/svg/outlined/close.svg?component-solid";

import { SidebarBase } from "./common";

interface Props {
  /**
   * Ordered list of conversations
   */
  conversations: () => Channel[];

  /**
   * Current channel ID
   */
  channelId?: string;
}

/**
 * Display direct messages and groups
 */
export const HomeSidebar = (props: Props) => {
  const { t } = useLingui();
  const client = useClient();
  const { openModal } = useModals();
  const { isMobile } = useDevice();

  let scrollTargetElement!: HTMLDivElement;

  return (
    <SidebarBase class="channel_bar home">
      <div ref={scrollTargetElement} use:invisibleScrollable>
        <List>
          {/* Awakyn: one community, so no home page, friends or saved notes; just conversations */}
          <SidebarTitle>
            <Trans>Direct Messages</Trans>
            <a
              class={css({ cursor: "pointer" })}
              onClick={() =>
                openModal({
                  type: "create_group",
                  client: client(),
                })
              }
              use:floating={{
                tooltip: {
                  placement: "right",
                  content: t`Create a new group`,
                },
              }}
            >
              <Symbol size={20} marginTop="2px">
                add
              </Symbol>
            </a>
          </SidebarTitle>

          <Deferred>
            <VirtualContainer
              items={props.conversations()}
              scrollTarget={scrollTargetElement}
              itemSize={{ height: 48 }}
            >
              {(item) => (
                <div
                  style={{
                    ...item.style,
                    width: "100%",
                    "padding-block": "3px",
                  }}
                >
                  <Entry
                    // @ts-expect-error missing type on Entry
                    role="listitem"
                    tabIndex={item.tabIndex}
                    channel={item.item}
                    active={item.item.id === props.channelId}
                    isMobile={isMobile}
                  />
                </div>
              )}
            </VirtualContainer>
          </Deferred>
        </List>
      </div>
    </SidebarBase>
  );
};

/**
 * Sidebar title
 */
const SidebarTitle = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: "calc(var(--gap-md) + 15px)",
    paddingInline: "var(--gap-md)",

    ...typography.raw({ class: "title" }),
  },
});

/**
 * Styles required to correctly display name and status
 */
const NameStatusStack = styled("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

/**
 * Single conversation entry
 */
function Entry(
  props: { channel: Channel; active: boolean; isMobile: boolean } /*& Omit<
    ComponentProps<typeof Link>,
    "href"
  >*/,
) {
  const [local, remote] = splitProps(props, ["channel", "active", "isMobile"]);

  const { t } = useLingui();
  const { openModal } = useModals();

  /**
   * Determine user status if present
   */
  const status = () =>
    local.channel.recipient?.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Busy`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    );

  return (
    <MenuButton
      {...remote}
      href={`/channel/${local.channel.id}`}
      size="normal"
      alert={
        !local.active &&
        local.channel.unread &&
        (local.channel.mentions?.size || true)
      }
      attention={
        local.active
          ? "selected"
          : local.channel.muted
            ? "muted"
            : local.channel.unread
              ? "active"
              : "normal"
      }
      icon={
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <Avatar
              size={32}
              shape="rounded-square"
              fallback={local.channel.name}
              src={local.channel.iconURL}
              primaryContrast
            />
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <Avatar
              size={32}
              src={local.channel.iconURL}
              holepunch="bottom-right"
              overlay={
                <UserStatus.Graphic
                  status={local.channel?.recipient?.presence}
                />
              }
            />
          </Match>
        </Switch>
      }
      actions={
        <Show when={!local.isMobile}>
          <a
            onClick={(e) => {
              e.preventDefault();
              openModal({
                type: "delete_channel",
                channel: local.channel,
              });
            }}
          >
            <MdClose {...iconSize("18px")} />
          </a>
        </Show>
      }
      use:floating={{
        contextMenu: () =>
          local.channel.type === "DirectMessage" ? (
            <UserContextMenu
              user={local.channel.recipient!}
              channel={local.channel}
            />
          ) : (
            <ChannelContextMenu channel={local.channel} />
          ),
      }}
    >
      <NameStatusStack>
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <OverflowingText>
              <TextWithEmoji content={local.channel.name!} />
            </OverflowingText>
            <span class={typography({ class: "_status" })}>
              {/* <Plural
                  value={local.channel.recipientIds.size}
                  one="# Member"
                  other="# Members"
                /> */}
              {local.channel.recipientIds.size}{" "}
              {local.channel.recipientIds.size > 1 ? `Members` : "Member"}
            </span>
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <OverflowingText>
              {local.channel?.recipient?.displayName}
            </OverflowingText>
            <Show when={status()}>
              <Tooltip
                content={() => <TextWithEmoji content={status()!} />}
                placement="top-start"
                aria={status()!}
              >
                <OverflowingText class={typography({ class: "_status" })}>
                  <TextWithEmoji content={status()!} />
                </OverflowingText>
              </Tooltip>
            </Show>
          </Match>
        </Switch>
      </NameStatusStack>
    </MenuButton>
  );
}

/**
 * Inner scrollable list
 * We fix the width in order to prevent scrollbar from moving stuff around
 */
const List = styled("div", {
  base: {
    paddingLeft: "var(--gap-md)",
    width: "var(--layout-width-channel-sidebar)",
  },
});
