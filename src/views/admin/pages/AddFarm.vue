<template>
  <div>
    <v-card class="new-farm">
      <v-card-title v-if="!editMode">New Farm</v-card-title>
      <v-card-title v-if="editMode">Edit Farm</v-card-title>
      <v-card-text>
        <v-form
            v-if="model"
            ref="form"
            v-model="valid"
        >
          <v-text-field
              v-model="model.name"
              :rules="defaultRules"
              label="Name"
              required
          ></v-text-field>

          <v-text-field
              v-model="model.platform"
              :rules="defaultRules"
              label="Platform"
              required
          ></v-text-field>

          <v-text-field
            v-model="model.chainNetworkUrl"
            :rules="defaultRules"
            label="Chain Network Url"
            required
          ></v-text-field>

          <v-text-field
            v-model="model.chainId"
            :rules="numberRules"
            label="Chain ID"
            required
          ></v-text-field>

          <div class="d-flex align-center justify-space-between scheduler">
            <v-text-field
              v-model="scheduler.amount"
              :rules="numberRules"
              label="Execute farming every"
              required
              :value="6"
            ></v-text-field>
            
            <v-select
              v-model="scheduler.unit"
              :rules="defaultRules"
              :items="unit"
              required
              class="ml-10"
            ></v-select>
          </div>

          <div class="d-flex flex-row justify-space-between mt-3">
            <v-btn
                color="error"
                class="mr-4"
                @click="reset"
            >
              Cancel
            </v-btn>
            <v-spacer/>
            <v-btn
                :disabled="!valid"
                color="success"
                class="mr-4"
                @click="validate"
            >
              Save
            </v-btn>

          </div>

        </v-form>
      </v-card-text>
    </v-card>

    <autocompounders v-if="editMode" />
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from "vue-property-decorator";
// import FarmStore from "@/store/farm";
import {Farm} from "@/interfaces/farm.interface";
import FarmStore from "@/store/farm";
import Autocompounders from "@/components/admin/autocompounders/autocompounders.vue";

@Component({
  components: {Autocompounders}
})
export default class AddFarm extends Vue {

  public valid = true;
  public editMode = false;
  public model: Farm = {
    deployed: 0,
    name: '',
    pendingRewards: '0',
    platform: '',
    rewardToken: '0',
    reinvestRewardBips: '0',
    timelock: '0',
    totalDeposits: '0',
    totalSupply: '0',
    depositToken: '0',
    chainNetworkUrl: '',
    chainId: 0,
    executionSchedule: ''
  };

  public unit = ['seconds', 'minutes', 'hours', 'days'];
  public scheduler: { amount: number, unit: string } = {
    amount: 0,
    unit: ''
  };

  constructor() {
    super();

    this.editMode = !!this.$route.params.id;

    if (this.editMode) {
      FarmStore.getFarm(this.$route.params.id).then(res => {
        Object.assign(this.model, res);
        // this.model = res;

        const executionSchedule = res!.executionSchedule.split(' ');
        this.scheduler.amount = +executionSchedule[0];
        this.scheduler.unit = executionSchedule[1];        
      });
    }
  }



  public defaultRules = [
    (v: string) => !!v || 'Required',
  ];
  public addressRules = [
    ...this.defaultRules,
    (v: string) => (v && /0x./.test(v)) || 'Address is wrong format',
  ];
  public numberRules = [
    ...this.defaultRules,
    (v: number) =>Number.isInteger(Number(v)) || 'The value must be a number',
    (v: number) => v > 0 || 'The value must be greater than 0' 
  ];


  @Ref() form!: any

  async validate () {
    this.form.validate();
    this.model.executionSchedule = `${this.scheduler.amount} ${this.scheduler.unit}`;
    if (this.editMode) {
      await FarmStore.editFarm(this.model);
    } else {
      await FarmStore.addFarm(this.model);
    }
    await this.$router.push({name: 'admin-farms'});
  }
  async reset () {
    this.form.reset();
    await this.$router.push({name: 'admin-farms'});
  }

}
</script>

<style scoped lang="scss">
.new-farm {
  width: 500px;
}
.scheduler .v-select {
  width: 230px;
}
</style>
