<template lang="pug">
    section.section
        h1.title Organisation: {{organisationName}}
        b-tabs(v-model="activeTab", :animated="false")
            b-tab-item(label="Organisation")
                table(style="width:80%")
                    tr  
                        td(style="justify:right;") 
                            label Organisation:
                        td(style="justify:left;") {{organisation.username}}
                    tr  
                        td(style="justify:right;") 
                            label Email:
                        td(style="justify:left;") {{organisation.email}}
                    tr  
                        td(style="justify:right;")
                            label Admin:
                        td(style="justify:left;") 

            b-tab-item(label="Members")
                h1.is-title.is-size-4 {{organisationName}} Members
                    b-button.is-primary(@click.prevent="newUser" type="is-light", style="float:right;") + Add new user
                br
                b-table(:data="org_users", focusable)
                    template(slot-scope="props")
                        b-table-column(field="user_username", label="Username")
                            | {{props.row.user_username}}
                        b-table-column(field="role", label="Role") 
                            | {{props.row.role}}
                        b-table-column(field="status", label="Status")
                            | {{props.row.status}}

            b-tab-item(label="Payment Details")
                br
                p It's free for now!

        // Modal for new users form
        div(v-show="newUserModal")
            transition(name="modal")
                div.modal-mask
                    div.modal-wrapper
                        div.modal-card
                            header.modal-card-head
                                p.modal-card-title Add new member to {{ organisationName }}
                            section.modal-card-body
                                div.modal-body
                                    slot(name="body")
                                        form
                                            div.form-group
                                                div.formStyle Find User: 
                                                    div.control
                                                        b-autocomplete(placeholder="Search...", :data="filterUsernames", clearable, icon="magnify", type="search", @select="option => selected = option", v-model="form.new_user")
                                                            template(slot="empty") No results found
                                                div.formStyle Role:
                                                    div.control
                                                        b-select(placeholder="Role", v-model="form.user_role") Role:
                                                            option(value="admin") Admin
                                                            option(value="user") User
                            footer.modal-card-foot
                                div.control
                                    b-button(@click.stop="saveNewUser",  type="is-primary is-light", size="is-small")  Save
                                    b-button(@click="newUserModal=false", type="is-danger is-outlined", size="is-small") Cancel

    
</template>

<script>
import axios from 'axios'
import standardStuff from '../../lib/standard-stuff'

export default {
    name: 'Organisation',

    components: {
        modal: {
            template: '#modal-template'
        }
    },

    data () {
        return {
            form: {
                new_user: '',
                user_role: '',
            },
            org_users: [ ],
            organisation: [ ],
            users: [ ],
            organisationName: '',
            activeTab: 0,
            newUserModal: false,
        }
    },

    computed: {
        usernames: function () {
            let usernames = [];
            let i = 0;

            this.users.forEach(user => {
                usernames[i] = user.username;
                i++;
            })

            return usernames;
        },

        filterUsernames: function () {
            return this.usernames.filter((option) => {
                return option.toString().toLowerCase().indexOf(this.form.new_user.toLowerCase()) >= 0
            })
        }
    },

    methods: {
        ...standardStuff.methods,

        // Open modal to add new org member/user:
        newUser() {
            this.newUserModal = true;
            return false
        },

        // Reload org_users data after adding new user 
        async reloadOrgUsers() {
            const params = {
                params: { 
                    org_username: this.organisationName
                }
            }

            const url = standardStuff.apiURL('/orgUsers');
            const config = standardStuff.axiosConfig(this.$loginservice.jwt);
            let res = await axios.get(url, params, config)

            this.org_users = res.data.org_users

            console.log('org_users = ', this.org_users)
            
            return {
                org_users: this.org_users,
            }
        },  // -reloadOrgUsers 

        // Add new org_user 
        async saveNewUser () {
            try {
                let record = {
                    user_username: this.form.new_user,
                    role: this.form.user_role,
                    org_username: this.organisationName,
                    status: 'pending',
                }

                let url = standardStuff.apiURL('/newOrgUser')
                const config = standardStuff.axiosConfig(this.$loginservice.jwt)

                await axios.post(url, record, config)

                console.log(`New org_user successfully sent to database`);

            } catch (e) {
                console.log(`Error while sending new org_user record to the database: `, e)
            }

            try {
                this.reloadOrgUsers();
                this.newUserModal = false;

            } catch (e) {
                console.log(`Error updating page: `, e)
            }
        },
    },
    
    async asyncData ({ app, params, error }) {
        let organisationName = params.organisationName;
        console.log('Orgname: ', organisationName)

        try {
            const params = {
                params: {
                    organisationName: organisationName,
                }
            }

            // Select org record from user db table
            const url = standardStuff.apiURL('/organisation')
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            let res = await axios.get(url, params, config)
            const organisation = res.data.organisation[0]
            console.log('Org:', organisation)

            // Select all users in org from org_users db table 
            const url2 = standardStuff.apiURL('/organisationUsers')
            res = await axios.get(url2, params, config)
            const org_users = res.data.organisationUsers
            console.log('org_users:', org_users)

            // Import all users
            let url3 = standardStuff.apiURL('/users');
            res = await axios.get(url3, config)
            const users = res.data.users
            console.log('Users: ', users)

            return {
                organisationName: organisationName,
                organisation: organisation,
                org_users: org_users,
                users: users,
            }

        } catch (e) {
            console.log(`Could not fetch organisation:`, e)
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
</style>