<template lang="pug">
section.section 
    div(v-if="initialisationError")
        // If we have just saved successfully, display a message.
        article.message.is-warning
            .message-header
                p Error while loading initial data. Cannot continue.
    div(v-else-if="savedMode")
        article.message.is-success
            div.message-header
                p Success!
                //button(class="delete", aria-label="delete")
            div.message-body
                | New deployable has been successfully saved. Would you like to return to the 
                a(href="/deployables") deployables page
                |, or 
                a(href="/newDeployable") create another deployable?
    div(v-else)
        h1.title Add New Deployable:
        //- div(v-if="mode === 'inputError'")
            article(class="message is-danger is-small")
                div(class="message-header")
                    p Form Error
                div(class="message-body") Please ensure that all fields have values before saving.
        form
            .field
                label.label Owner:
                    input.input(v-model="form.new_owner", type="text", :disabled="true")
            .field
                label.label New deployable name:
                    input.input(v-model="form.new_deployable", type="text", placeholder="Deployable Name")
                    //- div(v-else="variableError === `Deployable already exists`")
                    //- input(class="input is-danger", v-model="form.new_deployable", type="text", placeholder="Deployable Name")
                    p.help.is-danger(v-if="deployableExists") This deployable name already exists.
            .field
                label.label Description:
                    input.input(v-model="form.new_description", type="text", placeholder="Description")
            .field
                label.label Is this a project?
                    b-select(v-model="form.is_project", placeholder="Is this a project?") Is this a project?
                        option(value="1") Yes
                        option(value="0") No
            .field
                label.label Product owner:
                    input.input(v-model="form.new_product_owner", type="text", placeholder="Product Owner")
            .field
                .control
                    b-button.buttonStyle(@click.prevent="newDeployable", value="save", type="is-primary is-light", :disabled="!readyToSave")  Save
                    b-button.buttonStyle(tag="nuxt-link", to="/deployables", type="is-danger is-outlined") Cancel
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
    name: 'New_Deployable',
    data () {
        return {
            initialisationError: false,
            
            form: {
                new_owner: '',
                new_deployable: '',
                new_product_owner: '',
                new_description: '',
                is_project: 0
            },
            // mode: false,
            savedMode: false,
            deployables: [ ],
            deployableError: null,
        }
    },

    /*
     *  Call our API using Axios, to get the project data.
     *  See https://nuxtjs.org/guide/async-data#handling-errors
     */
    async asyncData ({ params, error, app }) {

        let me = app.$nuxtLoginservice.user.username

        try {
            const url = standardStuff.apiURL('/deployables')
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            console.log(`Calling ${url}`);
            let result = await axios.get(url, config)
            console.log(`result=`, result);
            
            return {
                deployables: result.data.deployables,
                form: {
                    new_owner: me
                }
            }
         } catch (e) {
            console.log(`Error while fetching deployables: `, e)
            // error({ statusCode: 400, message: 'Error while fetching deployables' })
            return {
                initialisationError: true
            }
        }
    },//- asyncData

    computed: {

        // Check for existing deployable name
        deployableExists () {
            if (this.form.new_deployable) {
                let found = false
                this.deployables.forEach(deployable => {
                    if (deployable.name === this.form.new_deployable) {
                        console.log(`There is already an existing deployable with this name!`)
                        found = true
                    }
                })
                return found
            }
            return false
        },//- deployableExists

        readyToSave () {
            if (!this.form.new_deployable) {
                console.log(`readyToSave 1`);
                return false // Need a name
            }
            if (this.deployableExists) {
                console.log(`readyToSave 2`);
                return false // Name is already used
            }
            console.log(`readyToSave 4`);
            return true
        },//- readyToSave
    },

    methods: {
        async newDeployable(e) {
            console.log(`newDeployable()`, this);

            // Check that form is correctly filled out
            if (!this.readyToSave) {
                return
            }
            
            // Check that form is correctly filled out
            // if (this.form.new_deployable && this.form.is_project && this.form.new_product_owner && this.form.new_description) {
                
                // // Check for existing deployable name
                // let found = false
                // this.deployables.forEach(deployable => {
                //     if (deployable.name === this.form.new_deployable) {
                //         console.log(`There is already an existing deployable with these values!`)
                //         found = true
                //     }
                // })
                // 
                // // If matching deployable is found, send error 
                // if (found) {
                //     console.log(`There is already a deployable with these values... Error message shown!`)
                //     this.deployableError = `Deployable already exists`
                //     return 
                // }
                // this.deployableError = false

                // If no error, send post request to server
                try {
                    e.preventDefault();

                    // let jwt = this.$loginservice.jwt
                    // let config = {
                    //     headers: {
                    //         authorization: `Bearer ${jwt}`,
                    //     }
                    // }
                    // console.log(`config is`, config);
                    

                    console.log(`calling /newDeployable`);
                    let record = {
                        owner: this.form.new_owner,
                        name: this.form.new_deployable,
                        product_owner: this.form.new_product_owner,
                        description: this.form.new_description,
                        is_project: this.form.is_project,
                    }
                    console.log(`record = `, record);
                    let url = standardStuff.apiURL('/newDeployable')
                    const config = standardStuff.axiosConfig(this.$loginservice.jwt)
                    await axios.post(url, record, config)
                    // Prevent input error from showing
                    // this.mode = false;
                } catch (err) {
                    console.log(`Error while sending new deployable to the database: `, err)
                }
            // } else {
            //     this.mode = 'inputError';
            //     console.log('Input error: please ensure all fields are filled.')
            // }

            // // Show successful save message
            // if (this.mode != 'inputError') {
            //     try {
                    this.savedMode = true
                    console.log(this.savedMode, 'Successful')
            //     } catch (err) {
            //         console.log(`Error while updating savedMode to success: `, err)
            //     }
            // } 
            
        },
    },//- methods
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

