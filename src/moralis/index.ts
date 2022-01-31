import Moralis from 'moralis'

const serverUrl = process.env.VUE_APP_MORALIS_SERVER_URL!.toString();
const appId = process.env.VUE_APP_MORALIS_APP_ID!.toString();

Moralis.start({
  serverUrl,
  appId
});

export default Moralis;
