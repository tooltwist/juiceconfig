<template lang="pug">
  section.section
    h1.title Applications
      div.buttons.has-text-weight-normal(style="float:right;")
        b-button.is-primary(@click="initNewDeploymentDialog")  + New Deployment
    b-tabs(v-model="activeTab", :animated="false")
      b-tab-item(label="Deployments")
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
              b-tooltip(:label="props.row._healthcheck.text", position="is-right", multilined, :type="healthcheckColor(props.row._healthcheck.status)")
                b-icon(:icon="healthcheckIcon(props.row._healthcheck.status)", size="is-small", :type="healthcheckColor(props.row._healthcheck.status)")
              nuxt-link(v-if="accessEnv(props.row.environment)", :to="`/user/${user}/environment/${std_toQualifiedName(props.row.environment_owner,props.row.environment)}`")
                span(v-html="std_toQualifiedDisplay(props.row.environment_owner,props.row.environment,true)")
              span(v-else, v-html="std_toQualifiedDisplay(props.row.environment_owner,props.row.environment,true)") 
            b-table-column(field="application_name", label="Name")
              | {{ props.row.application_name }}
            b-table-column(field="deployable", label="Deployable")
              nuxt-link(v-if="accessProject(props.row.deployable)", :to="`/user/${user}/deployable/${std_toQualifiedName(props.row.deployable_owner,props.row.deployable)}`")
                span(v-html="std_toQualifiedDisplay(props.row.deployable_owner,props.row.deployable,true)")
              span(v-else, v-html="std_toQualifiedDisplay(props.row.deployable_owner,props.row.deployable,true)") 
            b-table-column(field="", label="")
              b-button.button.is-small.is-primary.is-outlined(tag="nuxt-link", :to="`/user/${user}/deployment/${props.row.environment_owner}:${props.row.environment}/${props.row.application_name}`") Configure
      
      // A grid showing all the available deployables/environments and their health checks
      b-tab-item(label="Healthchecks")        
        div(style="overflow-x:auto;")
          table.tableStyle
            // headings
            tr
              td.transform.cellWidth
              td.transform.cellWidth(v-for="env in environments") {{env.name}}
            // Row for each deployable
            tr(v-for="dep in deployables")
              td.cellWidth {{dep.name}}
              td.cellWidth.cellDataStyle(v-for="env in environments")
                div(v-for="deployment in isDeployed(env.name, dep.name)") 
                  b-tooltip(:label="deployment._healthcheck.text", position="is-right", multilined, :type="healthcheckColor(deployment._healthcheck.status)")
                    b-icon(:icon="healthcheckIcon(deployment._healthcheck.status)", size="is-small", :type="healthcheckColor(deployment._healthcheck.status)")

    // Modal for New Deployment
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
                        input.input(v-model.trim="applicationName", maxlength="128", :placeholder="defaultApplicationName")

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

          .modal-card-foot
            button.button.is-success(:disabled="!readyToSave", @click="createDeployment") Save
            button.button(@click="showDialog = false;") Cancel
</template>

<script>
import axios from 'axios';
import standardStuff from '../../../lib/standard-stuff';

