<template>
  <transition enter-active-class="animate__animated animate__bounceInLeft"
              leave-active-class="animate__animated animate__zoomOutLeft" mode="out-in">
    <v-card v-click-outside="close" v-if="opened" class="nav-menu">
      <v-btn @click="close" class="nav-btn" color="primary" elevation="0" block :to="{name: 'true-home'}">
        <v-icon>mdi-home</v-icon>
        <span>Home</span>
        <v-icon class="addon">mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn @click="close" class="nav-btn" color="primary" elevation="0" block :to="{name: 'anal-main'}">
        <v-icon>mdi-chart-donut-variant</v-icon>
        <span>Analytics</span>
        <v-icon class="addon">mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn @click="close" class="nav-btn mt-4" color="primary" elevation="0" block :to="{name: 'admin-farms'}">
        <v-icon>mdi-incognito</v-icon>
        <span>Admin</span>
        <v-icon class="addon">mdi-chevron-right</v-icon>
      </v-btn>
    </v-card>
  </transition>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class NavigationMenu extends Vue {
  public opened = false;

  open() {
    if (!this.opened) {
      this.opened = true;
    }
  }

  close() {
    if (this.opened) {
      this.opened = false;
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";

@keyframes menuBackground {
  0% {
    background-color: rgba(0, 0, 0, 0.0);
  }
  100% {
    background-color: rgba(0, 0, 0, 0.1);
  }
}


.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.0);
  animation: menuBackground .1s ease-in-out 0s 1 forwards;
  -webkit-animation: menuBackground .1s ease-in-out 0s 1 forwards;
  -moz-animation: menuBackground .1s ease-in-out 0s 1 forwards;
}

.nav-menu {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 4;
  width: 100%;
  max-width: 250px;
  margin: 100px 25px;
  padding: 25px;
  background-color: $primary;
  border-radius: 16px;
  color: $secondary;
  animation-duration: 750ms;

  .nav-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &:not(.v-btn--active) {
      .addon {
        opacity: 0;
      }
    }
  }
}
</style>
