import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import '@/styles/global.scss'
import 'animate.css';
import VueApollo from 'vue-apollo'
import {apolloClient} from './plugins/apollo'
import NumbersService from "@/services/numbers.service";
import BigNumber from "bignumber.js";

Vue.config.productionTip = false

Vue.use(VueToast);

const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
})

Vue.use(VueApollo);

Vue.filter('date', function (value: Date | string, mode?: 'date' | 'time' | 'datetime') {
    if (value) {
        switch (mode) {
            case "time":
                return new Date(value).toLocaleTimeString();
            case "datetime":
                return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
            case "date":
            default:
                return new Date(value).toLocaleDateString();
        }
    }
});

Vue.filter('number', function (value: number | string, decimalPlaces?: number) {
    const number = Number(value);
    if (!isNaN(number)) {
        return NumbersService.parseNumericValue(number, decimalPlaces);
    }
    return '';
});

Vue.filter('WeiNumber', function (value: number | string, decimalPlaces?: number) {
    const number = new BigNumber(value.toString()).div(1e18).toNumber();
    if (!isNaN(number)) {
        return NumbersService.parseNumericValue(number, decimalPlaces);
    }
    return '';
});

new Vue({
    apolloProvider,
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
