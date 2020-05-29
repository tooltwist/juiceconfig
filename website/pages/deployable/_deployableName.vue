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
                    select.select(v-model="deployable.type", :disabled="!editingDetails", @input="saveDetails")
                      option(value="project") Project
                      option(value="api") API
                      option(value="database") Database
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
                label.label(style="width:200px;") Public:
              .field-body
                .field
                  .control
                    select.select(v-model="deployable.is_global", :disabled="!editingDetails", @input="saveDetails")
                      option(value="1") Yes
                      option(value="0") No
          div(v-if="isOwner()").control
            button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

      b-tab-item(label="Variables")
        // Variables
        h1.is-title.is-size-4(style="text-align:left;") Variables
          div.buttons(v-if="isOwner()", style="float:right;")
            div(v-if="isEditable")
              button.button.is-primary(v-if="variables.length>0", @click="editingDetails= !editingDetails") {{editingDetails?'Done':'Edit'}}
              button.button.is-light(@click.prevent="showLearnVariablesDialog")  Learn Variables
              button.button.is-primary(@click.prevent="newVariable(variables)")  + Add New Variable
        br 
        div(v-if="this.variables.length === 0")
          div(v-if="isOwner()")
            br
            article.message.is-success.is-small
              div.message-body 
                | There are no variables for this deployable yet. Would you like to add a 
                a(href="" @click.prevent="newVariable(variables)") new variable?
          div(v-else)
            article.message.is-success.is-small 
              div.message-body Nothing to show.
        div(v-else)
          br
          table.table.my-variable-table(:data="variables", focusable)
            tr.is-size-7
              th(colspan="2")
                | Name
                br
                span.is-light(style="padding-left:20px;") Example
              th Type
              th.has-text-centered Mandatory
              th.has-text-centered External
              th.has-text-centered Sensitive
              th Description
              th
            template(v-for="variable in variables")
              tr.is-size-7.my-variable-line-1
                td(colspan="2")
                  input.my-name-input(v-if="editingDetails", v-model="variable.name", @input="updateVariable(variable)")
                  span(v-else) {{ variable.name }} ({{variable._name}})
                td
                  select.selectZ.is-size-7(v-if="editingDetails", v-model="variable.type", @input="updateVariable(variable)")
                    option(value="string") String
                    option(value="number") Number
                  //- input(v-if="editingDetails", v-model="variable.type", @input="updateVariable(variable)")
                  span(v-else) {{ variable.type }}
                td.has-text-centered
                  input(v-if="editingDetails", type="checkbox", v-model="variable.mandatory", @input="updateVariable(variable)")
                  input.checkbox(v-else, type="checkbox", v-model="variable.mandatory", disabled="true")
                td.has-text-centered
                  input(v-if="editingDetails", type="checkbox", v-model="variable.is_external", @input="updateVariable(variable)")
                  input.checkbox(v-else, type="checkbox", v-model="variable.is_external", disabled="true")
                td.has-text-centered
                  input(v-if="editingDetails", type="checkbox", v-model="variable.is_sensitive", @input="updateVariable(variable)")
                  input.checkbox(v-else, type="checkbox", v-model="variable.is_sensitive", disabled="true")
                td
                  input(v-if="editingDetails", v-model="variable.description", @input="updateVariable(variable)")
                  span(v-else) {{ variable.description }}
                td
                  | X
                //- b-table-column(field="example", label="Example")
                //- b-table-column(field="type", label="Type")
                //- b-table-column(field="", label="")
                  div(v-if="isEditable")
                    a(href="", @click.prevent="editVariable(props.row)")
                      b-icon(icon="circle-edit-outline")
              tr.is-size-7.my-variable-line-2(v-if="variable.example", @input="updateVariable(variable)")
                td(style="width:20px;")
                td(colspan=7)
                  input.my-example-input(v-if="editingDetails", v-model="variable.example")
                  span(v-else) {{ variable.example }}
          //- modal(v-if="showModal", @close="showModal = false")
            h3(slot="header") Edit Variable
            button.button(@click="showModal=false") Hide
          //button.button.is-size-small(@click="editingDetails= !editingDetails") {{editingDetails?'Done':'Edit'}}

      b-tab-item(label="Deployments")
        // Deployments
        h1.is-title.is-size-4(style="text-align:left;") Deployments
        br 
        div(v-if="this.deployments.length === 0")
          br
          article.message.is-success.is-small
            div.message-body There are no deployments for this deployable yet. Would you like to add a new deployment?
        div(v-else)
          b-table(:data="deployments", focusable)
            template(slot-scope="props")
              b-table-column(field="application_name", label="Application Name")
                | {{ props.row.application_name }}
              b-table-column(field="environment", label="Environment")
                nuxt-link(:to="`/environment/${std_toQualifiedName(props.row.environmentOwner,props.row.environment)}`")
                  span(v-html="std_toQualifiedDisplay(props.row.environmentOwner, props.row.environment)")
              b-table-column(field="notes", label="Notes")
                | {{ props.row.notes }}

      b-tab-item(label="Dependencies")
        // Dependencies
        h1.is-title.is-size-4(style="text-align:left;") Dependencies
          div.buttons(style="float:right;")
            div(v-if="isEditable")
              button.button.is-primary(@click.prevent="newDependency(dependencies)", type="is-light")  + Add New Dependency
        br
        div(v-if="this.dependencies.length === 0")
          br
          article.message.is-success.is-small
            div.message-body There are no dependencies for this deployable yet. Would you like to add a new dependency?
        b-table(:data="dependencies", focusable)
          template(slot-scope="props")
            b-table-column(field="parent", label="Parent")
              nuxt-link(:to="`/deployable/${props.row.parent_name}`")
                span(v-html="std_toQualifiedDisplay(props.row.parent_owner, props.row.parent_name)")
            b-table-column(field="child", label="Child")
              nuxt-link(:to="`/deployable/${props.row.child_name}`")
                span(v-html="std_toQualifiedDisplay(props.row.child_owner, props.row.child_name)")
            b-table-column(field="prefix", label="Prefix")
              | {{ props.row.prefix }}
            b-table-column(field="version", label="Version")
              | {{ props.row.version }}

      b-tab-item(v-if="isOwner()", label="Users")
        // Users
        h1.is-title.is-size-4 Users
          div.buttons(style="float:right;")
            div(v-if="isEditable")
              button.button.is-primary(@click.prevent="newUser", type="is-light")  + Add New User
        br
        div(v-if="this.users.length === 0")
          br
          article.message.is-success.is-small
            div.message-body There are no users for this deployable yet. Would you like to add a new user?
        b-table(:data="users", focusable)
          template(slot-scope="props")
            b-table-column(field="username", label="Username")
              | {{ props.row.username }}
            b-table-column(field="first_name", label="First Name")
              | {{ props.row.first_name }}
            b-table-column(field="last_name", label="Last Name")
              | {{ props.row.last_name }}
            div(v-if="access === 'admin'")
              b-table-column(field="user_id", labe="Users ID")
                | {{ props.row.user_id }}
            b-table-column(field="access", label="Access", style="display:flex")    
              div(v-if="props.row.access === 'owner'") Admin   
              div(v-else-if="props.row.access === 'read'") Read  
              div(v-else-if="props.row.access === 'write'") Write 
              div(v-else) {{ props.row.access }}  
              a(href="", @click.prevent="editUser(props.row)") 
                b-icon(icon="circle-edit-outline")

      b-tab-item(label="Versions")     
        b-button.is-success(@click.prevent="newVersion()", style="float:right;") Create new version
        br
        br
        b-table(:data="versions", focusable)
            template(slot-scope="props")
              b-table-column(field="version", label="Version")
                | {{ props.row.version }}
              b-table-column(field="build_no", label="Build #")
                |  {{ props.row.build_no }}
              b-table-column(field="registration_time", label="Registration Time")
                |  {{ props.row.registration_time }}
              b-table-column(field="registration_source", label="Registration Source")
                | {{ props.row.registration_source }}
              b-table-column(field="registered_by", label="Registered By")
                | {{ props.row.registered_by}}

      b-tab-item(label="Tokens")       
        b-button.is-success(@click.prevent="newToken()", style="float:right;") Generate a random token
        br
        br
        b-table(:data="tokens", focusable)
          template(slot-scope="props")
            b-table-column(field="id", label="ID")
              | {{ props.row.id }}
            b-table-column(field="token_type", label="Token Type")
              |  {{ props.row.token_type }}
            b-table-column(field="creation_time", label="Created")
              |  {{ props.row.creation_time }}
            b-table-column(field="status", label="Status")
              | {{ props.row.status }}
            b-table-column(field="environment_name", label="Environment Name")
              | {{ props.row.environment_name }}
            b-table-column(field="environment_owner", label="Environment Owner")
              | {{ props.row.environment_owner }}

  // New Token Modal starts below:
  div(v-show="newTokenModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Create a new token
            section.modal-card-body
              slot(name="body")
                div(v-if="errormode === 'inputError'")
                  article.message.is-danger.is-small
                    div.message-header
                      p Form Error
                    div.message-body Please ensure that all necessary fields have values before saving.
                form
                  div.form-group
                    div.formStyle Application Name: {{deployableName}}
                    div.formStyle Token Type:
                      b-select(placeholder="Token Type", v-model="form.new_token_type")
                        option(value="registration") Registration
                        option(value="approve") Approve
                        option(value="approve_deploy") Approve and Deploy 
                        option(value="deploy") Deploy
                        option(value="downgrade") Downgrade 
                    div.formStyle(v-if="form.new_token_type === 'deploy' || 'approve_deploy' || 'downgrade'")
                      div.formStyle This token requires an environment specified    
                        input(type="checkbox", @click="showEnvironmentsToken()") 
                      div(v-if="showEnvironmentToken")
                        div.formStyle Environment name:
                          b-select(placeholder="Deployment", v-model="form.new_token_deployment")
                            option(v-for="deployment in deployments", :value="deployment")
                              | {{deployment.environment_owner}}:
                              b {{deployment.environment}}
                              | {{(deployment.application_name==deployment.deployable) ? '' : ` - ${deployment.application_name}`}}  
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveNewToken", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newTokenModal=false", type="is-danger is-outlined", size="is-small") Cancel


  // New Version Modal starts below:
  div(v-show="modalMode==='newVersion'")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Create a new version
            section.modal-card-body
              slot(name="body")
                div(v-if="errormode === 'inputError'")
                  article.message.is-danger.is-small
                    div.message-header
                      p Form Error
                    div.message-body Please ensure that all necessary fields have values before saving.
                form
                  div.form-group
                    div.formStyle Deployable Name: {{deployableName}}
                    div.formStyle Deployable owner: {{deployable.owner}} 
                    div.formStyle Version #:
                      div.control
                        input.input(v-model="form.new_version_hash", type="text", value="version", placeholder="Version")  
                    div.formStyle Build no.: 
                      div.control
                        input.input(v-model="form.new_version_build_no", type="text", value="build_no")
                    div.formStyle Registration source:
                      div.control 
                        input.input(v-model="form.new_version_registration_source", type="text", value="registration_source")
                    div.formStyle Registered by:
                      div.control
                        input.input(v-model="form.new_version_registered_by", type="text", value="registered_by") 
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveNewVersion", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="modalMode='none'", type="is-danger is-outlined", size="is-small") Cancel

  // Modal to import variables from example JSON:
  div(v-show="modalMode==='learnVariables'")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Learn variables from example config (JSON)
            section.modal-card-body
              slot(name="body")
                div(v-if="errormode === 'inputError'")
                  article.message.is-danger.is-small
                    div.message-header
                      p Form Error
                    div.message-body Please ensure that all necessary fields have values before saving.
                form
                  textarea.textarea.is-size-7(v-model="importJSON", @input.stop="scanJson", placeholder="Paste JSON here")

                  div(v-if="importJSON.trim() === ''")
                    br
                    b-notification(:closable="false")
                      .is-size-6 To copy a json file into the buffer:
                      .my-bash $ pbcopy &lt;&nbsp;
                        b config.json
                      br
                      .is-size-6 To copy a javascript file into the buffer:
                      .my-bash $ node -e 'console.log(JSON.stringify(require("
                        b ./config.js
                        |"),"",2))' | pbcopy
                      br
                      .is-size-6 (Replace config.json or config.js with your config file)
                  div(v-else-if="jsonError")
                    | {{jsonError}}
                  div(v-else-if="importVariables.length > 0")
                    br
                    table.my-table.is-small.is-size-7
                      tr
                        th
                          input(type="checkbox", v-model="selectAllImports", @change="toggleImports")
                        th Op
                        th Name
                      tr(v-for="v in importVariables")
                        td(style="padding-right:10px;")
                          label.checkbox(v-model="v.op")
                            input(type="checkbox", v-model="v.accept")
                        td(style="padding-right:10px;")
                            | {{v.op}}
                        td(style="padding-right:10px;")
                          | {{v.name}}
                        td(style="padding-right:10px;")
                          | {{v.example}}
            footer.modal-card-foot
              div.control
                b-button.is-small(@click.stop="updateVariablesFromImport", type="is-primary is-light", :disabled="importVariables.length < 1") Update    
                b-button.is-small(@click="modalMode='none'", type="is-danger is-outlined") Cancel
  
  // Edit Variable Modal starts below:
  div(v-show="showModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Edit Variable 
                b {{ variable_name }}
            section.modal-card-body
              slot(name="body")
                form
                  div.form-group
                    div.formStyle Edit description:
                      div.control
                        input.input(v-model="form.new_variable_description", type="text", value="description", placeholder="Description")  
                    div.formPlacement
                      b-field.formStyle.control Edit Type:
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
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveVariable", type="is-primary is-light", size="is-small")  Save    
                b-button(@click="showModal=false", type="is-danger is-outlined", size="is-small") Cancel
          
  // New Variable Modal starts below:
  div(v-show="newVariableModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Add New Variable for 
                b {{ deployableName }}
            section.modal-card-body
              div(v-if="errormode === 'inputError'")
                article.message.is-danger.is-small
                  div.message-header
                    p Form Error
                  div.message-body Please ensure that all fields have values before saving.
              div.modal-body(:data="variables")
                slot(name="body")
                    form
                      div.form-group
                        div.formStyle Variable name:
                          div.control
                            div(v-if="variableError === null")
                              input.input(name="variable_name", v-model="form.variable_name", type="text", placeholder="Variable name")
                            div(v-else="variableError === `Variable already exists`")   
                              input.input.is-danger(v-model="form.variable_name", type="text", placeholder="Variable Name")
                              p.help.is-danger This variable name already exists. Try again.
                        div.formStyle Description:
                          div.control
                            input.input(name="new_description", v-model="form.variable_description", type="text", placeholder="Description")
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
                          div.formStyle Sensitive:
                            b-select(placeholder="Is this variable sensitive?", v-model="form.variable_is_sensitive", value="is_sensitive") Is this variable sensitive?:
                              option(value="1") Yes
                              option(value="0") No
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveNewVariable",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newVariableModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // New Dependency Modal starts below:
  div(v-show="newDependencyModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Add New Dependency for 
                b {{ deployableName }}
            section.modal-card-body
              div(v-if="errormode === 'inputError'")
                article.message.is-danger.is-small
                  div.message-header
                    p Form Error
                  div.message-body Please ensure that all fields have values before saving.
              div.modal-body(:data="dependencies")
                slot(name="body")
                    form
                      div.form-group
                        div.formStyle Child:
                          div.control 
                            b-select(placeholder="Child", v-model="form.new_child")
                              option(v-for="deployable in deployables") {{ deployable.name }} 
                            div(v-if="dependencyError === `Dependency already exists`")
                              p.help.is-danger {{ deployableName }} already has a dependency with this child.
                        div.formStyle Prefix: 
                          div.control
                            div(v-if="dependencyError === null")
                              input.input(name="new_prefix", v-model="form.new_prefix", type="text", placeholder="Prefix")
                            div(v-else="dependencyError === `Prefix already exists`")
                              input.input(name="new_prefix", v-model="form.new_prefix", type="text", placeholder="Prefix")
                              p.help.is-danger {{ deployableName }} already has a dependency with this prefix.
                        div.formStyle Version:
                          div.control
                            input.input(name="new_version", v-model="form.new_version", type="text", placeholder="Version")
            footer.modal-card-foot
              div.control
                b-button(@click.stop="saveNewDependency",  type="is-primary is-light", size="is-small")  Save    
                b-button(@click="newDependencyModal=false", type="is-danger is-outlined", size="is-small") Cancel

  // New User Modal starts below:
  div(v-show="newUserModal")
    transition(name="modal")
      div.modal-mask
        div.modal-wrapper
          div.modal-card
            header.modal-card-head
              p.modal-card-title Add New User for Project 
                b {{ deployableName }}
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
                          b-select(placeholder="User", v-model="form.new_projectuser") User:
                            option(v-for="user in allUsers", :value="user.id") {{ user.first_name }} {{ user.last_name }}
                        div(v-if="newUserError === `User already exists`") 
                          p.help.is-danger {{ deployableName }} already has this user added.
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
                b  {{ users.first_name }} {{ users.last_name }}
            section.modal-card-body
              slot(name="body")
                form
                  div.form-group
                    b-field.formStyle.control Edit accessibility:
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
        is_global: '',
  
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
        variable_is_sensitive: '',

        // Adding a dependency
        new_child: '',
        new_prefix: '',
        new_version: '',
        child_owner: '',

        // Adding a new user
        new_projectuser: '',
        new_user_access: '',
        new_username: '',

        // Edit existing user
        edit_useraccess: '',
        editmodal_userid: '',

        // Add a new token
        new_token_type: 'registration',
        new_token_environment_name: '',//ZZZ unused now
        new_token_deployment: null,

        // Add a new version
        new_version_registered_by: '',
        new_version_hash: '',
        new_version_build_no: '',
        new_version_registration_source: '',
      },

      // Editing deployables existing values
      product_owner: '',
      description: '',
      is_project: '',
      deployableName: '',

      activeTab: 0,
      deployments: [ ],
      variables: [ ],
      environments: [ ],
      users: [ ],
      allUsers: [ ],
      versions: [ ],
      tokens: [ ],
      currentUser: [ ],
      deployable: '',
      deployables: [ ],
      project: null, 
      newUserError: null,
      editDeployableStatus: null,

      access: null,

      variableError: null,
      output: '',
      errormode: false,

      // Show environments option in token modal
      showEnvironmentToken: false,

      // Modal data for editing existing user
      showUserEditModal: false,

      // Modal data for new user
      newUserModal: false,

      // Modal for new token
      newTokenModal: false,

      // Modal for new version
      modalMode: 'none', // none|newVersion|importJson|newUser|userEdit|newToken|newDependancy

      // edit details
      editingDetails: false,

      importJSON: '',
      jsonError: '',
      importVariables: [ ],
      selectAllImports: false,

      // Modal data for adding dependency
      newDependencyModal: false,
      dependencyError: null,

      // Modal data for editing variables
      showModal: false,
      newVariableModal: false,
      variable_name: '',
      variable_description: '',
      variable_type: '',
      variable_mandatory: '',

      // Variables waiting to be saved, with setTimeout delay
      // variableName => { timer, variable }
      saveVariableTimers: { },
    }
  },//- data
  
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
    },

  },

  methods: {
    ...standardStuff.methods,

    // CHECK IF CURRENT USER IS OWNER 
    isOwner() {
      if ( this.currentUser[0].username == this.deployable.owner ) {
        return 1;
      } else {
        return 0;
      }
    },

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
          name: this.deployableName,
          is_global: this.form.is_global,
        }
        let config = standardStuff.axiosConfig(this.$loginservice.jwt)
        await axios.post(url, record, config)
        //console.log('Edited deployable successfully saved: ', this.form.new_is_project)

        // Display new deployable details
        this.editDeployableStatus = 'null'
        this.deployable.product_owner = this.form.new_owner
        this.deployable.type = this.form.new_type
        this.deployable.description = this.form.new_description
        this.deployable.is_global = this.form.is_global
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
            deployable_owner: this.deployableOwner,
            deployable_name: this.deployableName,
            name: this.form.variable_name,
            description: this.form.variable_description,
            type: this.form.variable_type,
            mandatory: this.form.variable_mandatory,
            external: this.form.variable_is_external,
            sensitive: this.form.variable_is_sensitive,
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

        this.allUsers.forEach(user => {
          if (user.id === this.form.new_projectuser) {
            this.form.new_username = user.username;
          }
        })

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newProjectUser')

          let record = {
            id: this.form.new_projectuser,
            access: this.form.new_user_access,
            project: this.deployableName,
            username: this.form.new_username,
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

    // ADD A NEW TOKEN FOR DEPLOYABLE - FROM MODAL 
    async saveNewToken() {
      console.log(`saveNewToken(): `)
      //Check that form is filled correctly
      if (this.form.new_token_type) {
        // Send post request to server
        try {

          // if (this.showEnvironmentToken === false) {
          //   this.form.new_token_environment_name = 'NULL';
          //   this.form.new_token_environment_owner = 'NULL';
          // } else { // find environment owner based on name
          //   let i = 0;
          //   let ownerName = 'NULL';
          //   this.environments.forEach(environment => { // set environment owner 
          //       if (environment.name === this.form.new_token_environment_name) {
          //         ownerName = environment.owner
          //       }
          //     }
          //   );

          //   this.form.new_token_environment_owner = ownerName;
          // }
          console.log(`this.form=`, this.form.new_token_deployment);

          let record = {
            token_type: this.form.new_token_type,
            deployable_owner: this.deployable.owner,
            deployable_name: this.deployableName,
          }
          if (this.form.new_token_deployment) {
            record.target_environment_owner = this.form.new_token_deployment.environment_owner
            record.target_environment_name = this.form.new_token_deployment.environment_name
            record.target_application_name = this.form.new_token_deployment.application_name
          }
console.log(`record is`, record);
          let url = standardStuff.apiURL('/token')
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newTokenModal = false
          console.log(`New token request successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new token request to the database: `, e)
        }

        // Once data sent, reload table with the new token
        try {
          this.reloadTokens(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Error while reloading tokens on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewToken

    // ADD A NEW VERSION FOR DEPLOYABLE - FROM MODAL 
    async saveNewVersion() {
      console.log(`saveNewVersion(): `)
      //Check that form is filled correctly
      if (this.form.new_version_hash && this.form.new_version_build_no && this.form.new_version_registration_source && this.form.new_version_registered_by) {
        // Send post request to server
        try {
          let url = standardStuff.apiURL('/newVersion')
          let record = {
            version: this.form.new_version_hash,
            build_no: this.form.new_version_build_no,
            registration_source: this.form.new_version_registration_source,
            registered_by: this.form.new_version_registered_by,
            deployable_name: this.deployableName,
            deployable_owner: this.deployable.owner,
          }
          let config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.modalMode = 'none'
          console.log(`New version request successfully sent to server`);
        } catch (e) {
          console.log(`Error while sending new version request to the server: `, e)
        }

        // Once data sent, reload table with the new version
        try {
          this.reloadVersions(); 
          console.log(`Reloading...`)
        } catch (e) {
          console.log(`Error while reloading versions on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewVersion 
    
    // SAVE EDITED USER
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

        this.deployables.forEach(deployable => {
          if (deployable.name === this.form.new_child) {
            this.form.child_owner = deployable.owner;
          }
        })

        // If no error, send post request to server
        try {
          let url = standardStuff.apiURL('/newDependency')
          let record = {
            child_name: this.form.new_child,
            child_owner: this.form.child_owner,
            prefix: this.form.new_prefix,
            version: this.form.new_version,
            deployable: this.deployableName,
            parent_owner: this.deployable.owner,
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
            deployableOwner: this.deployableOwner,
            deployableName: this.deployableName
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res = await axios.get(url, params, config)
      this.variables = res.data.variables
      console.log(`Variables have been reloaded on the browser.`)
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

    // RELOAD THE DATABASE TABLE AFTER SAVING A NEW TOKEN
    async reloadTokens() {
      const url = standardStuff.apiURL(`/tokens/${this.deployableOwner}:${this.deployableName}`)
      console.log(`YYYY AAA RRR PP`, url);
      // const params = {
      //     params: { 
      //       deployableName: this.deployableName
      //     }
      // }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let result = await axios.get(url, config)
      // let result = await axios.get(url, params, config)
      console.log(`API returned`, result.data);
      this.tokens = result.data.tokens
      return {
        tokens: this.tokens
      };
    },  // -reloadTokens

    // RELOAD THE DATABASE TABLE AFTER SAVING A NEW VERSION
    async reloadVersions() {
      const url = standardStuff.apiURL('/versions')
      const params = {
        params: { 
          deployableName: this.deployableName
        }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let result = await axios.get(url, params, config)
      console.log(`API returned`, result.data);
      this.versions = result.data.versions
      return {
        versions: this.versions
      };
    },  // -reloadVersions 

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW DEPENDENCY
    async reloadDependencies() {
      const url = standardStuff.apiURL('/deployable/${this.deployableOwner}:${this.deployableName}/dependancies')
      const params = {
          params: { 
            deployableName: this.deployableName,
            deployableOwner: this.deployableOwner,
          }
      }
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      // let res4 = await axios.get(url, params, config)
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
    }, // -newUser

    // OPEN MODAL FOR CREATE NEW TOKEN
    newToken() {
      this.newTokenModal = true;
      return false;
    }, // -newToken 

    showEnvironmentsToken() {
      if (this.showEnvironmentToken === true) {
        this.showEnvironmentToken = false;
      } else {
        this.showEnvironmentToken = true;
      }
      
      return false;
    },

    // OPEN MODAL FOR CREATE NEW VERSION
    newVersion() {
      this.modalMode = 'newVersion';
      this.form.new_version_registered_by = this.currentUser[0].username;
      this.form.new_version_registration_source = 'Juice';
      if (this.versions == 0) {
        this.form.new_version_build_no = 1;
      } else {
        let lastbuild = this.versions[this.versions.length - 1].build_no;
        let buildno = lastbuild;
        buildno++;
        this.form.new_version_build_no = buildno;
      }
      
      return false;
    }, // -newVersion 

    // OPEN MODAL AND CREATE NEW DEPENDENCY 
    newDependency(variable) {
      this.newDependencyModal = true;
      return false
    }, // -newVariable

    showLearnVariablesDialog() {
      this.importJSON = ''
      this.importVariables = { }
      this.modalMode = 'learnVariables'
    },

    // We are importing variable names from example JSON
    // 1. Check the JSON is valid.
    // 2. Display a list of possible variables.
    scanJson() {
      console.log(`scanJson()`);
      console.log(`pre-existing this.importVariables=`, this.importVariables);
      if (this.importJSON===null || this.importJSON.trim() === '') {
        this.jsonError = ''
        return
      }
      try {

        // Add these items to our list. At the same time
        // create a hash so we can lookup variable names.
        let config = JSON.parse(this.importJSON)
        console.log(`config is`, config);

        //
        let index = { }
        for (let path in this.importVariables) {
          const variable = this.importVariables[path]
          index[variable.name] = variable
          console.log(`Adding existsing ${variable.name}`);          
        }
        console.log(`existing index is`, JSON.stringify(index, '', 2));

        // Add any new fields to our index of stuff to update.
        let scan = (prefix, obj) => {
          for (let name in obj) {
            let value = obj[name]
            let path = `${prefix}${prefix?'.':''}${name}`

            if (typeof(value) === 'object') {
              scan(path, value)
            } else {
              // if (typeof(index[path]) === 'undefined') {
              // console.log(`add ${path}`);
              if (index[path]) {
                // console.log(`Already in index`);
              } else {
                let { is_sensitive, example } = safeExample(path, value)
                index[path] = {
                  name: path,
                  op: 'add',
                  accept: true,
                  is_sensitive,
                  example,
                }
              }
            }
          }
        }//- scan
        scan('', config)
        console.log(`index after scanning:`, index);
        console.log(`index after scanning:`, JSON.stringify(index, '', 2));

        // Compare our existing variables against those in the JSON.
        this.variables.forEach(variable => {
          let def = index[variable.name]
          if (def) {
            // We already know this variable
            // def.op = 'nada'
            if (def.op !== 'delete') {
              delete index[variable.name]
            }
          } else {
            // This variable is not in the JSON. Delete it?
            index[variable.name] = {
              name: variable.name,
              op: 'delete',
              accept: true,
              example: '' }
          }
        })

        // Display them as a sorted list
        this.importVariables = [ ]
        for (let name in index) {
          let value = index[name]
          this.importVariables.push(value)
        }
        this.importVariables.sort((v1, v2) => {
          if (v1.name < v2.name) return -1
          if (v1.name > v2.name) return +1
          return 0
        })

        this.jsonError = ''
      } catch (e) {
        console.log(`JSON WAS NOT VALID`, e.message);
        this.jsonError = e.message
      }
    },//- scanJson

    toggleImports () {
      // console.log(`toggleImports()`);

      // See if they are all selected, or none selected.
      let allSelected = true
      let noneSelected = true
      this.importVariables.forEach(v => {
        if (v.accept) {
          noneSelected = false
        } else {
          allSelected = false
        }
      })

      let newAccept = this.selectAllImports
      if (noneSelected) {
        newAccept = true
      } else if (allSelected) {
        newAccept = false
      }

      this.importVariables.forEach(v => {
        v.accept = newAccept
      })
      this.selectAllImports = newAccept
    },

    async updateVariablesFromImport() {
      console.log(`updateVariablesFromImport()`);
      console.log(`pre-existing this.importVariables=`, this.importVariables);
      for (let i = 0; i < this.importVariables.length; i++) {
        let v = this.importVariables[i]
        if (!v.accept) {
          continue;
        }
        if (v.op === 'add') {
          // console.log(` -> add`, v);

          // If no error, send post request to server
          try {
            let url = standardStuff.apiURL('/newVariable')
            let record = {
              deployable_owner: this.deployableOwner,
              deployable_name: this.deployableName,
              name: v.name,
              description: '',//this.form.variable_description,
              type: 'string',//this.form.variable_type,
              mandatory: true,//this.form.variable_mandatory,
              external: false,//this.form.variable_is_external,
              is_sensitive: v.is_sensitive,
              example: v.example,
            }
            // console.log(`save`, record);
            let config = standardStuff.axiosConfig(this.$loginservice.jwt)
            await axios.post(url, record, config)
            // console.log(`New variable successfully sent to database`);
          } catch (e) {
            console.log(`Error while adding new variable to the database: `, e)
          }//-try

        } else if (v.op === 'delete') {
          // console.log(` -> delete`, v);
          try {
            let url = standardStuff.apiURL(`/variable/${this.deployableOwner}:${this.deployableName}/${v.name}`)
            let config = standardStuff.axiosConfig(this.$loginservice.jwt)
            // console.log(`URL=${url}`);
            await axios.delete(url, config)
          } catch (e) {
            console.log(`Error while updating variables: `, e)
          }//-try
        }
      }//- for

      // Once data sent, reload with the new variable
      try {
        this.reloadVariables(); 
        console.log(`Variables have been reloaded on the browser.`)
        this.modalMode = 'none'
      } catch (e) {
        console.log(`Error while reloading variables on the browser: `, e)
      }
    },//- updateVariablesFromImport()

    updateVariable(variable) {
      console.log(`Update variable `, variable);


      // saveDetails: async function () {
      let meTimer = this.saveVariableTimers[variable.name]
      let self = this
        if (meTimer) {
            clearTimeout(meTimer.timer)
        } else {
          meTimer = { timer: null, variable }
          this.saveVariableTimers[variable.name] = meTimer
        }

        meTimer.timer = setTimeout(async function () {
            // console.log(`Updating...`, self.deployment);
            self.timer = null // Clear the cancel handle
            console.log(` DO IT! Update variable`, meTimer);
          //   const url = standardStuff.apiURL('/variable')
          //   const config = standardStuff.axiosConfig(self.$loginservice.jwt)
          //   console.log(`UPDATING VARIABLE`, self.environment);
          //  let result = await axios.put(url, self.environment, config)
          //   console.log(`result is `, result);
            try {
              let url = standardStuff.apiURL('/variable')
              // let record = {
              //   description: this.form.new_variable_description,
              //   type: this.form.new_variable_type,
              //   mandatory: this.form.new_variable_mandatory,
              //   external: this.form.new_variable_is_external,
              //   deployable: this.deployableName,
              //   name: this.variable_name,
              // }
              variable.deployable_owner = self.deployableOwner
              variable.deployable_name = self.deployableName
              let config = standardStuff.axiosConfig(self.$loginservice.jwt)
              let result = await axios.post(url, variable, config)
              // this.showModal = false
              console.log(`Updated variable successfully sent to database`, result)
            } catch (e) {
              console.log(`Error while sending edited variable to the database: `, e)
            }



        }, 1000)
    },//- updatevariable
  },//- methods

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
            deployableOwner: deployableOwner,
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
      variables.forEach(v => {v._name = v.name})

      // Select the deployments for this deployable
      const url3 = standardStuff.apiURL('/envDeployments')
      let res3 = await axios.get(url3, params, config)
      console.log(`API3 returned`, res3.data);
      const deployments = res3.data.deployments

      // Select dependencies for this deployable
      // const url4 = standardStuff.apiURL('/dependencies1')
      const url4 = standardStuff.apiURL('/deployable/${deployableOwner}:${deployableName}/dependancies')
      let res4 = await axios.get(url4, params, config)
      // let res4 = await axios.get(url4, params, config)
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
      console.log(`API6 returned`, res6.data);
  
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

      // Import all versions for this deployable
      const url9 = standardStuff.apiURL('/versions')
      let res9 = await axios.get(url9, params, config)
      console.log(`API9 returned`, res9.data);
      const versions = res9.data.versions

      // Import all tokens for this deployable
      const url10 = standardStuff.apiURL(`/tokens/${deployableOwner}:${deployableName}`)
      let res10 = await axios.get(url10, config)
      // let res10 = await axios.get(url10, params, config)
      console.log(`API10 returned`, res10.data);
      const tokens = res10.data.tokens 

      // Import all deployables for dependency modal
      const url11 = standardStuff.apiURL('/deployables')
      let res11 = await axios.get(url11, config)
      console.log(`API11 returned`, res11.data);
      const deployables = res11.data.deployables

      return {
        deployableOwner: deployableOwner,
        deployableName: deployableName,
        deployable: deployable,
        deployables: deployables,
        variables: variables,
        deployments: deployments, 
        users: users,
        allUsers: allUsers,
        environments: environments,
        dependencies: dependencies,
        currentUser: currentUser,
        //versions: versions,
        //tokens: tokens,
      }
    } catch (e) {
      console.log(`Could not fetch project:`, e)
      alert(`Error while fetching project ${deployableName}`)
    }
  }
}

// Obfuscate obviously sensitive values
// Returns { is_sensitive, example }
function safeExample(path, value) {
  path = path.toLowerCase()
  // return value
  if (
    path.indexOf('key') >= 0
    || path.indexOf('secret') >= 0
    || path.indexOf('password') >= 0
    || path.indexOf('passwd') >= 0
    || path.indexOf('username') >= 0
  ) {

    // The value needs to be obfuscated
    let pos = 0
    let final = ''
    const skipStrings = [ 'http://', 'https://', 'AKIA', 'API' ]
    skipStrings.forEach(skip => {
      if (value.startsWith(skip)) {
        final += skip
        value = value.substring(skip.length)
      }
    })
    while (value.length > 0) {
      let c = value.charAt(0)
      if (
        (c >= 'a' && c <= 'z')
        || (c >= 'A' && c <= 'Z')
        || (c >= '0' && c <= '9')
        || (c=='!')
        || (c=='@')
        || (c=='#')
        || (c=='$')
        || (c=='%')
        || (c=='^')
        || (c=='&')
        || (c=='*')
        || (c=='*')
        || (c=='(')
        || (c==')')
        || (c=='{')
        || (c=='[')
        || (c==']')
        || (c=='?')
      ) {
        final += 'x'
      } else {
        final += c
      }
      value = value.substring(1)
    }
    return { is_sensitive: true, example: final }
  }

  // No need to obfuscate
  return { is_sensitive: false, example: value }
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

.my-variable-table {
  border: solid 1px #dbdbdb;
  width: 100%;

  th {
    background-color: #e0e0e0;
  }

  .my-variable-line-1 {
    // background-color: yellow;
    border-bottom: none;
    td {
      border-bottom: solid 1px #ededed;
      padding-top: 2px;
      padding-bottom: 2px;
    }
  }
  .my-variable-line-2 {
    td {
      padding-top: 2px;
      padding-bottom: 2px;
      color: #aaa;
    }
  }
  .my-name-input {
    min-width: 200px;
    font-weight: 600;
  }
  input.my-example-input {
    min-width: 330px;
    color: #888;
    border-top: solid 1px #e7e7e7;
    border-left: solid 1px #e7e7e7;
    border-right: solid 1px #e7e7e7;
    border-bottom: solid 1px #e7e7e7;
    padding-left: 4px;
  }
}

// Show source code
.my-bash {
  padding-top: 8px;
  padding-left: 20px;
  // font-family:'Courier New', Courier, monospace;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-size: 18px;
  color: #66a;
}
</style>