import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Button, Column, Header, Text, iconSize, main } from "@revolt/ui";

import MdChat from "@material-design-icons/svg/filled/chat.svg?component-solid";

// Awakyn: our wordmark and wording instead of Stoat's
import { BRAND } from "../awakyn/brand";
import { Wordmark } from "../awakyn/Wordmark";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Base layout of the home page (i.e. the header/background)
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    color: "var(--md-sys-color-on-surface)",
  },
});

/**
 * Layout of the content as a whole
 */
const content = cva({
  base: {
    ...main.raw(),

    padding: "48px 0",

    gap: "32px",
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * Direct messages with no conversation open
 */
export function MessagesHome() {
  const navigate = useNavigate();
  const client = useClient();
  const state = useState();

  const hasConversations = () =>
    state.ordering.orderedConversations(client()).length > 0;

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <MdChat {...iconSize(22)} />
        </HeaderIcon>
        <Trans>Direct Messages</Trans>
      </Header>
      <div use:scrollable={{ class: content() }}>
        <Column>
          <Wordmark
            class={css({
              width: "160px",
              fill: "var(--md-sys-color-on-surface)",
            })}
          />
        </Column>
        {/* Awakyn: nothing else to say here once people have conversations */}
        <Show when={!hasConversations()}>
          <Text class="body" size="large">
            {BRAND.noConversationsYet}
          </Text>
        </Show>
        <Show when={IS_DEV}>
          <Button onPress={() => navigate("/dev")}>
            Open Development Page
          </Button>
        </Show>
      </div>
    </Base>
  );
}
