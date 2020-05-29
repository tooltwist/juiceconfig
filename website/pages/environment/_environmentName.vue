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
            label.label(style="width:200px;") Universal: 
          .field-body
            .field
              .control
                select.select(v-model="environment.is_universal", :disabled="!editingDetails", @input="saveDetails")
                  option(value="1") Yes
                  option(value="0") No
        .field.is-horizontal
          .field-label.is-normal
            label.label(style="width:200px;") Secure: 
          .field-body
            .field
              .control
                select.select(v-model="environment.is_secure_environment", :disabled="!editingDetails", @input="saveDetails")
                  option(value="1") Yes
                  option(value="0") No
        .field.is-horizontal
          .field-label.is-normal
            label.label(style="width:200px;") Group: 
          .field-body
            .field
              .control
                select.select(v-model="environment.group_name", :disabled="!editingDetails", @input="saveDetails")
                  option(v-for="group in groups", :value="group.group_name") {{group.group_name}}
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
      div(v-if="isOwner()").control
          button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

    b-tab-item(label="AWS", v-if="environment.type==='aws'")
      form.formStyle
        //- hr(v-if="environment.type==='aws'")
        .field.is-horizontal()
            .field-label.is-normal
                label.label(style="width:200px;") Account no: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_account", placeholder="eg. 270011112222", @input="saveDetails")
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_account}}
        .field.is-horizontal()
            .field-label.is-normal
                label.label(style="width:200px;") Profile: 
            .field-body
                .field
                    .control
                        input.input(v-if="editingDetails", v-model.trim="environment.aws_profile", placeholder="eg. development", @input="saveDetails")
                        p.my-not-input-p(v-else) &nbsp;{{environment.aws_profile}}
        .field.is-horizontal()
            .field-label.is-normal
                label.label(style="width:200px;") Region: 
            .field-body
                .field
                    .control
                        select.select(v-model="environment.aws_region", :disabled="!editingDetails")
                          option(value="us-east-2") US East (Ohio)	
                          option(value="us-east-1") US East (N. Virginia)	
                          option(value="us-west-1") US West (N. California)	
                          option(value="us-west-2") US West (Oregon)	
                          option(value="ap-east-1") Asia Pacific (Hong Kong)	
                          option(value="ap-south-1") Asia Pacific (Mumbai)	
                          option(value="ap-northeast-3") Asia Pacific (Osaka-Local)	
                          option(value="ap-northeast-2") Asia Pacific (Seoul)	
                          option(value="ap-southeast-1") Asia Pacific (Singapore)	
                          option(value="ap-southeast-2") Asia Pacific (Sydney)	
                          option(value="ap-northeast-1") Asia Pacific (Tokyo)	
                          option(value="ca-central-1") Canada (Central)	
                          option(value="cn-north-1") China (Beijing)	
                          option(value="cn-northwest-1") China (Ningxia)	
                          option(value="eu-central-1") Europe (Frankfurt)	
                          option(value="eu-west-1") Europe (Ireland)	
                          option(value="eu-west-2") Europe (London)	
                          option(value="eu-west-3") Europe (Paris)	
                          option(value="eu-north-1") Europe (Stockholm)	
                          option(value="me-south-1") Middle East (Bahrain)	
                          option(value="sa-east-1") South America (Sao Paulo)	
                          option(value="us-gov-east-1") AWS GovCloud (US-East)	
                          option(value="us-gov-west-1") AWS GovCloud (US-West)	

                        //- a.my-not-input-a(v-else-if="validUrl(environment.aws_region)", :href="environment.aws_region", target="_blank") &nbsp;{{environment.aws_region}}
                        //- p.my-not-input-p(v-else) &nbsp;{{environment.aws_region}}
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
      div(v-if="isOwner()").control
          button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

    b-tab-item(label="Deployments")
      // Deployments
      h1.is-title.is-size-4(style="text-align:left;") Deployments
      br
      div(v-if="this.deployments.length === 0") 
        br
        article.message.is-success.is-small
          div(v-if="isOwner()").message-body There are no deployments for this environment yet. Would you like to add one?
          div(v-else).message-body Nothing to show.
      div(v-else)
        b-table(:data="deployments", focusable)
          template(slot-scope="props")
            b-table-column(field="application_name", label="Application Name")
              | {{ props.row.application_name }}
            b-table-column(field="deployable" ,label="Deployable")
              nuxt-link(:to="`/deployable/${std_toQualifiedName(props.row.deployable_owner,props.row.deployable)}`")
                span(v-html="std_toQualifiedDisplay(props.row.deployable_owner,props.row.deployable,true)")
            b-table-column(field="notes", label="Notes")
              | {{ props.row.notes }}
    

    b-tab-item(label="Commands", v-if="environment.type==='aws'")
      .notification
          h1.title.is-size-5 Provisioning
          p.is-size-6(v-if="deployments.length === 0")
            | Nothing appears to be deployed to this environment - has it been provisioned?
            br
            | 
            | If you wish to set it up now, and you would like to use the Tooltwist conventions and
            | Cloudformation templates, the following command will guide you through the process.
          p.is-size-6(v-else)
            | This environment appears to be already set up.
          br
          code.is-size-7
            | $ AWS_PROFILE={{std_myProfile(environment)}} aws-explorer -r {{environment.aws_region}} provision
          br
          br
          p.is-size-6
              | Select 'Application' and then complete the prompts.
      .notification
          h1.title.is-size-5 Connecting
          p.is-size-6
            | If this environment was set up using aws-exploere (as above), the following command can assist you to log
            | in to your ECS host servers, or to connect to the database:
          br
          code.is-size-7
            | $ AWS_PROFILE={{std_myProfile(environment)}} aws-explorer \
            br
            | &nbsp;&nbsp;&nbsp;&nbsp; -r {{environment.aws_region}} \
            br
            | &nbsp;&nbsp;&nbsp;&nbsp; -e {{environment.name}} \
            br
            | &nbsp;&nbsp;&nbsp;&nbsp; remote

    b-tab-item(v-if="isOwner()", label="Users")
      // Users
      h1.is-title.is-size-4(style="text-align:left;") Users
        div.buttons(v-if="isOwner()", style="float:right;")
          button.button.is-primary(@click.prevent="newUser", type="is-light")  + Add New User
      br
      div(v-if="this.users.length === 0")
        br
        article.message.is-success.is-small
          div.message-body There are no users for this environment yet. Would you like to add a new user?
      b-table(:data="users", focusable)
        template(slot-scope="props")
          b-table-column(field="username", label="Username")
            | {{ props.row.username }}
          b-table-column(field="first_name", label="First Name")
            | {{ props.row.first_name }}
          b-table-column(field="last_name", label="Last Name")
            | {{ props.row.last_name }}
          div(v-if="access === 'admin'")
            b-table-column(field="user_id", label="User ID")
              | {{ props.row.user_id }}
          b-table-column(field="access", label="Access")  
            div(v-if="props.row.access === 'owner'") Admin
            div(v-else-if="props.row.access === 'read'") Read
            div(v-else-if="props.row.access === 'write'") Write
            div(v-else) {{ props.row.access }}
          b-table-column(field="", label="")
            div(v-if="isOwner()")
              a(href="", @click.prevent="editUser(props.row)")
                b-icon(icon="circle-edit-outline")

  // New User Modal starts below:
  div(v-show="newUserModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Add New User for Environment 
                b {{ environmentName }}
            section.modal-card-body
              div(v-if="errormode === 'inputError'")
                article.message.is-danger.is-small
                  div.message-header
                    p Form Error
                  div.message-body Please ensure that all fields have values before saving.
              div.modal-body
                slot(name="body")
                  form
                    div.form-group
                      div.formStyle Select User: 
                        div.control
                        div(v-if="newUserError === null")
                          b-select(placeholder="User", v-model="form.new_environmentuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }} 
                        div(v-if="newUserError === `User already exists`") 
                          b-select(placeholder="User", v-model="form.new_environmentuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }} 
                          p.help.is-danger {{ environmentName }} already has this user added.
                      div.formStyle Access:
                        div.control
                          b-select(placeholder="Access", v-model="form.new_user_access") Type:
                            option(value="owner") Admin
                            option(value="read") Read
                            option(value="write") Write 
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveNewUser",  type="is-primary is-light", size="is-small")  Save
                b-button(@click="newUserModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // Edit User Modal starts below:
  div(v-show="showUserEditModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Edit User 
                b {{ users.first_name }} {{ users.last_name }}
            section.modal-card-body
              div.modal-body
                slot(name="body")
                  form
                    div.form-group
                      div.formStyle
                        b-field.control Change accessibility:
                          b-select(placeholder="Accessibility", v-model="form.edit_useraccess", value="accessibility") 
                            option(value="owner") Admin
                            option(value="read") Read
                            option(value="write") Write
            footer.modal-card-foot 
              div.control
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
        // Edit Environment
        edit_envdescription: '',
        edit_envnotes: '',

        // Edit existing user
        edit_useraccess: '',

        // Add new user
        new_environmentuser: '',
        new_user_access: '',
        new_username: '',
      },
      editingDetails: false,

      users: [],
      allUsers: [],
      currentUser: [],
      groups: [],

      noData: false,
      environmentOwner: '',
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

      errormode: false,
    }
  }, // - data

  methods: {
    ...standardStuff.methods,

    // CHECK IF CURRENT USER IS OWNER 
    isOwner() {
      if ( this.currentUser[0].username == this.environment.owner ) {
        return 1;
      } else {
        return 0;
      }
    },

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

        this.allUsers.forEach(user => {
          if (user.id === this.form.new_environmentuser) {
            this.form.new_username = user.username;
          }
        })

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newEnvironmentUser')
          let record = {
            id: this.form.new_environmentuser,
            access: this.form.new_user_access,
            environment: this.environmentName,
            username: this.form.new_username,
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
    },

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
          environmentName: environmentName,
          environmentOwner: environmentOwner,
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

      // Import all groups to be used when editing environment
      const url9 = standardStuff.apiURL('/groups')
      let res9 = await axios.get(url9, config)
      console.log(`API9 returned`, res9.data);
      const groups = res9.data.groups
    
      return {
        environmentOwner: environmentOwner,
        environmentName: environmentName,
        environment: environment,
        deployments: deployments,
        deployables: deployables,
        users: users,
        allUsers: allUsers,
        currentUser: currentUser,
        groups: groups,
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