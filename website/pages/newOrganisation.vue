<template lang="pug">
section.section
    h1.title Create a new organisation:

    // New org details
    div(v-show="this.page === 0")
        form
            .field 
                label.label Organisation name:
                    input.input(v-model="form.org_name", maxLength="50")
                b-message.is-danger.is-small(v-show="usernameError") A user with this username already exists. 

                label.label Contact email:
                    input.input(v-model="form.email", maxLength="60")
                b-message.is-danger.is-small(v-show="emailError") A user with this email address already exists.
                    // first name, last name, role, access etc are all invalid for org records
                    // form.type = org
        br
        button.button.is-primary(:disabled="!disable('first_page')", @click="whichPage('next')") Next

    // Payment details
    div(v-show="this.page === 1")
        h2.title.is-size-4 Add subscription payment method:
        
        p I will pay 
            input(v-model="form.payment", type="checkbox") 
        br
        button.button.is-primary.is-outlined(@click="whichPage('back')") Back 
        button.button.is-primary(:disabled="!disable('submit')", @click="submitForm") Process 

    // User details
    div(v-show="this.page === 2")
        h2.title.is-size-4 Add users:
        form    
            .field 
                label.label Search username: 
                    b-autocomplete(placeholder="Search...", :data="filterUsernames", clearable, icon="magnify", type="search", @select="option => selected = option", v-model="form.username")
                        template(slot="empty") No results found
                label.label Role:
                div(style="display:flex;")
                    .control
                        .select
                            select(v-model="form.user_role")
                                option(value="admin") Admin
                                option(value="user") User            
                    b-button.is-primary.is-outlined(:disabled="!disable('add_user')", @click="addUser", style="display:flex;") + Add user

        b-table(:data="org_users")
            template(slot-scope="props")
                b-table-column(field="username", label="Username")
                    | {{props.row.user_username}}
                b-table-column(field="role", label="Role")
                    | {{props.row.role}}
        br
        // *** Not very nice format below, remember to fix this up ***
        div(v-show="this.org_users.length <= 1")
            b-button.is-primary(tag="nuxt-link", to="/myAccount") Skip this step
        div(v-show="this.org_users.length > 1")
            b-button.is-primary(tag="nuxt-link", to="/myAccount") Finish

</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
    name: "new_organisation",
    data () {
        return {
            form: {
                // New org details
                org_name: '',
                email: '',
                type: 'org',
                
                // Adding users
                username: '',
                user_role: '',

                // Payment
                payment: '',
            },

            currentUser: '',
            emailError: false,
            usernameError: false,
            page: 0,
            users: [],
            org_users: [],
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
                return option.toString().toLowerCase().indexOf(this.form.username.toLowerCase()) >= 0
            })
        }
    },

    methods: {
        // Check for existing email and username
        checkForm () {
            let found = false;

            this.users.forEach(user => {
                if (user.email === this.form.email) {
                    this.emailError = true;
                    found = true;
                } 

                if (user.username === this.form.org_name) {
                    this.usernameError = true;
                    found = true;
                } 
            })

            if (found) {
                return true;
            }

            return false;
        },

        // Disable next/submit buttons on forms that are incomplete
        disable (button) {
            if (this.checkForm()) {
                return false;
            }

            if (button == 'add_user') {
                if (!this.form.username || !this.form.user_role) {
                    return false;
                }
            } else if (button == 'first_page') {
                if (!this.form.org_name || !this.form.email) {
                    return false;
                }
            } else if (button == 'submit') {
                if (!this.form.payment) {
                    return false;
                }
            } 

            return true;
        },

        // Navigate forward and backwards on form pages
        whichPage (dir) {
            if (dir == 'next') {
                this.page++;

            } else if (dir == 'back') {
                this.page--;
            }

            return this.page;
        },

        // Reload org_users data after adding new user 
        async reloadOrgUsers() {
            const params = {
                params: { 
                    org_username: this.form.org_name
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

        // Add new org users 
        async addUser () {
            try {
                let record = {
                    user_username: this.form.username,
                    role: this.form.user_role,
                    org_username: this.form.org_name,
                    status: 'pending'
                }

                let url = standardStuff.apiURL('/newOrgUser')
                const config = standardStuff.axiosConfig(this.$loginservice.jwt)

                await axios.post(url, record, config)

                console.log(`New org_user successfully sent to database`);

            } catch (e) {
                console.log(`Error while sending new org_user record to the database: `, e)
            }

            try {
                // Reload page 2 and show added users table
                this.reloadOrgUsers();

                this.page = 2;
                this.form.username = '';
                this.form.user_role = '';
            } catch (e) {
                console.log(`Error updating page: `, e)
            }
        },

        // Add new organisation to users db table
        async submitForm () { 
            try {
                let record = {
                    username: this.form.org_name,
                    type: this.form.type,
                    email: this.form.email
                }

                let url = standardStuff.apiURL('/newOrg')
                const config = standardStuff.axiosConfig(this.$loginservice.jwt)

                await axios.post(url, record, config)

                console.log(`New org successfully sent to database`);

                this.page++;

            } catch (e) {
                console.log(`Error while sending new org to the database: `, e)
            }

            // Add current user as owner of organisation is org_users db table
            try {
                let record = {
                    user_username: this.currentUser,
                    org_username: this.form.org_name,
                    role: 'owner',
                    status: 'confirmed'
                }

                let url = standardStuff.apiURL('/newOrgUser')
                const config = standardStuff.axiosConfig(this.$loginservice.jwt)

                await axios.post(url, record, config)

                console.log(`New org_user successfully sent to database`);
                
            } catch (e) {
                console.log(`Error while updating org_user db table with new owner: `, e)
            }
        },

    },

    async asyncData ({ app, params, error }) {
        let currentUser = app.$nuxtLoginservice.user.username;

        try {
            const params = {
                params: { 
                    currentUser: currentUser,
                    //org_username: this.form.org_name,
                }
            }

            // Import all users to check username and to add users to org
            let url = standardStuff.apiURL('/users');
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);
            console.log(`Calling ${url}`);
            let res = await axios.get(url, config)
            const users = res.data.users
            console.log('Users: ', users)

            // Import all org_users for newly created org 
            url = standardStuff.apiURL('/orgUsers');
            console.log(`Calling ${url}`);
            res = await axios.get(url, params, config)
            const org_users = res.data.org_users
            console.log('org_users: ', org_users)

            return {
                org_users: org_users,
                users: users,
                currentUser: currentUser,
            }

        } catch (error) {
            error({ statusCode: 404, message: 'Error while fetching users' })
        }
    }
}
</script>

<style scoped>

</style>