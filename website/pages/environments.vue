<template lang="pug">
  section.section
    h1.title Environments
      div(style="float:right; display: flex;")
        b-select(placeholder="Sort by:", v-model="group")
          option(disabled selected) Sort by:
          option(value="") Show all
          option(:value="group", v-for="group in groups") {{ group.group_name }}
  
        div.buttons.has-text-weight-normal(style="padding: 0px 5px;")
          b-button.is-primary(tag="nuxt-link", to="/newEnvironment",  type="is-light")  + Add New Environment

    b-notification(aria-close-label="Close notification")
      | An &nbsp;
      b environment
      | &nbsp;provides the infrastructure to run&nbsp;
      b applications
      | . To run an application you deploy one or more&nbsp;
      b deployables
      | &nbsp;onto the environment.
      | Environments typically support the various stage
      | of software development - local machine, CI (Continuous Integration),
      | testing, UAT, staging and production.
      | Projects and applications can share environments, rather than
      | having dedicated servers for each stage. When deploying to AWS, each environment corresponds to an ECS Cluster.

    b-table(:data="selectedGroup", focusable)
      template(slot-scope="props")
        b-table-column(field="name", label="Name")
          nuxt-link(:to="`/environment/${std_toQualifiedName(props.row.owner,props.row.name)}`")
            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
        b-table-column(field="description", label="Description")
          | {{ props.row.description }}
        b-table-column(field="notes", label="Notes")
          | {{ props.row.notes }}
        b-table-column(v-if="groups.length != 0", field="group_name", label="Group") 
          span(v-if="groupColour(props.row.group_name) === ''") {{ props.row.group_name }}
          span(v-else)
            span(:class="['tag', groupColour(props.row.group_name)]") {{ props.row.group_name }}

</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
  name: 'Environments',

  data () {
    return {
      environments: [ ],
      groups: [ ],
      group: '',
    }
  }, // - data

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    try {
      // Get the environments
      const url = standardStuff.apiURL('/showEnvironments')
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      console.log(`Calling ${url}`);
      let reply = await axios.get(url, config)
      console.log(`Response is: `, reply)

      // Load all groups for distinction
      const url2 = standardStuff.apiURL('/groups')
      console.log(`Calling ${url2}`);
      let reply2 = await axios.get(url2, config)
      console.log(`Response2 is: `, reply2)

      return {
        environments: reply.data.environments,
        groups: reply2.data.groups,
      }
    } catch (e) {
      console.log(`Error while fetching environments: `, e)
    }
  },

  computed: {
    // This function changes the display of the environments table based on the selection of group 
    selectedGroup: function () {
      console.log('Group is ', this.group.group_name);
      
      let environmentsGrouped = [ ];
      let j = 0;

      for (let i = 0; i < this.environments.length; i++) {
        let environment = this.environments[i];

        if (environment.group_name === this.group.group_name) {
          environmentsGrouped[j] = environment;
          j++;
        }
      }
    
      if (environmentsGrouped.length === 0) {
        return this.environments;
      } else {
        return environmentsGrouped;
      }
    }
  },

  methods: {
    ...standardStuff.methods,

    groupColour: function(group_name) {
      let colour = 'none';

      for (let i = 0; i < this.groups.length; i++) {
        let group = this.groups[i];

        if (group.group_name === group_name) {
          colour = group.colour;
        }
      }

      if (colour === 'none') {
        return '';
      } else if (colour === 'red') {
        return 'is-danger';
      } else if (colour === 'blue') {
        return 'is-info';
      } else if (colour === 'green') {
        return 'is-success';
      } else if (colour === 'orange') {
        return 'is-primary'
      } else if (colour === 'yellow') {
        return 'is-warning';
      } else {
        return '';
      }
    },//- groupColour

  }
}
</script>

<style lang="scss">
</style>
