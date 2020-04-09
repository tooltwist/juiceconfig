<template lang="pug">

section.section
  h1.title Environment&nbsp;
    span(v-html="std_environmentDisplay(environment)")
  
  b-tabs(v-model="activeTab", :animated="false")
    b-tab-item(label="Information")
      form.formStyle
        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Name: 
            .field-body
                .field
                    .control
                        p.my-not-input-p() &nbsp;{{environment.name}}
        .field.is-horizontal
            .field-label.is-normal
              label.label(style="width:200px;") Type: 
            .field-body
                .field
                    .control
                        select.select(v-model="environment.type", :disabled="!editingDetails")
                          option(value="aws") Amazon Web Services (AWS)
                          option(value="local") Local development machine
                          option(value="other") Other
                        //- | &nbsp;{{environment.type}}
                        //- input.input(v-if="editingDetails", v-model.trim="environment.description", placeholder="URL to ECS Service", @input="saveDetails")
                        //- a.my-not-input-a(v-else-if="validUrl(environment.description)", :href="deployment.description", target="_blank") &nbsp;{{deployment.description}}
                        //- p.my-not-input-p(v-else) &nbsp;{{environment.description}}
        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Description: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.description", placeholder="Description", @input="saveDetails")
                        a.my-not-input-a(v-else-if="validUrl(environment.description)", :href="deployment.description", target="_blank") &nbsp;{{deployment.description}}
                        p.my-not-input-p(v-else) &nbsp;{{environment.description}}
        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Notes: 
            .field-body
                .field
                    .control
                        textarea.textarea(v-model.trim="environment.notes", placeholder="Notes", :disabled="!editingDetails", @input="saveDetails")
                        //- input.input(v-if="editingDetails", v-model.trim="environment.notes", placeholder="URL to ECS Service", @input="saveDetails")
                        //- a.my-not-input-a(v-else-if="validUrl(environment.notes)", :href="environment.notes", target="_blank") &nbsp;{{environment.notes}}
                        //- p.my-not-input-p(v-else) &nbsp;{{environment.notes}}
        hr(v-if="environment.type==='aws'")
        .field.is-horizontal(v-if="environment.type==='aws'")
            .field-label.is-normal
                label.label(style="width:200px;") Region: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_region", placeholder="eg. ap-southeast-1", @input="saveDetails")
                        a.my-not-input-a(v-else-if="validUrl(environment.aws_region)", :href="environment.aws_region", target="_blank") &nbsp;{{environment.aws_region}}
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_region}}
        .field.is-horizontal(v-if="environment.type==='aws'")
            .field-label.is-normal
                label.label(style="width:200px;") Stack: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_cf_stack", placeholder="URL to Cloudformation stack", @input="saveDetails")
                        a.my-not-input-a(v-else-if="validUrl(environment.aws_cf_stack)", :href="environment.aws_cf_stack", target="_blank") &nbsp;{{environment.aws_cf_stack}}
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_cf_stack}}
        .field.is-horizontal(v-if="environment.type==='aws'")
            .field-label.is-normal
                label.label(style="width:200px;") Cluster: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_cluster_url", placeholder="URL to ECS Service", @input="saveDetails")
                        a.my-not-input-a(v-else-if="validUrl(environment.aws_cluster_url)", :href="environment.aws_cluster_url", target="_blank") &nbsp;{{environment.aws_cluster_url}}
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_cluster_url}}
        .field.is-horizontal(v-if="environment.type==='aws'")
            .field-label.is-normal
                label.label(style="width:200px;") VPC URL: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_vpc_url", placeholder="URL to VPC dashboard", @input="saveDetails")
                        a.my-not-input-a(v-else-if="validUrl(environment.aws_vpc_url)", :href="environment.aws_vpc_url", target="_blank") &nbsp;{{environment.aws_vpc_url}}
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_vpc_url}}
      .control
          button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

      //- // Environment information
      //- table(style="width:100%")
      //-   //- tr
      //-     td(style="justify:right;") 
      //-       label Name:
      //-     td(style="justify:left;")
      //-       | {{environment.name}}
      //-   //- tr 
      //-     td(style="justify:right;")
      //-       label Description:
      //-     td(style="justify:left;")
      //-       | {{environment.description}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label Notes:
      //-     td(style="justify:left;")
      //-       | {{environment.notes}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label Type:
      //-     td(style="justify:left;")
      //-       select.select(v-model="environment.type")
      //-         option(value="aws") Amazon Web Services (AWS)
      //-         option(value="local") Local development machine
      //-         option(value="other") Other
      //-       | &nbsp;{{environment.type}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label Region:
      //-     td(style="justify:left;")
      //-       | {{environment.aws_region}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label Cloudformation Stack:
      //-     td(style="justify:left;")
      //-       | {{environment.aws_cf_stack}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label ECS Cluster URL:
      //-     td(style="justify:left;")
      //-       | {{environment.aws_cluster_url}}
      //-   tr
      //-     td(style="justify:right;")
      //-       label VPC URL:
      //-     td(style="justify:left;")
      //-       | {{environment.aws_vpc_url}}
      //- | {{environment}}
      //- br
      //- div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
      //-   b-button.stop(@click="setEditMode", type="is-primary is-outlined is-light", size="is-small")  Edit

    b-tab-item(label="Deployments")
      // Deployments
      h1(class="is-title is-size-4", style="text-align:left;") Deployments
        div(class="buttons", style="float:right;")
          div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
            button(@click.prevent="newDeployment(deployments)", class="button is-primary", type="is-light")  + Add new deployment
      br
      div(v-if="this.deployments.length === 0") 
        br
        article(class="message is-success is-small")
          div(class="message-body") There are no deployments for this environment yet. Would you like to add one?
      div(v-else)
        b-table(:data="deployments", focusable)
          template(slot-scope="props")
            b-table-column(field="environment", label="Environment")
              | {{ props.row.environment }}
            b-table-column(field="deployable" ,label="Deployable")
              nuxt-link(:to="`/deployable/${props.row.deployable}`") {{ props.row.deployable }}
            b-table-column(field="notes", label="Notes")
              | {{ props.row.notes }}
            b-table-column(field="", label="")
              div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
                b-button(class="button is-small is-primary is-outlined", tag="nuxt-link", :to="`../config/${props.row.environment}/${props.row.deployable}`") Configure
            //- | {{props.row.environment}}
    
    div(v-if="environmentName !== 'localhost'")
      b-tab-item(label="Users")
        // Users
        h1(class="is-title is-size-4", style="text-align:left;") Users
          div(class="buttons", style="float:right;")
            div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
              button(@click.prevent="newUser", class="button is-primary", type="is-light")  + Add New User
        br
        div(v-if="this.users.length === 0")
          br
          article(class="message is-success is-small")
            div(class="message-body") There are no users for this environment yet. Would you like to add a new user?
        b-table(:data="users", focusable)
          template(slot-scope="props")
            b-table-column(field="environment", label="Environment")
              | {{ props.row.environment }}
            b-table-column(field="first_name", label="First Name")
              | {{ props.row.first_name }}
            b-table-column(field="last_name", label="Last Name")
              | {{ props.row.last_name }}
            div(v-if="access === 'admin'")
              b-table-column(field="user_id", label="User ID")
                | {{ props.row.user_id }}
            b-table-column(field="access", label="Access")  
              | {{ props.row.access }}
            b-table-column(field="", label="")
              div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
                a(href="", @click.prevent="editUser(props.row)")
                  b-icon(icon="circle-edit-outline")

  // Edit environment information  MODAL
  div(v-show="editEnvInfo == 'edit'")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Edit Environment 
                b {{ environmentName }}
            section(class="modal-card-body")
              slot(name="body")
                form
                div.form-group
                    div.formStyle Description:
                      div(class="control")
                        input(v-model="form.edit_envdescription", class="input", type="text", value="description", placeholder="Description")  
                    div.formStyle Notes:
                      div(class="control")
                        input(v-model="form.edit_envnotes", class="input", type="text", value="notes", placeholder="Notes")  
            footer(class="modal-card-foot")        
              div(class="control")
                b-button(@click.stop="saveEditedEnv", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="editEnvInfo='null'", type="is-danger is-outlined", size="is-small") Cancel

  // New Deployment Modal starts below:
  div(v-show="newDeploymentModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New Deployment for 
                b {{ environmentName }}
            section(class="modal-card-body")
              div(v-if="errormode === 'inputError'")
                article(class="message is-danger is-small")
                  div(class="message-header")
                    p Form Error
                  div(class="message-body") Please ensure that all fields have values before saving.
              div(class="modal-body", :data="deployments")
                slot(name="body")
                    form
                      div.form-group
                        div.formStyle Deployable:
                          div(class="control")
                            div(v-if="deploymentError === null")
                              b-select(placeholder="Deployable", v-model="form.new_deployable") Deployable:
                                option(v-for="deployable in deployables") {{ deployable.name }}
                            div(v-else="deploymentError === `Deployment already exists`")
                              b-select(class="is-danger", placeholder="Environment", v-model="form.new_deployable") Deployable:
                                option(v-for="deployable in deployables") {{ deployable.name }}
                              p(class="help is-danger") {{ environmentName }} is already deployed with this deployable.
                        div.formStyle Notes:
                          div(class="control")
                            input(name="new_notes", v-model="form.new_notes", class="input", type="text", placeholder="Notes")
            footer(class="modal-card-foot")  
              div(class="control")
                b-button(@click.stop="saveNewDeployment",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newDeploymentModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // New User Modal starts below:
  div(v-show="newUserModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New User for Environment 
                b {{ environmentName }}
            section(class="modal-card-body")
              div(v-if="errormode === 'inputError'")
                article(class="message is-danger is-small")
                  div(class="message-header")
                    p Form Error
                  div(class="message-body") Please ensure that all fields have values before saving.
              div(class="modal-body")
                slot(name="body")
                  form
                    div.form-group
                      div.formStyle Select User: 
                        div(class="control")
                        div(v-if="newUserError === null")
                          b-select(placeholder="User", v-model="form.new_environmentuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }} 
                        div(v-if="newUserError === `User already exists`") 
                          b-select(placeholder="User", v-model="form.new_environmentuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }} 
                          p(class="help is-danger") {{ environmentName }} already has this user added.
                      div.formStyle Access:
                        div(class="control")
                          b-select(placeholder="Access", v-model="form.new_user_access") Type:
                            option(value="limited") Limited
                            option(value="write") Write
                            option(value="conditional") Conditional (recommended for clients only)
            footer(class="modal-card-foot")  
              div(class="control")
                b-button(@click.stop="saveNewUser",  type="is-primary is-light", size="is-small")  Save
                b-button(@click="newUserModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // Edit User Modal starts below:
  div(v-show="showUserEditModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Edit User 
                b {{ users.first_name }} {{ users.last_name }}
            section(class="modal-card-body")
              div(class="modal-body")
                slot(name="body")
                  form
                    div.form-group
                      div.formStyle
                        b-field(class="control") Change accessibility:
                          b-select(placeholder="Accessibility", v-model="form.edit_useraccess", value="accessibility") 
                            option(value="limited") Limited
                            option(value="write") Write
                            option(value="conditional") Conditional (clients-only)
            footer(class="modal-card-foot")  
              div(class="control")
                b-button(@click.stop="saveEditedUser", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="showUserEditModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios'
import standardStuff from '../../lib/standard-stuff'


export default {
  name: 'Environment',
  data () {
    return {
      form: {
        // New deployment 
        new_deployable: '',
        new_notes: '',

        // Edit Environment
        edit_envdescription: '',
        edit_envnotes: '',

        // Edit existing user
        edit_useraccess: '',

        // Add new user
        new_environmentuser: '',
        new_user_access: '',
      },
      editingDetails: false,

      users: [],
      allUsers: [],
      currentUser: [],

      noData: false,
      environmentName: '',
      environment: null,
      deployments: [],
      activeTab: 0,

      newUserError: null, 
      access: null,

      // New User Modal
      newUserModal: false,

      // Edit User Modal
      showUserEditModal: false,

      // Edit Environment Modal
      editEnvInfo: null,

      // New Deployment Modal
      deploymentError: null,
      newDeploymentModal: false,
      errormode: false,
    }
  }, // - data

  methods: {
    ...standardStuff.methods,

    // ADD A NEW DEPLOYMENT TO THE DATABASE - FROM MODAL 
    async saveNewDeployment() {
      //Check that form is filled correctly
      if (this.form.new_notes && this.form.new_deployable) {
        
        // Check for existing deployment using selected deployable:
        let found = false
        this.deployments.forEach(deployment => {
          if (deployment.environment === this.environmentName && deployment.deployable === this.form.new_deployable) {
            console.log(`There is already an existing deployment with these values!`)
            found = true
          }
        })

        // If matching deployment is found, send error 
        if (found) {
          console.log(`There is already a deployment with these values... Error message shown!`)
          this.deploymentError = `Deployment already exists`
          return 
        }
        this.deploymentError = null

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newDeployment')
          let record = {
            environment: this.environmentName,
            notes: this.form.new_notes,
            deployable: this.form.new_deployable,
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newDeploymentModal = false
          console.log(`New deployment successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new deployment to the database: `, e)
        }

        // Once data sent, reload with the new deployment
        try {
          this.reloadDeployments(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Error while reloading deployments on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewDeployment

    // SAVED EDITED ENVIRONMENT TO THE DATABASE - FROM MODAL
    async saveEditedEnv() {
      try {
        let url = standardStuff.apiURL('/editedEnv')
        let record = {
          description: this.form.edit_envdescription,
          notes: this.form.edit_envnotes,
          name: this.environmentName,
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        this.editEnvInfo = null
        console.log(`Updated environment successfully sent to database`)
      } catch (e) {
        console.log(`Error while sending edited environment to the database: `, e)
      }

      try {
        this.reloadEnvironment(); 
        console.log(`Environment has been reloaded`)
      } catch (e) {
        console.log(`Error while reloading environment: `, e)
      }
    }, // -saveEditedEnv

    // RELOAD THE DATABASE TABLE AFTER SAVING EDITED ENVIRONMENT
    async reloadEnvironment() {
      const url = standardStuff.apiURL('/environment')
      const params = { 
        params: {
          environmentName: this.environmentName
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res = await axios.get(url, params, config)
      this.environment = res.data.record
      console.log(`Environment has been reloaded on the browser.`)
      return {
        environment: this.environment
      };
    },  // -reloadEnvironment 

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW DEPLOYMENT
    async reloadDeployments() {
      const url2 = standardStuff.apiURL('/deployments')
      const params = { 
        params: {
          environmentName: this.environmentName
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res2 = await axios.get(url2, params, config)
      console.log(`Deployments have been reloaded on the browser`);
      this.deployments = res2.data.deployments
      return {
        deployments: this.deployments
      };
    },  // -reloadDeployments

    // ADD A NEW USER FOR SELECTED ENVIRONMENT TO THE DATABASE - FROM MODAL 
    async saveNewUser() {
      console.log(`saveNewUser(): `, this.form.new_environmentuser)
      //Check that form is filled correctly
      if (this.form.new_environmentuser && this.form.new_user_access) {
        
        // Check for existing user using selected project:
        let found = false
        this.users.forEach(user => {
          if (user.user_id === this.form.new_environmentuser) {
            console.log(`This user is already able to access this environment!`)
            found = true
          }
        })

        // If matching user is found, send error 
        if (found) {
          console.log(`There is already a user with these values... Error message shown!`)
          this.newUserError = `User already exists`
          return 
        }
        this.newUserError = null

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newEnvironmentUser')
          let record = {
            id: this.form.new_environmentuser,
            access: this.form.new_user_access,
            environment: this.environmentName
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newUserModal = false
          console.log(`New environment user successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new environment user to the database: `, e)
        }

        // Once data sent, reload with the new deployment
        try {
          this.reloadUsers(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Error while reloading users on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewUser

    async saveEditedUser() {
      try {
        let url = standardStuff.apiURL('/editEnvUser')
        let record = {
            id: this.users.user_id,
            access: this.form.edit_useraccess,
            environment: this.environmentName,
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        console.log('Edited user successfully saved: ' + this.environmentName + ' ' + this.users.user_id + ' ' + this.form.edit_useraccess)

        // Display new users details
        this.showUserEditModal = false;
        this.reloadUsers();
        console.log('New user details have been updated on the browser.')
      } catch (e) {
        console.log(`Error while updating browser with edited user:`, e)
      } 
    }, // - saveEditedUser

    async reloadUsers() {
      const url3 = standardStuff.apiURL('/environments_users')
      const params = {
          params: { 
            environmentName: this.environmentName
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res3 = await axios.get(url3, params, config)
      console.log(`Environments have been reloaded on the browser:`, res3.data);
      this.users = res3.data.users
      return {
        users: this.users
      };
    },  // -reloadUsers

    // OPEN NEW DEPLOYMENT MODAL
    newDeployment(deployments) {
      this.newDeploymentModal = true;
      return false
    }, // -newDeployment

    // OPEN EDIT ENV MODAL:
    setEditMode() {
      this.editEnvInfo = 'edit';
      this.form.edit_envdescription = this.environment.description
      this.form.edit_envnotes = this.environment.notes
      return false
    },

    // OPEN MODAL AND CREATE NEW USER:
    newUser() {
      this.newUserModal = true;
      return false
    },

    // OPEN MODAL AND CHANGE VALUES FOR EDITING USER - receives props.row (i.e. user record)
    editUser(users) {  
      this.showUserEditModal = true,
      this.users.first_name = users.first_name,
      this.users.last_name = users.last_name,
      this.users.user_id = users.user_id,
      this.form.edit_useraccess = users.access
      return false
    }, //- editUser


    saveDetails: async function () {
        let self = this
        if (self.updateDelay) {
            clearTimeout(self.updateDelay)
        }
        self.updateDelay = setTimeout(async function () {
            // console.log(`Updating...`, self.deployment);
            self.updateDelay = null
            const url = standardStuff.apiURL('/environment')
            const config = standardStuff.axiosConfig(self.$loginservice.jwt)
            console.log(`UPDATING ENVIRONMENT`, self.environment);

           let result = await axios.put(url, self.environment, config)
            // console.log(`result is `, result);
        }, 1000)
    }
  },//- methods

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    // let environmentName = params.environmentName
    let username = app.$nuxtLoginservice.user.username
    let {owner:environmentOwner, name:environmentName} = standardStuff.methods.std_fromQualifiedName(params.environmentName, username)
console.log(`environment=> ${environmentOwner}, ${environmentName}`);

    try {
      // Select the environment for this page
      const url = standardStuff.apiURL('/environment')
      const params = { 
        params: {
          environmentName: environmentName
        }
      }
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      console.log(`Calling ${url}`);
      let res = await axios.get(url, params, config)
      console.log(`API returned environment`, res.data);
      const environment = res.data.record

      // Select the deployments for this environment
      const url2 = standardStuff.apiURL('/deployments')
      let res2 = await axios.get(url2, params, config)
      console.log(`API2 returned`, res2.data);
      const deployments = res2.data.deployments

      // Select the users for the environment
      const url3 = standardStuff.apiURL('/environments_users')
      let res3 = await axios.get(url3, params, config)
      console.log(`API3 returned`, res3.data);
      const users = res3.data.users

      // Import deployables to be used in deployments form
      const url4 = standardStuff.apiURL('/deployables')
      let res4 = await axios.get(url4, config)

      const deployables = res4.data.deployables

      // Import all users for creating new user (on the selected project)
      const url5 = standardStuff.apiURL('/users')
      let res5 = await axios.get(url5, config)
      console.log(`API5 returned`, res5.data);
      const allUsers = res5.data.users
      console.log(allUsers)

      // This users accessibility/profile details
      const url8 = standardStuff.apiURL('/currentUser')
      let res8 = await axios.get(url8, config)
      console.log(`API8 returned`, res8.data);
      const currentUser = res8.data.user
      console.log('currentUser: ', currentUser)
    
      return {
        environmentName: environmentName,
        environment: environment,
        deployments: deployments,
        deployables: deployables,
        users: users,
        allUsers: allUsers,
        currentUser: currentUser,
      }
    } catch (e) {
      console.log(`Could not fetch project:`, e)
      alert(`Error while fetching project ${environmentName}`)
    }
  }
}
</script>

<style lang="scss">

/* 
FORM STYLING
*/

.formStyle {
  margin: 10px 0px;
}

a.my-not-input-a {
    position: relative;
    top: 6px;
}

.my-not-input-p {
    position: relative;
    top: 6px;
}
</style>