<template lang="pug">
  section.section
    h1.title Environments
      div(class="buttons has-text-weight-normal", style="float:right;")
        b-button(class="is-primary", tag="nuxt-link", to="/newEnvironment",  type="is-light")  + Add New Environment
    b-table(:data="environments")
      template(slot-scope="props")
        b-table-column(field="name", label="Name")
          nuxt-link(:to="`/environment/${props.row.name}`") {{ props.row.name }}
        b-table-column(field="description", label="Description")
          | {{ props.row.description }}
        b-table-column(field="notes", label="Notes")
          | {{ props.row.notes }}
</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig

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
      let jwt = app.$nuxtLoginservice.jwt

      let config = {
        headers: {
          authorization: `Bearer ${jwt}`,
        }
      }

      // Get the environments
      const url = `${protocol}://${host}:${port}/environments`

      console.log(`Calling ${url}`);
      let reply = await axios.get(url, config)
      console.log(`Response is: `, reply)

      return {
        environments: reply.data.environments
      }
    } catch (e) {
      console.log(`Could not fetch environments: `, e)
    }
  }
}
</script>

<style lang="scss">
</style>
