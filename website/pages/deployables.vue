<template lang="pug">
section.section
  h1.title Deployables
    div(class="buttons has-text-weight-normal", style="float:right;")  
      button.button(class="is-primary is-outlined", v-if="justProjects", @click="justProjects=false") Show all Deployables
      button.button(class="is-primary is-outlined", v-else, @click="justProjects=true") Show Projects   
      b-button(class="is-primary", tag="nuxt-link", to="/newDeployable",  type="is-light")  + Add New Deployable
  b-table(:data="listOfDeployables", focusable) 
    template(slot-scope="props")
      b-table-column(field="name", label="Name")
        b-icon(v-if="props.row.type==='database'", icon="database", size="is-small")
        b-icon(v-else-if="props.row.type==='api'", icon="run", size="is-small")
        b-icon(v-else-if="props.row.type==='project'", icon="android-studio", size="is-small")
        b-icon(v-else, icon="webpack", size="is-small")
        nuxt-link(:to="`/deployable/${props.row.name}`")
          span(v-html="std_deployableDisplay(props.row, true)")
        //{{stdOwnerPrefix(props.row.owner)}}{{ props.row.name }}
        //- b-table-column(field="product_owner" ,label="Owner")
          | {{ props.row.product_owner }}
      b-table-column(field="description", label="Description")
        | {{ props.row.description }}
      b-table-column(field="is_project", label="Project")
        | {{ props.row.is_project | yesno }}
        
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
  name: 'Projects',

  data () {
    return {
      projects: [ ],
      justProjects: false,
    }
  }, // - data

  computed: {
    listOfDeployables: function() {
      let filteredList = this.projects.filter(project => {
        return (project.is_project || !this.justProjects)
      })
      return filteredList
      // Alternative method:
      // let arr = [ ]
      // this.projects.forEach(project => {
      //   if (project.is_project || !this.justProjects) {
      //     arr.push(project)
      //   }
      // })
      // return arr
    },
  },

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    try {
      console.log(`------------------- asyncData`)
      const url = standardStuff.apiURL('/deployables')
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      let res = await axios.get(url, config);
      const projects = res.data.deployables;
      console.log(`data::: `, res.data.deployables)

      return {
        projects: projects,
      }
    } catch (e) {
      console.log(`Error while fetching deployables:`, e)
    }
  },

  methods: {
    ...standardStuff.methods
  }//- methods
}
</script>

<style lang="scss">
</style>
