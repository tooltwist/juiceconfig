<template lang="pug">
section.section 
    div(v-if="saveMode === 'Success'")
        article(class="message is-success")
            div(class="message-header")
                p Success!
                //button(class="delete", aria-label="delete")
            div(class="message-body") 
                | New environment has been successfully saved. Would you like to return to the 
                a(href="/environments") environments page
                |, or 
                a(href="/newEnvironment") create another environment?
    div(v-else)
        h1.title Add new environment:
        div(v-if="mode === 'inputError'")
            article(class="message is-danger is-small")
                div(class="message-header")
                    p Form Error
                div(class="message-body") Please ensure that all fields have values before saving.
        form
            div.form-group
                div.formStyle(class="control") New environment name:
                    div(v-if="environmentError === null")
                        input(name="new_environment", v-model="form.new_environment", class="input", type="text", placeholder="Environment Name")
                    div(v-else="environmentError === `Environment already exists`")
                        input(class="input is-danger", v-model="form.new_environment", type="text", placeholder="Environment Name")
                        p(class="help is-danger") This environment name already exists. Try again.
                div.formStyle(class="control") Description:
                    input(name="new_description", v-model="form.new_description", class="input", type="text", placeholder="Description")
                div.formStyle(class="control") Notes:
                    input(name="new_notes", v-model="form.new_notes", class="input", type="text", placeholder="Notes")
                div.formStyle Is this a universal environment? (Can anyone use it?):
                    b-select(placeholder="Is this a universal environment?", v-model="form.is_universal")
                        option(value="yes") Yes
                        option(value="no") No
                div(class="control")
                    b-button.buttonStyle(@click.prevent="newEnvironment", type="is-primary is-light")  Save
                    b-button.buttonStyle(tag="nuxt-link", to="/environments", type="is-danger is-outlined") Cancel
</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig

export default {
    name: 'New_Environment',
    data () {
        return {
            form: {
                new_environment: '',
                new_description: '',
                new_notes: '',
                is_universal: '',
            },
            mode: false,
            saveMode: false,
            environments: '',
            environmentError: null,
        }
    },

    methods: {
        async newEnvironment(e) {
            // Check that form is correctly filled out
            if (this.form.new_environment && this.form.new_description && this.form.new_notes && this.form.is_universal) {

                // Check for existing environment name
                let found = false
                this.environments.forEach(environment => {
                    if (environment.name === this.form.new_environment) {
                        console.log(`There is already an existing environment with these values!`)
                        found = true
                    }
                })
                
                // If matching environment is found, send error 
                if (found) {
                    console.log(`There is already a environment with these values... Error message shown!`)
                    this.environmentError = `Environment already exists`
                    return 
                }
                this.environmentError = null

                // If no error, send post request to server
                try {
                    e.preventDefault();

                    let jwt = app.$nuxtLoginservice.jwt
                    let config = {
                        headers: {
                        authorization: `Bearer ${jwt}`,
                        }
                    }
                    await axios.post(`${protocol}://${host}:${port}/newEnvironment`, {
                        name: this.form.new_environment,
                        description: this.form.new_description,
                        notes: this.form.new_notes,
                        is_universal: this.form.is_universal
                    }, config)
                    // Prevent input error from showing
                    this.mode = false;
                    console.log('New environment successfully sent to the database.');
                } catch (e) {
                    console.log(`Could not send new environment to the database`, e)
                }
            } else {
                this.mode = 'inputError';
                console.log('Input error: please ensure all fields are filled.')
            }

            // Show successful save message
            if (this.mode != 'inputError') {
                try {
                    this.saveMode = 'Success'
                    console.log(this.saveMode, 'Successful')
                } catch (e) {
                    console.log(`Could not change saveMode to Success :`, e)
                }
            }
        },
    },

    /*
   *  Call our API using Axios, to get the project data.
   *  See https://nuxtjs.org/guide/async-data#handling-errors
   */
    async asyncData ({ params, error }) {
    try {        
        // Get the environments
        const url = `${protocol}://${host}:${port}/showEnvironments`
        console.log(`Calling ${url}`);
        let reply = await axios.get(url)
        console.log(`Response is: `, reply)

        return {
            environments: reply.data.environments
        }
    } catch (e) {
        console.log(`Could not fetch environments: `, e)
    }
  }

}
</script>

<style scoped>
.buttonStyle {
    padding: 5px;
    margin: 10px 10px 5px 0px
}

.formStyle {
  margin: 10px 0px;
}
</style>