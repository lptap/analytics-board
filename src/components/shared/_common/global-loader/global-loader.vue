<template>
  <div class="backdrop">
      <div class="global-loader__content">
        <loader :wallet-type="walletType" size="128" icon-size="80"/>
      </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import Loader from "@/components/shared/_common/loader/loader.vue";
import WalletStore from "@/store/wallet";
import ModalWrapper from "@/components/shared/_modals/modal-wrapper/modal-wrapper.vue";
@Component({
  components: {Loader, ModalWrapper}
})
export default class GlobalLoader extends Vue {

  @Prop({default: true}) isProviderSpecific!: boolean;

  get walletType() {
    if(this.isProviderSpecific) {
      return WalletStore.currentProvider;
    }
    return null;
  }

}
</script>

<style scoped lang="scss">
.global-loader {
  pointer-events: none;
  &__content {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }
}
</style>
