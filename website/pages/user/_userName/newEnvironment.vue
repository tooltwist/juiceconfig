<template lang="pug">
section.section
    div(v-if="initialisationError")
        // If we have just saved successfully, display a message.
        article.message.is-danger
            .message-header
                p Could not load initial data
    div(v-else-if="saveMode")
        // If we have just saved successfully, display a message.
        article.message.is-success
            div.message-header
                p Success!
            div.message-body
                | New environment has been successfully saved. Would you like to return to the 
                a(:href="`/user/${user}/environments`") environments page
                |, or 
                a(:href="`/user/${user}/newEnvironment`") create another environment?
    div(v-else)
        h1.title Add New Environment:
        form
            .field
                label.label Admin:
                    input.input(v-model="form.new_owner", maxlength="50", type="text", :disabled="true")
            .field
                label.label New environment name
                input.input(name="new_environment", maxlength="16", v-model="form.new_environment", type="text", placeholder="Environment name")
                p.help.is-danger(v-if="environmentExists") This environment name already exists.
            .field
                label.label Type
                .control
                    .select
                        select(v-model="form.type")
                            option(value="aws") Amazon Web Services (AWS)
                            option(value="local") Local development machine
                            option(value="other") Other
            div(v-if="form.type === 'aws'", style="position:relative; left:50px; width:900px") 
                .field 
                    label.label AWS account:
                    input.input(name="aws_account", v-model="form.aws_account", maxlength="32", type="text", placeholder="Account ID")
                .field 
                    label.label AWS profile:
                    input.input(name="aws_profile", v-model="form.aws_profile", maxlength="128", type="text", placeholder="Profile name")
                .field  
                    label.label AWS region:
                    input.input(name="aws_region", v-model="form.aws_region", maxlength="32", type="text", placeholder="Region")
                .field 
                    label.label AWS cf stack:
                    input.input(name="aws_cf_stack", v-model="form.aws_cf_stack", maxlength="512", type="text", placeholder="Cloudformation Stack")
                .field 
                    label.label AWS cluster url:
                    input.input(name="aws_cluster_url", v-model="form.aws_cluster_url", maxlength="512", type="text", placeholder="ECS Cluster URL")
                .field 
                    label.label AWS VPC url:
                    input.input(name="aws_upc_vrl", v-model="form.aws_vpc_url", maxlength="512", type="text", placeholder="UPC URL")
                br
            .field
                label.label Description
                input.input(name="new_description", v-model="form.new_description", maxlength="128", type="text", placeholder="Description")
            .field
                label.label Is this a universal environment? (all-accessible)
                b-select(placeholder="Universal", v-model="form.is_universal")
                    option(value="1") Yes
                    option(value="0") No
            .field
                label.label Is this a secure environment?
                b-select(placeholder="Secure", v-model="form.is_secure_environment")
                    option(value="1") Yes
                    option(value="0") No
            .field
                label.label Group: 
                form(v-if="newGroup")
                    p Group name: 
                        input.input(name="new_group", v-model="form.new_group", maxlength="16", placeholder="Group Name")
                        p.help.is-danger(v-if="groupExists") This group name already exists.
                    p Description:
                        input.input(name="new_group_description", v-model="form.group_description", maxlength="16", placeholder="Description")
                    p Tag colour:
                        .control 
                            .select
                                select(v-model="form.group_colour")
                                    option(value="red") Red
                                    option(value="blue") Blue
                                    option(value="green") Green
                                    option(value="orange") Orange
                                    option(value="yellow") Yellow

                b-select(v-if="!newGroup", style="display:inline-block;" placeholder="Group name", v-model="form.group_name")
                    option(value="") None
                    option(v-for="group in groups", :value="`${group.group_name}`") {{group.group_name}}
                
                div(style="float:right;") New group?  
                    input.is-small(type="checkbox", @click="addNewGroup()")
            .field
                label.label Notes
                textarea.textarea(name="new_notes", v-model="form.new_notes", type="text", placeholder="Notes")
            div.control
                b-button.buttonStyle(@click.prevent="newEnvironment", type="is-primary is-light", :disabled="!readyToSave")  Save
                b-button.buttonStyle(tag="nuxt-link", :to="`/user/${user}/environments`", type="is-danger is-outlined") Cancel
</template>

<script>
import axios from 'axios';
import standardStuff from '../../../lib/standard-stuff';

