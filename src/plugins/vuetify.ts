import Vue from 'vue';
import Vuetify from "vuetify";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#305BF5',
                secondary: '#f85f43',
                accent: '#CBCDDA',
                error: '#F46060',
                warning: '#eebb4d',
                info: '#B5DEFF',
                success: '#47bc6c',
                background: '#F5F7FB'
            },
        },
    },
})
