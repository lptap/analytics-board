<template lang="html" src="./_template.html"/>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import TransactionService from "@/services/transaction.service";
import FarmStore from "@/store/farm";
import {FarmSummary} from "@/interfaces";
import ModalWrapper from "@/components/shared/_modals/modal-wrapper/modal-wrapper.vue";

@Component({
  components: {ModalWrapper}
})
export default class DepositModal extends Vue {

  @Prop({required: true}) farmSummary!: FarmSummary;

  public value: number | null = null;
  public confirmPrompt = false;
  public confirmLoading = false;
  public title = 'Deposit to';
  public actionName = 'Deposit';
  public showAllButton = false;
  public allChecked = false;

  @Emit() close() {
  }

  get valueValid() {
    return this.value !== null && this.value > 0;
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

  async confirm() {
    if (!this.confirmPrompt) {
      this.confirmPrompt = true;
    } else {
      try {
        this.confirmLoading = true;
        if (await TransactionService.needApproval(FarmStore.currentFarm, this.farmSummary.stakingToken, this.farmSummary.acAddress, this.value!)) {
          await TransactionService.approve(FarmStore.currentFarm, this.farmSummary.stakingToken, this.farmSummary.acAddress);
        }
        await TransactionService.deposit(FarmStore.currentFarm, this.farmSummary.stakingToken, this.farmSummary.acAddress, this.value!);
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