export default {
    name: 'New_Environment',

    data () {
        return {
            initialisationError: false,

            form: {
                new_owner: '',
                new_environment: '',
                new_description: '',
                type: '',
                group_name: '',
                new_notes: '',
                is_universal: false,
                is_aws: '',
                aws_account: '',
                aws_profile: '',
                aws_region: '',
                aws_cf_stack: '',
                aws_cluster_url: '',
                aws_vpc_url: '',
                is_secure_environment: '',

                // Creating a new group
                new_group: '',
                group_colour: '',
                group_description: '',
            },

            newGroup: '',
            saveMode: false,
            environments: [ ],
            groups: [ ],
            user: '',
        }
    },

    computed: {
        // Check for existing environment name
        environmentExists () {
            if (this.form.new_environment) {
                let found = false;

                this.environments.forEach(environment => {
                    if (environment.name === this.form.new_environment) {
                        console.log(`There is already an existing environment with these values!`);
                        found = true;
                    }
                })

                return found;
            }

            return false;
        }, // - environmentExists

        // Check for existing group name
        groupExists () {
            if (this.form.new_group) {
                let found = false;

                this.groups.forEach(group => {
                    if (group.group_name === this.form.new_group) {
                        console.log(`There is already an existing group with this value!`);
                        found = true;
                    }
                })

                return found;
            }

            return false;
        }, // - groupExists

        // Checks if all form requirements are met before saving
        readyToSave () {
            if (!this.form.new_environment) {
                return false; // Need a name
            }

            if (this.environmentExists) {
                return false; // Name is already used
            }

            if (!this.form.type) {
                return false; // Must have a type
            }

            return true;
        }, // - readyToSave
    },

    methods: {
        // Switch between newGroup = true / false
        addNewGroup() { 
            this.newGroup = (this.newGroup) ? false : true;
        }, // - addNewGroup

        // Add a new environment
        async newEnvironment(e) {
            // Check that form is correctly filled out
            if (!this.readyToSave) {
                return;
            }

            // Check if using existing group or creating new group
            if (this.newGroup) {
                try {
                    e.preventDefault();

                    // send record for new group
                    const url = standardStuff.apiURL('/newGroup');

                    const record = { 
                        group_name: this.form.new_group,
                        description: this.form.group_description,
                        colour: this.form.group_colour,
                        group_owner: this.user,
                    };

                    const config = standardStuff.axiosConfig(this.$loginservice.jwt);
                    await axios.post(url, record, config);
                    console.log('New group sent to the database.');

                    // set this.form.group_name as new group name
                    this.form.group_name = this.form.new_group;

                } catch (e) {
                    console.log(`Error while sending new group to the database: `, e);
                }
            }

            try {
                e.preventDefault();

                if (this.form.type === 'aws') {
                    this.form.is_aws = 1;
                }

                const url = standardStuff.apiURL('/newEnvironment');

                const record = {
                    owner: this.user,
                    name: this.form.new_environment,
                    description: this.form.new_description,
                    notes: this.form.new_notes,
                    group_name: this.form.group_name,
                    is_universal: this.form.is_universal,
                    is_aws: this.form.is_aws,
                    is_secure_environment: this.form.is_secure_environment,
                    aws_account: this.form.aws_account,
                    aws_profile: this.form.aws_profile,
                    aws_region: this.form.aws_region,
                    aws_cf_stack: this.form.aws_cf_stack,
                    aws_cluster_url: this.form.aws_cluster_url,
                    aws_vpc_url: this.form.aws_vpc_url,

                };

                const config = standardStuff.axiosConfig(this.$loginservice.jwt);
                await axios.post(url, record, config);
                console.log('New environment successfully sent to the database.');

            } catch (e) {
                console.log(`Error while sending new environment to the database: `, e);
            }
            
            this.saveMode = true;
            console.log(this.saveMode, 'Successful');
        }, // - newEnvironment
    },

    /*
     *  Call our API using Axios, to get the project data.
     *  See https://nuxtjs.org/guide/async-data#handling-errors
     */
    async asyncData ({ app, params, error }) {
        let user = params.userName;
        let me = app.$nuxtLoginservice.user.username;
        
        try {        
            const params = {
                params: {
                    user: user,
                }
            }

            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

            // Get the environments
            let url = standardStuff.apiURL('/showEnvironments');
            let reply = await axios.get(url, params, config);
            let environments = reply.data.environments;
            console.log(`Environments: `, environments);

            // Get environment groups 
            url = standardStuff.apiURL('/groups');
            reply = await axios.get(url, params, config);
            let groups = reply.data.groups;
            console.log(`Groups: `, groups);

            return {
                environments: environments,
                groups: groups,
                form: {
                    new_owner: user,
                },
                user: user,
            };

        } catch (e) {
            console.log(`Error while fetching environments: `, e);

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