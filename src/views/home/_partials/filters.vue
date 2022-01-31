<template>
  <div class="filters">
    <div class="filters-container">
      <transition name="slide-fade">
        <div class="filters-container__selects" v-if="mobileOpen || $vuetify.breakpoint.smAndUp">
          <v-btn icon color="black" height="50" large @click="changeVueMode" v-if="$vuetify.breakpoint.smAndUp">
            <v-icon class="view-mode-icon" v-bind:class="{'rotate': listMode}">{{ viewIcon }}</v-icon>
          </v-btn>
          <le-select
              outlined
              v-model="sortValue"
              :mobile-full-width="true"
              :key="'sort'"
              :items="sortFilterValues"/>
          <le-select
              v-if="showFarms"
              outlined
              v-model="farmValue"
              :mobile-full-width="true"
              :key="'farm'"
              :items="farmValues"/>
        </div>
      </transition>
      <div>
        <v-text-field
            class="filters-container__search"
            v-model="query"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            height="50"
            outlined
            rounded
            clearable
            hide-details
        ></v-text-field>
      </div>
    </div>
    <div class="filters__show-more" v-if="!$vuetify.breakpoint.smAndUp">
      <v-btn text block color="primary" @click="mobileOpen = !mobileOpen">
        <v-icon class="filters__show-more--icon" v-bind:class="{rotate: mobileOpen}">mdi-chevron-down</v-icon>
        Show more
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue, Watch} from "vue-property-decorator";
import {Filter, sortFilterValues} from "@/interfaces";
import {BehaviorSubject} from "rxjs";
import LeSelect from "@/components/shared/_forms/select/select.vue";
import FarmStore from "@/store/farm";
import {emptyFilterValue} from "@/interfaces/filters.interface";
import {Subject} from "rxjs-compat";
import {takeUntil} from "rxjs/operators";

@Component({
  components: {LeSelect}
})
export default class Filters extends Vue {
  sortFilterValues = sortFilterValues;

  public static reset$ = new Subject();

  public sortValue = sortFilterValues[0];
  public farmsLoaded = false;
  public mobileOpen = false;
  public farmValue: Filter = emptyFilterValue
  public query = ''
  public listMode = true;
  private readonly destroy$ = new Subject();

  @Prop({required: true})
  private readonly sortSubject!: BehaviorSubject<string | undefined>;
  @Prop({required: true})
  private readonly farmSubject!: BehaviorSubject<string | undefined>;
  @Prop({required: true})
  private readonly querySubject!: BehaviorSubject<string | undefined>;

  async mounted() {
    await FarmStore.getFarms();
    this.farmValue = this.farmValues[0] || null;
    this.farmsLoaded = true;
    Filters.reset$.asObservable().pipe(
        takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sortValue = sortFilterValues[0];
      this.query = '';
      this.sortSubject.next(this.sortValue.id.toString());
      this.querySubject.next(this.query);
    });
  }

  @Emit()
  changeVueMode() {
    this.listMode = !this.listMode;
    return this.listMode;
  }

  get viewIcon() {
    return !this.listMode ? 'mdi-view-grid' : 'mdi-view-headline'
  }

  get farmValues(): Filter[] {
    return FarmStore.farms.map(item => {
      return {
        id: item.id!,
        name: item.name
      }
    })
  }

  get showFarms() {
    return this.farmsLoaded && this.farmValues.length > 1;
  }


  @Watch('sortValue')
  sortChanged(val: Filter) {
    this.sortSubject.next(val.id.toString());
  }

  @Watch('farmValue')
  farmChanged(val: Filter) {
    FarmStore.setCurrentFarm(val.id.toString());
    this.farmSubject.next(val.id.toString());
  }

  @Watch('query')
  queryChanged(val: string) {
    this.querySubject.next(val);
  }


}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

::v-deep .v-text-field--outlined .v-label {
  top: 15px;
}

::v-deep .v-text-field .v-input__control .v-input__slot {
  min-height: auto !important;
}

.filters {
  width: 100%;
  padding: 25px;

  .filters-container {
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    transition: height 150ms;

    &__selects {
      display: flex;
      margin-top: 8px;
      flex-direction: column;
      gap: 10px;

      .view-mode-icon {
        transition: all 350ms;
      }

      .rotate {
        transform: rotate(360deg);
      }
    }

    &__search {
      ::v-deep.v-input__prepend-inner {
        margin-top: 14px;
      }

      ::v-deep.v-label {
        top: 15px !important;
      }
    }

    @include respond-to('small') {
      justify-content: space-between;
      flex-direction: row;

      &__selects {
        flex-direction: row;
      }
    }
  }

  &__show-more {
    margin-top: 8px;

    &--icon {
      transition: all 300ms;
    }
  }
}

.rotate {
  transform: rotate(180deg);
}
</style>
