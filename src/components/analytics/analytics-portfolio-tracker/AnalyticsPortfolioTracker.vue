<template>
  <v-card class="portfolio-tracker" elevation="0" rounded>
    <v-card-title>Portfolio tracker</v-card-title>
    <v-card-text>
      <v-form ref="form" class="d-flex flex-row justify-space-between">
        <v-text-field outlined rounded dense v-model="address" placeholder="0x0000000000000000000000000000" label="Address"></v-text-field>
        <v-btn color="success" height="40" elevation="0" class="ml-5" @click="search">Search</v-btn>
      </v-form>

      <v-simple-table v-if="show">
        <template v-slot:default>
          <thead>
            <tr>
              <th>Borrowed Assets</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in borrowedAssets" :key="asset.token">
              <td>{{ asset.value | number }} {{ asset.token }}</td>
            </tr>
            <tr v-if="!borrowedAssets.length">
              <td class="text-center">Nothing found</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <div v-if="loading" class="text-center">
        <loader />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Moralis from '@/moralis';
import BigNumber from 'bignumber.js';
import Loader from '@/components/shared/_common/loader/loader.vue';

@Component({
  components: { Loader }
})
export default class AnalyticsPortfolioTracker extends Vue {
  public address: string = '';
  public show: boolean = false;
  public loading: boolean = false;
  public borrowedAssets: { value: string; token: string }[] = [];

  async search() {
    this.borrowedAssets = [];
    this.loading = true;
    this.show = false;
    const tokens = ['AVAX', 'DAI', 'LINK', 'MIM', 'USDC', 'USDT', 'WBTC', 'WETH'];

    for (let i = 0; i < tokens.length; i++) {
      await this.findBorrows(tokens[i]);
    }

    this.show = true;
    this.loading = false;
  }

  async findBorrows(name: string) {
    const repayBorrowj = Moralis.Object.extend(`RepayBorrowj${name}`);
    const query = new Moralis.Query(repayBorrowj).equalTo('borrower', this.address.toLowerCase());
    const results = await query.limit(1).descending('block_timestamp').find(repayBorrowj);

    if (results.length > 0) {
      const accountBorrows = results[0].attributes.accountBorrows;
      const value = new BigNumber(accountBorrows.toString()).div(1e18).toString();
      if (value !== '0') this.borrowedAssets.push({ value, token: name });
    }
  }
}
</script>

<style scoped lang="scss">
.portfolio-tracker {
  margin: 25px;
  padding: 25px;
}
</style>
