/* eslint-disable prefer-const */
import erc20Abi from '../abis/ERC20.json';

import acAbi from '../abis/AutoCompounder.json';
import { FarmSummary } from '@/interfaces/farm-summary.interface';
import { fromWei, toBN, toWei } from 'web3-utils';
import { Contract, ContractInterface, ethers } from "ethers";
import gql from "graphql-tag";
import { Percent } from "@ubeswap/sdk";
import { apolloClient } from "@/plugins/apollo";
import { Autocompounder } from "@/interfaces/autocompounder.interface";
import ContractService from "@/services/contract.service";
import { ApiService } from './api.service';
import { Farm } from '@/interfaces';
import BigNumber from 'bignumber.js';
import { Token } from '@/interfaces/token.interface'
import WalletStore from "@/store/wallet";
import multiStakingRewards from '../abis/MultiStakingRewards.json'
import ConvertService from './convert.service';
import StringService from "@/services/string.service";

const CREATION_BLOCK = 9840049
const LAST_N_BLOCKS = 1440 // Last 2 hours
const COMPOUNDS_PER_YEAR = 2

const query = gql`
      query getPairHourData($id: String!) {
        pair(id: $id) {
          pairHourData(first: 24, orderBy: hourStartUnix, orderDirection: desc) {
            hourStartUnix
            hourlyVolumeUSD
          }
        }
      }`;

export default class UbeswapService {
    public static async getFarmRegistry(farmId: string): Promise<FarmSummary[]> {

        const [farm, autocompounders] = await Promise.all([
            ApiService.get<Farm>(`farms/${farmId}`),
            ApiService.get<Autocompounder[]>(`farms/${farmId}/autocompounders`)
        ]) as [Farm | null, Autocompounder[] | null];
        if (autocompounders == null) return [];
        return await Promise.all(autocompounders.map(async ac => {
            const acContract = ContractService.getContract(acAbi as ContractInterface, farm ? farm.chainNetworkUrl : null, ac.address);
            let [userALP, totalALP] =
                await Promise.all([
                    !StringService.isNullOrWhitespace(WalletStore.currentAddress) ? acContract.balanceOf(WalletStore.currentAddress) : Promise.resolve(0),
                    acContract.totalSupply(),
                ]);
            const rewardRates = [];
            const rewardCurrency = [];
            userALP = new BigNumber(userALP.toString()) as BigNumber;
            totalALP = new BigNumber(totalALP.toString()) as BigNumber;

            const stakingContract = ContractService.getContract(multiStakingRewards as ContractInterface, farm ? farm.chainNetworkUrl : null, ac.stakingReward);
            let [apTVL, rewardRate, totalSupply] = await Promise.all([
                stakingContract.balanceOf(ac.address),
                stakingContract.rewardRate(),
                stakingContract.totalSupply()
            ]);
            const stakingTokenContract = ContractService.getContract(erc20Abi as ContractInterface, farm ? farm.chainNetworkUrl : null, ac.stakingToken);
            let [stakingCurrency, userLPBalance] = await Promise.all([
                this.fetchToken(stakingTokenContract),
                !StringService.isNullOrWhitespace(WalletStore.currentAddress) ? stakingTokenContract.balanceOf(WalletStore.currentAddress) : Promise.resolve(0)
            ]);
            apTVL = new BigNumber(apTVL.toString());

            const userTVL = userALP.isEqualTo(0)
                ? new BigNumber(0)
                : apTVL.div(new BigNumber(10).pow(18)).multipliedBy(userALP.div(totalALP))

            userLPBalance = new BigNumber(userLPBalance.toString()).div(
                new BigNumber(10).pow(18),
            );
            // const farmingPoolType = await acContract.farmingPoolType();

             //const earned = await stakingContract.earned(WalletStore.currentAddress);
             //const earned2 = await stakingContract.earned(ac.address);

            const rewardsTokenContract = ContractService.getContract((erc20Abi as ContractInterface), farm ? farm.chainNetworkUrl : null, ac.rewardsToken);
            if (ac.rewards === null || ac.rewards === '') {
                rewardRates.push(new BigNumber(rewardRate.toString()).div(new BigNumber(10).pow(18)));
            } else {
                const rewardsArray = ac.rewards!.split(',').map(n=>new BigNumber(n));
                const rewardsMean = BigNumber.sum.apply(null, rewardsArray).dividedBy(rewardsArray.length);
                rewardRates.push(new BigNumber(rewardsMean).div(new BigNumber(10).pow(18)));
            }
            rewardCurrency.push(await this.fetchToken(rewardsTokenContract));

            /*const extRewards = stakingAddress;//await stakingContract.externalStakingRewards(); //remove this  - hack
            const stakingExternalRewardContract = ContractService.getContract(multiStakingRewards as ContractInterface, farm ? farm.chainNetworkUrl : null,
                extRewards,
            )
            const externalRewardRate = await stakingExternalRewardContract.rewardRate();
            const externalRewardsTokenAddress = await stakingContract.rewardsToken();
            const externalRewardsTokenContract = ContractService.getContract((erc20Abi as ContractInterface), farm ? farm.chainNetworkUrl : null, externalRewardsTokenAddress);
            rewardRates.push(new BigNumber(externalRewardRate.toString()).div(new BigNumber(10).pow(18)))
            rewardCurrency.push(await this.fetchToken(externalRewardsTokenContract));*/

            const TVLFarm = new BigNumber(totalSupply.toString()).div(new BigNumber(10).pow(18));

            //************convert values for view***************
            //convert total lp to usd
            const [totalConvertLPtoCUSD, userTVLtoCUSD, rewardToUSD] = await Promise.all([
                ConvertService.convertLPtoUSD(TVLFarm, stakingCurrency as Token, farm ? farm.chainNetworkUrl : '', farm?.chainId as number),
                ConvertService.convertLPtoUSD(userTVL, stakingCurrency as Token, farm ? farm.chainNetworkUrl : '', farm?.chainId as number),
                ConvertService.convertTokenToCUSD(rewardRates[0], rewardCurrency[0], farm ? farm.chainNetworkUrl : '', farm?.chainId as number)
            ]);
            //const externalRewardToUSD = await ConvertService.convertTokenToCUSD(rewardRates[1], rewardCurrency[1], farm ? farm.chainNetworkUrl : '', farm?.chainId as number)
            const totalRewardToUSD = rewardToUSD;//.plus(externalRewardToUSD);
            const APR = this.caculateAPR(totalRewardToUSD, totalConvertLPtoCUSD);
            const APY = this.caculateAPY(totalRewardToUSD, totalConvertLPtoCUSD);
            const farmName = `${ac.token0Name}-${ac.token1Name}`;
            const tokenLogos = farmName.split("-").map((item: string) => UbeswapService.tokenLogo(item));
            return {
                farmName: farmName,
                acAddress: ac.address,
                stakingAddress: ac.stakingReward,
                stakingToken: ac.stakingToken,
                userTlvUSD: userTVLtoCUSD ? userTVLtoCUSD.toNumber() : 0,
                tvl: totalConvertLPtoCUSD ? totalConvertLPtoCUSD.toNumber() : 0,
                apr: Number(APR),
                apy: Number(APY),
                tokenLogos,
                userRewards: totalRewardToUSD ? totalRewardToUSD.toNumber() : 0
            } as FarmSummary

        }));
    }

