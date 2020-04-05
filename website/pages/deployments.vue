<template lang="pug">
  section.section
    h1.title Applications
      div(class="buttons has-text-weight-normal", style="float:right;")
        //b-button(class="is-primary", tag="nuxt-link", to="/newEnvironment",  type="is-light")  + New Deployment
        b-button.is-primary(@click="initNewDeploymentDialog")  + New Deployment

    //- <div class="modal-card">
    //-   <header class="modal-card-head">
    //-     <p class="modal-card-title">Modal title</p>
    //-     <button class="delete" aria-label="close"></button>
    //-   </header>
    //-   <section class="modal-card-body">
    //-     <!-- Content ... -->
    //-   </section>
    //-   <footer class="modal-card-foot">
    //-     <button class="button is-success">Save changes</button>
    //-     <button class="button">Cancel</button>
    //-   </footer>
    //- </div>



    b-notification(aria-close-label="Close notification")
      | When a &nbsp;
      b deployable
      | &nbsp;is running in an&nbsp;
      b environment
      | &nbsp;it is called an&nbsp;
      strong application
      | . A deployable can be run in multiple environments, and also
      | as multiple instances within an environment.


    b-table(:data="deployments", focusable)
      template(slot-scope="props")
        b-table-column(field="environment", label="Environment")
          nuxt-link(:to="`/environment/${props.row.name}`") {{stdOwnerPrefix(props.row.environment_owner)}}{{ props.row.environment }}
        b-table-column(field="application_name", label="Name")
          | {{ props.row.application_name }}
        b-table-column(field="deployable", label="Deployable")
          nuxt-link(:to="`/environment/${props.row.name}`") {{stdOwnerPrefix(props.row.deployable_owner)}}{{ props.row.deployable }}
        //- b-table-column(field="description", label="Description")
        //  | {{ props.row.description }}
        //b-table-column(field="notes", label="Notes")
        //  | {{ props.row.notes }}
        b-table-column(field="", label="")
          //div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
           b-button(class="button is-small is-primary is-outlined", tag="nuxt-link", :to="`../config/${props.row.environment}/${props.row.deployable}`") Configure
        b-table-column(field="", label="")
          //- div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
          b-button(class="button is-small is-primary is-outlined", tag="nuxt-link", :to="`../config/${props.row.environment}/${props.row.deployable}`") Configure


      //- // Edit User Modal starts below:
      //- | YARP
      //- .modal
      //-   .modal-background
      //-     .modal-content
      //-       | Here is the model
      //-     button.modal-close.is-large(aria-label="close")

    .modal(:class="{ 'is-active': showDialog }")
      .modal-background
      .modal-content
        .modal-card
          .modal-card-head
            p.modal-card-title
              | Define Application
          .modal-card-body
            form.formStyle
                .field.is-horizontal
                    .field-label.is-normal
                      label.label(style="width:200px;") Environment: 
                    .field-body
                      .field
                        .control
                          select.select(v-model="environmentId")
                            option(v-for="env in environments", :value="`${env.owner}:${env.name}`")
                              | {{env.name}}
                              | &nbsp;- {{env.description}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Deployable: 
                    .field-body
                      .field
                        .control
                          select.select(v-model="deployableId")
                            option(v-for="dep in deployables", :value="`${dep.owner}:${dep.name}`")
                              | {{dep.name}}
                              | &nbsp;- {{dep.description}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") New application name: 
                    .field-body
                      .field
                          .control
                              input.input(v-model.trim="applicationName", :placeholder="defaultApplicationName")

                          p.has-text-danger.is-size-7(v-show="nameIsUsed")
                            | &nbsp;&nbsp;&nbsp;Name is already used

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Notes: 
                    .field-body
                      .field
                        .control
                          textarea.textarea(v-model="notes")


            b-message(:active.sync="showSaveErrorMsg", title="Notice", type="is-danger", aria-close-label="Close message")
              | An error occurred, and the new deployment was not saved. Please try again.

            //article.message.is-danger
              .message-body.is-danger
              | An error occurred, and the new deployment record was not saved. Please try again.

          .modal-card-foot
            button.button.is-success(:disabled="!readyToSave", @click="createDeployment") Save
            button.button(@click="showDialog = false;") Cancel

</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig
import standardStuff from '../lib/standard-stuff'

export default {
  name: 'Deployments',

  data () {
    return {
      deployments: [ ],
      environments: [ ],
      deployables: [ ],

      // Modal to add a deployment
      showDialog: false,
      environment: '',
      environmentOwner: '',
      deployable: '',
      deployableOwner: '',
      applicationName: '',
      notes: '',

      environmentId: '', // owner:name
      deployableId: '', // owner:name

      showSaveErrorMsg: false,
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
      // let url = `${protocol}://${host}:${port}/deployments`
      // let reply = await axios.get(url, config)
      // const deployments = reply.data.deployments
      const deployments = await loadDeployments(jwt)

      let url = `${protocol}://${host}:${port}/environments`
      let reply = await axios.get(url, config)
      const environments = reply.data.environments

      // console.log(`BEFORE loading deployables`);
      // let deployables = await loadDeployables(jwt)
      // console.log(`AFTER loading deployables`, deployables);

      url = `${protocol}://${host}:${port}/deployables`
      reply = await axios.get(url, config)
      const deployables = reply.data.deployables


// console.log(`deployments=`, deployments);
// console.log(`environments=`, environments);
// console.log(`deployables=`, deployables);


      return {
        deployments,
        environments,
        deployables,
      }
    } catch (e) {
      console.log(`Error while fetching deployments: `, e)
    }
  },

  computed: {
    defaultApplicationName: function () {

      // See if a deployable has been selected.
      let pos = this.deployableId.indexOf(':')
      if (pos < 0) { return '' } // Nope, none selected
      const owner = this.deployableId.substring(0, pos)
      const name = this.deployableId.substring(pos + 1)
      console.log(`dep is ${owner}:${name}`);

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':')
      if (pos < 0) { return name } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos)
      const envName = this.environmentId.substring(pos + 1)
      console.log(`env is ${envOwner}:${envName}`);

      // Find a non-duplicate deployable name.
      let newApplicationName = name
      for (let cnt = 1; ; cnt++) {
        // create a name
        if (cnt > 1) {
          newApplicationName = `${name}_${cnt}`
        }
        console.log(`Check ${newApplicationName}`);

        // See if it's already used
        for (let i = 0; i < this.deployments.length; i++) {
          let deployment = this.deployments[i]
          // console.log(` => `, deployment);
          // console.log(` - ${deployment.environment_owner}:${deployment.environment}:${deployment.application_name}`);
          if (!this.applicationExists(envOwner, envName, newApplicationName)) {
            return newApplicationName
          }
        } //- for
      }
    },//- defaultApplicationName

    nameIsUsed () {
      let pos = this.deployableId.indexOf(':')
      if (pos < 0) { return false } // Nope, none selected

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':')
      if (pos < 0) { return false } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos)
      const envName = this.environmentId.substring(pos + 1)
      console.log(`env is ${envOwner}:${envName}`);

      if (this.applicationName && this.applicationExists(envOwner, envName, this.applicationName)) {
        return true // need an application name
      }
      return false
    },

    readyToSave () {
      // See if we have a deployable selected.
      let pos = this.deployableId.indexOf(':')
      if (pos < 0) { return false }

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':')
      if (pos < 0) { return false }

      // See if an application with this environment and name is used.
      const envOwner = this.environmentId.substring(0, pos)
      const envName = this.environmentId.substring(pos + 1)
      if (this.applicationName && this.applicationExists(envOwner, envName, this.applicationName)) {
        return false // need an application name
      }
      return true
    },//- readyToSave

  },

  methods: {
    ...standardStuff.methods,

    applicationExists (environmentOwner, environmentName, applicationName) {
        for (let i = 0; i < this.deployments.length; i++) {
          let deployment = this.deployments[i]
          // console.log(` => `, deployment);
          // console.log(` - ${deployment.environment_owner}:${deployment.environment}:${deployment.application_name}`);
          
          if (
            deployment.environment_owner === environmentOwner
            && 
            deployment.environment === environmentName
            &&
            deployment.application_name === applicationName
          ) {
            return true
          }
        } //- for
        return false
    },

    initNewDeploymentDialog () {
      this.environmentId = ''
      this.deployableId = ''
      this.applicationName = ''
      this.showSaveErrorMsg = false
      this.showDialog = true;
    },

    async createDeployment () {
      console.log(`createDeployment()`);

      this.showSaveErrorMsg = false

      // See if a deployable has been selected.
      let pos = this.deployableId.indexOf(':')
      if (pos < 0) { return '' } // Nope, none selected
      const owner = this.deployableId.substring(0, pos)
      const name = this.deployableId.substring(pos + 1)
      console.log(`dep is ${owner}:${name}`);

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':')
      if (pos < 0) { return name } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos)
      const envName = this.environmentId.substring(pos + 1)
      console.log(`env is ${envOwner}:${envName}`);

      let applicationName = this.applicationName
      if (!applicationName) {
        applicationName = this.defaultApplicationName
      }

      let notes = this.notes

      // Prepare the object
      let obj = {
        environment_owner: envOwner,
        environment: envName,
        deployable_owner: owner,
        deployable: name,
        application_name: applicationName,
        notes: notes,
      }
      console.log(`obj is`, obj);
      
      try {
        
        let jwt = this.$loginservice.jwt
        let config = {
          headers: {
            authorization: `Bearer ${jwt}`,
          }
        }
        let url = `${protocol}://${host}:${port}/newDeployment`
        console.log(`url is ${url}`);
        let reply = await axios.post(`${protocol}://${host}:${port}/newDeployment`, obj, config)
        console.log(`reply is `, reply);

        let reloadedDeployments = await loadDeployments(jwt)
        // this.deployables = loadDeployables(jwt)
        console.log(`reloaded deployments: `, reloadedDeployments);
        this.deployments = reloadedDeployments
        this.showSaveErrorMsg = false
        this.showDialog = false
        return
      } catch (e) {
        console.log(`Error:`, e);
        
        alert(`Error creating deployable`)
        this.showSaveErrorMsg = true
      }
    }//- createDeployment
  }//- methods
}


async function loadDeployments (jwt) {
  let config = {
    headers: {
      authorization: `Bearer ${jwt}`,
    }
  }
  let url = `${protocol}://${host}:${port}/deployments`
  let reply = await axios.get(url, config)
  const deployments = reply.data.deployments
  return deployments
}

</script>

<style lang="scss">
</style>
