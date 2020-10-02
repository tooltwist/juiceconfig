<template lang="pug">
    section.section
        div(v-if="loggedIn")
            h1.title My Account
            b-tabs(v-model="activeTab", :animated="false")
                b-tab-item(label="Account Details")
                    table(style="width:80%")
                        tr 
                            td(style="justify:right;")
                                label Username:
                            td(style="justify:left;") {{userName}}
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
                                label Access:
                            td(style="justify:left;") {{user.access}}
                        br
                        b-button.is-grey.is-small(@click.prevent="editMyAccount()") Edit

                b-tab-item
                    template(slot="header")
                        span Organisations  
                            b-tag(v-show="this.requests.length > 0", rounded, type="is-danger is-outlined") {{this.requests.length}}
                    h1.is-title.is-size-4 My Organisations:
                        b-button.is-primary(tag="nuxt-link", to="/newOrganisation", type="is-light", style="float:right;") + Create new organisation
                    br
                    b-table(:data="organisations", focusable)
                        template(slot-scope="props")
                            b-table-column(field="organisation", label="Organisation Name")
                                nuxt-link(:to="`/organisation/${props.row.org_username}`")
                                    span(v-show="props.row.role === 'owner' && props.row.status === 'confirmed'", v-html="props.row.org_username")
                                span(v-show="props.row.role != 'owner' || props.row.status === 'pending'") {{props.row.org_username}}
                            b-table-column(field="role", label="Role") 
                                | {{props.row.role}}
                            b-table-column(field="status", label="Status")
                                b-dropdown(v-show="props.row.status === 'pending'", aria-role="list")
                                    button(class="button", slot="trigger", slot-scope="{active}")
                                        span {{props.row.status}}
                                        b-icon(:icon="active ? 'menu-up' : 'menu-down'")
                                    b-dropdown-item(value="accept", @click="invResponse(props.row.org_username, 'accept')") Accept
                                    b-dropdown-item(value="decline", @click="invResponse(props.row.org_username, 'decline')") Decline
                                span(v-show="props.row.status != 'pending'") {{props.row.status}}

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
                                        div Username: {{this.userName}}
                                        div.formStyle First name:
                                            div.control
                                                input.input(v-model="form.new_first_name", maxlength="35", type="text", value="first_name") 
                                        div.formStyle Last name:
                                            div.control
                                                input.input(v-model="form.new_last_name", maxlength="35", type="text", value="last_name") 
                                        div.formStyle Email:
                                            div.control
                                                input.input(v-model="form.new_email", maxlength="60", type="email", value="last_name") 
                            footer.modal-card-foot 
                                div.control
                                    b-button(@click.stop="saveEditedAccount", type="is-primary is-light", size="is-small")  Save    
                                    b-button(@click="editAccountModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios';
import standardStuff from '../lib/standard-stuff';

export default {
    data () {
        return {
            form: {
                new_first_name: '',
                new_last_name: '',
                new_email: '',
            },

            requests: [ ],
            user: [ ],
            organisations: [ ],
            editAccountModal: false,
            activeTab: 0,
            userName: '',
            status: 'declined',
        }
    }, // - data

    computed: {
        loggedIn: function() {
            if (this.$loginservice && this.$loginservice.user) {
                return true;
            }

            return false;
        }, // - loggedIn
        
        fullname: function() {
            return this.loggedIn ? this.$loginservice.user.fullname : '';
        }, // - fullname
    },

    methods: {
        ...standardStuff.methods,

        async invResponse (org, response) {
            try {
                if (response == 'accept') {
                    this.status = 'confirmed';
                } else {
                    this.status = 'declined';
                }

                console.log('Username: ', this.userName);

                let record = {
                    user_username: this.userName,
                    org_username: org,
                    status: this.status,
                }

                let url = standardStuff.apiURL('/orgUserRes');
                const config = standardStuff.axiosConfig(this.$loginservice.jwt);
                await axios.post(url, record, config);
                console.log(`Org_user response successfully sent to database`);
                this.reloadOrgUsers();

            } catch (e) {
                console.log(`Error while sending org_user response record to the database: `, e);
            }
        }, 

        // Reload org_users and requests after updating a pending response
        async reloadOrgUsers() {
            const params = {
                params: { 
                    userName: this.user.username
                }
            }

            // Update org_users
            let url = standardStuff.apiURL('/organisations');
            const config = standardStuff.axiosConfig(this.$loginservice.jwt);
            let result = await axios.get(url, params, config);
            this.organisations = result.data.organisations;

            // Update requests
            url = standardStuff.apiURL('/orgRequests');
            result = await axios.get(url, params, config);
            this.requests = result.data.requests;

            return {
                organisations: this.organisations,
                requests: this.requests,
            };
        },  // - reloadOrgUsers

        // OPEN MODAL AND CHANGE VALUES FOR MY ACCOUNT
        editMyAccount () {  
            this.editAccountModal = true;
            this.form.new_first_name = this.user.first_name;
            this.form.new_last_name = this.user.last_name;
            this.form.new_email = this.user.email;
            return false;
        }, // - editMyAccount

        // SAVE EDITED USER
        async saveEditedAccount() {
            try {
                let url = standardStuff.apiURL('/editAccount');

                let record = {
                    id: this.user.id,
                    first_name: this.form.new_first_name,
                    last_name: this.form.new_last_name,
                    email: this.form.new_email,
                    userName: this.userName
                };
                
                let config = standardStuff.axiosConfig(this.$loginservice.jwt);
                await axios.post(url, record, config);

                // Display new users details
                this.editAccountModal = false;
                this.reloadAccount();
                console.log('New account details have been updated on the browser.');

            } catch (e) {
                console.log(`Error whilst updating browser with edited account:`, e);
            } 
        }, // - saveEditedAccount

        // RELOAD THE DATABASE TABLE AFTER SAVING NEW ACCOUNT DETAILS
        async reloadAccount() {
            const url = standardStuff.apiURL('/myaccount');

            const params = {
                params: { 
                    userName: this.user.username
                }
            }

            const config = standardStuff.axiosConfig(this.$loginservice.jwt);
            let result = await axios.get(url, params, config);
            this.user = result.data.record;

            return {
                user: this.user,
            };
        },  // -reloadAccount
    }, // - methods
 
    async asyncData ({ app, params, error }) {
        let userName = app.$nuxtLoginservice.user;

        try {
            const params = { 
                params: {
                    userName: userName.username,
                    userID: userName.id,
                }
            };

            // Select the deployable for this page
            let url = standardStuff.apiURL('/myaccount');
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);
            let res = await axios.get(url, params, config);
            console.log(`User: `, res.data);
            const user = res.data.record;

            // Import organisations 
            url = standardStuff.apiURL('/organisations');
            res = await axios.get(url, params, config);
            console.log(`API4 returned`, res.data);
            const organisations = res.data.organisations;
            console.log('Organisations: ', organisations);

            // import pending invitation requests from org_user db table
            url = standardStuff.apiURL('/orgRequests');
            res = await axios.get(url, params, config);
            const requests = res.data.requests;
            console.log('Requests: ', requests);

            return {
                requests: requests,
                user: user,
                organisations: organisations,
                userName: userName.username,
            }

        } catch (e) {
            console.log(`Could not fetch user details:`, e);
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