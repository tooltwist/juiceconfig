<template lang="pug">
  section.section
    h1.title {{user}} users:
      div(style="float:right; display:flex;")
        b-select(placeholder="Sort by:", v-model="sortBy")
          option(disabled selected) Sort by:
          option(value="showAll") Show all
          option(value="confirmed") Active 
          option(value="pending") Pending
          option(value="disabled") Disabled
        div.buttons.has-text-weight-normal(style="padding: 0px 5px;")
          button.button.is-primary(@click.prevent="newUser(users)", type="is-light")  + Add New User

    b-table(:data="filterUsers", focusable)
      template(slot-scope="props")
        b-table-column(field="username", label="Username")
          nuxt-link(v-if="props.row.status != 'pending'", :to="`/user/${user}/${props.row.user_username}`") {{ props.row.user_username }}
          span(v-else) {{props.row.user_username}}
        b-table-column(field="role", label="Role")
          | {{ props.row.role }}
        b-table-column(field="status", label="Status")
          b-dropdown(v-show="props.row.status === 'pending'", aria-role="list")
            button(class="button", slot="trigger", slot-scope="{active}")
              span {{props.row.status}}
              b-icon(:icon="active ? 'menu-up' : 'menu-down'")
            b-dropdown-item(value="accept", @click="changeMembership(props.row.user_username, 'remove')") 
              b-icon(icon="delete")
              span Remove Member              
          b-dropdown(v-show="props.row.status === 'confirmed'", aria-role="list") 
            button(class="button", slot="trigger", slot-scope="{active}")
              span {{props.row.status}}
              b-icon(:icon="active ? 'menu-up' : 'menu-down'")
            b-dropdown-item(value="accept", @click="changeMembership(props.row.user_username, 'disable')") 
              b-icon(icon="cancel")
              span Disable Member
          b-dropdown(v-show="props.row.status === 'disabled'", aria-role="list") 
            button(class="button", slot="trigger", slot-scope="{active}")
              span {{props.row.status}}
              b-icon(:icon="active ? 'menu-up' : 'menu-down'")
            b-dropdown-item(value="accept", @click="changeMembership(props.row.user_username, 'enable')") 
              b-icon(icon="account-reactivate")
              span Reactivate Membership 

    // Modal for new user
    div(v-show="newUserModal")
      transition(name="modal")
        div.modal-mask
          div.modal-wrapper
            div.modal-card
              header.modal-card-head
                p.modal-card-title Add a New {{user}} User 
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
                        div.formStyle Find User: 
                          div.control
                            b-autocomplete(placeholder="Search...", :data="filterUsernames", clearable, icon="magnify", type="search", @select="option => selected = option", v-model="form.new_user")
                              template(slot="empty") No results found
                          div.formStyle Role:
                            div.control
                              b-select(placeholder="Role", v-model="form.user_role") Role:
                                option(value="admin") Admin
                                option(value="user") User
                div.control
                  b-button(@click.stop="saveNewUser",  type="is-primary is-light", size="is-small")  Save    
                  b-button(@click="newUserModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios';
import standardStuff from '../../../lib/standard-stuff';

export default {
  name: 'Users',

  data () {
    return {
      allUsers: [ ],
      users: [ ],
      user: '',
      sortBy: 'showAll',
      columns: [
        {
          field: 'first_name',
          label: 'First Name',
        },
        {
          field: 'last_name',
          label: 'Last Name',
        },
        {
          field: 'role',
          label: 'Role',
        },
        { 
          field: 'access',
          label: 'Access',
        },
      ],

      form: {
        new_user: '',
        user_role: '',
      },

      // New User Modal Data
      newUserModal: false,
      errormode: null,
    }
  },
  
  computed: {
    // Returns a list of usernames for all users
    usernames: function () {
      let usernames = [];
      let i = 0;

      this.allUsers.forEach(user => {
        usernames[i] = user.username;
        i++;
      })

      return usernames;
    }, // - usernames

    // Filters users based on input: searching
    filterUsernames: function () {
      return this.usernames.filter((option) => {
        return option.toString().toLowerCase().indexOf(this.form.new_user.toLowerCase()) >= 0;
      })
    }, // - filterUsernames

    // Filters list of users: Active, pending, disabled
    filterUsers: function () {
      let sort = this.sortBy;
      let newUsers = [];

      if (sort == 'showAll') {
        return this.users;

      } else {
        this.users.forEach(user => {
          if (user.status == sort) {
            newUsers.push(user);
          }
        })

        return newUsers;
      }
    }, // - filterUsers
  },

  methods: {
    newUser(users) {
      this.newUserModal = true;
    }, // - newUser

    // Change status of org_user: (disable) temporarily removes access of existing user, (remove) deletes a pending user invitation.
    async changeMembership(member, status) {
      if (status == 'disable') {
        // update the user_org record where user_username == member, org_username == user SET status == disabled
        try {
          let params = {
            org: this.user,
            member: member,
            status: 'disabled',
          }

          const url = standardStuff.apiURL('/orgStatusUpdate');
          const config = standardStuff.axiosConfig(this.$loginservice.jwt);
          await axios.post(url, params, config);

        } catch (e) {
          console.log(`Error while updating user on the database: `, e);
        }

      } else if (status == 'remove') {
        // delete the user_org record where user_username == member, org_username == user, status == pending
        try {
          const params = {
            params: {
              org: this.user,
              member: member,
              status: 'pending',
            }
          }

          const url = standardStuff.apiURL('/deleteOrgUser');
          const config = standardStuff.axiosConfig(this.$loginservice.jwt);
          await axios.delete(url, params, config);

        } catch (e) {
          console.log(`Error while deleting user record from the database: `, e);
        }

      } else if (status == 'enable') {
        try {
          let params = {
            org: this.user,
            member: member,
            status: 'confirmed',
          }

          const url = standardStuff.apiURL('/orgStatusUpdate');
          const config = standardStuff.axiosConfig(this.$loginservice.jwt);
          await axios.post(url, params, config);

        } catch (e) {
          console.log(`Error while updating user on the database: `, e);
        }        
      }

      try {
        this.reloadUsers();
      } catch (e) {
        console.log(`Error whilst reloading users: `, e);
      }
    }, // - changeMembership

    // Add a new user to database
    async saveNewUser() {
      //Check that form is filled correctly
      if (this.form.new_user && this.form.user_role) {
        // If form filled correctly, send post request to server
        try {
          let record = {
            role: this.form.user_role,
            org_username: this.user,
            user_username: this.form.new_user,
            status: 'pending',
          }

          const url = standardStuff.apiURL('/newOrgUser');
          const config = standardStuff.axiosConfig(this.$loginservice.jwt);
          await axios.post(url, record, config);
          this.newUserModal = false;
          console.log(`New user successfully sent to database`);

        } catch (e) {
          console.log(`Error while sending new user to the database: `, e);
        }

        // Once data sent, reload with the new user
        try {
          this.reloadUsers(); 
          console.log(`Users have been reloaded on the browser.`);

        } catch (e) {
          console.log(`Error while reloading users on the browser: `, e);
        }

      } else {
        this.errormode = 'inputError';
      }
    }, // - saveNewUser

    // Reload users after saving new user
    async reloadUsers() {
      const params = {
        params: {
          organisationName: this.user,
        }
      }

      const url = standardStuff.apiURL('/organisationUsers');
      const config = standardStuff.axiosConfig(this.$loginservice.jwt);
      let res = await axios.get(url, params, config);
      this.users = res.data.organisationUsers;
      console.log(`Users have been reloaded on the browser.`);

      return {
        users: this.users,
      };
    }, // - reloadUsers 
  }, // - data

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    let user = params.userName;

    try {
      const params = {
        params: {
          organisationName: user,
        }
      }

      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

      // Import all users from org_user db table where org_username = user;
      let url = standardStuff.apiURL('/organisationUsers');
      let res = await axios.get(url, params, config);
      const users = res.data.organisationUsers;
      console.log('Users: ', users);

      // Import all users
      url = standardStuff.apiURL('/users');
      res = await axios.get(url, config);
      const allUsers = res.data.users;
      console.log('allUsers: ', allUsers)

      return {
        allUsers: allUsers,
        users: users,
        user: user,
      };

    } catch (error) {
      error({ statusCode: 404, message: 'Error while fetching projects' });
    }
  },
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

.formStyle {
  margin: 10px 0px;
}

</style>

