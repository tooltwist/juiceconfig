<template lang="pug">

section.section
  h1.title Environment {{environmentName}}
  
  b-tabs(v-model="activeTab", :animated="false")
    b-tab-item(label="Information")
      // Environment information
      table(style="width:100%")
        tr
          td(style="justify:right;") 
            label Name:
          td(style="justify:left;")
            | {{environment.name}}
        tr 
          td(style="justify:right;")
            label Description:
          td(style="justify:left;")
            | {{environment.description}}
        tr
          td(style="justify:right;")
            label Notes:
          td(style="justify:left;")
            | {{environment.notes}}
      br
      div(v-if="currentUser[0].access == 'full' || 'write' || 'super'")
        b-button.stop(@click="setEditMode", type="is-primary is-outlined is-light", size="is-small")  Edit

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
          await axios.post('http://localhost:4000/newDeployment', {
            environment: this.environmentName,
            notes: this.form.new_notes,
            deployable: this.form.new_deployable,
          })
          this.newDeploymentModal = false
          console.log(`New deployment successfully sent to database`);
        } catch (e) {
          console.log(`Could not send new deployment to the database: `, e)
        }

        // Once data sent, reload with the new deployment
        try {
          this.reloadDeployments(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Deployments could not be reloaded on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewDeployment

    // SAVED EDITED ENVIRONMENT TO THE DATABASE - FROM MODAL
    async saveEditedEnv() {
      try {
        await axios.post('http://localhost:4000/editedEnv', {
          description: this.form.edit_envdescription,
          notes: this.form.edit_envnotes,
          name: this.environmentName,
        })
        this.editEnvInfo = null
        console.log(`Updated environment successfully sent to database`)
      } catch (e) {
        console.log(`Could not send edited environment to the database: `, e)
      }

      try {
        this.reloadEnvironment(); 
        console.log(`Environment has been reloaded`)
      } catch (e) {
        console.log(`Environment could not be reloaded`, e)
      }
    }, // -saveEditedEnv

    // RELOAD THE DATABASE TABLE AFTER SAVING EDITED ENVIRONMENT
    async reloadEnvironment() {
      const url = `http://localhost:4000/environment`
      let res = await axios.get(url, { 
        params: {
          environmentName: this.environmentName
        }
      })
      this.environment = res.data.record
      console.log(`Environment has been reloaded on the browser.`)
      return {
        environment: this.environment
      };
    },  // -reloadEnvironment 

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW DEPLOYMENT
    async reloadDeployments() {
      const url2 = `http://localhost:4000/deployments`
      let res2 = await axios.get(url2, { 
        params: {
          environmentName: this.environmentName
        }
      })
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
          await axios.post('http://localhost:4000/newEnvironmentUser', {
            id: this.form.new_environmentuser,
            access: this.form.new_user_access,
            environment: this.environmentName
          })
          this.newUserModal = false
          console.log(`New environment user successfully sent to database`);
        } catch (e) {
          console.log(`Could not send new environment user to the database: `, e)
        }

        // Once data sent, reload with the new deployment
        try {
          this.reloadUsers(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Users could not be reloaded on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewUser

    async saveEditedUser() {
      try {
        await axios.post('http://localhost:4000/editEnvUser', {
            id: this.users.user_id,
            access: this.form.edit_useraccess,
            environment: this.environmentName,
        })
        console.log('Edited user successfully saved: ' + this.environmentName + ' ' + this.users.user_id + ' ' + this.form.edit_useraccess)

        // Display new users details
        this.showUserEditModal = false;
        this.reloadUsers();
        console.log('New user details have been updated on the browser.')
      } catch (e) {
        console.log(`Could not update browser with edited user:`, e)
      } 
    }, // - saveEditedUser

    async reloadUsers() {
      const url3 = `http://localhost:4000/environments_users`
      let res3 = await axios.get(url3, {
          params: { 
            environmentName: this.environmentName
          }
      })
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
    }, // -editUser
  },

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let environmentName = params.environmentName

    let jwt = app.$nuxtLoginservice.jwt

    let config = {
      headers: {
        authorization: `Bearer ${jwt}`,
      }
    }

    try {
      // Select the environment for this page
      const url = `http://localhost:4000/environment`
      console.log(`Calling ${url}`);
      let res = await axios.get(url, { 
        params: {
          environmentName: environmentName
        }
      })
      console.log(`API returned`, res.data);
      const environment = res.data.record

      // Select the deployments for this environment
      const url2 = `http://localhost:4000/deployments`
      let res2 = await axios.get(url2, { 
        params: {
          environmentName: environmentName
        }
      })
      console.log(`API2 returned`, res2.data);
      const deployments = res2.data.deployments

      // Select the users for the environment
      const url3 = `http://localhost:4000/environments_users`
      let res3 = await axios.get(url3, {
          params: { 
            environmentName: environmentName
          }
      })
      console.log(`API3 returned`, res3.data);
      const users = res3.data.users

      // Import deployables to be used in deployments form
      const url4 = `http://localhost:4000/deployables`
      let res4 = await axios.get(url4, config)

      const deployables = res4.data.list

      // Import all users for creating new user (on the selected project)
      const url5 = `http://localhost:4000/users`
      let res5 = await axios.get(url5)
      console.log(`API5 returned`, res5.data);
      const allUsers = res5.data.users
      console.log(allUsers)

      // This users accessibility/profile details
      const url8 = `http://localhost:4000/currentUser`
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
      alert(`Could not fetch project ${environmentName}`)
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

</style>