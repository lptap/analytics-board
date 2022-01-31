import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from '@/store/index';
import {NetworkEnum, networkObjectMap, WalletEnum} from "@/interfaces";
import StringService from "@/services/string.service";
import CommonStore from "@/store/common";
import Vue from 'vue'
import {Subject} from "rxjs-compat";

@Module({
    name: 'wallet-store',
    dynamic: true,
    namespaced: true,
    store,
})
export class WalletModule extends VuexModule {
    private address: string = '';
    private provider: WalletEnum = WalletEnum.none;
    private network: NetworkEnum = NetworkEnum.Main;

    public walletChanged$ = new Subject();

    @Mutation
    private writeWalletAddress(address: string) {
        this.address = address;
    }

    @Mutation
    private writeWalletProvider(provider: WalletEnum) {
        this.provider = provider;
    }

    @Mutation
    private writeWalletNetwork(network: NetworkEnum) {
        this.network = network;
    }

    @Action({rawError: true})
    public initWallet(payload: { address: string, provider: WalletEnum, network: NetworkEnum, rememberMe: boolean }) {
        this.writeWalletProvider(payload.provider);
        this.writeWalletAddress(payload.address);
        this.writeWalletNetwork(payload.network);
        if (payload.rememberMe) {
            localStorage.setItem('le-exchange-provider', payload.provider.toString());
        }
    }

    @Action({rawError: true})
    public destroyWallet() {
        this.writeWalletProvider(WalletEnum.none);
        this.writeWalletAddress('');
        this.writeWalletNetwork(NetworkEnum.Main);
        localStorage.removeItem('le-exchange-provider');
    }

    @Action({rawError: true})
    public async changeNetwork(network: NetworkEnum) {
        this.writeWalletNetwork(network);
        CommonStore.stopLoading();
        Vue.$toast.info(`Network changed to ${networkObjectMap[network].name}`);
        this.walletChanged$.next();
    }

    @Action({rawError: true})
    public async changeWallet(address: string) {
        this.writeWalletAddress(address);
        CommonStore.stopLoading();
        Vue.$toast.info(`Network changed to ${address}`);
        this.walletChanged$.next();
    }

    get currentAddress() {
        return this.address;
    }

    get currentProvider() {
        return this.provider;
    }

    get currentNetwork() {
        return this.network;
    }

    get isAuthenticated() {
        return this.currentProvider !== WalletEnum.none || !StringService.isNullOrWhitespace(this.address);
    }
}

const WalletStore = getModule(WalletModule);
export default WalletStore;
