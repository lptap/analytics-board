<template>
    <modal-wrapper class="wallet-modal" :back-drop-close="true" @backdrop-click="close">
      <v-card rounded outlined elevation="10">
        <div class="wallet-modal__header font--regular">
          <wallet-logo :wallet-type="provider" :use-big="true"/>
          {{ address }}
          <div class="wallet-modal__close" @click="close">
            <v-icon>mdi-close</v-icon>
          </div>
        </div>
        <div class="wallet-modal__actions" v-if="isMetaMask">
          <v-select
              :items="networks"
              v-model="network"
              item-text="name"
              item-value="id"
              dense
              return-object
              single-line
              label="Select chain"
              outlined
              rounded
          ></v-select>
        </div>
      </v-card>
    </modal-wrapper>
</template>

<script lang="ts">
import {Component, Emit, Vue} from "vue-property-decorator";
import WalletStore from "@/store/wallet";
import ModalWrapper from "@/components/shared/_modals/modal-wrapper/modal-wrapper.vue";
import WalletLogo from "@/components/shared/_common/wallet-logo/wallet-logo.vue";
import {NetworkEnum, networkObjectMap, WalletEnum} from "@/interfaces";
import WalletAuthService from "@/services/wallet-auth.service";

@Component({
  components: {WalletLogo, ModalWrapper}
})
export default class WalletModal extends Vue {

  @Emit() close() {
  }

  get address() {
    return WalletStore.currentAddress;
  }

  get provider() {
    return WalletStore.currentProvider
  }

  get isMetaMask() {
    return WalletStore.currentProvider === WalletEnum.metamask;
  }

  get networks() {
    return Object.values(networkObjectMap);
  }

  get network() {
    return networkObjectMap[WalletStore.currentNetwork];
  }

  set network(value: { id: number, name: string }) {
    WalletAuthService[WalletStore.currentProvider].network = value.id as NetworkEnum;
    this.close();
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";

.wallet-modal {
  &__close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    opacity: 0.7;
    transition: all 100ms;

    &:hover {
      opacity: 1;
    }
  }

  &__header {
    padding: 0 0 16px;
  }

  &__actions {
    display: flex;
    margin-top: 20px;
    align-items: baseline;
    gap: 20px;
  }

  .v-card {
    width: 1200px;
    padding: 25px 25px 5px 25px;
  }
}
</style>
