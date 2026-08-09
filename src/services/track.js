import { URI } from '@/lib/spicetify.js';
import { requestGraphQL } from '@/lib/graphql.js';

const assertTrackURI = (uri) => {
  if (!URI.isTrack(uri)) {
    throw new TypeError(`Expected a track URI, but received: "${uri}"`);
  }
};

const validateTrackUnion = ({ trackUnion }) => {
  const typeName = trackUnion.__typename;
  if (typeName && typeName !== 'Track') {
    return {
      name: typeName,
      message: trackUnion.message,
    };
  }
  if (!trackUnion.albumOfTrack) {
    return { message: 'Response is missing expected data' };
  }
};

export const getTrack = async (uri) => {
  assertTrackURI(uri);
  const { trackUnion } = await requestGraphQL(
    'getTrack',
    { uri },
    validateTrackUnion
  );

  const rawAlbum = trackUnion.albumOfTrack;
  const rawCoverArt = rawAlbum.coverArt;
  const rawTracks = rawAlbum.tracks;

  const artists = [
    ...trackUnion.firstArtist.items,
    ...trackUnion.otherArtists.items,
  ].map(({ id, uri, profile, visuals }) => ({
    id,
    uri,
    name: profile.name,
    avatar: visuals.avatarImage?.sources ?? [],
  }));

  return {
    id: trackUnion.id,
    uri: trackUnion.uri,
    name: trackUnion.name,
    num: trackUnion.trackNumber,
    type: trackUnion.mediaType,
    duration: trackUnion.duration?.totalMilliseconds,
    saved: trackUnion.saved,
    playcount: Number(trackUnion.playcount ?? 0),
    artists,
    album: {
      id: rawAlbum.id,
      uri: rawAlbum.uri,
      name: rawAlbum.name,
      type: rawAlbum.type,
      coverArt: rawCoverArt?.sources ?? [],
      colors: {
        raw: rawCoverArt?.extractedColors?.colorRaw,
      },
      tracks: rawTracks.items ?? [],
      tracksCount: rawTracks.totalCount,
      date: rawAlbum.date?.isoString,
    },
  };
};

export const getTrackColors = async (uri) => {
  assertTrackURI(uri);
  const { trackUnion } = await requestGraphQL(
    'fetchExtractedColorForTrackEntity',
    { uri },
    validateTrackUnion
  );

  const rawColors = trackUnion.albumOfTrack.coverArt?.extractedColors;
  return { dark: rawColors?.colorDark };
};
