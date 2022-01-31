import {Action, getModule, Module, Mutation, MutationAction, VuexModule} from "vuex-module-decorators";
import store from "@/store/index";
import {PairData} from "@/interfaces";
import MoralisService from "@/services/moralis.service";

@Module({
    name: 'analytics-store',
    dynamic: true,
    namespaced: true,
    store,
})
export class AnalyticsModule extends VuexModule {
    private _pairsData: PairData[] = [];
    private _loaders: boolean[] = [];

    @Mutation
    private writePairsData(data: PairData[]) {
        this._pairsData.length = 0;
        data.forEach(val => this._pairsData.push(val));
    }

    @Mutation
    private writeLoading(load: boolean) {
        if (load) {
            this._loaders.push(load);
        } else {
            this._loaders.pop();
        }
    }

    @Action({rawError: true})
    public async getPairData(force = false) {
        if (!this._pairsData.length || force) {
            this.writePairsData(await MoralisService.getPairsData());
        }
    }

    @Action({rawError: true})
    public startLoading() {
        const currentLoaders = this._loaders;
        currentLoaders.push(true);
    }

    get pairsData() {
        return this._pairsData;
    }
}

const AnalyticsStore = getModule(AnalyticsModule);
export default AnalyticsStore;
