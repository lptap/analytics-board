<template lang="html">

  <section class="home pb-10">
    <div class="home__content" v-bind:class="{'list-view': isListMode}">
      <filters
          :sort-subject="sortValue$"
          :farm-subject="farmValue$"
          :query-subject="query$"
          @change-vue-mode="changeVueMode"/>
    </div>
    <div class="home__content" v-bind:class="{'list-view': isListMode}">
      <div class="home__box home__box--header" v-if="isListMode" v-bind:class="{'list-scrolled': lastScrollPos > 100}">
        <product :header="true" :list-view="isListMode"/>
      </div>
      <div v-for="(farmDataItem, index) in farms" :key="`${farmDataItem.lpAddress}_${index}`" class="home__box">
        <product :list-view="isListMode" type="asset" :farmData="farmDataItem"/>
      </div>
    </div>
  </section>
</template>

<script lang="ts">

import {Component, Vue} from "vue-property-decorator";
import Product from "@/components/product/product.vue";
import Filters from "@/views/home/_partials/filters.vue";
import FarmStore from "@/store/farm";
import {FarmSummary} from "@/interfaces";
import {BehaviorSubject, combineLatest} from "rxjs";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs-compat";
import WalletStore from "@/store/wallet";

@Component({
  components: {Filters, Product},
})
export default class Home extends Vue {

  private readonly sortValue$ = new BehaviorSubject(undefined);
  private readonly farmValue$ = new BehaviorSubject<string>('');
  private readonly query$ = new BehaviorSubject(undefined);
  private readonly destroy$ = new Subject();

  private lastFarm = '';

  public listMode = true;
  public lastScrollPos = 0;
  public farms: FarmSummary[] = [];

  created () {
    window.addEventListener('scroll', this.onScroll);
  }

  destroyed () {
    window.removeEventListener('scroll', this.onScroll);
  }

  get isListMode() {
    return this.listMode && this.$vuetify.breakpoint.smAndUp;
  }

  async mounted() {
    combineLatest([
      this.query$.asObservable().pipe(debounceTime(250)),
      this.farmValue$.asObservable(),
      this.sortValue$.asObservable(),
    ]).pipe(
        takeUntil(this.destroy$)
    ).subscribe(async ([query, farm, sort]) => {
      if (this.lastFarm !== farm && farm !== '') {
        this.lastFarm = farm;
        await FarmStore.initUberSwapFarms(farm)
      }
      this.farms = this.farmsParsed(query, sort);
    })

    WalletStore.walletChanged$.asObservable().pipe(
        takeUntil(this.destroy$)
    ).subscribe(async () => {
      Filters.reset$.next();
      await FarmStore.initUberSwapFarms(this.lastFarm);
      this.farms = this.farmsParsed();
    })
  }

  unmounted() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeVueMode($event: boolean) {
    this.listMode = $event;
  }

  onScroll() {
    this.lastScrollPos = window.scrollY;
  }

  farmsParsed(query?: string, sort?: string,) {
    return FarmStore.ubeswapFarms
        .filter(item => !query || item.farmName.toLowerCase().indexOf(query.toLowerCase()) > -1)
        .sort((a: FarmSummary, b: FarmSummary) => {
          const sortValue = sort || 'name asc';

          const [sortProp, sortOrder] = sortValue.split(' ');
          let prev = a;
          let next = b;
          if (sortOrder === 'dsc') {
            prev = b;
            next = a;
          }
          switch (sortProp) {
            case "tvl":
              return this.compare(prev.tvl, next.tvl);
            case "apr":
              return this.compare(prev.apr, next.apr);
            case "apy":
              return this.compare(prev.apy, next.apy);
            case "default":
            default:
              return 1;
          }
        });
  }

  private compare(prev: string | number, next: string | number): number {
    const a = Number(prev);
    const b = Number(next);
    return a < b ? -1 : a > b ? 1 : 0;
  }

}
</script>

<style scoped lang="scss">
@import "src/styles/mixins/breakpoints.mixins";
@import "src/styles/variables";

.header-enter-active {
  animation: slideInTop .2s;
}

.header-leave-active {
  animation: slideInTop .2s reverse;
}

.home {
  &__content {
    max-width: 800px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-content: center;
  }

  &__box {
    flex: 1 1 100%;
    max-width: 450px;
    margin: 25px;

    &--header {
      width: 100%;
      position: sticky;
      top: 90px;
      z-index: 1;
    }
  }

  @include respond-to('small') {
    &__content {
      flex-direction: row;
      justify-content: space-evenly;
      flex-wrap: wrap;
    }

    &__box {
      flex: 1 1 30%;
    }
  }

  @include respond-to('medium') {
    &__content {
      max-width: 1500px;
    }
  }

  .home__content.list-view {
    max-width: 1920px;

    .home__box {
      flex: 1 1 100%;
      width: 100%;
      max-width: 100%;
      margin: 0 25px;

      &.list-scrolled {
        box-shadow: 0 10px 15px -15px #000000
      }
    }
  }
}
</style>
