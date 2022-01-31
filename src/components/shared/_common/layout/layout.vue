<template lang="html">
  <div class="main-view">
    <connect-modal v-if="isConnecting" @close="connectWallet"/>
    <wallet-modal v-if="showAccountSettingsModal" @close="editWallet"/>
    <global-loader v-if="isLoading"/>
    <navigation-menu ref="mainMenu"/>
    <header class="main-view__header">
      <div class="main-view__header--inner">
        <v-btn icon large color="primary" @click="mainMenu.open()"><v-icon>mdi-dots-vertical</v-icon></v-btn>
        <v-toolbar-title>
          <a href="/">
            <v-img position="left center" :contain="$vuetify.breakpoint.smAndUp" class="main-view__header--logo"
                   src="@/assets/layer.exchange_logo.svg"></v-img>
          </a>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div v-if="walletConnected" class="main-view__wallet">
          <div class="main-view__wallet--address">
            <wallet-logo class :wallet-type="provider" size="30"/>
            <p @click="editWallet">{{ address }}</p>
          </div>
          <v-btn icon color="black" class="main-view__wallet--disconnect" @click="disconnect">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
        <v-btn v-if="!walletConnected" color="primary"
               elevation="0"
               @click="connectWallet">
          Connect wallet
        </v-btn>
      </div>
    </header>
    <div class="main-view__content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
import ConnectModal from "@/components/shared/_modals/connect-modal/connect-modal.vue";
import WalletStore from "@/store/wallet";
import WalletLogo from "@/components/shared/_common/wallet-logo/wallet-logo.vue";
import WalletModal from "@/components/shared/_modals/wallet-modal/wallet-modal.vue";
import CommonStore from "@/store/common";
import GlobalLoader from "@/components/shared/_common/global-loader/global-loader.vue";
import {Ethereum, WalletEnum} from "@/interfaces";
import WalletAuthService from "@/services/wallet-auth.service";
import NavigationMenu from "@/components/shared/_common/navigation-menu/navigation-menu.vue";

@Component({
  components: {NavigationMenu, GlobalLoader, WalletModal, WalletLogo, ConnectModal}
})
export default class Layout extends Vue {

  constructor() {
    super();
    const Ethereum = window.ethereum as Ethereum;
    if (Ethereum) {
      this.autoLogin().then(() => {
        Ethereum.removeListener('chainChanged', this.chainListener);
        Ethereum.removeListener('accountsChanged', this.accountListener);
        Ethereum.on('chainChanged', this.chainListener);
        Ethereum.on('accountsChanged', this.accountListener);
      });
    }
  }

  @Ref('mainMenu') readonly mainMenu!: NavigationMenu
  private isConnecting = false;
  private showAccountSettingsModal = false;

  connectWallet() {
    this.isConnecting = !this.isConnecting;
  }

  editWallet() {
    this.showAccountSettingsModal = !this.showAccountSettingsModal;
  }

  disconnect() {
    WalletAuthService[WalletStore.currentProvider].disconnect();
  }

  get walletConnected() {
    return WalletStore.isAuthenticated;
  }

  get address() {
    return WalletStore.currentAddress;
  }

  get provider() {
    return WalletStore.currentProvider;
  }

  get isLoading() {
    return CommonStore.isLoading;
  }

  private async chainListener(payload: string) {
    await WalletStore.changeNetwork(parseInt(payload, 16));
  }

  private async accountListener(payload: string[]) {
    await WalletStore.changeWallet(payload[0])
  }

  private async autoLogin(): Promise<void> {
    const rememberMe = this.detectAutoLogin();
    if (rememberMe) {
      const address = await WalletAuthService[rememberMe].connect();
      const network = WalletAuthService[rememberMe].network;
      WalletStore.initWallet({address, provider: rememberMe, network, rememberMe: true});
    }
  }

  private detectAutoLogin(): WalletEnum {
    return parseInt(localStorage.getItem('le-exchange-provider') || '0') as WalletEnum;
  }
}
</script>

<style lang="scss" scoped src="./layout.scss"/>
