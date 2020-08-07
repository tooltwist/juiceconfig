<template lang="pug">
  section.section
    h1.title Users
      div.buttons(style="float:right;")
        button.button.is-primary(@click.prevent="newUser(users)", type="is-light")  + Add New User
    b-table(:data="users", focusable)
      template(slot-scope="props")
        b-table-column(field="username", label="Username")
          | {{ props.row.username }}
        b-table-column(field="first_name", label="First Name")
          | {{ props.row.first_name }}
        b-table-column(field="last_name", label="Last Name")
          | {{ props.row.last_name }}
        b-table-column(field="id", label="ID")
          nuxt-link(:to="`/user/user/${user}/${props.row.id}`") {{ props.row.id }}
        b-table-column(field="role", label="Role")
          | {{ props.row.role }}
        b-table-column(field="access", label="Access")
          | {{ props.row.access }}

    // Modal for new user
    div(v-show="newUserModal")
      transition(name="modal")
        div.modal-mask
          div.modal-wrapper
            div.modal-card
              header.modal-card-head
                p.modal-card-title Add a New User
              section.modal-card-body
                div(v-if="errormode === 'inputError'")
                  article.message.is-danger.is-small
                    div.message-header
                      p Form Error
                    div.message-body Please ensure that all fields have values before saving.
                div.modal-body(:data="users")
                  slot(name="body")
                      form
                        div.form-group
                          div.formStyle First Name:
                            div.control
                              input.input(name="user_firstname", maxlength="35", v-model="form.user_firstname", type="text", placeholder="First Name")
                          div.formStyle Last Name:
                            div.control
                              input.input(name="user_lastname", maxlength="35", v-model="form.user_lastname", type="text", placeholder="Last Name")
                          div.formStyle Role:
                            div.control
                              input.input(name="user_role", maxlength="16", v-model="form.user_role", type="text", placeholder="Users Role")
                          div.formStyle Accessibility type:
                            b-select(placeholder="Type", v-model="form.user_accesstype") Type:
                              option(value="limited") Limited
                              option(value="write") Write
                              option(value="conditional") Conditional (recommended for clients only)
                          div.formStyle Email address (for account verification):
                            div.control
                              div(v-if="userError === null")
                                input.input(name="user_email", v-model="form.user_email", maxlength="60", type="email", placeholder="example@tooltwist.com")
                              div(v-else="userError === `User already exists`")   
                                input.input.is-danger(v-model="form.user_email", type="email", placeholder="example@tooltwist.com")
                                p.help.is-danger A user with this email already exists. 
              footer.modal-card-foot
                div.control
                  b-button(@click.stop="saveNewUser",  type="is-primary is-light", size="is-small")  Save    
                  b-button(@click="newUserModal=false", type="is-danger is-outlined", size="is-small") Cancel
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
  name: 'Users',

  data () {
    return {
      users: [ ],
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
        user_firstname: '',
        user_lastname: '',
        user_role: '',
        user_accesstype: '',
        user_email: '',
      },

      // New User Modal Data
      newUserModal: false,
      errormode: null,
      userError: null,
    }
  },
  
  methods: {
    newUser(users) {
      this.newUserModal = true;
    },

    // ADD A NEW USER TO THE DATABASE - FROM MODAL 
    async saveNewUser() {
      //Check that form is filled correctly
      if (this.form.user_firstname && this.form.user_lastname && this.form.user_role && this.form.user_accesstype && this.form.user_email) {
        
        // Check for existing email
        let found = false
        this.users.forEach(user => {
          if (user.email === this.form.user_email) {
            console.log(`There is already an existing user with this email!`)
            found = true
          }
        })

        // If matching email is found, send error 
        if (found) {
          console.log(`There is already an existing user with this email.. Error message shown!`)
          this.userError = `User already exists`
          return 
        }
        this.userError = null

        // If no error, send post request to server
        try {
          let record = {
            first_name: this.form.user_firstname,
            last_name: this.form.user_lastname,
            role: this.form.user_role,
            access: this.form.user_accesstype,
            email: this.form.user_email,
          }
          const url = standardStuff.apiURL('/newUser')
          const config = standardStuff.axiosConfig(this.$loginservice.jwt)
          await axios.post(url, record, config)
          this.newUserModal = false
          console.log(`New user successfully sent to database`);
        } catch (e) {
          console.log(`Error while sending new user to the database: `, e)
        }

        // Once data sent, reload with the new user
        try {
          this.reloadUsers(); 
          console.log(`Users have been reloaded on the browser.`)
        } catch (e) {
          console.log(`Error while reloading users on the browser: `, e)
        }
      } else {
        this.errormode = 'inputError'
      }
    }, // - saveNewUser

    // RELOAD THE DATABASE TABLE AFTER SAVING NEW USER
    async reloadUsers() {
      const url = standardStuff.apiURL('/users')
      const config = standardStuff.axiosConfig(this.$loginservice.jwt)
      let res = await axios.get(url, config)
      this.users = res.data.users
      console.log(`Users have been reloaded on the browser.`)
      return {
        users: this.users
      };
    },  // -reloadVariables 
  }
  , // - data

  /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
  async asyncData ({ app, params, error }) {
    try {
      const url = standardStuff.apiURL('/users')
      const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
      console.log(`Calling ${url}`);
      let res = await axios.get(url, config)
      const users = res.data.users
        return {
          users: users
        }
    } catch (error) {
      error({ statusCode: 404, message: 'Error while fetching projects' })
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