export default {
  name: 'Deployments',

  data () {
    return {
      deployments: [ ],
      environments: [ ],
      deployables: [ ],

      // Modal to add new deployment
      showDialog: false,
      applicationName: '',
      notes: '',
      projectUsers: '',
      environmentUsers: '',

      user: '',
      currentUser: '',
      environmentId: '', // owner:name
      deployableId: '', // owner:name

      showSaveErrorMsg: false,
      activeTab: 0,
    }
  }, // - data

  computed: {
    // Creates a default application name for new deployment form
    defaultApplicationName: function () {
      // See if a deployable has been selected
      let pos = this.deployableId.indexOf(':');
      if (pos < 0) { return '' } // Nope, none selected
      const owner = this.deployableId.substring(0, pos);
      const name = this.deployableId.substring(pos + 1);
      console.log(`dep is ${owner}:${name}`);

      // See if we have an environment selected
      pos = this.environmentId.indexOf(':');
      if (pos < 0) { return name } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos);
      const envName = this.environmentId.substring(pos + 1);
      console.log(`env is ${envOwner}:${envName}`);

      // Find a non-duplicate deployable name
      let newApplicationName = name;

      for (let cnt = 1; ; cnt++) {
        if (cnt > 1000) {
          alert(`We appear to be in an infinite loop!`);
          return;
        }

        // Create a name
        if (cnt > 1) {
          newApplicationName = `${name}_${cnt}`;
        }

        console.log(`Check ${newApplicationName}`);

        // See if it's already used
          if (this.applicationExists(envOwner, envName, newApplicationName)) {
            // Name is already used
            // console.log(`Name ${newApplicationName} is already used.`);
          } else {
            // console.log(`Name ${newApplicationName} is available.`);
            return newApplicationName;
          }
      }
    }, // - defaultApplicationName

    // Checks if name already exists
    nameIsUsed () {
      let pos = this.deployableId.indexOf(':');
      if (pos < 0) { return false } // Nope, none selected

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':');
      if (pos < 0) { return false } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos);
      const envName = this.environmentId.substring(pos + 1);
      console.log(`env is ${envOwner}:${envName}`);

      if (this.applicationName && this.applicationExists(envOwner, envName, this.applicationName)) {
        return true; // need an application name
      }

      return false;
    }, // - nameIsUsed

    // Checks that form is completed correctly
    readyToSave () {
      // See if we have a deployable selected.
      let pos = this.deployableId.indexOf(':');
      if (pos < 0) { return false }

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':');
      if (pos < 0) { return false }

      // See if an application with this environment and name is used.
      const envOwner = this.environmentId.substring(0, pos);
      const envName = this.environmentId.substring(pos + 1);

      if (this.applicationName && this.applicationExists(envOwner, envName, this.applicationName)) {
        return false; // need an application name
      }

      return true;
    }, // - readyToSave
  },

  methods: {
    ...standardStuff.methods,

    // Check if environment is owned
    accessEnv (environment) {
      for (let i = 0; i < this.environments.length; i++) {
        if (this.environments[i].name ==  environment && this.environments[i].owner == this.currentUser) {
          return 1;
        }
      }

      for (let i = 0; i < this.environmentUsers.length; i++) { // check if user is a collaborator
        if (environment == this.environmentUsers[i].environment) {
          return 1;
        } 
      }

      return 0; // user is neither collaborator or owner of environment
    }, // - accessEnv

    // Check if project is owned
    accessProject (deployable) {
      for (let i = 0; i < this.deployables.length; i++) {
        if (this.deployables[i].name ==  deployable && this.deployables[i].owner == this.currentUser) {
          return 1;
        }
      }

      for (let i = 0; i < this.projectUsers.length; i++) { // check if user is a collaborator
        if (deployable == this.projectUsers[i].project) {
          return 1;
        } 
      }

      return 0; // user is neither collaborator or owner of deployable
    }, // - accessProject

    // A list of applications for an environment/deployable for use in healthcheck grid 
    isDeployed (environmentName, deployableName) {
      let arr = [];

      for (let i = 0; i < this.deployments.length; i++) {
        let deployment = this.deployments[i];
        if (deployment.deployable === deployableName && deployment.environment === environmentName) {
          let j = 0;
          arr[j] = deployment;
          j++;
        } 
      }

      return arr; // array of application names
    }, // - isDeployed

    // Checks for an existing record for new deployment/application form
    applicationExists (environmentOwner, environmentName, applicationName) {
        for (let i = 0; i < this.deployments.length; i++) {
          let deployment = this.deployments[i];
          
          if (
            deployment.environment_owner === environmentOwner
            && 
            deployment.environment === environmentName
            &&
            deployment.application_name === applicationName
          ) {
            return true;
          }

        } //- for

        return false;
    }, // - applicationExists

    // Opens new deployment modal
    initNewDeploymentDialog () {
      this.environmentId = '';
      this.deployableId = '';
      this.applicationName = '';
      this.showSaveErrorMsg = false;
      this.showDialog = true;
    }, // - initNewDeploymentDialog

    // Creates a new record for deployment/application from form
    async createDeployment () {
      this.showSaveErrorMsg = false;

      // See if a deployable has been selected.
      let pos = this.deployableId.indexOf(':');
      if (pos < 0) { return '' } // Nope, none selected
      const owner = this.deployableId.substring(0, pos);
      const name = this.deployableId.substring(pos + 1);
      console.log(`dep is ${owner}:${name}`);

      // See if we have an environment selected.
      pos = this.environmentId.indexOf(':');
      if (pos < 0) { return name } // Just show the deployable name for now.
      const envOwner = this.environmentId.substring(0, pos);
      const envName = this.environmentId.substring(pos + 1);
      console.log(`env is ${envOwner}:${envName}`);

      let applicationName = this.applicationName;

      if (!applicationName) {
        applicationName = this.defaultApplicationName;
      }

      let notes = this.notes;

      // Prepare the object
      try {
        let url = standardStuff.apiURL('/newDeployment');

        let record = {
          environment_owner: envOwner,
          environment: envName,
          deployable_owner: owner,
          deployable: name,
          application_name: applicationName,
          notes: notes,
        }

        let config = standardStuff.axiosConfig(this.$loginservice.jwt);
        let reply = await axios.post(url, record, config);

        const params = {
          params: { 
            user: this.user,
          }
        }

        let reloadedDeployments = await loadDeployments(config, params);
        console.log(`Reloaded deployments: `, reloadedDeployments);
        this.deployments = reloadedDeployments;

        // Set the initial healthcheck status for each deployment
        this.deployments.forEach(d => {
          d._healthcheck = {
            status: 'scanning',
            text: 'attempting to contact...',
          }

          checkHealth(d);
        })

        this.showSaveErrorMsg = false;
        this.showDialog = false;
        return;

      } catch (e) {
        console.log(`Error:`, e);
        alert(`Error creating deployable`);
        this.showSaveErrorMsg = true;
      }
    }, // - createDeployment

    // Returns the relevant icon for healthcheck status of application
    healthcheckIcon: function(mode) {
      switch (mode) {
        case 'scanning':
          return 'radar';
        case 'OK':
          return 'thumb-up-outline';
        case 'error':
          return 'alert-outline';
        case 'network':
          return 'cloud-off-outline';
        case 'ENOENT': // healthcheck path not found
          return 'cancel';
        case 'ENOTFOUND': // url not defined
          return 'cancel';
        case 'ECONNABORTED':
          return 'timer-off-outline';
        case 'skip':
        case 'unknown':
        default:
          return 'minus';
      }
    }, // - healthcheckIcon

    // Returns the relevant colour for healthcheck status of application
    healthcheckColor: function(status) {
      switch (status) {
        case 'scanning':
          return 'is-info';
        case 'OK':
          return 'is-success';
        case 'error':
          return 'is-danger';
        case 'network':
          return 'is-danger';
        case 'ENOENT':
          return 'is-black';
        case 'ENOTFOUND': // url not defined
          return 'is-black';
        case 'ECONNABORTED':
          return 'is-danger';
        case 'skip':
        case 'unknown':
        default:
          return 'is-light';
      }
    },// - healthcheckColor
  }, // - methods

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let currentUser = app.$nuxtLoginservice.user.username;
    let user = params.userName;

    try {
      const params = {
        params: { 
          username: currentUser,
          user: user,
        }
      }

      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

      // Get the deployments
      const deployments = await loadDeployments(config, params);
      console.log('deployments: ', deployments);

      // Get all the environments, for the new dialog
      let url = standardStuff.apiURL('/showEnvironments');
      let reply = await axios.get(url, params, config);
      const environments = reply.data.environments;
      console.log('environments: ', environments);

      // Get all the deployables, for the new dialog
      url = standardStuff.apiURL('/allDeployables');
      reply = await axios.get(url, params, config);
      const deployables = reply.data.deployables;
      console.log('deployables: ', deployables);

      // Get all projectUsers from project_user db
      url = standardStuff.apiURL('/thisUsersProjects');
      reply = await axios.get(url, params, config);
      const projectUsers = reply.data.projectUsers;
      console.log('projectUsers: ', projectUsers);

      // Get all environmentUsers from environment_user db
      url = standardStuff.apiURL('/thisUsersEnvironments');
      reply = await axios.get(url, params, config);
      const environmentUsers = reply.data.environmentUsers;
      console.log('environmentUsers: ', environmentUsers);

      // Set the initial healthcheck status for each deployment
      deployments.forEach(d => {
        d._healthcheck = {
          status: 'scanning',
          text: 'attempting to contact...',
        }

        checkHealth(d);
      })

      return {
        deployments,
        environments,
        deployables,
        currentUser,
        user,
        projectUsers, // all records in project_users db with this username
        environmentUsers, // "" "" "" from environment_users db
      }

    } catch (e) {
      console.log(`Error while fetching deployments: `, e);
    }
  }
}

