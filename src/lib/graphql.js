const { Request, Definitions } = Spicetify.GraphQL;

export const GRAPHQL_QUERIES = {
  GET_TRACK: 'getTrack',
  GET_TRACK_COLORS: 'fetchExtractedColorForTrackEntity',
  GET_ALBUM_FEED: 'watchFeedEntity',
};

export const requestGraphQL = async (
  definition,
  variables,
  validator
) => {
  const { data, errors } = await Request(
    Definitions[definition],
    variables
  );

  if (errors?.length) {
    const [primaryError] = errors;
    const error = new Error(primaryError.message);
    const errorName = primaryError.extensions?.classification;
    if (errorName) error.name = errorName;
    throw error;
  }

  if (typeof validator === 'function') {
    const errorInfo = validator(data);
    if (errorInfo) {
      const { name, message } = errorInfo;
      const error = new Error(message ?? 'Request failed');
      if (name) error.name = name;
      throw error;
    }
  }

  return data;
};
