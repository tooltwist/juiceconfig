<template lang="pug">
section.section
  h1.title Deployables
    b-select(style="float:right;", placeholder="Sort by:")
      option(disabled selected) Sort by:
      option(value="showAll") Show all
      option(value="projects") Projects only
      option(value="myDeployables") My deployables
      option(value="collab") Collaborative
      option(value="public") Public 
    div.buttons.has-text-weight-normal(style="float:right;")  
      //button.button.is-primary.is-outlined(v-if="justProjects", @click="justProjects=false") Show all Deployables
      //button.button.is-primary.is-outlined(v-else, @click="justProjects=true") Show Projects   
      b-button.is-primary(tag="nuxt-link", to="/newDeployable",  type="is-light")  + Add New Deployable

  
  b-table(:data="listOfDeployables", focusable) 
    template(slot-scope="props")
      b-table-column(field="name", label="Name")
        b-icon(v-if="props.row.type==='database'", icon="database", size="is-small")
        b-icon(v-else-if="props.row.type==='api'", icon="run", size="is-small")
        b-icon(v-else-if="props.row.type==='project'", icon="android-studio", size="is-small")
        b-icon(v-else, icon="webpack", size="is-small")
        div(v-if="props.row.is_global != '0'") 
          nuxt-link(:to="`/deployable/${std_toQualifiedName(props.row.owner,props.row.name)}`") 
            span(v-html="std_toQualifiedDisplay('global',props.row.name,true)")
        div(v-else)
          nuxt-link(:to="`/deployable/${std_toQualifiedName(props.row.owner,props.row.name)}`")
            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
      b-table-column(field="description", label="Description")
        | {{ props.row.description }}
      b-table-column(field="type", label="Type")
        | {{ props.row.type }}
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

      let arr = [ ]

      if (command === 'projects') {
        this.projects.forEach(project => {
          if (project.is_project || !this.justProjects) {
            arr.push(project)
          }
        })

        return arr
      } else if (command === 'myDeployables') {

      } else if (command === 'collab') {

      } else if (command === 'public') {

      } else {
        return this.projects
      }
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
.hover tr:hover {
  background-color: green;
}

</style>
