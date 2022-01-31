<template>
  <v-card class="charts-wrapper" elevation="0" rounded>
    <v-card-title>Lending & Borrowing</v-card-title>
    <div v-if="!loading" class="charts-wrapper__content">
      <borrow-chart v-for="(asset, index) in borrowers" :key="asset.token" :borrow-value="asset.value"
                    :name="asset.token" :color="colors[index % 3]"/>
    </div>
    <div v-if="loading" class="charts-wrapper__loader">
      <loader/>
    </div>
  </v-card>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import Moralis from '@/moralis';
import BorrowChart from '@/components/charts/BorrowChart.vue';
import Loader from "@/components/shared/_common/loader/loader.vue";

@Component({
  components: {Loader, BorrowChart}
})
export default class AnalyticsBorrowCharts extends Vue {
  public borrowers: { value: number; token: string }[] = [];
  public loading: boolean = true;

  public readonly colors = ['#ff6384', '#36a2eb', '#ffcd56']

  async created() {
    const tokens = ['AVAX', 'DAI', 'LINK', 'MIM', 'USDC', 'USDT', 'WBTC', 'WETH'];
    for (let i = 0; i < tokens.length; i++) {
      await this.findTotalBorrowersAndLenders(tokens[i]);
    }
    this.loading = false;
  }

  async findTotalBorrowersAndLenders(name: string) {
    const lenders = Moralis.Object.extend(`Mintj${name}`);
    const qrL = new Moralis.Query(lenders);
    const countL = await qrL.count();
    const borrow = Moralis.Object.extend(`Borrowj${name}`);
    const qrB = new Moralis.Query(borrow);
    const countB = await qrB.count();
    const lbSum = countL+countB;
    const value = (countB / lbSum) * 100;
    this.borrowers.push({value, token: name});
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.charts-wrapper {
  padding: 25px;
  margin: 25px;
  &__content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 8px;
  }

  &__loader {
    display: flex;
    justify-content: center;
  }
}
</style>
