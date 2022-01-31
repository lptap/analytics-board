<template>
  <v-card class="autocompounder">
    <v-card-title v-if="!editMode">New Autocompounder</v-card-title>
    <v-card-title v-if="editMode">Edit Autocompounder</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="autocompounderModel.address"
          :rules="addressRules"
          placeholder="0x0000000000000000000000000000"
          label="Address"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.name"
          :rules="defaultRules"
          placeholder="Name"
          label="Autocompounder name"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.stakingReward"
          :rules="addressRules"
          placeholder="0x0000000000000000000000000000"
          label="Staking reward address"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.rewardsToken"
          :rules="addressRules"
          placeholder="0x0000000000000000000000000000"
          label="Rewards token address"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.stakingToken"
          :rules="addressRules"
          placeholder="0x0000000000000000000000000000"
          label="Staking token address"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.token0Name"
          :rules="defaultRules"
          placeholder="Name"
          label="Token0 name"
          required
        ></v-text-field>

        <v-text-field
          v-model="autocompounderModel.token1Name"
          :rules="defaultRules"
          placeholder="Name"
          label="Token1 name"
          required
        ></v-text-field>

        <div class="d-flex flex-row justify-space-between mt-3">
          <v-btn color="error" class="mr-4" @click="reset">Cancel</v-btn>
          <v-spacer />
          <v-btn :disabled="!valid" color="success" class="mr-4" @click="validate">Save</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { Autocompounder } from '@/interfaces/autocompounder.interface';
import FarmStore from '@/store/farm';

@Component({})
export default class AddAutocompounder extends Vue {
  public valid = false;
  public editMode = this.$route.params.aid ? true : false;
  public autocompounderModel: Autocompounder = {
    idFarm: this.$route.params.id,
    name: '',
    address: '',
    stakingReward: '',
    rewardsToken: '',
    stakingToken: '',
    token0Name: '',
    token1Name: ''
  };

  constructor() {
    super();

    if (this.editMode) {
      const params = {
        aid: this.$route.params.aid,
        id: this.$route.params.id
      };

      FarmStore.getFarmOneAutocompounders(params).then((res: Autocompounder | null) => {
        Object.assign(this.autocompounderModel, res);
      });
    }
  }

  public defaultRules = [(v: string) => !!v || 'Required'];
  public addressRules = [
    ...this.defaultRules,
    (v: string) => (v && /0x./.test(v)) || 'Address is wrong format'
  ];

  @Ref() form!: any;
  async reset() {
    this.form.reset();
    await this.$router.push({ name: 'admin-farms-edit', params: { id: this.$route.params.id } });
  }

  async validate() {
    this.form.validate();

    if (this.editMode) {
      await FarmStore.editFarmAutocompounder(this.autocompounderModel);
    } else {
      const model: Autocompounder = { ...this.autocompounderModel };
      await FarmStore.addFarmAutocompounder(model);
    }

    await this.$router.push({ name: 'admin-farms-edit', params: { id: this.$route.params.id } });
  }
}
</script>

<style scoped lang="scss">
.autocompounder {
  width: 500px;
}
</style>
