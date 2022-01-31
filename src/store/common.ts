import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "@/store/index";

@Module({
    name: 'common-store',
    dynamic: true,
    namespaced: true,
    store,
})
export class CommonModule extends VuexModule {
    private _loading: boolean = false;

    @Mutation
    private writeLoading(loading: boolean) {
        this._loading = loading;
    }

    @Action({rawError: true})
    public startLoading(timeout?: number) {
        this.writeLoading(true);
        if (timeout) {
            setTimeout(() => {
                this.writeLoading(false)
            }, timeout)
        }
    }

    @Action({rawError: true})
    public stopLoading() {
        this.writeLoading(false);
    }

    get isLoading() {
        return this._loading;
    }
}

const CommonStore = getModule(CommonModule);
export default CommonStore;
