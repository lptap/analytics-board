<template>
    <v-layout class="admin" fill-height>
      <div class="admin__content">
        <transition>
          <router-view></router-view>
        </transition>
       </div>

    </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";



@Component
export default class Admin extends Vue {

}
</script>

<style scoped lang="scss">
.admin {
  display: flex;
  max-width: 1920px;
  margin: auto;
  &__nav {
    padding-top: 25px;
  }
  &__content {
    padding: 30px;
  }
}
</style>
