<template>
  <div class="paginator-wrapper" v-if="showPaginator">
    <div class="items-indicator" v-if="showItemsIndicator">
      Items count: {{itemCount}}
    </div>
    <div class="paginator">
      <v-btn icon
             large
             class="prev-btn"
             :disabled="isFirstPage || loading"
             @click="changePage(currentPage - 1)">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div v-if="!isMobile">
        <v-btn icon
               large
               :disabled="loading"
               @click="changePage(page)"
               v-for="page of pages"
               v-bind:key="page"
               v-bind:class="{'v-btn--active': currentPage === page}">
          {{page + 1}}
        </v-btn>
      </div>
      <div v-if="isMobile" class="pagination-select">
        <select @change="mobileSelectChanged" :value="currentPage">
          <option v-for="(page, index) of pages" v-bind:key="index"
                  :disabled="loading"
                  :value="page" :selected="currentPage === page">Page {{ page + 1 }}</option>
        </select>
      </div>
      <v-btn icon
             large
             class="next-btn"
             :disabled="isLastPage || loading"
             @click="changePage(currentPage + 1)">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import UserAgentService from "@/services/user-agent.service";
import {Component, Emit, Prop, Vue} from "vue-property-decorator";

@Component
export default class Paginator extends Vue{
  @Prop({required: true}) itemCount!: number;
  @Prop({default: 10}) perPage!: number;
  @Prop({required: true}) currentPage!: number;
  @Prop({default: false}) loading!: boolean;
  @Prop({default: true}) showItemsIndicator!: boolean;

  get pagesCount() {
    return Math.ceil(this.itemCount / this.perPage);
  }

  get showArrows() {
    return this.pagesCount > 3;
  }

  get isMobile() {
    return UserAgentService.isMobile();
  }

  get pages(): number[] {
    if (UserAgentService.isMobile()) {
      return Array.from({length: this.pagesCount}, (_, i) => i);
    }
    const length = this.pagesCount < 5 ? this.pagesCount : 5;
    const startPage = this.currentPage - 2 > 0 ? this.currentPage - 2 : 0;
    const lastPage = this.pagesCount - length;
    return Array.from({length}, (_, i) => i + (startPage > lastPage ? lastPage : startPage));
  }

  get isFirstPage() {
    return this.currentPage === 0;
  }

  get showPaginator() {
    return !!this.itemCount && this.itemCount > this.perPage;
  }

  get isLastPage() {
    return this.currentPage === this.pagesCount - 1;
  }

  mobileSelectChanged(event: any) {
    const page = this.pages.find(page => page === event.target.value);
    this.$emit('changePage', page);
  }

  @Emit('changePage')
  changePage(){}
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.paginator-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  padding-top: 16px;
}

.items-indicator {
  display: none;
  @include respond-to('small') {
    display: inline;
  }
}


.paginator {
  display: flex;
  .v-btn {
    margin: 0;
    border-radius: 0 !important;
  }
  .next-btn {
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }
  .prev-btn {
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }

  .pagination-select {
    select {

      /* styling */
      background-color: white;
      color: $text-color;
      border: none;
      display: block;
      font: inherit;
      line-height: 1.5em;
      padding: 0.5em 3.5em 0.5em 1em;
      width: 100%;
      height: 50px;
      /* reset */

      margin: 0;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      -webkit-appearance: none;
      -moz-appearance: none;
    }


    select.minimal {
      background-image:
          linear-gradient(45deg, transparent 50%, gray 50%),
          linear-gradient(135deg, gray 50%, transparent 50%);
      background-position:
          calc(100% - 20px) calc(1em + 5px),
          calc(100% - 15px) calc(1em + 5px),
          calc(100% - 2.5em) 0.5em;
      background-size:
          5px 5px,
          5px 5px,
          1px 1.5em;
      background-repeat: no-repeat;
    }
  }
}
</style>
