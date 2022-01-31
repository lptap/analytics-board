<template>
  <v-card class="autocompounder my-10">
    <div class="d-flex align-center justify-space-between">
      <v-card-title>Autocompounders</v-card-title>
      <v-btn
        :to="{ name: 'admin-autocompounder', params: { id: this.$route.params.id } }"
        class="mr-5"
        color="primary"
      >
        <v-icon left>mdi-plus</v-icon>
        New autocompounder
      </v-btn>
    </div>

    <v-data-table :headers="headers" :items="autocompounders" class="elevation-0" hide-default-footer disable-pagination>
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.address }}</td>
          <td>
            <v-simple-checkbox
              color="primary"
              v-model="props.item.active"
              @click="changeActive(props.item)"
            ></v-simple-checkbox>
          </td>
          <td>
            <v-btn icon color="primary" @click="edit(props.item.id)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="error" @click="remove(props.item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FarmStore from '@/store/farm';
import { Autocompounder } from '@/interfaces/autocompounder.interface';

@Component
export default class Autocompounders extends Vue {
  private readonly headers = [
    {
      text: 'Name',
      value: 'name',
      sortable: false
    },
    {
      text: 'Address',
      value: 'address',
      sortable: false
    },
    {
      text: 'Active',
      value: 'active',
      sortable: false
    },
    {
      text: '',
      sortable: false
    }
  ];

  public autocompounders: Autocompounder[] | null = [];

  async changeActive(autocompounder: Autocompounder) {
    await FarmStore.editFarmAutocompounder(autocompounder);
  }

  async created() {
    this.autocompounders = await FarmStore.getFarmAutocompounders(this.$route.params.id);
  }

  async edit(aid: string) {
    await this.$router.push({ name: 'admin-autocompounder', params: { id: this.$route.params.id, aid } });
  }

  async remove(aid: string) {
    const params = {
      aid,
      id: this.$route.params.id
    };
    await FarmStore.deleteFarmAutocompounder(params);
    this.autocompounders = await FarmStore.getFarmAutocompounders(this.$route.params.id);
  }
}
</script>

<style scoped lang="scss">
.autocompounder {
  width: 800px;
}
</style>
