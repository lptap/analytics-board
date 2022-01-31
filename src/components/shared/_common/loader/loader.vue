<template>
  <v-progress-circular
      indeterminate
      :size="size"
      :color="colorMap[walletType]"
  >
    <wallet-logo :wallet-type="walletType" :size="iconSize"/>
  </v-progress-circular>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {WalletEnum, colorMap} from "@/interfaces";
import WalletLogo from "@/components/shared/_common/wallet-logo/wallet-logo.vue";

@Component({
  components: {WalletLogo}
})
export default class Loader extends Vue {
  colorMap = colorMap;

  @Prop({default: WalletEnum.none}) readonly walletType!: WalletEnum;
  @Prop({default: 64}) readonly size!: number;
  @Prop({default: 45}) readonly iconSize!: number;
}
</script>
