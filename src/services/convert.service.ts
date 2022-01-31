import BigNumber from 'bignumber.js'
import ContractService from "@/services/contract.service";
import IUniswapV2Pair from '../abis/IUniswapV2Pair.json';
import IUniswapV2Factory from '../abis/IUniswapV2Factory.json';

import erc20Abi from '../abis/ERC20.json';
import {Token} from '@/interfaces/token.interface'
import { Contract, ContractInterface } from 'ethers';
import { PairInfo } from '@/interfaces/pair-info.interface';
import { Currency } from '@/interfaces/currency.interface';
import { cUSD, UniswapV2Factory, ZERO_ADDRESS } from './constants';

export default class ConvertService {
  public static async convertLPtoUSD(amount: BigNumber, currency: Token, network: string, networkId: number) {
    if (!amount || !currency) {
      return new BigNumber(0)
    }

    const pairContract = ContractService.getContract(IUniswapV2Pair as ContractInterface, network, currency?.address);
    const factoryContract =
    ContractService.getContract(IUniswapV2Factory as ContractInterface,  network, UniswapV2Factory[networkId]);

    const pairLP = await ConvertService.getPairInforByAddress(
      network,
      networkId,
      pairContract,
      currency?.address,
    )

    const totalConvertLPToToken0 = await ConvertService.convertAllLPTotoken0(amount, pairLP?.pairInfor.totalSupply, pairLP?.pairInfor.reserve0)

    const pairLPToken0AndUSD = await ConvertService.getPairInfor(
      network,
      factoryContract,
      pairLP?.currencyInfor.currency0,
      cUSD[networkId],
    )
    const tempTotalConvertLPtoCUSD = ConvertService.convertV2token(
      totalConvertLPToToken0,
      pairLPToken0AndUSD?.reserve0,
      pairLPToken0AndUSD?.reserve1,
    )
    return tempTotalConvertLPtoCUSD as BigNumber
  }
  public static async  convertTokenToCUSD(amount: BigNumber, currency: Token, network: string, networkId: number) {
    if (!amount || !currency) {
      return new BigNumber(0)
    }
    const factoryContract =
    ContractService.getContract(IUniswapV2Factory as ContractInterface,  network, UniswapV2Factory[networkId]);

    const pairRewardUSD = await ConvertService.getPairInfor(
      network,
      factoryContract,
      currency,
      cUSD[networkId],
    )

    const rewardToUSD = ConvertService.convertV2token(amount, pairRewardUSD?.reserve0, pairRewardUSD?.reserve1)
    return rewardToUSD as BigNumber
  }

  private static async getPairInforByAddress(network: string, networkId: number, pairContract: Contract , address: string ){

    try {
      const [reserves, totalSupply, token0, token1] = await Promise.all([
        pairContract.getReserves(),
        pairContract.totalSupply(),
        pairContract.token0(),
        pairContract.token1(),
      ])
      const reserve0 = new BigNumber(reserves.reserve0.toString());
      const reserve1 = new BigNumber(reserves.reserve1.toString());

      const [tokenA, tokenB] = [token0, token1]

      const tokenAErc20 = ContractService.getContract(erc20Abi as ContractInterface, network, tokenA);
      const [decimals0, name0, symbol0] = await Promise.all([
        tokenAErc20.decimals(),
        tokenAErc20.name(),
        tokenAErc20.symbol(),
      ])
      const CurrencyA : Token = {address: tokenA, decimals: decimals0, name: name0, symbol: symbol0}

      const tokenBErc20 = ContractService.getContract(erc20Abi as ContractInterface, network, tokenB);
      const [decimals1, name1, symbol1] = await Promise.all([
        tokenBErc20.decimals(),
        tokenBErc20.name(),
        tokenBErc20.symbol(),
      ])
      const CurrencyB : Token = {address: tokenB, decimals: decimals1, name: name1, symbol: symbol1}

      const _pairInfo: PairInfo = {
        pairAddress: address,
        totalSupply: new BigNumber(totalSupply.toString()).dividedBy(new BigNumber(10).pow(18)),
        token0: tokenA,
        token1: tokenB,
        reserve0: reserve0.div(new BigNumber(10).pow(CurrencyA.decimals)),
        reserve1: reserve1.div(new BigNumber(10).pow(CurrencyB.decimals)),
        price: new BigNumber(reserve0.toString()).isGreaterThan(0)
          ? new BigNumber(reserve1.toString()).dividedBy(reserve0.toString())
          : undefined,
      }
      const _currencyInfor = {
        currency0: CurrencyA,
        currency1: CurrencyB,
      }
      return { pairInfor: _pairInfo, currencyInfor: _currencyInfor }
    } catch (e) {
      console.log('e', e)
    }
  }

  private static async convertAllLPTotoken0(amount0In?: BigNumber, total?: BigNumber, reserve0?: BigNumber) {
    if (!amount0In || !total || !reserve0) {
      return
    }
    return amount0In.div(total).multipliedBy(reserve0).multipliedBy(2)
  }

  private static async getPairInfor(
    network: string,
    factoryContract: Contract,
    currencyA?: Currency | Token | null,
    currencyB?: Currency | Token | null,
  ) {
    try {
      const wrappedTokenA = currencyA as Token
      const wrappedTokenB = currencyB as Token

      const pairAddress = await factoryContract.getPair(wrappedTokenA.address, wrappedTokenB.address);
      if (!pairAddress || pairAddress === ZERO_ADDRESS) {
        return
      }
      const pairContract =  ContractService.getContract(IUniswapV2Pair as ContractInterface, network, pairAddress);

      const [reserves, totalSupply, token0] = await Promise.all([
        pairContract.getReserves(),
        pairContract.totalSupply(),
        pairContract.token0(),
      ])

      const { reserve0, reserve1 } = reserves

      const [tokenA, tokenB] =
        token0.toLowerCase() === wrappedTokenA.address.toLowerCase()
          ? [wrappedTokenA, wrappedTokenB]
          : [wrappedTokenB, wrappedTokenA]
      const [reserveTokenA, reserveTokenB] =
        token0.toLowerCase() === wrappedTokenA.address.toLowerCase() ? [reserve0, reserve1] : [reserve1, reserve0]

      const _pairInfo: PairInfo = {
        pairAddress: pairAddress,
        totalSupply: new BigNumber(totalSupply.toString()).dividedBy(new BigNumber(10).pow(18)),
        token0: tokenA,
        token1: tokenB,
        reserve0: new BigNumber(reserveTokenA.toString()).dividedBy(new BigNumber(10).pow(tokenA.decimals)),
        reserve1: new BigNumber(reserveTokenB.toString()).dividedBy(new BigNumber(10).pow(tokenB.decimals)),
        price: new BigNumber(reserveTokenA.toString()).isGreaterThan(0)
          ? new BigNumber(reserveTokenB.toString()).dividedBy(reserveTokenA.toString())
          : undefined,
      }

      return _pairInfo
    } catch (e) {
      console.log('e', e)
    }
  }

  private static  convertV2token(amount0In?: BigNumber, reserve0?: BigNumber, reserve1?: BigNumber) {
    if (!amount0In || !reserve0 || !reserve1) {
      return
    }
    return amount0In.multipliedBy(reserve1).div(reserve0)
  }
}
