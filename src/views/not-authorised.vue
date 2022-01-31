<template>
  <div class="not-authorised">
    <img class="not-authorised__addon animate__animated animate__bounceIn" alt="arrow" src="@/assets/arrow_alt.png"/>
    <div class="not-authorised__message animate__animated animate__fadeIn">
      <p class="font--heading mb-2 d-flex justify-center align-center">To use this application please connect to You wallet.</p>
      <p class="font--heading mb-2 d-flex justify-center align-center">using
        <img alt="metamask" height="40" src="@/assets/metamask.svg"/>
        or
        <img class="ml-3" alt="metamask" height="20"  src="@/assets/walletconnect.svg"/>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class NotAuthorised extends Vue {
}
</script>

<style scoped lang="scss">
.not-authorised {
  width: 100%;
  max-width: 1920px;
  margin: auto;
  height: 100%;
  position: relative;

  &__message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 1s;
    text-align: center;
  }
  &__addon {
    position: absolute;
    max-width: 400px;
    top: 0;
    right: 0;
    animation-delay: 1.5s;
  }
}
</style>
