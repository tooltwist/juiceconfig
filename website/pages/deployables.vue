<template lang="pug">
section.section
  h1.title Deployables
    div(class="buttons has-text-weight-normal", style="float:right;")  
      button.button(class="is-primary is-outlined", v-if="justProjects", @click="justProjects=false") Show all Deployables
      button.button(class="is-primary is-outlined", v-else, @click="justProjects=true") Show Projects   
      b-button(class="is-primary", tag="nuxt-link", to="/newDeployable",  type="is-light")  + Add New Deployable
  b-table(:data="listOfDeployables") 
    template(slot-scope="props")
      b-table-column(field="name", label="Name")
        nuxt-link(:to="`/deployable/${props.row.name}`") {{ props.row.name }}
      b-table-column(field="product_owner" ,label="Owner")
        | {{ props.row.product_owner }}
      b-table-column(field="description", label="Description")
        | {{ props.row.description }}
      b-table-column(field="is_project", label="Project")
        | {{ props.row.is_project | yesno }}
        
</template>

<script>
import axios from 'axios'

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
      let jwt = app.$nuxtLoginservice.jwt

      const url = `http://localhost:4000/deployables`
      let config = {
        headers: {
          authorization: `Bearer ${jwt}`,
        }
      }
      console.log(`Calling ${url}`);
      let res = await axios.get(url, config);
      const projects = res.data.list;
      console.log(`data::: `, res.data.list)

      return {
        projects: projects,
      }
    } catch (e) {
      console.log(`Could not fetch projects:`, e)
    }
  }
}
</script>

<style lang="scss">
</style>
