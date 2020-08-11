<template lang="pug">
section.section
  h1.title Deployables
    div(style="float:right; display: flex;")
      b-select(placeholder="Sort by:", v-model="sortBy")
        option(disabled selected) Sort by:
        option(value="showAll") Show all
        option(value="projects") Projects only
        option(value="myDeployables") My deployables
        option(value="collab") Collaborative
        option(value="public") Public 
      div.buttons.has-text-weight-normal(style="padding: 0px 5px;")   
        b-button.is-primary(tag="nuxt-link", :to="`/user/${user}/newDeployable`",  type="is-light")  + Add New Deployable
  
  b-table(:data="listOfDeployables", focusable) 
    template(slot-scope="props")
      b-table-column(field="name", label="Name")
        b-icon(v-if="props.row.type==='database'", icon="database", size="is-small")
        b-icon(v-else-if="props.row.type==='api'", icon="run", size="is-small")
        b-icon(v-else-if="props.row.type==='project'", icon="android-studio", size="is-small")
        b-icon(v-else, icon="webpack", size="is-small")
        div.iconTable(v-if="props.row.is_global != '0'") 
          nuxt-link(:to="`/user/${user}/deployable/${std_toQualifiedName(props.row.owner,props.row.name)}`") 
            span(v-html="std_toQualifiedDisplay('public',props.row.name,true)")
        div.iconTable(v-else)
          nuxt-link(:to="`/user/${user}/deployable/${std_toQualifiedName(props.row.owner,props.row.name)}`")
            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
      b-table-column(field="description", label="Description")
        | {{ props.row.description }}
      b-table-column(field="type", label="Type")
        | {{ props.row.type }}
</template>

<script>
import axios from 'axios'
import standardStuff from '../../../lib/standard-stuff'

export default {
  name: 'Projects',

  data () {
    return {
      projects: [ ],
      currentUser: '',
      projectUsers: [],
      sortBy: 'showAll',
      user: '',
    }
  }, // - data

  computed: {
    listOfDeployables: function () {      
      let sortedDeployables = [ ];
      let j = 0;

      if (this.sortBy != 'showAll') {
        for (let i = 0; i < this.projects.length; i++) {
          let deployable = this.projects[i];

          if (this.sortBy === 'projects') { // show projects only 
            if (deployable.type === 'project') {
              sortedDeployables[j] = deployable;
              j++;
            }
          } else if (this.sortBy === 'myDeployables') { // show deployables owned by user only
            if (deployable.owner === this.user) {
              sortedDeployables[j] = deployable;
              j++;
            }

            // check if user is secondary owner in project_user db - might change this later in case 
            // original user wants to exchange their ownership with another user... 
            this.projectUsers.forEach(project => {
              if (deployable.name === project.project && project.access === 'owner') {
                sortedDeployables[j] = deployable;
                j++;
              }
            })

          } else if (this.sortBy === 'public') { // show all public (global) deployables
            if (deployable.is_global != '0' || deployable.is_global != 0) {
              sortedDeployables[j] = deployable;
              j++;
            }
          } else if (this.sortBy === 'collab') { // show all deployables that user collaborates on
            // Compare collab deployables with projects to create list
            this.projectUsers.forEach(project => {
              if (deployable.name === project.project && project.access === 'collab') {
                sortedDeployables[j] = deployable;
                j++;
              }
            })
          } 
        }
      } else {
        return this.projects; 
      }
    
      return sortedDeployables; 
    },
  },

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let currentUser = app.$nuxtLoginservice.user.username
    let user = params.userName

    try {
      const params = {
        params: { 
          username: currentUser,
          user: user,
        }
      }

      // Retrieve ALL deployables from db table deployables 
      console.log(`------------------- asyncData`)
      const url = standardStuff.apiURL('/deployables')
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      let res = await axios.get(url, params, config);
      const projects = res.data.deployables;
      console.log(`data::: `, res.data.deployables)

      // Retrieve all records with current userid from project_user db table
      const url2 = standardStuff.apiURL('/projectAccess')
      let res2 = await axios.get(url2, params, config);
      const projectUsers = res2.data.records;
      console.log(`data2::: `, res2.data.records)

      return {
        projects: projects,
        currentUser: currentUser,
        projectUsers: projectUsers,
        user: user,
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

.iconTable {
  display: inline-block;
}

</style>