// Returns the health check status for each deployment where url is provided
async function checkHealth(deployment) {
  // Check we have a valid website URL, that is not localhost
  if (
    !deployment.website_url
    || !deployment.website_url.startsWith('http')
  ) {
    // development on local server
    deployment._healthcheck.status = 'skip';
    deployment._healthcheck.text = 'Not configured';
    return;
  }

  if (
    deployment.website_url.startsWith('http://localhost')
    || deployment.website_url.startsWith('https://localhost')
    || deployment.website_url.startsWith('http://127.0.0.1')
    || deployment.website_url.startsWith('https://127.0.0.1')
  ) {
    // development on local server
    deployment._healthcheck.status = 'skip';
    deployment._healthcheck.text = 'Runs locally';
    return;
  }
  // if (!deployment.healthcheck) {
  //   // Skip this healthcheck
  //   deployment._healthcheck.status = 'unknown'
  //   return
  // }

  // if (deployment.application_name !== 'inhouse_db') {
  //   return
  // }
  // if (deployment.application_name !== 'juiceconfig' || deployment.environment !== "j-test") {
  //   return
  // }
  
  // Call health check to determine status
  // console.log(`Checking health of `, deployment);
  const healthcheckUrl = deployment.website_url + deployment.healthcheck;
  let result;
  const USE_PROXY = true;
  if (USE_PROXY) {
    try {
      let url = standardStuff.apiURL('/proxyHealthcheck');
      // console.log(`checkHealth(${deployment.environment}.${deployment.application_name}): ${url}`);

      result = await axios.get(url, {
        params: {
          url: healthcheckUrl,
        }
      });

      deployment._healthcheck.status = result.data.status;
      // deployment._healthcheck.text = result.data.text
      switch (deployment._healthcheck.status) {
        // case 'scanning':
        //   break
        case 'OK':
          deployment._healthcheck.text = result.data.body;
          break;
        // case 'error':
        //   return 'is-danger'
        // case 'network':
        //   return 'is-danger'
        case 'ENOENT':
          deployment._healthcheck.text = `ENOENT: healthcheck path was not found on the server (${deployment.healthcheck})`;
          break;
        case 'ENOTFOUND': // url not defined
          deployment._healthcheck.text = `ENOTFOUND: incorrect server url? (${deployment.website_url})`;
          break;
        case 'ECONNABORTED':
          deployment._healthcheck.text = 'ECONNABORTED: timeout?';
          break;
        // case 'skip':
        // case 'unknown':
        default:
          deployment._healthcheck.text = `status: ${deployment._healthcheck.status}`;
          break;
      }

    } catch (error) {
      // Unable to ask our server to do the healthcheck for us. I wonder why?
      deployment._healthcheck.status = 'error';
      deployment._healthcheck.text = 'Error in juice server.';
      console.log(`Healthcheck proxy failed:`, error);
    }

    return;
  }

  /*
   *  We'll run the healthchecks directly from the browser. This is faster, but CORS checking by the
   *  browser will cause some healthchecks to fail (Cross Site Resource Scripting is a hack technique).
   */
  try {
    console.log(`checkHealth(${deployment.environment}.${deployment.application_name}): ${healthcheckUrl}`);

    let result = await axios.get(healthcheckUrl, {
      timeout: 4000,
      // crossdomain: true
    });

    let status = result.status;
    console.log(`status is`, status);
    console.log(`data is`, result.data);
    if (status == 200) {
      deployment._healthcheck.status = 'OK';
      deployment._healthcheck.text = `status: ${deployment._healthcheck.status}`;
      return;

    } else if (status == 'error') {
      deployment._healthcheck.status = 'error';
      deployment._healthcheck.text = `status: ${deployment._healthcheck.status}`;
      return;
    }

  } catch (error) {
    if (error.response) {
      // standard axios exception
      if (error.response.status === 404) {
        // ENOENT - the pinged server says the page does not exist
        deployment._healthcheck.status = 'ENOTFOUND';
        deployment._healthcheck.text = `ENOENT: healthcheck path was not found on the server (${deployment.healthcheck})`;
        return;
      }
      // } else if (error.message === 'Network Error') {
      //   deployment._healthcheck.status = 'network'
      //   return
    } else if (error.code === 'ECONNABORTED') {
      // See https://medium.com/@masnun/handling-timeout-in-axios-479269d83c68
      deployment._healthcheck.status = 'ECONNABORTED';
      deployment._healthcheck.text = 'ECONNABORTED: timeout?';
      return;
    }

    deployment._healthcheck.status = 'timeout';
    console.log(`error doing healthcheck:`, error);
    console.log(`error.statusCode`, error.statusCode);
    console.log(`error.errcode`, error.errcode);
    console.log(`error.message`, error.message);
    console.log(`error.response`, error.response);
    let json=JSON.stringify(error, '', 2);
    console.log(`json=`, json);
    let errorObject=JSON.parse(JSON.stringify(error));
    console.log(`errorObject=`, errorObject);
    deployment._healthcheck.status = 'error';
    deployment._healthcheck.text = `status: ${deployment._healthcheck.status}`;
  } //- catch
}

// Returns deployments with environments that are owned by user, 
// or collaborated on by user
async function loadDeployments (axiosConfig, params) {
  let url = standardStuff.apiURL('/applications');
  let reply = await axios.get(url, params, axiosConfig);
  const deployments = reply.data.applications;
  console.log('Deployments: ', deployments);

  return deployments;
} // - loadDeployments
</script>

<style lang="scss">
  .transform {
    height: 140px;
    transform: rotate(270deg) translate(0px, 50px);
    float: none;
    vertical-align: bottom;
    column-width: 100px;
    text-align: center;
  }

  .tableStyle {
    border: solid thin; 
  }

  .cellWidth {
    white-space: nowrap;
    vertical-align: top; 
    border: solid thin lightgray;
    padding: 6px;
  }

  .cellDataStyle {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }
</style>
