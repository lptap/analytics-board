<template>
  <div>
    <v-simple-table class="farms-table">
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Platform
          </th>
          <th class="text-left">
            Chain Network URL
          </th>
          <th class="text-left">
            Chain ID
          </th>
           <th class="text-left">
            Farming Schedule
          </th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <farm-item v-for="item in data"
                   :key="item.id"
                   :item="item"
        />
        </tbody>
      </template>
    </v-simple-table>
    <div class="pa-2 d-flex justify-space-between">
            <v-btn @click="refreshFarms" color="success" >
              Refresh rewards
            </v-btn>
            <v-btn :to="{name: 'admin-farms-add'}" color="primary" >
              <v-icon>mdi-plus</v-icon>
              Add farm
            </v-btn>
          </div>
  </div>

</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import FarmStore from "@/store/farm";
import {Farm} from "@/interfaces";
import FarmItem from "@/components/admin/farm-item/farm-item.vue";
import {ApiService} from "@/services/api.service";
import {Autocompounder} from "@/interfaces/autocompounder.interface";
@Component({
  components: {FarmItem}
})
export default class FarmList extends Vue {

  public data: Farm[] = FarmStore.farms as Farm[];

  constructor() {
    super();
  }
  async refreshFarms(model: Autocompounder) {

    let result = await ApiService.post<Autocompounder>('farms/refreshreward',model)
    console.log(result);
    if(result)
    {
        this.$toast.success('Rewards refreshed');
    }

  }

  created() {
    FarmStore.getFarms();
  }

}
</script>

<style scoped lang="scss">

</style>
