import Moralis from "@/moralis";
import {PaginatedResponse, PairData, PairDataToken, Transfer} from "@/interfaces";

export default class MoralisService {
    public static async getPairsData(): Promise<PairData[]> {
        const pairData: PairData[] = [];

        const pairs = await Moralis.Object.extend('PairsCreated');
        const results = await new Moralis.Query(pairs).find();
        const tokenIds = results.flatMap((result: Moralis.Object) => [result.attributes.token0, result.attributes.token1]);
        const metadata = await Moralis.Web3API.token.getTokenMetadata({
            //TODO: Use network from store??
            // chain: `0x${WalletStore.currentNetwork.toString(16)}` as any,
            chain: `avalanche`,
            addresses: tokenIds
        });
        for (const result of results) {
            const token0 = metadata.find(item => item.address === result.attributes.token0);
            const token1 = metadata.find(item => item.address === result.attributes.token1);

            pairData.push({
                pair: result.attributes.pair,
                token0: (token0 as PairDataToken),
                token1: (token1 as PairDataToken)
            })
        }

        return pairData;
    }

    public static async getPairTransfers(address: string, page: number, perPage: number): Promise<PaginatedResponse<Transfer>> {
        return await Moralis.Web3API.account.getTokenTransfers({
            chain: `avalanche`,
            address: address,
            offset: page * perPage,
            limit: perPage
        }) as PaginatedResponse<Transfer>;
    }

}
