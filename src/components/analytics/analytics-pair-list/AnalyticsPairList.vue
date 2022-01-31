<template>
  <v-card class="pair-list" elevation="0" rounded>
    <v-card-title class="header">
      <span>Pairs</span>
      <v-spacer/>
      <v-text-field
          class="header__search"
          :value="query"
          @input="queryChanged($event)"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          dense
          outlined
          rounded
          clearable
          hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text>
      <v-simple-table class="pair-list__table">
        <template v-slot:default>
          <tbody>
          <tr v-for="pair of pairData" :key="`${pair.token0.address}_${pair.token1.address}`">
            <td class="pairs-row">
              <product-logos :logos="[pair.token0.symbol, pair.token1.symbol]"
                             :offset="15"
                             :size="25" :top="8" :left="8"/>
              <router-link :to="{ name: 'anal-pair-details', params: { address: pair.pair } }">{{pair.token0.symbol}}/{{pair.token1.symbol}}</router-link>
            </td>
          </tr>
          <tr v-if="!pairData.length">
            <td class="text-center">
              Nothing found
            </td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
      <paginator :current-page="currentPage" :item-count="itemCount" :per-page="10" @changePage="changePage"/>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {PairData} from "@/interfaces";
import AnalyticsStore from "@/store/alaytics";
import Loader from "@/components/shared/_common/loader/loader.vue";
import {Subject} from "rxjs-compat";
import {debounceTime, takeUntil} from "rxjs/operators";
import Paginator from "@/components/shared/_common/paginator/paginator.vue";
import StringService from "@/services/string.service";
import ProductLogos from "@/components/shared/_common/product-logos/ProductLogos.vue";

@Component({
  components: {ProductLogos, Paginator, Loader}
})
export default class AnalyticsPairList extends Vue{
  public pairDataFiltered: PairData[] = [];
  public query = '';
  public currentPage = 0;
  public itemCount = 0;

  public query$ = new Subject<string>();
  public destroy$ = new Subject();

  created() {
    AnalyticsStore.getPairData();
    this.query$.pipe(
        takeUntil(this.destroy$),
        debounceTime(350),
    ).subscribe(q => {
      this.query = q;
      this.currentPage = 0;
    })
  }

  queryChanged(val: string) {
    console.log(val);
    this.query$.next(val);
  }

  unmounted() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  get pairData() {
    const filtered = AnalyticsStore.pairsData
        .filter(item => StringService.isNullOrWhitespace(this.query) || item.token0.symbol.toLowerCase().indexOf(this.query.toLowerCase()) >= 0 || item.token1.symbol.toLowerCase().indexOf(this.query.toLowerCase()) >= 0);
    this.itemCount = filtered.length;
    return filtered.slice(this.currentPage * 10, this.currentPage * 10 + 10);
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";

.pair-list {
  padding: 25px;
  margin: 25px;

  .header {
    &__search {
      max-width: 300px;
      padding: 8px;
    }
  }

  &__table {
    width: 100%;
    overflow: hidden;

    .pairs-row {
      position: relative;
      a {
        margin-left: 50px;
      }
    }

    tr {
      border-bottom: $border;

      a:not(:hover) {
        color: $text-color;
        text-decoration: none;
      }
    }
  }
}
</style>
