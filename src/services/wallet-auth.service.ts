import {Ethereum, NetworkEnum, WalletEnum} from "@/interfaces";
import detectEthereumProvider from '@metamask/detect-provider'
import Vue from 'vue';
import CommonStore from "@/store/common";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletStore from "@/store/wallet";

interface IWalletMethods {
    connect: () => Promise<string>;
    disconnect: () => Promise<void>;
    network: NetworkEnum
}

const noop: IWalletMethods = {
    connect: async (): Promise<string> => {
        return new Promise<string>(resolve => {
            resolve('');
        })
    },
    disconnect: async (): Promise<void> => {
        return new Promise<void>(resolve => {
            resolve();
        })
    },
    get network(): NetworkEnum {
        return NetworkEnum.Main
    },
    set network(network: NetworkEnum) {

    },
}

export default class WalletAuthService {

    private static walletConnectProvider?: WalletConnectProvider;

    public static readonly [WalletEnum.metamask]: IWalletMethods = {
        connect: async (): Promise<string> => {
            const provider = await detectEthereumProvider({mustBeMetaMask: true});
            if (provider) {
                const accounts = await (provider as Ethereum).request({method: 'eth_requestAccounts'});
                return accounts[0];
            } else {
                Vue.$toast.error('Unable to find MetaMask');
                return new Promise<string>(resolve => {
                    resolve('');
                })
            }
        },
        get network(): NetworkEnum {
            const Ethereum = window.ethereum as Ethereum;
            return Ethereum.networkVersion as NetworkEnum;
        },
        set network(network: NetworkEnum) {
            try {
                CommonStore.startLoading();
                const Ethereum = window.ethereum as Ethereum;
                const chainId = `0x${network.toString(16)}`;
                Ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{chainId}]
                });
            } catch (switchError) {
                CommonStore.stopLoading();
                Vue.$toast.error(switchError.message);
            }
        },
        disconnect: async(): Promise<void> => {
            CommonStore.startLoading();
            WalletStore.destroyWallet();
            CommonStore.stopLoading();
        }
    }

    public static readonly [WalletEnum.walletConnect]: IWalletMethods = {
        connect: async (): Promise<string> => {
            const provider = new WalletConnectProvider({
                infuraId: 'b7b5cca41103499999cc8277e68c081d',
                rpc: {
                    1: 'https://mainnet.infura.io/v3/07e180fc271d4e79a8a9fb1001f57a6b',
                    56: 'https://bsc-dataseed.binance.org',
                    137: 'https://rpc-mainnet.maticvigil.com',
                    42220: 'https://rpc.ankr.com/celo/'
                }
            });

            const accounts = await provider.enable();
            WalletAuthService.walletConnectProvider = provider;

            return accounts[0] || '';
        },
        disconnect: async (): Promise<void> => {
            CommonStore.startLoading();
            WalletStore.destroyWallet();
            await WalletAuthService.walletConnectProvider!.disconnect();
            WalletAuthService.walletConnectProvider = undefined;
            CommonStore.stopLoading();
        },
        get network(): NetworkEnum {
            return NetworkEnum.Main;
        },
        set network(network: NetworkEnum) {
        },
    }

    public static readonly [WalletEnum.coinbase]: IWalletMethods = noop

    public static readonly [WalletEnum.none]: IWalletMethods = noop
}
