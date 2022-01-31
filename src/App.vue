<template>
  <v-app>
    <layout>
        <router-view/>
    </layout>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Layout from "@/components/shared/_common/layout/layout.vue";

@Component({
  components: {Layout}
})
export default class AppComponent extends Vue {
}
</script>
