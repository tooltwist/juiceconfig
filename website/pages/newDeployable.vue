<template lang="pug">
section.section 
    div(v-if="saveMode === 'Success'")
        article(class="message is-success")
            div(class="message-header")
                p Success!
                //button(class="delete", aria-label="delete")
            div(class="message-body") 
                | New deployable has been successfully saved. Would you like to return to the 
                a(href="/deployables") deployables page
                |, or 
                a(href="/newDeployable") create another deployable?
    div(v-else)
        h1.title Add New Deployable:
        div(v-if="mode === 'inputError'")
            article(class="message is-danger is-small")
                div(class="message-header")
                    p Form Error
                div(class="message-body") Please ensure that all fields have values before saving.
        form
            div.form-group
                div.formStyle(class="control") New deployable name:
                    div(v-if="deployableError === null")
                        input(name="new_deployable", v-model="form.new_deployable", class="input", type="text", placeholder="Deployable Name")
                    div(v-else="variableError === `Deployable already exists`")
                        input(class="input is-danger", v-model="form.new_deployable", type="text", placeholder="Deployable Name")
                        p(class="help is-danger") This deployable name already exists. Try again.
                div.formStyle(class="control") Product owner:
                    input(name="new_owner", v-model="form.new_owner", class="input", type="text", placeholder="Product Owner")
                div.formStyle(class="control") Description:
                    input(name="new_description", v-model="form.new_description", class="input", type="text", placeholder="Description")
                div.formStyle Is this a project?
                    b-select(placeholder="Is this a project?", v-model="form.is_project") Is this a project?
                        option(value="1") Yes
                        option(value="0") No
                div(class="control")
                    b-button.buttonStyle(@click.prevent="newDeployable", value="save", type="is-primary is-light")  Save
                    b-button.buttonStyle(tag="nuxt-link", to="/deployables", type="is-danger is-outlined") Cancel
</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig

export default {
    name: 'New_Deployable',
    data () {
        return {
            form: {
                new_deployable: '',
                new_owner: '',
                new_description: '',  
                is_project: ''
            },
            mode: false,
            saveMode: false,
            deployables: '',
            deployableError: null,
        }
    },

    methods: {
        newDeployable(e) {     
            // Check that form is correctly filled out
            if (this.form.new_deployable && this.form.is_project && this.form.new_owner && this.form.new_description) {
                
                // Check for existing deployable name
                let found = false
                this.deployables.forEach(deployable => {
                    if (deployable.name === this.form.new_deployable) {
                        console.log(`There is already an existing deployable with these values!`)
                        found = true
                    }
                })

                // If matching deployable is found, send error 
                if (found) {
                    console.log(`There is already a deployable with these values... Error message shown!`)
                    this.deployableError = `Deployable already exists`
                    return 
                }
                this.deployableError = null

                // If no error, send post request to server
                try {
                    e.preventDefault();
                    axios.post(`${protocol}://${host}:${port}/newDeployable`, {
                        name: this.form.new_deployable,
                        product_owner: this.form.new_owner,
                        description: this.form.new_description,
                        is_project: this.form.is_project,
                    })
                    // Prevent input error from showing
                    this.mode = false;
                } catch (e) {
                    console.log(`Could not send new deployable to the database`, e)
                }
            } else {
                this.mode = 'inputError';
                console.log('Input error: please ensure all fields are filled.')
            }

            // Show successful save message
            if (this.mode != 'inputError') {
                try {
                    this.saveMode = 'Success'
                    console.log(saveMode, 'Successful')
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
    asyncData ({ params, error }) {

        const url = `${protocol}://${host}:${port}/showDeployables`
        console.log(`Calling ${url}`);
        return axios.get(url)
        .then((res) => {
            return {
                deployables: res.data.list,
            }
        })
        .catch((e) => {
            error({ statusCode: 404, message: 'Could not fetch deployables' })
        })
    }//- methods
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

