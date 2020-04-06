<template lang="pug">
section.section
    div(v-if="initialisationError")
        // If we have just saved successfully, display a message.
        article.message.is-danger
            .message-header
                p Could not load initial data
    div(v-else-if="saveMode")
        // If we have just saved successfully, display a message.
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
        h1.title Add New Environment:
        //- div(v-if="mode === 'inputError'")
            article(class="message is-danger is-small")
                div(class="message-header")
                    p Form Error
                div(class="message-body") Please ensure that all fields have values before saving.
        
        form
                .field
                    label.label New environment name
                    input.input(name="new_environment", v-model="form.new_environment", type="text", placeholder="Environment name")
                    p.help.is-danger(v-if="environmentExists") This environment name already exists.
                //- div.form-group
                //-     div.formStyle(class="control") New environment name:
                //-         div(v-if="environmentError === null")
                //-             input.input(name="new_environment", v-model="form.new_environment", type="text", placeholder="Environment name")
                //-         div(v-else="environmentError === `Environment already exists`")
                //-             input.input.is-danger(v-model="form.new_environment", type="text", placeholder="Environment Name")
                //-             p(class="help is-danger") This environment name already exists. Try again.
                .field
                    label.label Type
                    .control
                        .select
                            select(v-model="form.type")
                                option(value="aws") Amazon Web Services (AWS)
                                option(value="local") Local development machine
                                option(value="other") Other
                .field
                    label.label Description
                    //- div.formStyle(class="control") Description:
                    input.input(name="new_description", v-model="form.new_description", type="text", placeholder="Description")
                .field
                    label.label Is this a universal (all-accessible) environment?
                    //- div.formStyle Is this a universal (all-accessible) environment?
                    b-select(placeholder="Is this a universal environment?", v-model="form.is_universal")
                        option(value="true") Yes
                        option(value="false") No
                .field
                    label.label Notes
                    //- div.formStyle(class="control") Notes:
                    textarea.textarea(name="new_notes", v-model="form.new_notes", type="text", placeholder="Notes")
                div(class="control")
                    b-button.buttonStyle(@click.prevent="newEnvironment", type="is-primary is-light", :disabled="!readyToSave")  Save
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
            initialisationError: false,
            form: {
                new_environment: '',
                new_description: '',
                type: '',
                new_notes: '',
                is_universal: false,
            },
            // mode: false,
            saveMode: false,
            environments: '',
            // environmentError: false,
        }
    },

    computed: {

        // Check for existing environment name
        environmentExists () {
            if (this.form.new_environment) {
                let found = false
                this.environments.forEach(environment => {
                    if (environment.name === this.form.new_environment) {
                        console.log(`There is already an existing environment with these values!`)
                        found = true
                    }
                })
                return found
            }
            return false
        },//- environmentExists

        readyToSave () {
            if (!this.form.new_environment) {
                return false // Need a name
            }
            if (this.environmentExists) {
                return false // Name is already used
            }
            if (!this.form.type) {
                return false // Must have a type
            }
            return true
        }
    },

    methods: {
        async newEnvironment(e) {
            // Check that form is correctly filled out
            if (!this.readyToSave) {
                return
            }
            // if (this.form.new_environment && this.form.new_description && this.form.new_notes && this.form.is_universal) {

                // // Check for existing environment name
                // let found = false
                // this.environments.forEach(environment => {
                //     if (environment.name === this.form.new_environment) {
                //         console.log(`There is already an existing environment with these values!`)
                //         found = true
                //     }
                // })
                
                // // If matching environment is found, send error 
                // if (found) {
                //     console.log(`There is already a environment with these values... Error message shown!`)
                //     this.environmentError = true
                //     return 
                // }
                // this.environmentError = false

                // If no error, send post request to server
                try {
                    e.preventDefault();

                    // let jwt = app.$nuxtLoginservice.jwt
                    let jwt = this.$loginservice.jwt
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
                    // this.mode = false;
                    console.log('New environment successfully sent to the database.');
                } catch (e) {
                    console.log(`Error while sending new environment to the database: `, e)
                }
            // } else {
            //     this.mode = 'inputError';
            //     console.log('Input error: please ensure all fields are filled.')
            // }

            // Show successful save message
            // if (this.mode != 'inputError') {
            //     try {
                    this.saveMode = true
                    console.log(this.saveMode, 'Successful')
                // } catch (e) {
                //     console.log(`Error while changing saveMode to success: `, e)
                // }
            // }
        },
    },

    /*
     *  Call our API using Axios, to get the project data.
     *  See https://nuxtjs.org/guide/async-data#handling-errors
     */
    async asyncData ({ params, error }) {
        console.log(`asyncData()`);
        
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
            console.log(`Error while fetching environments: `, e)
            return {
                initialisationError: true
            }
        }
    },//- asyncData

}
</script>

<style scoped>
.buttonStyle {
    padding: 5px;
    margin: 10px 10px 5px 0px
}

.formStyle {
  margin: 10px -20px;
}
</style>