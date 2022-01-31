import erc20Abi from '../abis/ERC20.json';
import acAbi from '../abis/AutoCompounder.json';
import {ContractInterface, ethers} from "ethers";
import ContractService from "@/services/contract.service";
import {Farm} from '@/interfaces';
import BigNumber from 'bignumber.js';
import WalletStore from "@/store/wallet";
import {MaxUint256} from './constants';
import {ExternalProvider} from '@ethersproject/providers';

export default abstract class TransactionService {
    public static async needApproval(farm: Farm,  tokenAddress: string, autocompounderAddress: string, amount: number) : Promise<boolean> {
        const tokenContract = ContractService.getContract(erc20Abi as ContractInterface, farm ? farm.chainNetworkUrl: null, tokenAddress);
        const decimals = await tokenContract.decimals();
        const allowance = await tokenContract.allowance(WalletStore.currentAddress, autocompounderAddress);
        const allowanceAmount = new BigNumber(!allowance ? '0' : allowance.toString()).multipliedBy(new BigNumber(10).pow(decimals)).decimalPlaces(0);
        const current = (new BigNumber(amount.toString()).multipliedBy(new BigNumber(10).pow(decimals)).decimalPlaces(0))
        return current.gt(allowanceAmount);
    }

    public static async approve(farm: Farm,  tokenAddress: string, autocompounderAddress: string) {
        let tokenContract = ContractService.getContract(erc20Abi as ContractInterface, farm ? farm.chainNetworkUrl: null, tokenAddress);
        const signer = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider)).getSigner();
        const provider = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider));
        await provider.send("eth_requestAccounts", []);
        tokenContract = tokenContract.connect(signer);

        return await tokenContract.approve(autocompounderAddress, MaxUint256);
    }

    public static async deposit(farm: Farm,  tokenAddress: string, autocompounderAddress: string, amount: number){

        const tokenContract = ContractService.getContract(erc20Abi as ContractInterface, farm ? farm.chainNetworkUrl: null, tokenAddress);
        let acContract = ContractService.getContract(acAbi as ContractInterface, farm ? farm.chainNetworkUrl: null, autocompounderAddress);
        const decimals = await tokenContract.decimals();
        const adr = WalletStore.currentAddress;
        const amountToSend = ethers.utils.parseEther(amount.toString());
        const signer = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider)).getSigner();
        const provider = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider));
        await provider.send("eth_requestAccounts", []);
        acContract = acContract.connect(signer);
        return acContract.deposit(amountToSend, WalletStore.currentAddress)
    }

    public static async withdraw(farm: Farm, autocompounderAddress: string, amount: number){
        let acContract = ContractService.getContract(acAbi as ContractInterface, farm ? farm.chainNetworkUrl: null, autocompounderAddress);
        const amountToWithdraw = ethers.utils.parseEther(amount.toString());
        const signer = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider)).getSigner();
        const provider = (new ethers.providers.Web3Provider(window.ethereum as ExternalProvider));
        await provider.send("eth_requestAccounts", []);
        acContract = acContract.connect(signer);
        return acContract.withdraw(WalletStore.currentAddress, amountToWithdraw);
    }
}
