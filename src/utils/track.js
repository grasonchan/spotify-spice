import { HEART_STATUS } from '../config/constants.js';

export function getPlayStatus({ item, isPaused, isBuffering }) {
  const playStatus = ![!item, isPaused, isBuffering].some((el) => el);
  return playStatus;
}

export function getHeartStatus({ item }) {
  const { DEFAULT, COLLECTED, DISABLED } = HEART_STATUS;
  const status =
    !item || item.metadata['collection.can_add'] !== 'true'
      ? DISABLED
      : item.metadata['collection.in_collection'] === 'true'
        ? COLLECTED
        : DEFAULT;
  return status;
}

export function getAdjacentTracks(
  { prevTracks = [], nextTracks = [] } = {},
  mapper
) {
  const getTrack = (tracks) => {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const {
        provider,
        contextTrack: { metadata },
      } = track;
      if (provider === 'ad' || metadata.hidden) continue;
      return mapper ? mapper(track) : track;
    }
    return null;
  };
  return {
    prevTrack: getTrack([...prevTracks].reverse()),
    nextTrack: getTrack(nextTracks),
  };
}
