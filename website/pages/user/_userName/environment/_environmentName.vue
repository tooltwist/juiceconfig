<template lang="pug">
div
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
                          select.select(v-model="environment.type", :disabled="!editingDetails", @input="saveDetails")
                            option(value="aws") Amazon Web Services (AWS)
                            option(value="local") Local development machine
                            option(value="other") Other
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
                  div(v-if="groups.length == 0", style="display: inline-block;")
                    p None  
                  div(v-else, style="display: inline-block;")
                    select.select(v-show="!newGroup", v-model="environment.group_name", :disabled="!editingDetails", @input="saveDetails")
                      option(v-for="group in groups", :value="group.group_name") {{group.group_name}}
                  button.button.is-small.is-light(v-if="editingDetails", @click.prevent="addGroupModal", style="margin: 2px 5px;") Add group
          .field.is-horizontal
              .field-label.is-normal
                  label.label(style="width:200px;") Description: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="128", v-model.trim="environment.description", placeholder="Description", @input="saveDetails")
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
        div(v-if="isEditable").control
            button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

      b-tab-item(label="AWS", v-if="environment.type==='aws'")
        form.formStyle
          .field.is-horizontal()
              .field-label.is-normal
                  label.label(style="width:200px;") Account no: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="32", v-model.trim="environment.aws_account", placeholder="eg. 270011112222", @input="saveDetails")
                          p.my-not-input-p(v-else) &nbsp;{{environment.aws_account}}
          .field.is-horizontal()
              .field-label.is-normal
                  label.label(style="width:200px;") Profile: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="128", v-model.trim="environment.aws_profile", placeholder="eg. development", @input="saveDetails")
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
          .field.is-horizontal(v-if="environment.type==='aws'")
              .field-label.is-normal
                  label.label(style="width:200px;") Stack: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="512", v-model.trim="environment.aws_cf_stack", placeholder="URL to Cloudformation stack", @input="saveDetails")
                          a.my-not-input-a(v-else-if="validUrl(environment.aws_cf_stack)", :href="environment.aws_cf_stack", target="_blank") &nbsp;{{environment.aws_cf_stack}}
                          p.my-not-input-p(v-else) &nbsp;{{environment.aws_cf_stack}}
          .field.is-horizontal(v-if="environment.type==='aws'")
              .field-label.is-normal
                  label.label(style="width:200px;") Cluster: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="512", v-model.trim="environment.aws_cluster_url", placeholder="URL to ECS Service", @input="saveDetails")
                          a.my-not-input-a(v-else-if="validUrl(environment.aws_cluster_url)", :href="environment.aws_cluster_url", target="_blank") &nbsp;{{environment.aws_cluster_url}}
                          p.my-not-input-p(v-else) &nbsp;{{environment.aws_cluster_url}}
          .field.is-horizontal(v-if="environment.type==='aws'")
              .field-label.is-normal
                  label.label(style="width:200px;") VPC URL: 
              .field-body
                  .field
                      .control
                          input.input(v-if="editingDetails", maxlength="512", v-model.trim="environment.aws_vpc_url", placeholder="URL to VPC dashboard", @input="saveDetails")
                          a.my-not-input-a(v-else-if="validUrl(environment.aws_vpc_url)", :href="environment.aws_vpc_url", target="_blank") &nbsp;{{environment.aws_vpc_url}}
                          p.my-not-input-p(v-else) &nbsp;{{environment.aws_vpc_url}}
        div(v-if="isEditable").control
            button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

      b-tab-item(label="Deployments")
        // Deployments
        h1.is-title.is-size-4(style="text-align:left;") Deployments
        br
        div(v-if="this.deployments.length === 0") 
          br
          article.message.is-success.is-small
            div(v-if="isEditable").message-body There are no deployments for this environment yet. Would you like to add one?
            div(v-else).message-body Nothing to show.
        div(v-else)
          b-table(:data="deployments", focusable)
            template(slot-scope="props")
              b-table-column(field="application_name", label="Application Name")
                | {{ props.row.application_name }}
              b-table-column(field="deployable" ,label="Deployable")
                nuxt-link(:to="`/user/${user}/deployable/${std_toQualifiedName(props.row.deployable_owner,props.row.deployable)}`")
                  span(v-html="std_toQualifiedDisplay(props.row.deployable_owner,props.row.deployable,true)")
              b-table-column(field="notes", label="Notes")
                | {{ props.row.notes }}
              b-table-column(field="", label="")
                b-button.button.is-small.is-primary.is-outlined(tag="nuxt-link", :to="`/user/${user}/deployment/${props.row.environment_owner}:${props.row.environment}/${props.row.application_name}`") Configure
      
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

      b-tab-item(v-if="this.user != this.username", label="Users")
        // Users
        h1.is-title.is-size-4(style="text-align:left;") Users
          div.buttons(v-if="isEditable", style="float:right;")
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
            b-table-column(v-if="isEditable", field="user_id", label="User ID")
              | {{ props.row.user_id }}
            b-table-column(v-if="isEditable", field="access", label="Access")  
              div(v-if="props.row.access === 'owner'") Admin
              div(v-else-if="props.row.access === 'read'") Read
              div(v-else-if="props.row.access === 'write'") Write
              div(v-else) {{ props.row.access }}
            b-table-column(v-if="isEditable", field="", label="")
              a(href="", @click.prevent="editUser(props.row)")
                b-icon(icon="circle-edit-outline")
              a(href="",  @click.prevent="deleteUser(props.row)")
                b-icon(icon="delete")

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
                          b-select(placeholder="User", v-model="form.new_environmentuser") User:
                            option(v-for="user in orgUsers", :value="user.user_username") {{ user.user_username }} 
                        div(v-if="newUserError === `User already exists`") 
                          p.help.is-danger {{ environmentName }} already has {{ form.new_environmentuser }} added.
                      div.formStyle Access:
                        div.control
                          b-select(placeholder="Access", v-model="form.new_user_access") Type:
                            option(value="owner") Admin
                            option(value="read") Read only
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
                            option(value="read") Read only
            footer.modal-card-foot 
              div.control
                b-button(@click.stop="saveEditedUser", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="showUserEditModal=false", type="is-danger is-outlined", size="is-small") Cancel
  
  // Remove User Modal starts below:
  div(v-show="deleteUserModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Remove user    
            section.modal-card-body
              p Are you sure you want to remove {{ users.first_name }} {{ users.last_name }} from {{environmentName}}?
            footer.modal-card-foot 
              div.control
                b-button(@click.stop="removeUser", type="is-danger is-outlined", size="is-small") Remove    
                b-button(@click="deleteUserModal=false", type="is-gray is-outlined", size="is-small") Cancel

  // Modal for new environment group
  div(v-show="showNewGroupModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Create new group for {{environmentName}} 
            section.modal-card-body
              div.modal-body
                slot(name="body")
                  form
                    p Group name: 
                      input.input(name="new_group", v-model="form.new_group", maxlength="16", placeholder="Group Name")
                      //p.help.is-danger(v-if="groupExists") This group name already exists.
                    p Description:
                      input.input(name="new_group_description", v-model="form.group_description", maxlength="16", placeholder="Description")
                    p Tag colour:
                      .control 
                        .select
                          select(v-model="form.group_colour")
                            option(value="red") Red
                            option(value="blue") Blue
                            option(value="green") Green
                            option(value="orange") Orange
                            option(value="yellow") Yellow
            footer.modal-card-foot 
              div.control
                b-button(@click.stop="addGroup()", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="showNewGroupModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios'
import standardStuff from '../../../../lib/standard-stuff'

export default {
  name: 'Environment',

  components: {
    modal: {
      template: '#modal-template'
    }
  },

  data () {
    return {
      form: {
        // Edit existing user
        edit_useraccess: '',

        // Add new user
        new_environmentuser: '',
        new_user_access: '',

        // Creating a new group
        new_group: '',
        group_colour: '',
        group_description: '',
      },

      // Identification
      user: '',
      username: '',
      currentUser: [],

      // Users
      users: [],
      allUsers: [],
      orgUsers: [],

      // Environments
      environmentOwner: '',
      environmentName: '',
      environment: null,
      groups: [],

      // Create new group
      newGroup: false,

      // Deployments
      deployments: [],

      // Editing modes
      newUserModal: false,
      deleteUserModal: false,
      showUserEditModal: false,
      editingDetails: false,
      showNewGroupModal: false,

      // Formatting
      newUserError: null,
      errormode: false,
      activeTab: 0,
    }
  }, // - data

  methods: {
    ...standardStuff.methods,

    // This method returns true if the user is 1. the owner of the private account (user==username), 2. the owner or
    // admin of the organisation (org_user db table), or, 3/4. the environment has specified that this user has owner/readwrite 
    // access to this environment (environment_user db table). Else, it returns false and access to edit buttons, etc, are hidden.
    isEditable: function() {
      if (this.user == this.username) { // 1. Environment is from a personal account
        return true;

      } else { 
        // 2. User is org admin or owner (can see everything in the organisation)
        this.orgUsers.forEach(user => { 
          if ((user.user_username == this.username) && (user.role == "owner")) {
            return true;
          }
        })

        // 3. User is owner of environment
        if (this.username == this.environmentOwner) {
          return true;
        }
        
        // 4. User has write/admin privileges for this environment
        this.users.forEach(user => { 
          if (user.username == this.user && (user.access == 'owner' || user.access == 'write')) {
            return true;
          } 
        })
      }

      return false;
    }, // - isEditable

    async addGroup() {
      try {
        // Send record for new group
        const url = standardStuff.apiURL('/newGroup');
        const record = { 
          group_name: this.form.new_group,
          description: this.form.group_description,
          colour: this.form.group_colour,
          group_owner: this.user,
        };
        const config = standardStuff.axiosConfig(this.$loginservice.jwt);
        await axios.post(url, record, config);
        console.log('New group sent to the database.');

        // Reset page formatting
        this.reloadGroups();
        this.showNewGroupModal = false;
        this.form.new_group = '';
        this.form.group_description = '';
        this.form.group_colour = '';
      } catch (e) {
        console.log(`Error while sending new group to the database: `, e);
      }
    },

    // Reload users on the browser
    async reloadGroups() {
      const url = standardStuff.apiURL('/groups');
      const params = {
        params: { 
          user: this.user
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt);
      let res = await axios.get(url, params, config);
      this.groups = res.data.groups;
      console.log(`Groups have been reloaded on the browser:`, this.groups);

      return {
        groups: this.groups,
      };
    }, // - reloadGroups

    // Add a new user 
    async saveNewUser() {
      // Check that form is filled correctly
      if (this.form.new_environmentuser && this.form.new_user_access) {
        // Check for existing user using selected project:
        let found = false;

        this.users.forEach(user => {
          if (user.username === this.form.new_environmentuser) {
            console.log(`This user is already able to access this environment!`);
            found = true;
          }
        })

        // If matching user is found, send error 
        if (found) {
          console.log(`There is already a user with these values... Error message shown!`);
          this.newUserError = `User already exists`;
          return;
        }

        this.newUserError = null;

        // Retrieve user record from db for new project_user
        let userId = '';
        let config = standardStuff.axiosConfig(this.$loginservice.jwt);

        try {
          let url = standardStuff.apiURL('/usernameRecord');

          const params = {
            params: {
              username: this.form.new_environmentuser,
            }
          }

          let res = await axios.get(url, params, config);
          userId = res.data.user[0].id;

        } catch (e) {
          console.log('Error retrieving user record', e);
        }

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newEnvironmentUser');

          let record = {
            username: this.form.new_environmentuser,
            access: this.form.new_user_access,
            environment: this.environmentName,
            id: userId,
          }

          let config = standardStuff.axiosConfig(this.$loginservice.jwt);
          await axios.post(url, record, config);
          this.newUserModal = false;
          console.log(`New environment user successfully sent to database`);

        } catch (e) {
          console.log(`Error while sending new environment user to the database: `, e);
        }

        // Once data sent, reload with the new deployment and reset form values
        try {
          this.reloadUsers(); 
          this.form.new_environmentuser = '';
          this.form.new_user_access = '';

        } catch (e) {
          console.log(`Error while reloading users on the browser: `, e);
        }

      } else {
        this.errormode = 'inputError';
      }
    }, // - saveNewUser

    // Save an edited user
    async saveEditedUser() {
      try {
        let url = standardStuff.apiURL('/editEnvUser');

        let record = {
            id: this.users.user_id,
            access: this.form.edit_useraccess,
            environment: this.environmentName,
        }

        let config = standardStuff.axiosConfig(this.$loginservice.jwt);
        await axios.post(url, record, config);

        // Display new users details
        this.showUserEditModal = false;
        this.reloadUsers();
        console.log('New user details have been updated on the browser.');

      } catch (e) {
        console.log(`Error while updating browser with edited user:`, e);
      } 
    }, // - saveEditedUser

    // Remove a user from environment_users db table
    async removeUser() {
      try {
        let url = standardStuff.apiURL(`/removeEnvUser/${this.environmentName}/${this.users.username}`);
        let config = standardStuff.axiosConfig(this.$loginservice.jwt);
        await axios.delete(url, config);

        // Display new users details
        this.deleteUserModal = false;
        this.reloadUsers();
        console.log('User has been removed from the environment_users db table.');

      } catch (e) {
        console.log(`Error whilst removing user:`, e);
      } 
    }, // - removeUser

    // Reload users on the browser
    async reloadUsers() {
      const url = standardStuff.apiURL('/environments_users');

      const params = {
          params: { 
            environmentName: this.environmentName
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt);
      let res = await axios.get(url, params, config);
      this.users = res.data.users;
      console.log(`Users have been reloaded on the browser:`, this.users);

      return {
        users: this.users,
      };
    }, // - reloadUsers

    // Opens newUserModal
    newUser() {
      this.newUserModal = true;
      return false;
    }, // - newUser

    // Opens and populates showUserEditModal
    editUser(users) {  
      this.showUserEditModal = true;
      this.users.first_name = users.first_name;
      this.users.last_name = users.last_name;
      this.users.user_id = users.user_id;
      this.form.edit_useraccess = users.access;
      return false;
    }, // - editUser

    // Opens new group modal
    addGroupModal() {
      this.showNewGroupModal = true;
      return false;
    }, // - addGroupModal

    // Opens and populates deleteUserModal
    deleteUser(user) {
      this.deleteUserModal = true;
      this.users.first_name = user.first_name;
      this.users.last_name = user.last_name;
      this.users.username = user.username;
      this.users.user_id = user.user_id;
      return false;
    }, // - deleteUser

    // Save edited environment form
    saveDetails: async function () {
      let self = this;
      if (self.updateDelay) {
        clearTimeout(self.updateDelay);
      }

      self.updateDelay = setTimeout(async function () {
        self.updateDelay = null;
        const url = standardStuff.apiURL('/environment');
        const config = standardStuff.axiosConfig(self.$loginservice.jwt);
        let result = await axios.put(url, self.environment, config);
      }, 1000)
    }, // - saveDetails
  }, //- methods

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let username = app.$nuxtLoginservice.user.username;
    let user = params.userName;
    let {owner:environmentOwner, name:environmentName} = standardStuff.methods.std_fromQualifiedName(params.environmentName, username);

    try {
      // Config and params for all calls
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

      const params = { 
        params: {
          environmentName: environmentName,
          environmentOwner: environmentOwner,
          organisationName: user,
          user: user,
        }
      }

      // Select the environment for this page
      let url = standardStuff.apiURL('/environment');
      let res = await axios.get(url, params, config);
      const environment = res.data.record;
      console.log(`environment: `, environment);

      // Select the deployments for this environment
      url = standardStuff.apiURL('/deployments');
      res = await axios.get(url, params, config);
      const deployments = res.data.deployments;
      console.log(`deployments: `, deployments);

      // Select the users for the environment (from environment_users db table)
      url = standardStuff.apiURL('/environments_users');
      res = await axios.get(url, params, config);
      const users = res.data.users;
      console.log(`users: `, users);

      // Import deployables to be used in deployments form
      url = standardStuff.apiURL('/deployables');
      res = await axios.get(url, config);
      const deployables = res.data.deployables;
      console.log(`deployables: `, deployables);

      // Import all users for creating new user (on the selected project)
      url = standardStuff.apiURL('/users');
      res = await axios.get(url, config);
      const allUsers = res.data.users;
      console.log(`allUsers: `, allUsers);

      // This users accessibility/profile details
      url = standardStuff.apiURL('/currentUser');
      res = await axios.get(url, config);
      const currentUser = res.data.user;
      console.log(`currentUser: `, currentUser);

      // Import all groups to be used when editing environment
      url = standardStuff.apiURL('/groups');
      res = await axios.get(url, params, config);
      const groups = res.data.groups;
      console.log(`groups: `, groups);

      // Import all orgusers (if an org account)
      url = standardStuff.apiURL('/organisationUsers');
      res = await axios.get(url, params, config);
      const orgUsers = res.data.organisationUsers;
      console.log('orgUsers: ', orgUsers);
    
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
        user: user,
        username: username,
        orgUsers: orgUsers,
      }

    } catch (e) {
      console.log(`Could not fetch project:`, e);
      alert(`Error while fetching project ${environmentName}`);
    }
  }
}
</script>

<style lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

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