<template lang="pug">
  section.section
    h1.title Environments
      div(class="buttons has-text-weight-normal", style="float:right;")
        b-button(class="is-primary", tag="nuxt-link", to="/newEnvironment",  type="is-light")  + Add New Environment
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

    b-table(:data="environments", focusable)
      template(slot-scope="props")
        b-table-column(field="name", label="Name")
          nuxt-link(:to="`/environment/${props.row.name}`")
            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
          //{{stdOwnerPrefix(props.row.owner)}}{{ props.row.name }}
        b-table-column(field="description", label="Description")
          | {{ props.row.description }}
        b-table-column(field="notes", label="Notes")
          | {{ props.row.notes }}
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
  name: 'Environments',

  data () {
    return {
      environments: [ ],
    }
  }, // - data

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    try {

      // Get the environments
      const url = standardStuff.apiURL('/environments')
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      console.log(`Calling ${url}`);
      let reply = await axios.get(url, config)
      console.log(`Response is: `, reply)

      return {
        environments: reply.data.environments
      }
    } catch (e) {
      console.log(`Error while fetching environments: `, e)
    }
  },

  methods: {
    ...standardStuff.methods,
  }
}
</script>

<style lang="scss">
</style>
