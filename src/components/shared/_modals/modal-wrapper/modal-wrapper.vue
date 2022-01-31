<template>
  <transition name="modal-animation">
    <div class="modal backdrop" @keydown.esc="keyPressed">
      <div class="modal__content animate__animated animate__bounceInRight"
           v-if="center === false"
           v-bind:style="{maxWidth: `${maxWidthParsed}`, right}">
        <div v-click-outside="handleClick">
          <slot></slot>
        </div>
      </div>
      <div class="modal__content--center animate__animated animate__zoomInDown"
           v-if="center === true"
           v-bind:style="{maxWidth: `${maxWidthParsed}`}">
        <div v-click-outside="handleClick">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";

@Component
export default class ModalWrapper extends Vue {
  @Prop({default: false}) backDropClose!: boolean;
  @Prop({default: false}) escapeClose!: boolean;
  @Prop({default: false}) center!: boolean;
  @Prop({default: 350}) maxWidth!: number;

  @Emit() backdropClick() {
  }

  @Emit() escapeClick() {
  }

  created() {
    document.addEventListener('keydown', this.keyPressed);
  }

  destroyed() {
    document.removeEventListener('keydown', this.keyPressed);
  }

  get right() {
    return window.innerWidth > 1920 ? `${(window.innerWidth - 1920) / 2 + 15}px` : '0'
  }

  handleClick() {
    if (this.backDropClose) {
      this.backdropClick();
    }
  }

  keyPressed(e: KeyboardEvent) {
    if (this.escapeClose) {
      if (e.code.toLowerCase() === 'escape') {
        this.escapeClick();
      }
    }
  }

  get maxWidthParsed() {
    return this.$vuetify.breakpoint.xsOnly ? '100%' : `${this.maxWidth}px`;
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.modal-animation-leave-active {
  animation: fadeIn .3s reverse;
  transition: all 0.2s ease-in;
}


.modal {
  &__content {
    position: absolute;
    width: 100%;
    padding: 25px;
    animation-duration: 500ms;
    overflow: hidden;

    &--center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-duration: 500ms;
      overflow: hidden;
    }
  }
}

@include respond-to('small') {
  .modal {
    &__content {
      top: 65px;
      right: 0;
      padding: 15px;

      &.center {
        top: 50%;
        right: 50%;
        transform: translate(50%, -50%) !important;
      }
    }
  }
}

</style>
