import { URI } from '@/lib/spicetify.js';
import { GRAPHQL_QUERIES, requestGraphQL } from '@/lib/graphql.js';

const assertAlbumURI = (uri) => {
  if (!URI.isAlbum(uri)) {
    throw new TypeError(
      `Expected an album URI, but received: "${uri}"`
    );
  }
};

export const getAlbumFeed = async (uri, limit, offset = 0) => {
  assertAlbumURI(uri);
  const { id } = URI.fromString(uri);
  const { getWatchFeedForEntity: rawData } = await requestGraphQL(
    GRAPHQL_QUERIES.GET_ALBUM_FEED,
    {
      watchFeedUri: `spotify:watch-feed:album:${id}`,
      limit,
      offset,
    }
  );

  const rawItems = rawData.items ?? [];
  const rawAlbum = rawItems[0]?.data?.albumOfTrack;
  const rawCoverArt = rawAlbum?.coverArt;

  const tracks = rawItems.map(({ data }) => {
    const artists = data.artists.items.map(
      ({ uri, profile, visuals, saved, stats }) => ({
        uri,
        name: profile.name,
        avatar: visuals.avatarImage?.sources ?? [],
        saved,
        monthlyListeners: stats.monthlyListeners,
      })
    );

    return {
      uri: data.uri,
      name: data.name,
      audioPreview: data.previews?.audioPreviews?.items?.[0] ?? null,
      canvas: data.canvas,
      artists,
    };
  });

  return {
    tracks,
    album: rawAlbum
      ? {
          uri: rawAlbum.uri,
          name: rawAlbum.name,
          coverArt: rawCoverArt?.sources ?? [],
          colors: {
            dark: rawCoverArt?.extractedColors?.colorDark,
          },
        }
      : null,
    totalCount: rawData.totalCount,
    nextOffset: rawData.pagingInfo?.nextOffset,
  };
};
