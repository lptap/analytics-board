import BigNumber from "bignumber.js";
import { Token } from "./token.interface";

export interface PairInfo {
    pairAddress: string
    totalSupply: BigNumber
    token0: Token
    token1: Token
    reserve0: BigNumber
    reserve1: BigNumber
    price?: BigNumber
}