import { createResource, createSignal, For, Show } from "solid-js";

import { useState } from "@revolt/state";
import { Button, Column, Row, Text, TextField } from "@revolt/ui";

import { ActionButton } from "../ActionButton";
import { appAddress } from "../appAddress";
import type { CallRoom } from "../gateway";
import { gateway } from "../gatewayClient";
import { MAX_NAME_LENGTH } from "../join/joinFlow";
import { callLink, shortDate } from "./callLinks";

const COPY = {
  newRoom: "New call room",
  roomName: "Room name",
  create: "Create",
  creating: "Creating…",
  created: "Created",
  copy: "Copy link",
  copying: "Copying…",
  copied: "Copied",
  fresh: "New link",
  turnOn: "Turn on",
  making: "Making…",
  made: "Done",
  switchOff: "Switch off",
  switching: "Switching off…",
  switchedOff: "Switched off",
  linkOff: "Link off",
  remove: "Delete room",
  confirmRemove: "Tap again to delete",
  removing: "Deleting…",
  removed: "Deleted",
  none: "No call rooms yet.",
};

/** Taylan's call rooms: make one, copy its link, replace or switch off the link, delete it. */
export function CallLinks() {
  const state = useState();
  const token = () => state.auth.getSession()!.token;
  const [rooms, { mutate, refetch }] = createResource(async () => (await gateway.callRooms(token())).rooms);
  const [name, setName] = createSignal("");
  const address = appAddress(location.origin, import.meta.env.BASE_URL);

  const replace = (room: CallRoom) => mutate((all) => all?.map((r) => (r.id === room.id ? room : r)));

  async function create() {
    const room = await gateway.createCallRoom(token(), name());
    setName("");
    mutate((all) => [room, ...(all ?? [])]);
  }

  return (
    <Column gap="lg">
      <Column>
        <Text class="title">{COPY.newRoom}</Text>
        <Row gap="md" style={{ "align-items": "center", "flex-wrap": "wrap" }}>
          <TextField
            label={COPY.roomName}
            maxlength={MAX_NAME_LENGTH}
            value={name()}
            onInput={(e: InputEvent) => setName((e.currentTarget as HTMLInputElement).value)}
          />
          <ActionButton
            variant="filled"
            label={COPY.create}
            working={COPY.creating}
            done={COPY.created}
            isDisabled={!name().trim()}
            run={create}
          />
        </Row>
      </Column>

      <Show when={rooms.error}>
        <span role="status" style={{ color: "var(--md-sys-color-error)" }}>
          {(rooms.error as Error).message}
        </span>
        <ActionButton label="Try again" working="Loading…" done="Loaded" run={refetch as () => Promise<unknown>} />
      </Show>
      <Show when={rooms() && rooms()!.length === 0}>
        <Text>{COPY.none}</Text>
      </Show>
      <For each={rooms()}>
        {(room) => (
          <RoomRow
            room={room}
            address={address}
            token={token}
            onChange={replace}
            onRemoved={() => mutate((all) => all?.filter((r) => r.id !== room.id))}
          />
        )}
      </For>
    </Column>
  );
}

function RoomRow(props: {
  room: CallRoom;
  address: string;
  token: () => string;
  onChange: (room: CallRoom) => void;
  onRemoved: () => void;
}) {
  const [confirming, setConfirming] = createSignal(false);
  const link = () => (props.room.code ? callLink(props.address, props.room.code) : null);

  async function remove() {
    await gateway.deleteCallRoom(props.token(), props.room.id);
    props.onRemoved();
  }

  return (
    <Column gap="sm" data-call-room={props.room.id} style={{ "padding-block": "12px", "border-top": "1px solid var(--md-sys-color-outline-variant)" }}>
      <Row gap="md" style={{ "align-items": "baseline", "flex-wrap": "wrap" }}>
        <Text class="title">{props.room.name}</Text>
        <Text class="label">{shortDate(props.room.createdAt)}</Text>
      </Row>
      <Text class="label" style={{ "user-select": "all", "overflow-wrap": "anywhere" }}>
        {link() ?? COPY.linkOff}
      </Text>
      <Row gap="sm" style={{ "flex-wrap": "wrap" }}>
        <Show when={link()}>
          <ActionButton
            variant="filled"
            label={COPY.copy}
            working={COPY.copying}
            done={COPY.copied}
            run={() => navigator.clipboard.writeText(link()!)}
          />
        </Show>
        <ActionButton
          label={link() ? COPY.fresh : COPY.turnOn}
          working={COPY.making}
          done={COPY.made}
          run={async () => props.onChange(await gateway.freshCallLink(props.token(), props.room.id))}
        />
        <Show when={link()}>
          <ActionButton
            label={COPY.switchOff}
            working={COPY.switching}
            done={COPY.switchedOff}
            run={async () => props.onChange(await gateway.switchOffCallLink(props.token(), props.room.id))}
          />
        </Show>
        <Show
          when={confirming()}
          fallback={
            <Button variant="outlined" onPress={() => setConfirming(true)}>
              {COPY.remove}
            </Button>
          }
        >
          <ActionButton variant="outlined" label={COPY.confirmRemove} working={COPY.removing} done={COPY.removed} run={remove} />
        </Show>
      </Row>
    </Column>
  );
}
