import ApolloClient, {InMemoryCache} from "apollo-boost";

export const apolloClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap',
    cache: new InMemoryCache(),
});
