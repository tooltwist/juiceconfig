<template lang="pug">
section.section
    h1.title {{ this.org }}:{{ this.username }} 
    b-tabs(v-model="activeTab", :animated="false")
        b-tab-item(label="Account Information")
            table(style="width:100%;")
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") First name: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", :disabled="editingDetails", v-model="user.first_name", @input="saveDetails")
                                p.my-not-input-p(v-else) &nbsp; {{user.first_name}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Last name: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", :disabled="editingDetails", v-model="user.last_name", @input="saveDetails")
                                p.my-not-input-p(v-else) &nbsp; {{user.last_name}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Organisation role: 
                    .field-body
                        .field
                            .control
                                select.select(v-if="editingDetails", v-model.trim="orguser.role", @input="saveDetails")
                                    option(value="owner") Owner
                                    option(value="admin") Admin 
                                    option(value="user") User 
                                p.my-not-input-p(v-else) &nbsp;{{orguser.role}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Account email: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", :disabled="editingDetails", v-model="user.email", @input="saveDetails")
                                p.my-not-input-p(v-else) &nbsp; {{user.email}}

                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Status: 
                    .field-body
                        .field
                            .control
                                select.select(v-if="editingDetails", v-model.trim="orguser.status", @input="saveDetails")
                                    option(value="confirmed") Active 
                                    option(value="disabled") Disable
                                p.my-not-input-p(v-else) &nbsp;{{orguser.status}}
            .control
                button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}
    
        b-tab-item(label="Projects")
            div(v-if="this.filteredProjects.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} is not involved in any projects yet. Add this user to a project via the relevant deployables' 'Users' tab.
            b-table(:data="filteredProjects", focusable)
                template(slot-scope="props")
                    b-table-column(field="project", label="User's Projects")
                        nuxt-link(:to="`/user/${user}/deployable/${std_toQualifiedName(props.row.owner,props.row.name)}`")
                            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
                    b-table-column(field="description", label="Description")
                        | {{ props.row.description }}
                    b-table-column(field="type", label="Type")
                        | {{ props.row.type }}
    
        b-tab-item(label="Environments")
            div(v-if="this.filteredEnvironments.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} does not have access to any environments yet. Add this user to an environment via the relevant environments' 'Users' tab.
            b-table(:data="filteredEnvironments", focusable)
                template(slot-scope="props")
                    b-table-column(field="environment", label="User's Environments")
                        nuxt-link(:to="`/user/${user}/environment/${std_toQualifiedName(props.row.owner,props.row.name)}`")
                            span(v-html="std_toQualifiedDisplay(props.row.owner,props.row.name,true)")
                    b-table-column(field="description", label="Description")
                        | {{ props.row.description }}
                    b-table-column(field="type", label="Type")
                        | {{ props.row.type }}
                    b-table-column(field="notes", label="Notes")
                        | {{ props.row.notes }}
</template> 

<script>
import axios from 'axios';
import standardStuff from '../../../lib/standard-stuff'
import environmentsVue from '../../../../../juiceconfig-userorg/website/pages/environments.vue';

export default {
    name: 'User',

    data () {
        return {
            user: [],
            projectUsers: [],
            environmentUsers: [],
            org: '',
            projects: [],
            environments: [],
            activeTab: 0,
            username: '',
            orguser: '',
            editingDetails: false,
        }
    },

    computed: {
        // Return projects that this user has access to
        filteredProjects() {
            let projects = [];

            this.projects.forEach(project => {
                this.projectUsers.forEach(user => {
                    if (project.name == user.project) {
                        projects.push(project);
                    }
                })
            })

            return projects;
        }, // - filteredProjects

        // Return environments that this user has access to
        filteredEnvironments() {
            let environments = [];

            this.environments.forEach(env => {
                this.environmentUsers.forEach(user => {
                    if (env.name == user.environment) {
                        environments.push(env);
                    }
                })
            })

            return environments;
        }, // - filteredEnvironments
    },

    methods: {
        ...standardStuff.methods,

        // Save updated deployable details
        saveDetails: async function () {
            let self = this;

            if (self.updateDelay) {
                clearTimeout(self.updateDelay);
            }

            self.updateDelay = setTimeout(async function () {
                let params = {
                    params: {
                        org_username: self.org,
                        user_username: self.orguser.user_username,
                        status: self.orguser.status,
                        role: self.orguser.role,
                    }
                }

                self.updateDelay = null;
                const url = standardStuff.apiURL('/updateOrgUser');
                const config = standardStuff.axiosConfig(self.$loginservice.jwt);
                let result = await axios.put(url, params, config);
            }, 1000)
        }, // - saveDetails

        // Reload users data
        async reloadUsers() {
            const params = {
                params: { 
                    userID: this.userID
                }
            }

            const url = standardStuff.apiURL('/userName');
            const config = standardStuff.axiosConfig(this.$loginservice.jwt);
            let res = await axios.get(url, params, config);
            console.log(`reloadUsers returned: `, res.data);
            this.user = res.data.record;

            return {
                user: this.user,
            };
        }, // - reloadUsers
    },

    async asyncData ({ app, params, error }) {
        let org = params.userName;
        let username = params.username;

        try {
            // Params and config for all API calls
            let params = {
                params: {
                    username: username,
                    user: username,
                    org: org,
                }
            }

            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

            // Select the user for this page from user db table
            let url = standardStuff.apiURL('/userName');
            let res = await axios.get(url, params, config);
            const user = res.data.record;
            console.log(`user: `, user);

            // Select user details from org_user db table
            url = standardStuff.apiURL('/singleOrgUser');
            res = await axios.get(url, params, config);
            const orguser = res.data.record;
            console.log(`orgUser: `, orguser);

            // Import all project_users with username to cross-reference with org deployables
            url = standardStuff.apiURL('/projectAccess');
            res = await axios.get(url, params, config);
            const projectUsers = res.data.records;
            console.log('projectUsers: ', projectUsers);

            // Import all project_users with username to cross-reference with org deployables
            url = standardStuff.apiURL('/thisUsersEnvironments');
            res = await axios.get(url, params, config);
            const environmentUsers = res.data.environmentUsers;
            console.log('environmentUsers: ', environmentUsers);

            // Changed params for future calls 
            params = { 
                params: {
                    username: org,
                    user: org,
                }
            }

            // Import all org deployables
            url = standardStuff.apiURL('/allDeployables');
            res = await axios.get(url, params, config);
            const projects = res.data.deployables;
            console.log('projects: ', projects);

            // Import all org environments
            url = standardStuff.apiURL('/showEnvironments');
            res = await axios.get(url, params, config);
            const environments = res.data.environments;
            console.log('environments: ', environments);

            return {
                environmentUsers: environmentUsers,
                projectUsers: projectUsers,
                org: org,
                username: username,
                user: user,
                orguser: orguser,
                projects: projects,
                environments: environments,
            }

        } catch (e) {
            console.log(`Error while fetching user: `, e);
        }
    }
}
</script>

<style scoped>
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