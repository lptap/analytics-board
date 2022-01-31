<template>
  <div class="breadcrumbs">
    <v-btn icon :to="{name: 'true-home'}">
      <v-icon>mdi-home</v-icon>
    </v-btn>
    <div v-for="(route, index) of historyRoutes" :key="route">
      <v-icon>mdi-chevron-right</v-icon>
      <v-btn plain :to="route" :x-large="index === historyRoutes.length - 1" :disabled="index === historyRoutes.length - 1">
        {{getRouteName(route, index === historyRoutes.length - 1)}}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

const routeMap = {
  ['/analytics' as string]: 'Analytics' as string,
  ['/analytics/:address/pair-details' as string]: 'Pair details' as string,
}

@Component
export default class Breadcrumbs extends Vue {
  @Prop({default: null}) current: string | undefined;
  public historyRoutes: string[] = [];

  mounted() {
    const paths = this.$router.currentRoute.matched.map(item => {
      if (item.path.endsWith('/')) {
        return item.path.slice(0, -1);
      }
      return item.path;
    });
    this.historyRoutes = [... new Set(paths)];
  }

  getRouteName(routePath: string, isLast: boolean) {
    if (isLast && this.current) {
      return this.current;
    }
    return routeMap[routePath] as string;
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";

.breadcrumbs {
  display: flex;
  margin-left: 25px;
  flex-direction: row;
  align-items: center;

  .v-btn {
    padding: 8px;
  }

  .v-btn.v-btn--disabled {
    color: $primary !important;
    opacity: 1 !important;
    font-size: 2em !important;
    font-weight: 700 !important;
  }
}
</style>
