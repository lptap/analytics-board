<template>
  <div class="product-component__header" v-bind:class="{'list-view': listView}">
    <product-logos v-if="logos"
                   :logos="logos"
                   :offset="(listView ? 15 : 25)"
                   :size="(listView ? 25 : 50)"
                   :top="(listView ? 20 : -25)"
                   :left="(listView ? 10 : 25)"/>
    <div class="pa-0">
      <p class="font--heading">{{ farmName }}</p>
      <!-- <p class="font--sm">{{ assetName }}</p> -->
    </div>
    <div class="pa-0 product-component__header--info">
      <div>
        <p v-if="!listView || header" class="font-sm" v-bind:class="{'font-bold': header}">Protocol</p>
        <p v-if="!header" class="font--regular font--bold color--primary mb-1">{{ farmProtocol }}</p>
      </div>
      <div>
        <p v-if="!listView || header" class="font-sm" v-bind:class="{'font-bold': header}">TVL</p>
        <p v-if="!header" class="font--regular font--bold color--success">${{ farmValueParsed }}</p>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import 'reflect-metadata'
import {Component, Prop, Vue} from "vue-property-decorator";
import NumbersService from "@/services/numbers.service";
import ProductLogos from "@/components/shared/_common/product-logos/ProductLogos.vue";
@Component({
  components: {ProductLogos}
})
export default class ProductHeader extends Vue {
  @Prop({default: 'asset'}) readonly type!: 'asset' | 'lp-token';
  @Prop({default: ''}) readonly farmProtocol!: string;
  @Prop({default: ''}) readonly farmName!: string;
  @Prop({default: 0}) readonly farmValue!: number;
  @Prop({default: []}) readonly logos!: string[];
  @Prop({default: true}) readonly listView!: boolean;
  @Prop({default: false}) readonly header!: boolean;

  get assetName() {
    return this.type === 'asset' ? 'Single asset' : 'LP Token'
  }

  get farmValueParsed(): string {
    const valueAsNumber = Number(this.farmValue);
    if (isNaN(valueAsNumber)) {
      return '0';
    }
    return NumbersService.parseNumericValue(valueAsNumber);
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";

.product-component__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  &--info {
    text-align: right;
    min-width: 40%;
  }
}

.product-component__header.list-view {
  padding-left: 75px;
  flex-direction: row;
  align-items: center;

  .product-component__header--info {
    display: flex;
    flex-direction: row;
    column-gap: 50px;
    justify-content: space-around;

    div {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 50%;
    }
  }
}

</style>
