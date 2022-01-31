<template lang="html" src="./_template.html"/>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import {FarmSummary} from "@/interfaces";
import ModalWrapper from "@/components/shared/_modals/modal-wrapper/modal-wrapper.vue";
import TransactionService from "@/services/transaction.service";
import FarmStore from "@/store/farm";

@Component({
  components: {ModalWrapper}
})
export default class WithdrawModal extends Vue {

  @Prop({required: true}) farmSummary!: FarmSummary;

  public value: number | null = null;
  public confirmPrompt = false;
  public confirmLoading = false;
  public title = 'Withdraw from';
  public actionName = 'Withdraw';
  public showAllButton = true;
  public allChecked = false;

  @Emit() close() {
  }

  get valueValid() {
    return this.allChecked || (this.value !== null && this.value > 0);
  }

  closeClick() {
    if (!this.confirmLoading || window.confirm('Operation in progress, do You want to close?')) {
      this.close();
    }
  }

  filterInput(e: KeyboardEvent) {
    const isSpecialKeys = e.ctrlKey || e.metaKey;
    const isDelete = e.code.toLowerCase() === 'backspace' || e.code.toLowerCase() === 'delete';
    if (!isSpecialKeys && !isDelete && !/^[0-9]|\./.test(e.key)) {
      e.preventDefault();
    }
  }

  allCheckChanged() {
    this.value = null;
  }

  async confirm() {
    if (!this.confirmPrompt) {
      this.confirmPrompt = true;
    } else {
      try {
        this.confirmLoading = true;
        if (this.allChecked) {
          await TransactionService.withdraw(FarmStore.currentFarm, this.farmSummary.acAddress, 123123);
        } else {
          await TransactionService.withdraw(FarmStore.currentFarm, this.farmSummary.acAddress, this.value!);
        }
        this.$toast.success('Transaction successful');
      } catch (error) {
        this.$toast.error(error.message);
      } finally {
        this.confirmLoading = false;
        this.confirmPrompt = false;
        this.value = null;
        this.close();
      }
    }
  }
}
</script>

<style scoped lang="scss" src="./_styles.scss"/>
