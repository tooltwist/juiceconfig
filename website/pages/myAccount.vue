<template lang="pug">
    section.section
        div(v-if="loggedIn")
            h1.title My Account
            b-tabs(v-model="activeTab", :animated="false")
                b-tab-item(label="Account Details")
                    table(style="width:80%")
                        tr  
                            td(style="justify:right;") 
                                label Full name: 
                            td(style="justify:left;") {{user.first_name}} {{user.last_name}} (ID: {{user.id}})
                        tr  
                            td(style="justify:right;") 
                                label Email:
                            td(style="justify:left;") {{user.email}}
                        tr  
                            td(style="justify:right;") 
                                label Role:
                            td(style="justify:left;") {{user.role}}
                        tr  
                            td(style="justify:right;") 
                                label Access:
                            td(style="justify:left;") {{user.access}}
                        br
                        b-button.is-grey.is-small(@click.prevent="editMyAccount()") Edit

                b-tab-item(label="Organisations")
                    b-icon(icon="comment-warning-outline") // message-alert is another good icon
                    h1.is-title.is-size-4 My Organisations:
                        b-button.is-primary(tag="nuxt-link", to="/newOrganisation", type="is-light", style="float:right;") + Create new organisation
                    br
                    b-table(:data="organisations", focusable)
                        template(slot-scope="props")
                            b-table-column(field="organisation", label="Organisation Name")
                                nuxt-link(:to="`/organisation/${props.row.org_username}`")
                                    span(v-show="props.row.role === 'owner'", v-html="props.row.org_username")
                                span(v-show="props.row.role != 'owner'") {{props.row.org_username}}
                            b-table-column(field="role", label="Role") 
                                | {{props.row.role}}
                            b-table-column(field="status", label="Status")
                                | {{props.row.status}}

                // Below is just filler - it doesn't actually make sense to have this here.
                b-tab-item(label="Deployables")
                    b-table(:data="deployables", focusable)
                        template(slot-scope="props")
                            b-table-column(field="project", label="Your Projects")
                                | {{props.row.owner}}:{{ props.row.name }}
                            b-table-column(field="product owner", label="Product Owner")
                                | {{ props.row.product_owner }}
                            b-table-column(field="description", label="Description")
                                | {{ props.row.description }}
                            b-table-column(field="access", label="Access")
                                | {{ props.row.access }}
                b-tab-item(label="Environments")
                    b-table(:data="environments", focusable)
                        template(slot-scope="props")
                            b-table-column(field="project", label="Your Projects")
                                | {{props.row.owner}}:{{ props.row.name }}
                            b-table-column(field="type", label="Type")
                                | {{ props.row.type }}
                            b-table-column(field="description", label="Description")
                                | {{ props.row.description }}
                            b-table-column(field="notes", label="Notes")
                                | {{ props.row.notes }}

        // Edit My Account Modal starts below:
        div(v-show="editAccountModal")
            transition(name="modal")
                div.modal-mask
                    div.modal-wrapper
                        div.modal-card
                            header.modal-card-head
                                p.modal-card-title Edit Account Details 
                            section.modal-card-body
                                slot(name="body")
                                    form
                                        div.formStyle First name:
                                            div.control
                                                input.input(v-model="form.new_first_name", maxlength="35", type="text", value="first_name") 
                                        div.formStyle Last name:
                                            div.control
                                                input.input(v-model="form.new_last_name", maxlength="35", type="text", value="last_name") 
                                        div.formStyle Email:
                                            div.control
                                                input.input(v-model="form.new_email", maxlength="60", type="email", value="last_name") 
                                        div.formStyle Role:
                                            div.control
                                                input.input(v-model="form.new_role", maxlength="16", type="role", value="role") 
                            footer.modal-card-foot 
                                div.control
                                    b-button(@click.stop="saveEditedAccount", type="is-primary is-light", size="is-small")  Save    
                                    b-button(@click="editAccountModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
    data () {
        return {
            form: {
                new_first_name: '',
                new_last_name: '',
                new_email: '',
                new_role: '',
            },
            user: [ ],
            deployables: [ ],
            environments: [ ],
            organisations: [ ],
            editAccountModal: false,
            activeTab: 0,
        }
    },

    computed: {
        loggedIn: function() {
            if (this.$loginservice && this.$loginservice.user) {
                return true
            }

            return false
        },
        
        fullname: function() {
            return this.loggedIn ? this.$loginservice.user.fullname : ''
        }
    },

    methods: {
        ...standardStuff.methods,

        // OPEN MODAL AND CHANGE VALUES FOR MY ACCOUNT
        editMyAccount() {  
        this.editAccountModal = true,
        this.form.new_first_name = this.user.first_name,
        this.form.new_last_name = this.user.last_name,
        this.form.new_email = this.user.email,
        this.form.new_role = this.user.role
        return false
        }, // -editMyAccount

        // SAVE EDITED USER
        async saveEditedAccount() {
        try {
            let url = standardStuff.apiURL('/editAccount')
            let record = {
                id: this.user.id,
                first_name: this.form.new_first_name,
                last_name: this.form.new_last_name,
                email: this.form.new_email,
                role: this.form.new_role,
            }
            let config = standardStuff.axiosConfig(this.$loginservice.jwt)
            await axios.post(url, record, config)

            // Display new users details
            this.editAccountModal = false;
            this.reloadAccount();
            console.log('New account details have been updated on the browser.')
        } catch (e) {
            console.log(`Error whilst updating browser with edited account:`, e)
        } 
        }, // - saveEditedAccount

        // RELOAD THE DATABASE TABLE AFTER SAVING NEW ACCOUNT DETAILS
        async reloadAccount() {
            const url = standardStuff.apiURL('/myaccount')
            const params = {
                params: { 
                    userName: this.user.username
                }
            }
            const config = standardStuff.axiosConfig(this.$loginservice.jwt)
            let result = await axios.get(url, params, config)
            this.user = result.data.record
            return {
                user: this.user
            };
        },  // -reloadAccount

    },

    async asyncData ({ app, params, error }) {
        let userName = app.$nuxtLoginservice.user
        try {
            // Select the deployable for this page
            const url = standardStuff.apiURL('/myaccount')
            const params = { 
                params: {
                    userName: userName.username,
                    //userID: user.id,
                }
            }
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            console.log(`Calling ${url}`);
            let res = await axios.get(url, params, config)
            console.log(`API returned`, res.data);
            const user = res.data.record

            // Select deployables for this page
            const url2 = standardStuff.apiURL('/usersDeployables')
            let res2 = await axios.get(url2, params, config)
            console.log(`API2 returned`, res2.data);
            const deployables = res2.data.deployables

            // Select environments for this page
            const url3 = standardStuff.apiURL('/accountEnvironments')
            let res3 = await axios.get(url3, params, config)
            console.log(`API3 returned`, res3.data);
            const environments = res3.data.environments

            // Import organisations 
            const url4 = standardStuff.apiURL('/organisations')
            let res4 = await axios.get(url4, params, config)
            console.log(`API4 returned`, res4.data);
            const organisations = res4.data.organisations

            return {
                user: user,
                deployables: deployables,
                environments: environments,
                organisations: organisations,
            }

        } catch (e) {
            console.log(`Could not fetch user details:`, e)
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