    public static tokenLogo(name: String) {
        return `https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_${name}.png`;
    }

    public static traderJoeTokenLogo(address: string) {
        const result =  `${window.location.origin}/static-files/logos/traderjoe/${address.toLowerCase()}/logo.png`;
        return result;
    }

    private static caculateAPR(amount?: BigNumber, total?: BigNumber) {
        if (!amount || amount.isEqualTo(0) || !total || total.isEqualTo(0)) {
            return 0
        }
        const rewardPerYear = amount.multipliedBy(86400).multipliedBy((365))
        return Math.round(Number(rewardPerYear.div(total).multipliedBy(100)))
    }
    private static caculateAPY(amount?: BigNumber, total?: BigNumber) {
        if (!amount || amount.isEqualTo(0) || !total || total.isEqualTo(0)) {
            return
        }
        const rewardPerDay = amount.multipliedBy(86400)
        const ratePerDay = rewardPerDay.div(total)
        const totalYear = total.multipliedBy(ratePerDay.plus(1).pow((365)))
        return Math.round(Number(totalYear.div(total).minus(1).multipliedBy(100)))
    }

    private static async fetchToken(contract: Contract): Promise<Token> {
        const address = contract.address;
        const decimals = await contract.decimals();
        const name = await contract.name();
        const symbol = await contract.symbol();

        const token: Token = {
            address: address,
            decimals: decimals,
            name: name,
            symbol: symbol
        }
        return token;
    }

    private static annualizedPercentageYield(nominal: Percent, compounds: number) {
        const divideNominalByNAddOne: number = Number(nominal.divide(BigInt(compounds)).add(BigInt(1)).toFixed(10));
        return ((divideNominalByNAddOne ** compounds - 1) * 100).toFixed(0)
    }

}
