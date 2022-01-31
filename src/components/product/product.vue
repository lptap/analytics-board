<template lang="html">
  <div>
    <deposit-modal v-if="depositModal" :farm-summary="farmData" @close="closeModal"/>
    <withdraw-modal v-if="withdrawModal" :farm-summary="farmData" @close="closeModal"/>
    <v-card class="product-component"
            :elevation="0"
            v-bind:class="{'list-view': listView, 'header': header, 'options-active': showListActions}"
    >
      <product-header
          :type="type"
          :farm-protocol="'Ubeswap'"
          :farm-name="header ? 'NAME' : farmData.farmName"
          :farm-value="header ? 0 : farmData.tvl"
          :logos="header ? null : farmData.tokenLogos"
          :list-view="listView"
          :header="header"
      />
      <div class="product-component__content">
        <product-list-element :list-view="listView"
                              :header="header"
                              :value="header ? 0 : farmData.userTlvUSD"
                              title="My TVL"
                              help-text="My TVL"
                              prepend="$"/>
        <product-list-element :list-view="listView"
                              :header="header"
                              :value="header ? 0 : farmData.userRewards"
                              title="My Rewards"
                              help-text="My Rew"
                              prepend="$"/>
        <product-list-element :list-view="listView"
                              :header="header"
                              :value="header ? 0 : farmData.apr"
                              title="Apr"
                              help-text="APR"
                              append="%"/>
        <product-list-element :list-view="listView"
                              :header="header"
                              :value="header ? 0 : farmData.apy"
                              title="Apy"
                              help-text="APY"
                              type="success"
                              append="%"/>
      </div>
      <div class="product-component__footer" v-if="!listView">
        <v-btn elevation="0"
               outlined
               class="withdraw-btn"
               large
               :disabled="header === true || !canWithdraw"
               @click="withdraw">
          Withdraw
        </v-btn>
        <v-btn color="primary"
               elevation="0"
               large
               :disabled="header === true || !canDeposit"
               @click="deposit">
          Deposit
        </v-btn>
      </div>
      <div class="product-component__footer" v-if="listView">
        <v-btn small icon large rounded color="primary" @click="toggleListActions">
          <div class="product-component__footer--toggle-icon"
               v-bind:class="{'rotate': showListActions}">
            <v-icon v-if="!showListActions">mdi-cog-outline</v-icon>
            <v-icon v-if="showListActions">mdi-cog</v-icon>
          </div>
        </v-btn>
        <transition enter-active-class="animate__animated animate__bounceInRight"
                    leave-active-class="animate__animated animate__bounceOutRight" mode="out-in">
          <div class="product-component__footer--hidden-buttons" v-if="showListActions">
            <v-btn outlined
                   class="withdraw-btn"
                   elevation="2"
                   large
                   :disabled="header === true || !canWithdraw"
                   @click="withdraw">
              Withdraw
            </v-btn>
            <v-btn color="primary"
                   elevation="2"
                   large
                   :disabled="header === true || !canDeposit"
                   @click="deposit">
              Deposit
            </v-btn>
          </div>

        </transition>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import {Component, Prop, Vue} from "vue-property-decorator";
import ProductListElement from "@/components/product/_partials/ProductListElement.vue";
import ProductHeader from "@/components/product/_partials/ProductHeader.vue";
import {FarmSummary} from '@/interfaces/farm-summary.interface';
import DepositModal from "@/components/shared/_modals/deposit-withdraw-modal/deposit-modal.vue";
import WalletStore from "@/store/wallet";
import WithdrawModal from "@/components/shared/_modals/deposit-withdraw-modal/withdraw-modal.vue";

@Component({
  components: {WithdrawModal, DepositModal, ProductHeader, ProductListElement},
})
export default class Product extends Vue {
  @Prop({default: 'asset'}) readonly type!: 'asset' | 'lp-token';
  @Prop({default: null}) readonly farmData!: FarmSummary;
  @Prop({default: false}) readonly listView!: boolean;
  @Prop({default: false}) readonly header!: boolean;

  public depositModal = false
  public withdrawModal = false
  public showListActions = false

  get canDeposit() {
    return WalletStore.isAuthenticated;
  }

  get canWithdraw() {
    const userTvL = Number(this.farmData.userTlvUSD);
    return true || !isNaN(userTvL) && userTvL > 0;
  }

  deposit() {
    this.depositModal = true;
  }

  withdraw() {
    this.withdrawModal = true;
  }

  toggleListActions() {
    this.showListActions = !this.showListActions;
  }

  closeModal() {
    this.depositModal = false;
    this.withdrawModal = false;
    this.showListActions = false;
  }
}

</script>

<style scoped lang="scss">
@import "src/styles/variables";

.deposit-enter-active {
  animation: slideInRight .2s;
  transition: all 0.2s ease-out;
}

.deposit-leave-active {
  animation: slideInRight .2s reverse;
  transition: all 0.2s ease-in;
}

.v-text-field--outlined .v-label {
  top: 12px !important;
}

.clearfix::after {
  content: "";
  clear: both;
  display: block;
}

.product-component {
  border-radius: 8px;

  & > div {
    padding: 1em;
  }

  &__footer {
    border-top: $border;
    flex: 0 !important;
    display: flex;
    justify-content: space-between;
    gap: 50px;
  }

  * {
    flex: 1 1 0;
  }
}

.product-component.list-view {
  display: flex;
  flex-direction: row;
  border-bottom: $border;
  border-radius: 0;
  padding: 4px 0;
  transition: background-color 150ms ease;
  overflow: hidden;

  .product-component__footer {
    border-top: none;
    position: relative;

    &--hidden-buttons {
      position: absolute;
      display: flex;
      gap: 15px;
      right: 75px;
      top: 0;
      padding: 15px;
      animation-duration: 500ms;
      height: 100%;
    }

    &--toggle-icon {
      transition: all 500ms;

      &.rotate {
        transform: rotate(720deg);
      }
    }
  }

  &:not(.header):hover {
    background-color: #eff0f3;
  }

  * {
    flex: 1;
  }

  .product-component__content {
    display: flex;
    flex-direction: row;
  }
}

.product-component.header {
  border-top-left-radius: $border-radius;
  border-top-right-radius: $border-radius;
  border-bottom-width: 2px;

  .product-component__footer {
    opacity: 0;
  }
}

.withdraw-btn {
  border-color: #D5D6DF;
  background-color: white;
}
</style>
