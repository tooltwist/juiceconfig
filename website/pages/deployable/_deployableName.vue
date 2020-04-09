<template lang="pug">
div
  section.section
    h1.title Deployable&nbsp;
      span(v-html="std_deployableDisplay(deployable)")

    b-tabs(v-model="activeTab", :animated="false")
      b-tab-item(label="Status")
          // Project information
          form.formStyle
            .field.is-horizontal
              .field-label.is-normal
                label.label(style="width:200px;") Name
              .field-body
                .field  
                  .control
                    p.my-not-input-p() &nbsp;{{deployable.name}}
            .field.is-horizontal
              .field-label.is-normal  
                label.label(style="width:200px;") Type:
              .field-body
                .field
                  .control
                    select.select(v-model="deployable.type", :disabled="!editingDetails")
                      option(value="project") Project
                      option(value="non project") Non project
            .field.is-horizontal
              .field-label.is-normal 
                label.label(style="width:200px;") Product Owner:
              .field-body 
                .field  
                  .control  
                    input.input(v-if="editingDetails", v-model.trim="deployable.product_owner", @input="saveDetails")
                    a.my-not-input-a(v-else-if="validUrl(deployable.product_owner)", :href="deployable.product_owner", target="_blank") &nbsp;{{deployable.product_owner}}
                    p.my-not-input-p(v-else) &nbsp;{{deployable.product_owner}}
            .field.is-horizontal
              .field-label.is-normal
                label.label(style="width:200px;") Description:
              .field-body
                .field
                  .control
                    textarea.textarea(v-model.trim="deployable.description", placeholder="Description", :disabled="!editingDetails", @input="saveDetails")
            .field.is-horizontal
              .field-label.is-normal  
                label.label(style="width:200px;") Is this a project?
              .field-body
                .field
                  .control
                    select.select(v-model="deployable.type", :disabled="!editingDetails")
                      option(value="project") Project
                      option(value="non project") Non project
          .control
          button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

          
          //- div.form-group
          //-   div(v-if="mode === 'display'")
          //-     table(style="width:100%")
          //-       tr 
          //-         td(style="justify:right;") 
          //-           label Name:
          //-         td(style="justify:left;")
          //-           | {{ deployable.name }}
          //-       tr
          //-         td(style="justify:right;")
          //-           label(for='type') Type:
          //-         td(style="justify:left;")
          //-           | {{deployable.type}}
          //-       tr
          //-         td(style="justify:right;")
          //-           label(for='product_owner') Product Owner:
          //-         td(style="justify:left;")
          //-           | {{deployable.product_owner}}
          //-       tr
          //-         td(style="justify:right;")
          //-           label(for='description') Description: 
          //-         td(style="justify:left;")
          //-           | {{deployable.description}}
          //-       tr
          //-         td(style="justify:right;")
          //-           label(for='is_project') Is this a project? 
          //-         td(style="justify:left;")
          //-           | {{ yesnoFilter }}
          //-     br
          //-     div(v-if="isEditable")
          //-       b-button.stop(@click="setEditMode", type="is-primary is-outlined is-light", size="is-small")  Edit

      b-tab-item(label="Variables")
        // Variables
        h1(class="is-title is-size-4", style="text-align:left;") Variables
          div(class="buttons", style="float:right;")
            div(v-if="isEditable")
              button(@click.prevent="newVariable(variables)", class="button is-primary", type="is-light")  + Add New Variable
        br
        div(v-if="this.variables.length === 0")
          br
          article(class="message is-success is-small")
            div(class="message-body") 
              | There are no variables for this deployable yet. Would you like to add a 
              a(href="" @click.prevent="newVariable(variables)") new variable?
        div(v-else)
          b-table(:data="variables", focusable)
            template(slot-scope="props")
              b-table-column(field="name", label="Name")
                | {{ props.row.name }}
              b-table-column(field="description", label="Description")
                |  {{ props.row.description }}
              b-table-column(field="type", label="Type")
                |  {{ props.row.type }}
              b-table-column(field="mandatory", label="Mandatory")
                | {{ props.row.mandatory | yesno }}
              b-table-column(field="is_external", label="Is external?")
                | {{ props.row.is_external | yesno }}
              b-table-column(field="", label="")
                div(v-if="isEditable")
                  a(href="", @click.prevent="editVariable(props.row)")
                    b-icon(icon="circle-edit-outline")
          //- modal(v-if="showModal", @close="showModal = false")
            h3(slot="header") Edit Variable
            button.button(@click="showModal=false") Hide

      b-tab-item(label="Deployments")
        // Deployments
        h1(class="is-title is-size-4", style="text-align:left;") Deployments
          div(class="buttons", style="float:right;")
            div(v-if="isEditable")
              button(@click.prevent="newDeployment(deployments)", class="button is-primary",  type="is-light")  + Add New Deployment
        br
        div(v-if="this.deployments.length === 0")
          br
          article(class="message is-success is-small")
            div(class="message-body") There are no deployments for this deployable yet. Would you like to add a new deployment?
        div(v-else)
          b-table(:data="deployments", focusable)
            template(slot-scope="props")
              b-table-column(field="environment", label="Environment")
                nuxt-link(:to="`/environment/${props.row.environment}`")
                  span(v-html="std_toQualifiedDisplay(props.row.environmentOwner, props.row.environment)")
              b-table-column(field="deployable", label="Application")
                | {{ props.row.application_name }}
              b-table-column(field="notes", label="Notes")
                | {{ props.row.notes }}
              b-table-column(field="", label="")
                b-button(class="button is-small is-primary is-outlined", tag="nuxt-link", :to="`../deployment/${props.row.environment_owner}:${props.row.environment}/${props.row.application_name}`") Configure

      b-tab-item(label="Dependencies")
        // Dependencies
        h1(class="is-title is-size-4", style="text-align:left;") Dependencies
          div(class="buttons", style="float:right;")
            div(v-if="isEditable")
              button(@click.prevent="newDependency(dependencies)", class="button is-primary", type="is-light")  + Add New Dependency
        br
        div(v-if="this.dependencies.length === 0")
          br
          article(class="message is-success is-small")
            div(class="message-body") There are no dependencies for this deployable yet. Would you like to add a new dependency?
        b-table(:data="dependencies", focusable)
          template(slot-scope="props")
            b-table-column(field="parent", label="Parent")
              | {{ props.row.parent }}
            b-table-column(field="child", label="Child")
              | {{ props.row.child }}
            b-table-column(field="prefix", label="Prefix")
              | {{ props.row.prefix }}
            b-table-column(field="version", label="Version")
              | {{ props.row.version }}

      div(v-if="deployable.is_project === 1")
        b-tab-item(label="Users")
          // Users
          h1(class="is-title is-size-4") Users
            div(class="buttons", style="float:right;")
              div(v-if="isEditable")
                button(@click.prevent="newUser", class="button is-primary", type="is-light")  + Add New User
          br
          div(v-if="this.users.length === 0")
            br
            article(class="message is-success is-small")
              div(class="message-body") There are no users for this deployable yet. Would you like to add a new user?
          b-table(:data="users", focusable)
            template(slot-scope="props")
              b-table-column(field="project", label="Project")
                | {{ props.row.project }}
              b-table-column(field="first_name", label="First Name")
                | {{ props.row.first_name }}
              b-table-column(field="last_name", label="Last Name")
                | {{ props.row.last_name }}
              div(v-if="access === 'admin'")
                b-table-column(field="user_id", labe="Users ID")
                  | {{ props.row.user_id }}
              b-table-column(field="access", label="Access")  
                | {{ props.row.access }}
              b-table-column(field="", label="")
                div(v-if="isEditable")
                  a(href="", @click.prevent="editUser(props.row)")
                    b-icon(icon="circle-edit-outline")

  // Edit Deployable details MODAL
  div(v-show="editDeployableStatus == 'edit'")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Edit Deployable 
                b {{ deployableName }}
            section(class="modal-card-body")
              slot(name="body")
                form
                  div.form-group
                    div.formStyle Edit product owner:
                      div(class="control")
                        input(name="product_owner", v-model="form.new_owner", class="input", type="text", value="product_owner", placeholder="Product Owners Name")
                    div.formStyle Edit description:
                      div(class="control")
                        input(name="description", v-model="form.new_description", class="input", type="text", value="description", placeholder="Description")
                    div.formStyle Edit type:
                      div(class="control")
                        input(name="type", v-model="form.new_type", class="input", type="text", value="type", placeholder="Type")
                    div.formStyle Edit is this a project?
                      div(class="control")
                        b-select(placeholder="Is this a project?", v-model="form.new_is_project", value="is_project") Is this deployable a project?:
                          option(value="1") Yes
                          option(value="0") No
            footer(class="modal-card-foot")    
              div(class="control")
                b-button(@click.stop="saveDeployable", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="editDeployableStatus='null'", type="is-danger is-outlined", size="is-small") Cancel
  
  // Edit Variable Modal starts below:
  div(v-show="showModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Edit Variable 
                b {{ variable_name }}
            section(class="modal-card-body")
              slot(name="body")
                form
                  div.form-group
                    div.formStyle Edit description:
                      div(class="control")
                        input(v-model="form.new_variable_description", class="input", type="text", value="description", placeholder="Description")  
                    div.formPlacement
                      b-field.formStyle(class="control") Edit Type:
                        b-select(placeholder="Type", v-model="form.new_variable_type", value="type") 
                          option(value="string") String
                          option(value="numeric") Numeric 
                      div.formStyle Edit mandatory:
                        b-select(placeholder="Is this variable mandatory?", v-model="form.new_variable_mandatory", value="mandatory") Is this variable mandatory?:
                          option(value="1") Yes
                          option(value="0") No
                      div.formStyle Edit external:
                        b-select(placeholder="Is this variable external?", v-model="form.new_variable_is_external", value="is_external") Is this variable external?:
                          option(value="1") Yes
                          option(value="0") No
            footer(class="modal-card-foot")  
              div(class="control")
                b-button(@click.stop="saveVariable", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="showModal=false", type="is-danger is-outlined", size="is-small") Cancel
          
  // New Variable Modal starts below:
  div(v-show="newVariableModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New Variable for 
                b {{ deployableName }}
            section(class="modal-card-body")
              div(v-if="errormode === 'inputError'")
                article(class="message is-danger is-small")
                  div(class="message-header")
                    p Form Error
                  div(class="message-body") Please ensure that all fields have values before saving.
              div(class="modal-body", :data="variables")
                slot(name="body")
                    form
                      div.form-group
                        div.formStyle Variable name:
                          div(class="control")
                            div(v-if="variableError === null")
                              input(name="variable_name", v-model="form.variable_name", class="input", type="text", placeholder="Variable name")
                            div(v-else="variableError === `Variable already exists`")   
                              input(class="input is-danger", v-model="form.variable_name", type="text", placeholder="Variable Name")
                              p(class="help is-danger") This variable name already exists. Try again.
                        div.formStyle Description:
                          div(class="control")
                            input(name="new_description", v-model="form.variable_description", class="input", type="text", placeholder="Description")
                        div.formPlacement
                          div.formStyle Type:
                            b-select(placeholder="Type", v-model="form.variable_type") Type:
                              option(value="string") String
                              option(value="numeric") Numeric
                          div.formStyle Mandatory:
                            b-select(placeholder="Is this variable mandatory?", v-model="form.variable_mandatory") Is this variable mandatory: 
                              option(value="1") Yes
                              option(value="0") No
                          div.formStyle External:
                            b-select(placeholder="Is this variable external?", v-model="form.variable_is_external", value="is_external") Is this variable external?:
                              option(value="1") Yes
                              option(value="0") No
            footer(class="modal-card-foot")
              div(class="control")
                b-button(@click.stop="saveNewVariable",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newVariableModal=false", type="is-danger is-outlined", size="is-small") Cancel
  
  // New Deployment Modal starts below:
  div(v-show="newDeploymentModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New Deployment for 
                b {{ deployableName }}
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
                        div.formStyle Environment:
                          div(class="control")
                            div(v-if="deploymentError === null")
                              b-select(placeholder="Environment", v-model="form.new_environment") Environment:
                                option(v-for="environment in environments") {{ environment.name }}
                            div(v-else="deploymentError === `Deployment already exists`")
                              b-select(class="is-danger", placeholder="Environment", v-model="form.new_environment") Environment:
                                option(v-for="environment in environments") {{ environment.name }}
                              p(class="help is-danger") {{ deployableName }} is already deployed on this environment.
                        div.formStyle Notes:
                          div(class="control")
                            input(name="new_notes", v-model="form.new_notes", class="input", type="text", placeholder="Notes")
            footer(class="modal-card-foot")  
              div(class="control")
                b-button(@click.stop="saveNewDeployment",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newDeploymentModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // New Dependency Modal starts below:
  div(v-show="newDependencyModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New Dependency for 
                b {{ deployableName }}
            section(class="modal-card-body")
              div(v-if="errormode === 'inputError'")
                article(class="message is-danger is-small")
                  div(class="message-header")
                    p Form Error
                  div(class="message-body") Please ensure that all fields have values before saving.
              div(class="modal-body", :data="dependencies")
                slot(name="body")
                    form
                      div.form-group
                        div.formStyle Child: 
                          div(class="control")
                            div(v-if="dependencyError === null")
                              input(name="new_child", v-model="form.new_child", class="input", type="text", placeholder="Dependent Child")
                            div(v-else="dependencyError === `Dependency already exists`")
                              input(name="new_child", v-model="form.new_child", class="input", type="text", placeholder="Dependent Child")
                              p(class="help is-danger") {{ deployableName }} already has a dependency with this child.
                        div.formStyle Prefix: 
                          div(class="control")
                            div(v-if="dependencyError === null")
                              input(name="new_prefix", v-model="form.new_prefix", class="input", type="text", placeholder="Prefix")
                            div(v-else="dependencyError === `Prefix already exists`")
                              input(name="new_prefix", v-model="form.new_prefix", class="input", type="text", placeholder="Prefix")
                              p(class="help is-danger") {{ deployableName }} already has a dependency with this prefix.
                        div.formStyle Version:
                          div(class="control")
                            input(name="new_version", v-model="form.new_version", class="input", type="text", placeholder="Version")
            footer(class="modal-card-foot")
              div(class="control")
                b-button(@click.stop="saveNewDependency",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newDependencyModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // New User Modal starts below:
  div(v-show="newUserModal")
    transition(name="modal")
      div(class="modal-mask")
        div(class="modal-wrapper")
          div(class="modal-card")
            header(class="modal-card-head")
              p(class="modal-card-title") Add New User for Project 
                b {{ deployableName }}
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
                          b-select(placeholder="User", v-model="form.new_projectuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }}
                        div(v-if="newUserError === `User already exists`") 
                          b-select(placeholder="User", v-model="form.new_projectuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }}
                          p(class="help is-danger") {{ deployableName }} already has this user added.
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
                b  {{ users.first_name }} {{ users.last_name }}
            section(class="modal-card-body")
              slot(name="body")
                form
                  div.form-group
                    b-field.formStyle(class="control") Edit accessibility:
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
  name: 'Deployable',

  components: {
    modal: {
    template: '#modal-template'
    }
  },

  data () {
    return {
      form: {
        // Editing the existing deployable
        new_owner: '',
        new_type: '',
        new_description: '',
        new_is_project: '',
  
        // Editing an existing variable
        new_variable_description: '',
        new_variable_type: '',
        new_variable_mandatory: '',
        new_variable_is_external: '',

        // Adding a new variable
        variable_name: '',
        variable_description: '',  
        variable_type: '',
        variable_mandatory: '',
        variable_is_external: '',

        // Adding a new deployment
        new_notes: '',
        new_environment: '',

        // Adding a dependency
        new_child: '',
        new_prefix: '',
        new_version: '',

        // Adding a new user
        new_projectuser: '',
        new_user_access: '',

        // Edit existing user
        edit_useraccess: '',
        editmodal_userid: '',
      },
      editingDetails: false,

      // Editing deployables existing values
      product_owner: '',
      description: '',
      is_project: '',
      deployableName: '',
      mode: 'display',

      activeTab: 0,
      deployments: [ ],
      variables: [ ],
      environments: [ ],
      users: [ ],
      allUsers: [ ],
      currentUser: [ ],
      deployable: '',
      project: null, 
      newUserError: null,
      editDeployableStatus: null,

      access: null,

      variableError: null,
      output: '',
      errormode: false,

      // Modal data for editing existing user
      showUserEditModal: false,

      // Modal data for new user
      newUserModal: false,

      // Modal data for adding dependency
      newDependencyModal: false,
      dependencyError: null,

      // Modal data for adding deployment
      newDeploymentModal: false,
      deploymentError: null,

      // Modal data for editing variables
      showModal: false,
      newVariableModal: false,
      variable_name: '',
      variable_description: '',
      variable_type: '',
      variable_mandatory: '',
    }
  },
  
  computed: {
    yesnoFilter: function() {
      if (this.deployable.is_project===1 || this.deployable.is_project==='1') {
        return 'Yes';
      } else {
        return 'No';
      }
    },

    isEditable: function() {
      if (this.currentUser[0].access == 'full'
       || this.currentUser[0].access == 'write' 
       || this.currentUser[0].access == 'super') {
         return true
       } else {
         return false
       }
    }
  },

  methods: {
    ...standardStuff.methods,

    // SAVE EDITED DEPLOYABLE DETAILS 
    saveDetails: async function () {
      let self = this
      if (self.updateDelay) {
        clearTimeout(self.updateDelay)
      }
      self.updateDelay = setTimeout(async function () {
        self.updateDelay = null
        const url = standardStuff.apiURL('/deployable')
        const config = standardStuff.axiosConfig(self.$loginservice.jwt)
        console.log(`UPDATING DEPLOYABLE`, self.deployable);

        let result = await axios.put(url, self.deployable, config)
      }, 1000)
    }, // -saveDetails

    // EDIT THE DETAILS OF THE SELECTED DEPLOYABLE
    async saveDeployable() {
      try {
        let url = standardStuff.apiURL('/deployable')
        let record = {
          product_owner: this.form.new_owner,
          type: this.form.new_type,
          description: this.form.new_description,
          is_project: this.form.new_is_project,
          name: this.deployableName
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        //console.log('Edited deployable successfully saved: ', this.form.new_is_project)

        // Display new deployable details
        this.editDeployableStatus = 'null'
        this.deployable.product_owner = this.form.new_owner
        this.deployable.type = this.form.new_type
        this.deployable.description = this.form.new_description
        this.deployable.is_project = this.form.new_is_project
        console.log('New deployable details have been updated on the browser.')
      } catch (e) {
        console.log(`Error while updating browser: `, e)
      } 
    }, // - saveDeployable

    // ADD A NEW VARIABLE TO THE DATABASE - FROM MODAL 
    async saveNewVariable() {
      //Check that form is filled correctly
      if (this.form.variable_name && this.form.variable_type && this.form.variable_mandatory && this.form.variable_is_external) {
        
        // Check for existing variable names
        let found = false
        this.variables.forEach(variable => {
          if (variable.name === this.form.variable_name) {
            console.log(`There is already an existing variable with these values!`)
            found = true
          }
        })

        // If matching variable is found, send error 
        if (found) {
          console.log(`There is already a variable with these values... Error message shown!`)
          this.variableError = `Variable already exists`
          return 
        }
        this.variableError = null

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newVariable')
          let record = {
            name: this.form.variable_name,
            description: this.form.variable_description,
            type: this.form.variable_type,
            mandatory: this.form.variable_mandatory,
            deployable: this.deployableName,
            external: this.form.variable_is_external,
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newVariableModal = false
          console.log(`New variable successfully sent to database`);
        } catch (e) {
          console.log(`Error while adding new variable to the database: `, e)
        }

        // Once data sent, reload with the new variable
        try {
          this.reloadVariables(); 
          console.log(`Variables have been reloaded on the browser.`)
        } catch (e) {
          console.log(`Error while reloading variables on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewVariable

    // ADD A NEW USER FOR SELECTED PROJECT TO THE DATABASE - FROM MODAL 
    async saveNewUser() {
      console.log(`saveNewUser(): `, this.form.new_projectuser)
      //Check that form is filled correctly
      if (this.form.new_projectuser && this.form.new_user_access) {
        
        // Check for existing user using selected project:
        let found = false
        this.users.forEach(user => {
          if (user.user_id === this.form.new_projectuser) {
            console.log(`This user is already able to access this project!`)
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
          let url = standardStuff.apiURL('/newProjectUser')
          let record = {
            id: this.form.new_projectuser,
            access: this.form.new_user_access,
            project: this.deployableName
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newUserModal = false
          console.log(`New project user successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new project user to the database: `, e)
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
        let url = standardStuff.apiURL('/editUser')
        let record = {
            id: this.users.user_id,
            access: this.form.edit_useraccess,
            project: this.deployableName,
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        console.log('Edited user successfully saved: ' + this.deployableName + ' ' + this.users.user_id + ' ' + this.form.edit_useraccess)

        // Display new users details
        this.showUserEditModal = false;
        this.reloadUsers();
        console.log('New user details have been updated on the browser.')
      } catch (e) {
        console.log(`Error whilst updating browser with edited user:`, e)
      } 
    }, // - saveEditedUser

    // ADD A NEW DEPLOYMENT TO THE DATABASE - FROM MODAL 
    async saveNewDeployment() {
      //Check that form is filled correctly
      if (this.form.new_notes && this.form.new_environment) {
        
        // Check for existing deployment using selected environment:
        let found = false
        this.deployments.forEach(deployment => {
          if (deployment.environment === this.form.new_environment && deployment.deployable === this.deployableName) {
            console.log(`There is already an existing deployable with these values!`)
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
            environment: this.form.new_environment,
            notes: this.form.new_notes,
            deployable: this.deployableName,
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

    // ADD A NEW DEPENDENCY TO THE DATABASE - FROM MODAL 
    async saveNewDependency() {
      //Check that form is filled correctly
      if (this.form.new_child && this.form.new_prefix && this.form.new_version) {
        
        // Check for existing dependency using selected child & deployableName:
        let found = false
        this.dependencies.forEach(dependency => {
          if (dependency.child === this.form.new_child && dependency.parent === this.deployableName) {
            console.log(`There is already an existing dependency with these values!`)
            found = true
          }
        })

        // Check for existing prefix using selected prefix and deployableName:
        let foundPref = false
        this.dependencies.forEach(dependency => {
          if (dependency.prefix === this.form.new_prefix && dependency.parent === this.deployableName) {
            console.log(`There is already an existing prefix with this value!`)
            foundPref = true
          }
        })

        // If matching dependency is found, send error 
        if (found) {
          console.log(`There is already a dependency with these values... Error message shown!`)
          this.dependencyError = `Dependency already exists`
          return 
        }

        // If matching prefix is found, send error 
        if (foundPref) {
          console.log(`There is already a prefix with this value... Error message shown!`)
          this.dependencyError = `Prefix already exists`
          return 
        }
        this.dependencyError = null

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newDependency')
          let record = {
            child: this.form.new_child,
            prefix: this.form.new_prefix,
            version: this.form.new_version,
            deployable: this.deployableName
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newDependencyModal = false
          console.log(`New dependency successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new dependency to the database: `, e)
        }

        // Once data sent, reload with the new dependency
        try {
          this.reloadDependencies(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Error while reloading dependencies on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewDependency

    // SAVE AN EDITED VARIABLE WITH NEW VALUES - IN MODAL
    async saveVariable() {
      try {
        let url = standardStuff.apiURL('/variable')
        let record = {
          description: this.form.new_variable_description,
          type: this.form.new_variable_type,
          mandatory: this.form.new_variable_mandatory,
          external: this.form.new_variable_is_external,
          deployable: this.deployableName,
          name: this.variable_name,
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        this.showModal = false
        console.log(`Updated variable successfully sent to database`)
      } catch (e) {
        console.log(`Error while sending edited variable to the database: `, e)
      }

      try {
        this.reloadVariables(); 
        console.log(`Variables have been reloaded`)
      } catch (e) {
        console.log(`Error while reloading variables`, e)
      }
    }, // -saveVariable

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW OR EDITED VARIABLES
    async reloadVariables() {
      const  url = standardStuff.apiURL('/variables')
      const params = { 
        params: {
          deployableName: this.deployableName
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res = await axios.get(url, params, config)
      this.variables = res.data.variables
      console.log(`Variables have been reloaded on the browser.`)
      return {
        variables: this.variables
      };
    },  // -reloadVariables 

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW PROJECT USER
    async reloadUsers() {
      const url = standardStuff.apiURL('/project_users')
      const params = {
          params: { 
            deployableName: this.deployableName
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let result = await axios.get(url, params, config)
      console.log(`API5 returned`, result.data);
      this.users = result.data.users
      return {
        users: this.users
      };
    },  // -reloadUsers

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW DEPLOYMENT
    async reloadDeployments() {
      const url = standardStuff.apiURL('/envDeployments')
      const params = { 
        params: {
          deployableName: this.deployableName
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res3 = await axios.get(url, params, config)
      console.log(`Deployments have been reloaded on the browser`);
      this.deployments = res3.data.deployments
      return {
        deployments: this.deployments
      };
    },  // -reloadDeployments

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW DEPENDENCY
    async reloadDependencies() {
      const url = standardStuff.apiURL('/dependencies1')
      const params = {
          params: { 
            deployableName: this.deployableName
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res4 = await axios.get(url, params, config)
      console.log(`Dependencies have been reloaded on the browser`);
      this.dependencies = res4.data.dependencies
      return {
        dependencies: this.dependencies
      }
    },  // -reloadDependencies

    // EDIT MODE FOR DEPLOYABLES
    setEditMode() { 
      this.editDeployableStatus = 'edit'
      this.form.new_owner = this.deployable.product_owner
      this.form.new_type = this.deployable.type
      this.form.new_description = this.deployable.description
      this.form.new_is_project = this.deployable.is_project
    }, // -setEditMode

    // OPEN MODAL AND CHANGE VALUES FOR EDITING VARIABLE - receives props.row (i.e. variable record)
    editVariable(variables) {  
      this.showModal = true,
      this.variable_name = variables.name
      this.form.new_variable_description = variables.description 
      this.form.new_variable_type = variables.type 
      this.form.new_variable_mandatory = variables.mandatory
      this.form.new_variable_is_external = variables.is_external
      return false
    }, // -editVariable

    // OPEN MODAL AND CREATE NEW VALUES FOR CREATING NEW VARIABLE 
    newVariable(variable) {
      this.newVariableModal = true;
      this.variable_name = variable.name,
      this.variable_description = variable.description,
      this.variable_type = variable.type,
      this.variable_mandatory = variable.mandatory,
      this.variable_is_external = variable.is_external
      return false
    }, // -newVariable

    // OPEN MODAL AND CHANGE VALUES FOR EDITING USER - receives props.row (i.e. user record)
    editUser(users) {  
      this.showUserEditModal = true,
      this.users.first_name = users.first_name,
      this.users.last_name = users.last_name,
      this.users.user_id = users.user_id,
      this.form.edit_useraccess = users.access
      return false
    }, // -editUser

    // OPEN MODAL AND CREATE NEW USER
    newUser() {
      this.newUserModal = true;
      return false
    },

    // OPEN MODAL AND CREATE NEW DEPENDENCY 
    newDependency(variable) {
      this.newDependencyModal = true;
      return false
    }, // -newVariable

    // OPEN MODAL AND ENTER NEW VALUES FOR CREATING NEW DEPLOYMENT 
    newDeployment(deployments) {
      this.newDeploymentModal = true;
      return false
    }, // -newDeployment
  },

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let username = app.$nuxtLoginservice.user.username
    let {owner:deployableOwner, name:deployableName} = standardStuff.methods.std_fromQualifiedName(params.deployableName, username)
    console.log(`deployable=> ${deployableOwner}, ${deployableName}`);

    try {
      // Select the deployable for this page
      const url = standardStuff.apiURL('/deployable')
      const params = {
          params: { 
            deployableName: deployableName
          }
      }
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      console.log(`Calling ${url}`);
      let res = await axios.get(url, params, config)
      console.log(`API returned`, res.data);
      const deployable = res.data.record

      // Select the variables for this deployable
      const url2 = standardStuff.apiURL('/variables')
      let res2 = await axios.get(url2, params, config)
      console.log(`API2 returned`, res2.data);
      const variables = res2.data.variables

      // Select the deployments for this deployable
      const url3 = standardStuff.apiURL('/envDeployments')
      let res3 = await axios.get(url3, params, config)
      console.log(`API3 returned`, res3.data);
      const deployments = res3.data.deployments

      // Select dependencies for this deployable
      const url4 = standardStuff.apiURL('/dependencies1')
      let res4 = await axios.get(url4, params, config)
      console.log(`API4 returned dependencies:`, res4.data);
      const dependencies = res4.data.dependencies

      // Select users for this deployable
      const url5 = standardStuff.apiURL('/project_users')
      let res5 = await axios.get(url5, params, config)
      console.log(`API5 returned`, res5.data);
      const users = res5.data.users

      // Import environments to use when creating new Deployment
      const url6 = standardStuff.apiURL('/environments')
      console.log(`Calling ${url6}`);
      console.log(`config = `, config)
      let res6 = await axios.get(url6, config)
  
      const environments = res6.data.environments

      // Import all users for creating new user (on the selected project)
      const url7 = standardStuff.apiURL('/users')
      let res7 = await axios.get(url7, config)
      console.log(`API7 returned`, res7.data);
      const allUsers = res7.data.users
      console.log(allUsers)

      // This users accessibility/profile details
      const url8 = standardStuff.apiURL('/currentUser')
      let res8 = await axios.get(url8, config)
      console.log(`API8 returned`, res8.data);
      const currentUser = res8.data.user
      console.log('currentUser: ', currentUser)

      return {
        deployableName: deployableName,
        deployable: deployable,
        variables: variables,
        deployments: deployments, 
        users: users,
        allUsers: allUsers,
        environments: environments,
        dependencies: dependencies,
        currentUser: currentUser,
      }
    } catch (e) {
      console.log(`Could not fetch project:`, e)
      alert(`Error while fetching project ${deployableName}`)
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
.formPlacement {
  display: flex;
}

.formStyle {
  margin: 10px 0px;
  padding: 0px 20px;
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