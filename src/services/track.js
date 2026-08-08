import { URI } from '@/lib/spicetify.js';
import { requestGraphQL } from '@/lib/graphql.js';

const validator = ({ trackUnion }) => {
  const typeName = trackUnion.__typename;
  if (typeName !== 'Track') {
    return {
      name: typeName,
      message: trackUnion.message,
    };
  }
};

export const getTrack = async (uri) => {
  if (!URI.isTrack(uri)) {
    throw new TypeError(`Expected a track URI, but received: "${uri}"`);
  }

  const { trackUnion } = await requestGraphQL(
    'getTrack',
    { uri },
    validator
  );

  const rawAlbum = trackUnion.albumOfTrack;
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
      coverArt: rawAlbum.coverArt,
      tracks: rawTracks.items ?? [],
      tracksCount: rawTracks.totalCount,
      date: rawAlbum.date?.isoString,
    },
  };
};
