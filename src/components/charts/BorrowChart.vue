<template>
  <div class="ma-auto" style="width: 200px; height: 200px;">
    <div v-bind:class="{backdrop: detailsView}">
      <div :id="`${id}_wrapper`"
           class="chart-wrapper"
           v-bind:style="{top, left}"
           v-bind:class="{details: detailsView}">
        <div>
          <canvas :id="id" width="200" height="200"></canvas>
        </div>
        <v-btn v-if="!detailsView" class="action" :color="color" text @click="showDetails">
          {{ name }}
        </v-btn>
        <div v-if="detailsView" class="details__addons pa-2">
          <p class="font--heading text-center mb-2" v-bind:style="{color}">{{name}}</p>
          <p> <span v-bind:style="{color}" class="font--bold">Borrows TXs: </span>{{borrowValue.toFixed(3)}}%</p>
          <p> <span class="font--bold">Lending TXs: </span>{{(100 - borrowValue).toFixed(3)}}%</p>
          <v-btn class="mt-auto" color="secondary" text @click="showDetails">
            Close
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Vue, Prop} from "vue-property-decorator";

import {Chart, ChartData, ChartItem, registerables} from 'chart.js';

Chart.register(...registerables);

const getOrCreateTooltip = (chart: Chart) => {
  let tooltipEl = chart.canvas.parentNode!.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '8px';
    tooltipEl.style.zIndex = '2';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = '1';
    tooltipEl.style.width = '200px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.display = 'flex';
    tooltipEl.style.flexDirection = 'row';
    tooltipEl.style.alignItems = 'center';
    chart.canvas.parentNode!.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const {chart, tooltip} = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  // Set Text
  if (tooltip.body) {
    const bodyLines = tooltip.body.map((b: any) => b.lines);

    bodyLines.forEach((body: any, i: number) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '0';
      span.style.marginRight = '8px';
      span.style.height = '8px';
      span.style.width = '8px';
      span.style.display = 'inline-block';

      const text = document.createTextNode(body);

      while (tooltipEl!.firstChild) {
        tooltipEl!.firstChild.remove();
      }

      tooltipEl.appendChild(span);
      tooltipEl.appendChild(text);
    });
  }

  // Display, position, and set styles for font
  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = '0%';
  tooltipEl.style.top = '50%';
  tooltipEl.style.transform = 'translateY(-50%)';
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};
@Component
export default class BorrowChart extends Vue {
  @Prop({required: true}) name!: string;
  @Prop({required: true}) borrowValue!: number;
  @Prop({default: '#ff6384'}) color!: string;

  public id: string;
  public detailsView: boolean = false;
  public top = '0';
  public left = '0';

  constructor() {
    super();
    this.id = Math.random().toString();
  }

  mounted() {
    const data: ChartData = {
      labels: ['Lending TXs %', 'Borrows TXs %'],
      datasets: [{
        label: `${this.name} Borrows`,
        data: [100 - this.borrowValue, this.borrowValue],
        backgroundColor: [
          '#F5F7FB',
          this.color
        ],
      }],
    }
    Chart.defaults.plugins.legend = {
      ...Chart.defaults.plugins.legend,
      display: false
    };
    const ctx = document.getElementById(this.id) as ChartItem;
    new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        cutout: 80,
        borderRadius: 8,
        plugins: {
          tooltip: {
            enabled: false,
            position: 'nearest',
            external: externalTooltipHandler
          }
        }
      } as any
    })
  }

  showDetails() {
    const rect = document.getElementById(`${this.id}_wrapper`)?.getBoundingClientRect();
    if (rect) {
      this.top = this.detailsView ? '0' : `${rect.top.toString()}px`;
      this.left = this.detailsView ? '0' : `${(rect.right - rect.width).toString()}px`;
    }
    this.detailsView = !this.detailsView;

  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

* {
  transition: all 0ms;
}

@keyframes showcaseChart {
  to {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@keyframes showAddons {
  from {
    width: 0;
    height: 0;
  }
  to {
    width: 200px;
    height: 200px;
  }
}


.chart-wrapper {
  position: relative;

  &.details {
    position: fixed;
    background-color: white;
    border-radius: $border-radius;
    animation: showcaseChart .2s ease-out 0s 1 forwards;
    -webkit-animation: showcaseChart .2s ease-out 0s 1  forwards;
    -moz-animation: showcaseChart .2s ease-out 0s 1  forwards;
    display: flex;
    flex-direction: column;

    @include respond-to('small') {
      flex-direction: row;
    }

    .details__addons {
      width: 0;
      height: 0;
      overflow: hidden;
      animation: showAddons .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) .5s 1 forwards;
      -webkit-animation: showAddons .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) .5s 1  forwards;
      -moz-animation: showAddons .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) .5s 1  forwards;
      display: flex;
      flex-direction: column;

    }
  }

  canvas {
    width: 200px !important;
    height: 200px !important;
  }

  .action {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>


<!--'#ff6384',-->
<!--'#36a2eb',-->
<!--'#ffcd56'-->
