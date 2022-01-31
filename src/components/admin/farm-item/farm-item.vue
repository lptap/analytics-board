<template>
  <tr>
    <td>{{ item.name }}</td>
    <td>{{ item.platform }}</td>
    <td>{{ item.chainNetworkUrl }}</td>
    <td>{{ item.chainId }}</td>
    <td>{{ item.executionSchedule }}</td>
    <td>
        <div class="actions" v-if="!deleting">
          <v-btn icon color="primary" @click="edit">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="error" @click="askDelete">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
        <div class="actions" v-if="deleting">
          <v-btn color="error" plain @click="confirmDelete">
            <v-icon left>mdi-delete</v-icon>
            Confirm
            <v-progress-linear
                v-model="deletingTimer"
                color="error lighten-2"
                class="delete-confirm__timeout"
                rounded
                value="100"
            ></v-progress-linear>
          </v-btn>
          <v-btn icon color="black" @click="rejectDelete">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
    </td>
  </tr>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Farm} from "@/interfaces";
import FarmStore from "@/store/farm";

@Component
export default class FarmItem extends Vue{
  @Prop({required: true})
  public readonly item!: Farm;

  public deleting = false;
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;


  askDelete() {
    this.deleting = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) {
        this.rejectDelete();
      }
    }, 50);
  }

  rejectDelete() {
    this.deleting = false;
    if (this.deletingTimerId) {
      clearInterval(this.deletingTimerId!);
    }
    this.deletingTimerId = undefined;
  }

  async edit() {
    await this.$router.push({name: 'admin-farms-edit', params: {id: this.item.id!}});
  }

  async confirmDelete() {
    this.rejectDelete();
    await FarmStore.deleteFarm(this.item);
  }
}
</script>

<style scoped lang="scss">
.actions {
  animation: fadeIn .2s ease-out 0s 1 forwards;
  -webkit-animation: fadeIn .2s ease-out 0s 1 forwards;
  -moz-animation: fadeIn .2s ease-out 0s 1 forwards;
}
.delete-confirm__timeout {
  position: absolute;
  bottom: -4px;
}
</style>
