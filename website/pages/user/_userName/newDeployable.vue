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
            div.message-body
                | New deployable has been successfully saved. Would you like to return to the 
                a(:href="`/user/${user}/deployables`") deployables page
                |, or 
                a(:href="`/user/${user}/newDeployable`") create another deployable?
    div(v-else)
        h1.title Add New Deployable:
        
        div(v-if="global === true")
            article.message.is-warning.is-small
                .message-header Public mode selected:
                .message-body
                    p Your deployable will be publicly accesible by any user, however they will not be able to edit or update the deployable.
        
        form
            .field
                label.label Owner:
                    input.input(v-model="form.new_owner", maxlength="50", type="text", :disabled="true")
            .field 
                p.is-small Public deployable 
                    input(type="checkbox", @click="globalDeployable") 
            .field
                label.label New deployable name:
                    input.input(v-model="form.new_deployable", maxlength="16", type="text", placeholder="Deployable Name")
                    p.help.is-danger(v-if="deployableExists") This deployable name already exists.
            .field
                label.label Description:
                    input.input(v-model="form.new_description", maxlength="50", type="text", placeholder="Description")
            .field
                label.label Type:
                    b-select(v-model="form.type", placeholder="Type") 
                        option(value="project") Project
                        option(value="api") API
                        option(value="database") Database
            .field
                label.label Product owner:
                    input.input(v-model="form.new_product_owner", maxlength="50", type="text", placeholder="Product Owner")
            .field
                .control
                    b-button.buttonStyle(@click.prevent="newDeployable", value="save", type="is-primary is-light", :disabled="!readyToSave")  Save
                    b-button.buttonStyle(tag="nuxt-link", :to="`/user/${user}/deployables`", type="is-danger is-outlined") Cancel
</template>

<script>
import axios from 'axios';
import standardStuff from '../../../lib/standard-stuff';

export default {
    name: 'New_Deployable',

    data () {
        return {
            initialisationError: false,
            
            form: {
                is_global: 0,
                new_owner: '',
                new_deployable: '',
                new_product_owner: '',
                new_description: '',
                type: '',
            },

            global: false,
            ownerName: '',
            savedMode: false,
            deployables: [ ],
            deployableError: null,
            user: '',
        }
    },

    computed: {
        // Check for existing deployable name
        deployableExists () {
            if (this.form.new_deployable) {
                let found = false;

                this.deployables.forEach(deployable => {
                    if (deployable.name === this.form.new_deployable) {
                        console.log(`There is already an existing deployable with this name!`);
                        found = true;
                    }
                })

                return found;
            }

            return false;
        }, // - deployableExists

        readyToSave () {
            if (!this.form.new_deployable) {
                return false; // Need a name
            }

            if (this.deployableExists) {
                return false; // Name is already used
            }

            return true;
        }, // - readyToSave
    },

    methods: {
        globalDeployable () {
            if (this.form.is_global != 1) {
                this.form.is_global = 1;
                this.global = true;
            } else {
                this.form.is_global = 0;
                this.global = false;
            }
        }, // - globalDeployable

        async newDeployable(e) {
            // Check that form is correctly filled out
            if (!this.readyToSave) {
                return;
            }

            try {
                e.preventDefault();                    
                console.log(`calling /newDeployable`);

                let record = {
                    owner: this.form.new_owner,
                    name: this.form.new_deployable,
                    product_owner: this.form.new_product_owner,
                    description: this.form.new_description,
                    type: this.form.type,
                }

                console.log(`record = `, record);
                let url = standardStuff.apiURL('/newDeployable');
                const config = standardStuff.axiosConfig(this.$loginservice.jwt);
                await axios.post(url, record, config);

            } catch (err) {
                console.log(`Error while sending new deployable to the database: `, err);
            }
            
            this.savedMode = true;
            console.log(this.savedMode, 'Successful');
        }, // - newDeployable
    }, // - methods

    /*
    *  Call our API using Axios, to get the project data.
    *  See https://nuxtjs.org/guide/async-data#handling-errors
    */
    async asyncData ({ params, error, app }) {
        let user = params.userName;
        let me = app.$nuxtLoginservice.user.username;

        try {
            const url = standardStuff.apiURL('/deployables');
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);
            let result = await axios.get(url, config);
            let deployables = result.data.depoyables;
            console.log(`Deployables: `, deployables);
            
            return {
                deployables: deployables,
                ownerName: me,
                user: user,
                form: {
                    new_owner: user
                },
            }

         } catch (e) {
            console.log(`Error while fetching deployables: `, e);
            // error({ statusCode: 400, message: 'Error while fetching deployables' })
            return {
                initialisationError: true,
            };
        }
    }, // - asyncData
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

