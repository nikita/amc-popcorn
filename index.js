import "dotenv/config";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import "cross-fetch/polyfill";
import captcha from "@infosimples/node_two_captcha";

// Initialize GraphQL for AMC
const client = new ApolloClient({
  uri: "https://graph.amctheatres.com"
});

// Initialize 2captcha API wrapper with our 2captcha key
const captchaClient = new captcha(process.env.CAPTCHA_KEY, {
  // 60 seconds
  timeout: 60000,
  // 5 seconds
  polling: 5000,
  throwErrors: false
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
