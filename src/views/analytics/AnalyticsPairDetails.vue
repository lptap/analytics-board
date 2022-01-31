<template>
  <div>
    <breadcrumbs :current="`${pairData.token0.symbol}/${pairData.token1.symbol} details`"/>
    <div class="pair-details" v-if="pairData !== undefined">
      <div class="pair-details__header">
        <v-card elevation="0" rounded>
          <product-logos :logos="[pairData.token0.symbol, pairData.token1.symbol]"
                         :offset="30"
                         :absolute="false"
                         :size="75"
                         :direction="'xy'"/>
        </v-card>
        <v-card class="flex-grow-1" elevation="0" rounded>
          <p class="font--regular details-header">Details</p>
          <p> <span class="font--bold">Token 1: </span>{{pairData.token0.name}}</p>
          <p> <span class="font--bold">Token 2: </span>{{pairData.token1.name}}</p>
        </v-card>
      </div>
      <div class="pair-details__swaps">
        <v-card elevation="0" rounded>
          <p class="font--heading">
            <span>Transfers</span>
          </p>
          <v-simple-table>
            <template v-slot:default>
              <thead>
              <tr class="table-header">
                <th>
                  <span>Block number</span>
                </th>
                <th>
                  <span>Block timestamp</span>
                </th>
                <th>
                  <span>Value</span>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(transfer, index) of pairTransfers" :key="index">
                <td>
                  {{ transfer.block_number }}
                </td>
                <td>
                  {{ transfer.block_timestamp | date('datetime')}}
                </td>
                <td>
                  {{ transfer.value | weiNumber(5)}}
                </td>
              </tr>
              <tr v-if="!pairTransfers.length && !loading">
                <td colspan="3" class="text-center">
                  Nothing found
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
          <div v-if="loading" class="text-center">
              <loader/>
          </div>
          <paginator :current-page="currentPage" :item-count="itemCount" :per-page="25" :loading="loading" @changePage="changePage"/>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import AnalyticsStore from "@/store/alaytics";
import ProductLogos from "@/components/shared/_common/product-logos/ProductLogos.vue";
import MoralisService from "@/services/moralis.service";
import Paginator from "@/components/shared/_common/paginator/paginator.vue";
import Loader from "@/components/shared/_common/loader/loader.vue";
import {Transfer} from "@/interfaces";
import Breadcrumbs from "@/components/shared/_common/breadcrumbs/breadcrumbs.vue";
@Component({
  components: {Breadcrumbs, Loader, ProductLogos, Paginator}
})
export default class AnalyticsPairDetails extends Vue {

  public pairTransfers: Transfer[] = [];
  public currentPage = 0;
  public itemCount = 0;
  public loading = false;

  async created() {
    await AnalyticsStore.getPairData();
    await this.loadTransfers();
  }

  async changePage(page: number) {
    this.pairTransfers.length = 0;
    this.currentPage = page;
    await this.loadTransfers()
  }

  async loadTransfers() {
    this.loading = true;
    const paginatedResponse = await MoralisService.getPairTransfers(this.$route.params.address, this.currentPage, 25);
    this.itemCount = paginatedResponse.total;
    this.pairTransfers = paginatedResponse.result;
    this.loading = false;
  }

  get pairData() {
    return AnalyticsStore.pairsData.find(item => item.pair === this.$route.params.address)!;
  }

}
</script>

<style lang="scss" scoped>
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.pair-details {
  display: flex;
  flex-direction: column;

  .details-header {
    border-bottom: $border;
    padding-bottom: 4px;
    margin-bottom: 8px !important;
  }

  &__header {
    display: flex;
    flex-direction: column;

    @include respond-to('small') {
      flex-direction: row;
    }

  }

  .v-card {
    padding: 25px;
    margin: 25px;
  }
}
</style>
