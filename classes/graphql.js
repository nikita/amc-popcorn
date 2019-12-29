import "cross-fetch/polyfill";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";

// Initialize GraphQL for AMC
const client = new ApolloClient({
  uri: "https://graph.amctheatres.com"
});

const CREATE_ACCOUNT = gql`
  mutation accountCreate($input: AccountCreateInput!) {
    accountCreate(input: $input) {
      user {
        id
        account {
          id
          accountId
          accountType
          displayName
          token
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const GET_THEATRES = gql`
  query TheatreFinder(
    $query: String!
    $useGeolocation: Boolean!
    $useQuery: Boolean!
  ) {
    viewer {
      user {
        id
        theatres(first: 10, type: NearDevice) @include(if: $useGeolocation) {
          edges {
            node {
              id
              __typename
            }
            __typename
          }
          ...TheatreResultList_Theatres
          __typename
        }
        ...TheatreSearch_User
        __typename
      }
      location(first: 10, query: $query) @include(if: $useQuery) {
        edges {
          node {
            title
            theatres(first: 10) {
              edges {
                node {
                  id
                  __typename
                }
                __typename
              }
              ...TheatreResultList_Theatres
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
  fragment TheatreSearch_User on User {
    lastLocations {
      device {
        type
        location {
          longitude
          latitude
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  fragment TheatreResultList_Theatres on TheatreConnection {
    edges {
      node {
        id
        theatreId
        ...TheatreResult_Theatre
        __typename
      }
      __typename
    }
    __typename
  }
  fragment TheatreResult_Theatre on Theatre {
    addressLine1
    addressLine2
    attributes(type: PREMIUM_FILTERS, first: 4) {
      ...TheatreResultAttributesList_Attributes
      __typename
    }
    city
    distance
    latitude
    longitude
    longName
    postalCode
    secondaryLongName
    state
    theatreId
    __typename
  }
  fragment TheatreResultAttributesList_Attributes on AttributeConnection {
    edges {
      node {
        abbreviation
        __typename
      }
      __typename
    }
    __typename
  }
`;

export const createAccount = async (
  { email, password, theatreId, firstName, lastName, birthDate },
  captcha
) => {
  try {
    const resp = await client.mutate({
      mutation: CREATE_ACCOUNT,
      variables: {
        input: {
          email,
          password,
          theatreId,
          firstName,
          lastName,
          captcha,
          birthDate
        }
      }
    });

    return true;
  } catch (err) {
    if (
      err.message.includes(
        "An AMC account already exists with the specified email address"
      )
    ) {
      // TODO: Rotate email if get this somehow
      console.log("Need new email");
      return false;
    } else {
      console.log(err);
    }
    return false;
  }
};

export const getTheatres = async zipCode => {
  try {
    const resp = await client.query({
      query: GET_THEATRES,
      variables: {
        query: zipCode,
        useGeolocation: false,
        useQuery: true
      }
    });

    return resp.data.viewer.location.edges[0].node.theatres.edges;
  } catch (err) {
    console.log(err);

    return false;
  }
};
