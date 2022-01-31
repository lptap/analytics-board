import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "@/store/index";
import {Farm} from "@/interfaces/farm.interface";
import {Autocompounder} from "@/interfaces/autocompounder.interface";
import {ApiService} from "@/services/api.service";
import CommonStore from "@/store/common";
import {FarmSummary} from "@/interfaces";
import UbeswapService from "@/services/ubeswap.service";
import {providers} from 'ethers'

@Module({
    name: 'farm-store',
    dynamic: true,
    namespaced: true,
    store,
})
export class FarmModule extends VuexModule {
    private _farms: Farm[] = [];
    private _currentFarm: Partial<Farm> = {};
    private _uberSwapFarms: FarmSummary[] = [];
    private _provider: any = {};

    @Mutation
    private writeFarms(value: Farm[]) {
        this._farms.length = 0;
        value.forEach(val => this._farms.push(val));
    }

    @Mutation
    private writeCurrentFarms(value: Farm) {
        this._currentFarm = value;
    }

    @Mutation
    private writeUberSwap(value: FarmSummary[]) {
        this._uberSwapFarms.length = 0;
        value.forEach(val => this._uberSwapFarms.push(val));
        CommonStore.stopLoading();
    }

    @Mutation
    private writeProvider(value: string) {
        this._provider = new providers.WebSocketProvider(value);
    }

    @Action({rawError: true})
    async saveProvider(value: string) {
        this.writeProvider(value);
    }

    @Action({rawError: true})
    async getFarms() {
        CommonStore.startLoading();
        const res = await ApiService.get<Farm[]>('farms');
        if (res) {
            this.writeFarms(res!);
        }
        CommonStore.stopLoading();
    }

    @Action({rawError: true})
    async initUberSwapFarms(farmId: string) {
        if (farmId !== '') {
            CommonStore.startLoading();
            const res = await UbeswapService.getFarmRegistry(farmId);
            this.writeUberSwap(res);
            CommonStore.stopLoading();
        }
    }

    @Action({rawError: true})
    async getFarm(id: string) {
        CommonStore.startLoading();
        const res = await ApiService.get<Farm>(`farms/${id}`);
        CommonStore.stopLoading();
        return res;
    }

    @Action({rawError: true})
    async setCurrentFarm(id: string) {
        const farm = this._farms.find(item => item.id === id);
        if (farm) {
            this.writeCurrentFarms(farm);
        }
    }

    @Action({rawError: true})
    async addFarm(model: Farm) {
        CommonStore.startLoading();
        const res = await ApiService.post<Farm>('farms', model)
        CommonStore.stopLoading();
        return res;
    }

    @Action({rawError: true})
    async editFarm(model: Farm) {
        CommonStore.startLoading();
        const id = model.id;
        const res = await ApiService.put(`farms/${id}`, model);
        CommonStore.stopLoading();
        return res;
    }

    @Action({rawError: true})
    async deleteFarm(model: Farm) {
        CommonStore.startLoading();
        await ApiService.delete<Farm>(`farms/${model.id}`)
        await this.getFarms();
    }

    @Action({rawError: true})
    async getFarmAutocompounders(id: string) {
        CommonStore.startLoading();
        const res = await ApiService.get<Autocompounder[]>(`farms/${id}/autocompounders`);
        CommonStore.stopLoading();
        return res;
    }

    @Action({rawError: true})
    async getFarmOneAutocompounders(params: {id: string, aid: string}) {
        CommonStore.startLoading();
        const res = await ApiService.get<Autocompounder>(`farms/${params.id}/autocompounders/${params.aid}`);
        CommonStore.stopLoading();
        return res;
    }

    @Action({rawError: true})
    async addFarmAutocompounder(model: Autocompounder) {
        CommonStore.startLoading();
        const res = await ApiService.post<Autocompounder>(`farms/${model.idFarm}/autocompounders`, model)
        CommonStore.stopLoading();
        return res;
    }

    @Action({ rawError: true })
    async editFarmAutocompounder(model: Autocompounder) {
        CommonStore.startLoading();
        const res = await ApiService.put(`farms/${model.idFarm}/autocompounders/${model.id}`, model);
        CommonStore.stopLoading();
        return res;
    }

    @Action({ rawError: true })
    async deleteFarmAutocompounder(params: {id: string, aid: string}) {
        CommonStore.startLoading();
        await ApiService.delete<Autocompounder>(`farms/${params.id}/autocompounders/${params.aid}`)
    }

    get provider() {
        return this._provider;
    }

    get farms() {
        return this._farms
    }

    get currentFarm(): Farm {
        return this._currentFarm as Farm;
    }

    get ubeswapFarms() {
        return this._uberSwapFarms;
    }

}

const FarmStore = getModule(FarmModule);
export default FarmStore;
