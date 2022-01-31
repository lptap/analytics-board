<template>
  <modal-wrapper :escape-close="true" @escape-click="close" :back-drop-close="true" @backdrop-click="close">
    <v-card rounded>
      <div v-if="showInitialPage">
        <v-card-title class="font__align--center">
          <p class="font--heading font__align--center"> Select wallet provider</p>
        </v-card-title>
        <v-card-text class="connect-modal__content">
          <v-btn v-if="!isMobile" :color="colorMap[WalletEnum.metamask]"
                 outlined
                 elevation="0"
                 @click="connect(WalletEnum.metamask)">
            <span class="color--dark" v-if="!isMetaMaskInstalled">GET </span>
            <img alt="metamask" class="connect-modal__content--metamask" src="@/assets/metamask.svg"/>
          </v-btn>
          <v-btn :color="colorMap[WalletEnum.walletConnect]"
                 outlined
                 elevation="0"
                 @click="connect(WalletEnum.walletConnect)">
            <img alt="wallet-connect" class="connect-modal__content--wallet-connect" src="@/assets/walletconnect.svg"/>
          </v-btn>
          <v-switch
              class="align-self-center"
              v-model="rememberMe"
              flat
              height="12"
              :color="$vuetify.theme.themes.light.primary"
              label="Remember me"
          ></v-switch>
        </v-card-text>
      </div>
      <div class="connect-modal__content--intermediate" v-if="onboardingInProcess">
        <loader :wallet-type="walletType"/>
        <div>
          <v-btn text :color="colorMap[walletType]" @click="refresh">
            Refresh
          </v-btn>
          <span>page after onboarding</span>
        </div>
      </div>
      <div class="connect-modal__content--intermediate" v-if="connectionInProcess">
        <loader :wallet-type="walletType"/>
      </div>
      <div class="connect-modal__content--intermediate connect-modal__content--error" v-if="isError">
        <p>Error <strong>{{ error.code }}</strong></p>
        <p>{{ error.message }}</p>
        <v-btn class="mt-2" text color="error" @click="close">
          Close
        </v-btn>
      </div>
    </v-card>
  </modal-wrapper>
</template>

<script lang="ts">
import {Component, Emit, Vue} from "vue-property-decorator";
import MetaMaskOnboarding from '@metamask/onboarding';
import {WalletEnum, colorMap} from "@/interfaces";
import WalletStore from "@/store/wallet";
import Loader from "@/components/shared/_common/loader/loader.vue";
import WalletAuthService from "@/services/wallet-auth.service";
import ModalWrapper from "@/components/shared/_modals/modal-wrapper/modal-wrapper.vue";
import UserAgentService from "@/services/user-agent.service";

@Component({
  components: {ModalWrapper, Loader}
})
export default class ConnectModal extends Vue {
  WalletEnum = WalletEnum;
  colorMap = colorMap;

  private walletType: WalletEnum = WalletEnum.none;
  private onboardingInProcess: boolean = false;
  private connectionInProcess: boolean = false;
  private rememberMe: boolean = true

  private isError: boolean = false;
  private error?: {
    code: number;
    message: string;
  };

  @Emit() close() {
    this.isError = false;
    this.error = undefined;
    this.onboardingInProcess = false;
    this.connectionInProcess = false;
  }

  get isMetaMaskInstalled(): boolean {
    return MetaMaskOnboarding.isMetaMaskInstalled();
  }

  get isMobile() {
    return UserAgentService.isMobile();
  }

  get showInitialPage() {
    return !this.connectionInProcess && !this.onboardingInProcess && !this.isError;
  }

  private connect(type: WalletEnum) {
    this.walletType = type;
    switch (type) {
      case WalletEnum.none:
        return this.close();
      case WalletEnum.metamask:
        return this.connectMetaMask();
      case WalletEnum.walletConnect:
        return this.connectWalletConnect()
    }
  }

  private async connectMetaMask() {
    try {
      if (!this.isMetaMaskInstalled) {
        new MetaMaskOnboarding().startOnboarding();
        this.onboardingInProcess = true;
      } else {
        this.connectionInProcess = true;
        const address = await WalletAuthService[WalletEnum.metamask].connect();
        const network = WalletAuthService[WalletEnum.metamask].network;
        const provider = WalletEnum.metamask;
        const rememberMe = this.rememberMe;
        await WalletStore.initWallet({address, provider, network, rememberMe});
        WalletStore.walletChanged$.next();
        setTimeout(() => {
          this.close();
        }, 1000);
      }
    } catch (error) {
      this.onboardingInProcess = false;
      this.connectionInProcess = false;
      this.error = error;
      this.isError = true;
    }
  }

  private async connectWalletConnect() {
    try {
      this.connectionInProcess = true;
      const address = await WalletAuthService[WalletEnum.walletConnect].connect();
      const network = WalletAuthService[WalletEnum.walletConnect].network;
      const provider = WalletEnum.walletConnect;
      const rememberMe = this.rememberMe;

      await WalletStore.initWallet({address, provider, network, rememberMe});
      setTimeout(() => {
        this.close();
      }, 1000);
    } catch (error) {
      this.onboardingInProcess = false;
      this.connectionInProcess = false;
      this.error = error;
      this.isError = true;
    }
  }

  private refresh() {
    window.location.reload();
  }
}
</script>

<style scoped lang="scss" src="./connect-modal.scss"/>
