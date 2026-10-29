import type { Channel, User } from "stoat.js";

/**
 * A group's members the app has loaded. Stoat's `recipients` leaves an empty
 * slot for anyone not loaded yet (a guest who just joined by link), which
 * breaks anything that reads their name; ChannelPage loads the rest.
 */
export function loadedRecipients(channel: Channel): User[] {
  return channel.recipients.filter((user): user is User => user !== undefined);
}
