<template lang="html">
  <v-card class="product-list-element" elevation="0"
          v-bind:style="{ backgroundColor }">
    <div v-if="listView === false || header === true">
      <p>
        <span>{{ title }}</span>
        <v-tooltip v-if="showHelpIcon" right>
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="ml-1" small :color="helpColor" v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
          </template>
          <span>{{ helpText }}</span>
        </v-tooltip>
      </p>
    </div>
    <div v-if="header === false">
      <p class="font--heading text-no-wrap" v-bind:class="{'color--success': header === true && type === 'success'}" v-if="parsedValue">{{ parsedValue }}</p>
      <p class="font--heading product-list-element__no-value" v-if="!parsedValue">n/a</p>
    </div>
  </v-card>
</template>

<script lang="ts">
import 'reflect-metadata'
import {Component, Prop, Vue} from "vue-property-decorator";
import NumbersService from "@/services/numbers.service";

@Component
export default class ProductListElement extends Vue {
  @Prop({default: 'default'}) type!: 'success' | 'default';
  @Prop() readonly listView!: boolean;
  @Prop() readonly header!: boolean;
  @Prop() helpText?: string;
  @Prop() prepend?: string;
  @Prop() append?: string;
  @Prop() title!: string;
  @Prop() value!: number;

  get showHelpIcon(): boolean {
    return !!this.helpText;
  }

  get parsedValue() {
    const valueAsNumber = Number(this.value);
    if (this.header || isNaN(valueAsNumber) || valueAsNumber === 0) {
      return null;
    }
    return `${this.prepend || ''}${NumbersService.parseNumericValue(valueAsNumber)}${this.append || ''}`
  }

  get helpColor(): string {
    switch (this.type) {
      case "success":
        return '#47bc6c';
      default:
        return '#CBCDDA'
    }
  }

  get backgroundColor(): string {
    switch (this.type) {
      case "success":
        return '#C6F9D6';
      default:
        return '#FFFFFF'
    }
  }

}

</script>

<style scoped lang="scss">
@import "src/styles/variables";

.product-list-element {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: $border;
  padding: 4px 8px;
  margin-bottom: 4px;

  .font--heading {
    font-size: 18px;
    line-height: 21px;
  }

  &__no-value {
    color: $accent;
    letter-spacing: 3px;
  }
}
.list-view {
  .product-list-element {
    margin: 4px;
    border: none;
    background-color: transparent !important;
    justify-content: center;
  }
}
</style>
