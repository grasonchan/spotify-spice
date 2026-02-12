import { originPlayer } from '../lib/spicetify.js';

export const playerUpdate = (cb) =>
  originPlayer._events.addListener('update', cb);

export const queueUpdate = (cb) =>
  originPlayer._events.addListener('queue_update', cb);

export const fadRequest = (cb) => {
  window.addEventListener('fad-request', cb);
  return () => window.removeEventListener('fad-request', cb);
};
