<template lang="pug">
section.section
    h1.title {{ this.org }}:{{ this.username }} 
    b-tabs(v-model="activeTab", :animated="false")
        b-tab-item(label="Account Information")
            table(style="width:100%;")
                tr 
                    td(style="justify:right;")
                        label First name: 
                    td(style="justify:left;")
                        | {{ user.first_name }}
                tr 
                    td(style="justify:right;")
                        label Last name: 
                    td(style="justify:left;")
                        | {{ user.last_name }} 
                tr 
                    td(style="justify:right;")
                        label Organisation role: 
                    td(style="justify:left;")
                        | {{ orguser.role }} 
                tr 
                    td(style="justify:right;")
                        label Account Email: 
                    td(style="justify:left;")
                        | {{ user.email }}
                tr 
                    td(style="justify:right;")
                        label Status: 
                    td(style="justify:left;")
                        | {{ orguser.status }}
    
        b-tab-item(label="Projects")
            div(v-if="this.projects.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} is not involved in any projects yet. Add this user to a project via the relevant deployables' 'Users' tab.
            b-table(:data="filteredProjects", focusable)
                template(slot-scope="props")
                    b-table-column(field="project", label="User's Projects")
                        | {{ props.row.name }}
                    b-table-column(field="description", label="Description")
                        | {{ props.row.description }}
                    b-table-column(field="type", label="Type")
                        | {{ props.row.type }}
    
        b-tab-item(label="Environments")
            div(v-if="this.environments.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} does not have access to any environments yet. Add this user to an environment via the relevant environments' 'Users' tab.
            b-table(:data="filteredEnvironments", focusable)
                template(slot-scope="props")
                    b-table-column(field="environment", label="User's Environments")
                        | {{ props.row.name }}
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
        }
    },

    computed: {
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
        },

        filteredEnvironments() {
            let environments = [];

            this.environments.forEach(env => {
                this.environmentUsers.forEach(user => {
                    if (env.name == user.environment) {
                        environments.push(env);
                    }
                })
            })

            console.log('env', environments)

            return environments;
        },
    },

    methods: {
        // RELOAD THE DATABASE TABLE 
        async reloadUsers() {
        const url = standardStuff.apiURL('/userName')
        const params = {
            params: { 
                userID: this.userID
            }
        }
        const config = standardStuff.axiosConfig(this.$loginservice.jwt)
        let res = await axios.get(url, params, config)
        console.log(`API returned`, res.data);
        this.user = res.data.record
        return {
            user: this.user
        };
        },  // -reloadUsers
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
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)

            // Select the user for this page from user db table
            let url = standardStuff.apiURL('/userName')
            let res = await axios.get(url, params, config)
            const user = res.data.record
            console.log(`User   :`, user)

            // Select user details from org_user db table
            url = standardStuff.apiURL('/singleOrgUser')
            res = await axios.get(url, params, config)
            const orguser = res.data.record
            console.log(`OrgUser   :`, orguser)

            // Import all project_users with username to cross-reference with org deployables
            url = standardStuff.apiURL('/projectAccess')
            res = await axios.get(url, params, config)
            const projectUsers = res.data.records
            console.log('projectUsers = ', projectUsers);

            // Import all project_users with username to cross-reference with org deployables
            url = standardStuff.apiURL('/thisUsersEnvironments')
            res = await axios.get(url, params, config)
            const environmentUsers = res.data.environmentUsers
            console.log('environmentUsers = ', environmentUsers);

            // Import all org deployables
            params = { // change params for future calls
                params: {
                    username: org,
                    user: org,
                }
            }

            url = standardStuff.apiURL('/allDeployables')
            res = await axios.get(url, params, config)
            const projects = res.data.deployables
            console.log('projects = ', projects);

            // Import all org environments
            url = standardStuff.apiURL('/showEnvironments')
            res = await axios.get(url, params, config)
            const environments = res.data.environments
            console.log('environments = ', environments);

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
            console.log(`Error while fetching user: `, e)
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

</style>