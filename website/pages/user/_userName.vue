<template lang="pug">
section.section
    h1.title {{ user.first_name }} {{ user.last_name }} 
    b-tabs(v-model="activeTab", :animated="false")
        b-tab-item(label="Account Information")
            table(style="width:100%;")
                tr 
                    td(style="justify:right;")
                        label ID: 
                    td(style="justify:left;")
                        | {{ user.id }}
                tr 
                    td(style="justify:right;")
                        label Account Email: 
                    td(style="justify:left;")
                        | {{ user.email }}
                tr 
                    td(style="justify:right;")
                        label Role: 
                    td(style="justify:left;")
                        | {{ user.role }}
                tr 
                    td(style="justify:right;")
                        label Access: 
                    td(style="justify:left;")
                        | {{ user.access }}
            br
            b-button.stop(@click="setEditMode", type="is-primary is-outlined is-light", size="is-small")  Edit
    
        b-tab-item(label="Projects")
            div(v-if="this.projects.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} is not involved in any projects yet. Add this user to a project via the relevant deployables' 'Users' tab.
            b-table(:data="projects", focusable)
                template(slot-scope="props")
                    b-table-column(field="project", label="User's Projects")
                        | {{ props.row.project }}
                    b-table-column(field="access", label="Access")
                        | {{ props.row.access }}
    
        b-tab-item(label="Environments")
            div(v-if="this.environments.length === 0")
                br
                article.message.is-success.is-small
                    div.message-body {{ user.first_name}} {{user.last_name}} does not have access to any environments yet. Add this user to an environment via the relevant environments' 'Users' tab.
            b-table(:data="environments", focusable)
                template(slot-scope="props")
                    b-table-column(field="project", label="User's Environments")
                        | {{ props.row.environment }}
                    b-table-column(field="access", label="Access")
                        | {{ props.row.access }}
            
    // Edit users account details MODAL
    div(v-show="editUserAccount == 'edit'")
        transition(name="modal")
            div.modal-mask
                div.modal-wrapper
                    div.modal-card
                        header.modal-card-head
                            p.modal-card-title Edit User
                                b {{ user.first_name }} {{ user.last_name }} ({{ user.id }})
                        section.modal-card-body
                            div.modal-body
                                slot(name="body")
                                    form
                                        div.form-group
                                            div.formStyle Email:
                                                div.control
                                                    input.input(v-model="form.new_accountemail", maxlength="60", type="text", value="email", placeholder="Email")  
                                            div.formStyle Account Role:
                                                div.control
                                                    input.input(v-model="form.new_accountrole", maxlength="16", type="text", value="role", placeholder="Role")  
                                            b-field.formStyle.control Edit accessibility:
                                                b-select(placeholder="Accessibility", v-model="form.new_accountaccess", value="access") 
                                                    option(value="limited") limited
                                                    option(value="write") write
                                                    option(value="conditional") conditional (clients-only)
                        footer.modal-card-foot  
                            div.control
                                b-button(@click.stop="saveEditedUser", type="is-primary is-light", size="is-small")  Save    
                                b-button(@click="editUserAccount='null'", type="is-danger is-outlined", size="is-small") Cancel
</template> 

<script>
import axios from 'axios';
import standardStuff from '../../lib/standard-stuff'

export default {
    name: 'User',

    data () {
        return {
            form: {
                new_accountemail: '',
                new_accountrole: '',
                new_accountaccess: '',
            },
            user: [],
            userID: '',
            projects: [],
            environments: [],
            activeTab: 0,
            editUserAccount: 'null',
        }
    },

    methods: {
        setEditMode() {
            this.editUserAccount = 'edit'
            this.form.new_accountemail = this.user.email
            this.form.new_accountrole = this.user.role
            this.form.new_accountaccess = this.user.access
        },

        async saveEditedUser() {
            try {
                const url = standardStuff.apiURL('/editUserAccount')
                let record = {
                    id: this.user.id,
                    email: this.form.new_accountemail,
                    role: this.form.new_accountrole,
                    access: this.form.new_accountaccess
                }
                let config = standardStuff.axiosConfig(this.$loginservice.jwt)
                await axios.post(url, record, config)
                console.log(`Edited user successfully`)
                this.editUserAccount = 'null', 
                this.reloadUsers();

            } catch (e) {
                console.log(`Error while sending edited account details to the server: `, e)
            }
        },

        // RELOAD THE DATABASE TABLE AFTER SAVING NEW PROJECT USER
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
        let userID = params.userName

        try {
            // Select the user for this page
            const url = standardStuff.apiURL('/userName')
            const params = {
                params: {
                    userID: userID
                }
            }
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            let res = await axios.get(url, params, config)
            const user = res.data.record
            console.log(`User   :`, user)

            // Select users projects for this page
            const url2 = standardStuff.apiURL('/usersProjects')
            let res2 = await axios.get(url2, params, config)
            const projects = res2.data.records

            // Select users environments for this page
            const url3 = standardStuff.apiURL('/usersEnvironments')
            let res3 = await axios.get(url3, params, config)
            const environments = res3.data.records

            return {
                userID: userID,
                user: user,
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