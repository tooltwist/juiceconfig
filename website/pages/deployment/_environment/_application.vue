<template lang="pug">
section.section
    h1.title.is-paddingless.is-marginless Deployment
    //- p(class="is-size-5 has-text-weight-semibold is-italic")
        | Project 
        span.is-warning {{ applicationName }} 
        span on environment 
        span.is-warning {{ environmentName }} 
    br
    table
        tr
            td(style="width:110px;") Environment:&nbsp;
            td
                b
                    span(v-html="std_toQualifiedDisplay(environmentOwner, environmentName)")

        tr
            td Application:&nbsp;
            td
                b {{applicationName}}
        tr
            td Deployable:&nbsp;
            td
                b
                    span(v-html="std_toQualifiedDisplay(deployment.deployable_owner, deployment.deployable)")
    br

    .field
        b-checkbox(v-model="isSecureEnvironment")
        | No secure values. {{isSecureEnvironment}}, {{environment.is_secure_environment}}
    .notification.is-warning
        //- button.delete
        | This is a secure environment, so you will not be able to
        | specify configuration details here.
        | You will however be able to download templates and scripts to help create configurations.

    //- | {{ deployment }}
    b-tabs(v-model="activeTab", :animated="false")
        b-tab-item(label="Deployment details")
            form.formStyle
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Notes: 
                    .field-body
                        .field
                            .control
                                textarea.textarea(:disabled="!editingDetails", v-model="deployment.notes", placeholder="Add any notes or comments here", @input="saveDetails")
                                //- input.input(v-if="editingDetails", v-model.trim="deployment.aws_service", placeholder="URL to ECS Service")
                                //- a.my-not-input-a(v-else-if="validUrl(deployment.aws_service)", :href="deployment.aws_service", target="_blank") &nbsp;{{deployment.aws_service}}
                                //- p.my-not-input-p(v-else) &nbsp;{{deployment.aws_service}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Healthcheck: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", v-model.trim="deployment.healthcheck_url", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.healthcheck_url)", :href="deployment.healthcheck_url", target="_blank") &nbsp;{{trimUrl(deployment.healthcheck_url)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.healthcheck_url}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") ECS Service: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", v-model.trim="deployment.aws_service", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_service)", :href="deployment.aws_service", target="_blank") &nbsp;{{trimUrl(deployment.aws_service)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_service}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Target group: 
                    .field-body
                        .field
                            .control
                                //- input.input(type="text", :class="{ myEditing: !editingDetails } ", v-model="deployment.aws_targetGroup", placeholder="URL to target group")
                                input.input(v-if="editingDetails", v-model.trim="deployment.aws_targetgroup", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_targetgroup)", :href="deployment.aws_targetgroup", target="_blank") &nbsp;{{trimUrl(deployment.aws_targetgroup)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_targetgroup}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Load balancer: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", v-model.trim="deployment.aws_loadbalancer", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_loadbalancer)", :href="deployment.aws_loadbalancer", target="_blank") &nbsp;{{trimUrl(deployment.aws_loadbalancer)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_loadbalancer}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Cloudwatch: 
                    .field-body
                        .field
                            .control
                                //- input.input(type="text", :class="{ myEditing: !editingDetails } ", v-model="deployment.aws_logfile_url", placeholder="URL to Cloudwatch logs")
                                input.input(v-if="editingDetails", v-model.trim="deployment.aws_logfile_url", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_logfile_url)", :href="deployment.aws_logfile_url", target="_blank") &nbsp;{{trimUrl(deployment.aws_logfile_url)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_logfile_url}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Secret Name: 
                    .field-body
                        .field
                            .control
                                //- input.input(type="text", :class="{ myEditing: !editingDetails } ", v-model="deployment.aws_secretsmanager_secret", placeholder="Secret name")
                                input.input(v-if="editingDetails", v-model.trim="deployment.aws_secretsmanager_secret", placeholder="URL to ECS Service", @input="saveDetails")
                                //- a.my-not-input-a(v-else-if="validUrl(deployment.aws_secretsmanager_secret)", :href="deployment.aws_secretsmanager_secret", target="_blank") &nbsp;{{deployment.aws_secretsmanager_secret}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_secretsmanager_secret}}

            .control
                button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}
                //- | &nbsp;
                //- button.button.is-small(@click="updateDeployment") update


        b-tab-item(label="Values")
            .panel(v-if="variableRecursive.length === 0")
                h1 No variables are required for this deployable.
                br
                br
                br
                br
                br
                br
                br
                br
                br
            div(v-if="variableRecursive.length > 0")
                form(v-for="(variable, index) in variableRecursive")
                    div.formStyle.field.is-horizontal
                        div.field-label.is-normal
                            label.label(style="width:200px;") {{ variable.variableName }}: 
                        div.field-body
                            div.field
                                p.control()
                                    input.input(v-if="editingValues", style="width:100%;", type="text", v-model="variable.value", placeholder="Configuration Value")
                                    //- p.control(v-else)
                                    p.my-not-input-p(v-if="!editingValues") &nbsp;{{variable.value}}

            section(v-if="unusedValues.length > 0")
                hr
                | The following values are defined but they are not used by&nbsp;
                b
                    span(v-html="std_toQualifiedDisplay(deployment.deployable_owner, deployment.deployable)")
                | &nbsp;or it's dependancies.

                form(v-for="(val, index) in unusedValues")
                    div.formStyle.field.is-horizontal(v-show="!val.deleted")
                        div.field-label.is-normal
                            label.label(style="width:200px;") {{ val.variableName }}: 
                        div.field-body
                            b-field(v-if="editingValues")
                                b-input(
                                    v-model="val.value"
                                    icon-right="close-circle"
                                    icon-right-clickable
                                    @icon-right-click="deleteUnusedValue(val.variableName)")
                            b-field(v-else)
                                p.my-not-input-p &nbsp;{{val.value}}
            br

            .control(v-if="editingValues", )
                button.button.is-success(@click="saveVariableValues") Save Changes
                | &nbsp;&nbsp;
                b-button.button.is-danger.is-outlined.is-light(tag="nuxt-link", to="/deployments") Cancel
            .control(v-else)
                button.button.is-warning(@click="editingValues= !editingValues") Edit

            //- // Submit Modal 
            //- div(v-show="submitModal")
            //-     transition(name="modal")
            //-         div(class="modal-mask")
            //-             div(class="modal-wrapper")
            //-                 div(class="modal-container")
            //-                     div(class="modal-header")
            //-                         slot(name="header")
            //-                             div(class="is-size-5 has-text-weight-semibold") Add New Configuration:
            //-                             i Adding new configuration for {{ applicationName }} on {{ environmentName }}
            //-                         div(class="modal-body")
            //-                             slot(name="body")
            //-                                 article(class="message is-info is-small")
            //-                                     div(class="message-body") Please check fields for missing or incorrect values before saving.
            //-                                 div.formStyle(v-for="variables in variableRecursive")
            //-                                     p {{variables.variableName}}: {{variables.value}}
            //-                         div(class="buttons is-centered")
            //-                             b-button(@click.stop="saveNewVariable",  type="is-light", size="is-small")  Save    
            //-                             b-button(@click="submitModal = false", type="is-danger", size="is-small") Cancel


        b-tab-item(label="Configuration")
            p How will you provide the configuration to this application?
            br
            section
                .block(style="margin-left: 80px;")
                    b-radio(v-model="configType", size="is-small", name="configType", native-value="file")
                        | Configuration file&nbsp;&nbsp;&nbsp;
                    b-radio(v-model="configType", size="is-small", name="configType", native-value="secrets")
                        | Amazon Secrets Manager&nbsp;&nbsp;&nbsp;
                    b-radio(v-model="configType", size="is-small", name="configType", native-value="environment")
                        | Environment variable

            br

            // Configuration file
            div(v-if="configType==='file'")
                .notification
                    | JUICE_CONFIG=file:::/
                    i path-to-configuration
                    | /{{environmentName}}-{{applicationName}}.config`
                textarea.textarea.my-textarea(ref="configFileContent", readonly="true", style="font-family: courier;")
                    | {{configFileContent}}
                button.button.is-small.is-success(@click="downloadConfigFile") Download

            // Amazon secrets manager
            div(v-else-if="configType==='secrets'")
                .notification
                    | JUICE_CONFIG=secrets_manager:::{{environment.aws_region}}:::{{deployment.aws_secretsmanager_secret}}
                    br
                    br
                    | The script below uses the AWS CLI to update the secret in Secrets Manager.
                textarea.textarea.my-textarea(readonly="true", style="font-family: courier;")
                    | {{codeForSecretsManager}}
                button.button.is-small.is-success(@click="downloadSetSecret") Download

            // Environment variable
            div(v-else-if="configType==='environment'")
                .notification
                    | The script below sets the JUICE_CONFIG environment variable.
                textarea.textarea.my-textarea(readonly="true", style="font-family: courier;")
                    | {{codeToSetEnvVariable}}
                button.button.is-small.is-success(@click="downloadSetEnvironment") Download

   
</template>

<script>
import axios from 'axios'
import standardStuff from '../../../lib/standard-stuff'

const NUM_START = `ZNUZM(`
const NUM_END = `)NUZMZ`
const BOOL_START = `ZBOZOL(`
const BOOL_END = `)BOZOLZ`


export default {
    data () {
        return {
            environmentOwner: '',
            environmentName: '',
            applicationName: '',
            deployment: {},
            //deployableName: '',//ZZZZ
            variables: [],
            unusedValues: [],
            deployables: [],
            environment: {},
            dependencies: [],
            // submitModal: false,
            variableRecursive: [],

            activeTab: 0,
            noSecureValues: true,
            editingDetails: false,
            editingValues: false,
            updateDelay: null,

            configType: 'file'
        }
    },

    async asyncData ({ app, params, error }) {
        let username = app.$nuxtLoginservice.user.username
        let {owner:environmentOwner, name:environmentName} = standardStuff.methods.std_fromQualifiedName(params.environment, username)
        let applicationName = params.application
        // let deployableName = params.deployable
        console.log(`deployment=> ${environmentOwner}, ${environmentName}, ${applicationName}`);
        

        try {
        
        // Select this deployment for this page
        let url = standardStuff.apiURL('/deployments')
        let params = { 
            params: {
                environmentOwner,
                environmentName,
                applicationName,
                // deployableOwner: '',
                // deployableName: deployableName
            }
        }
        const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
        console.log(`Calling ${url}`);
        let res = await axios.get(url, params, config)
        console.log(`API returned deployments`, res.data.deployments);
        if (res.data.deployments.length > 1) {
            return error({status: 500, message: 'Returned too many deployments'})
        }
        const deployment = res.data.deployments[0]
console.log(`YYYYY YARP 1`, deployment);



        // Select the environment for this page
        url = standardStuff.apiURL('/environmentIndex')
        params = { 
            params: {
                environmentName: environmentName
            }
        }
        console.log(`Calling ${url}`);
        res = await axios.get(url, params, config)
        console.log(`API returned environment`, res.data);
        if (res.data.record.length > 1) {
            return error({status: 500, message: 'Returned too many environments'})
        }
        const environment = res.data.record
        console.log(`Environment is`, environment);
        

        // Import deployables to be shown in dropdown
        const url2 = standardStuff.apiURL('/deployables')
        let res2 = await axios.get(url2, config)
        const deployables = res2.data.deployables

        // Find our specific deployable
        // let deployableOwner = null
        // let deployableName = null
        // for (let i = 0; i < deployables.length; )

        // // Select the variables for this deployable
        // const url3 = `${protocol}://${host}:${port}/variables`
        // let res3 = await axios.get(url3, { 
        //     params: {
        //         deployableName: deployableName
        //     }
        // })
        // // console.log(`API3 returned`, res3.data);
        // const variables = res3.data.variables

        // // Import dependencies with 'deployableName' as parent
        // const url4 = `${protocol}://${host}:${port}/dependencies1`
        // let res4 = await axios.get(url4, {
        //     params: {
        //         owner: deployment.deployable_owner,
        //         name: deployment.deployable
        //     }
        // })
        // console.log(`API4 dependencies`, res4.data)
        // const dependencies = res4.data.dependencies

        // // Select all variables for dependencies
        // const url5 = '${protocol}://${host}:${port}/variablesAll'
        // let res5 = await axios.get(url5)
        
        // const variablesDepend = res5.data.variables

        // Variables for dependencies and deployable (recursive array data)
        const url6 = standardStuff.apiURL('/variablesConfig')
        const params6 = {
            params: {
                deployable_owner: deployment.deployable_owner,
                deployable: deployment.deployable
            }
        }
        let res6 = await axios.get(url6, params6, config)
        console.log(`API6 variablesConfig=`, res6.data)
        const variableRecursive = res6.data

// console.log(`YYYYY YARP 2`, deployment);

        // Select variable values for this deployment
console.log(`YARP XUT 1`);

        const url7 = standardStuff.apiURL('/variableValues')
        const params7 = {
            params: {
                environmentOwner: environmentOwner,
                environment: environmentName,
                applicationName: applicationName
            }
        }
        let result7 = await axios.get(url7, params7, config)
console.log(`YARP XUT 1`);
        console.log(`API7 variableValues=`, result7.data)
        const variableValues = result7.data.variableValues

console.log(`YYYYY YARP 2`, deployment);

        // If we have any values defined that are not used, we might want
        // to keep them - perhaps they'll be added back to the deployable.
        let unusedValues = [ ]

        // Patch the variable values in to the variable list
        // This is inefficient, but the list isn't too long...
        variableValues.forEach((vv) => {
            let used = false
            for (let i = 0; i < variableRecursive.length; i++) {
                let v = variableRecursive[i]
                if (v.variableName === vv.variable_name) {
                    v.value = vv.value
                    used = true
                    break                    
                }
            }//- for

            // If this value is not used by any defined variable, let's put it in the "unused values" list.
            if (!used) {
                unusedValues.push({
                    variableName: vv.variable_name,
                    value: vv.value,
                    deleted: false
                })
            }
        })//- variableValues.forEach

        console.log(`unusedValues=`, unusedValues);
        


        return {
            environmentOwner,
            environmentName,
            applicationName,
            deployment: deployment,
            // deployableName: deployableName,
            environment: environment,
            deployables: deployables,
            // variables: variables,
            // dependencies: dependencies,
            variableRecursive: variableRecursive,
            unusedValues,
        }
        } catch (e) {
            console.log(`Could not fetch data:`, e)
        }
    },

    computed: {

        isSecureEnvironment: function () {
            if (this.environment && this.environment.is_secure_environment) {
                return true
            }
            return false
        },

        configFileContent: function () {
            let mode = this.noSecureValues ? 'type' : 'value'
            return this.jsonAsString(mode)
        },

        codeToSetEnvVariable: function( ) {
            // return 'xyz'
            let mode = this.noSecureValues ? 'type' : 'value'
            let json = this.jsonAsString(mode)
            let script = `export JUICE_CONFIG=env:::$(cat<<ENDDD\n${json}\nENDDD`
            // console.log(`script=${script}`);
            return script
        },

        codeForSecretsManager: function( ) {
            // return 'xyz'
            let mode = this.noSecureValues ? 'type' : 'value'
            let json = this.jsonAsString('envvar')

            let vars = ''
            this.variableRecursive.forEach((v, i) => {

                //ZZZZZ
                let value = v.value
                let type = v.type
                // console.log(`*** name=${v.variableName}, value=${value}, type=${type}`);
                
                if (v.variableName.endsWith('host')) { type = 'text'; value = 'yarp.yar.yep.com' }
                if (v.variableName.endsWith('port')) { type = 'number'; value = 123 }
                if (v.variableName.endsWith('isAwesome')) { type = 'boolean'; value = false }
                // console.log(`    name=${v.variableName}, value=${value}, type=${type}`);



                // console.log(`v is`, v);
                let envvar = this.environmentVariableName(v.variableName)
                switch (type) {
                    case 'number':
                        vars += `${envvar}=${this.noSecureValues ? 'NUMBER' : value}\n`
                        break
                    case 'boolean':
                        vars += `${envvar}=${this.noSecureValues ? 'BOOLEAN' : value}\n`
                        break
                    case 'text':
                    default:
                        vars += `${envvar}=${this.noSecureValues ? 'STRING' : `"${value}"`}\n`
                        break
                }
            })

            let script = ''
            script += '#/bin/bash\n'
            script += '#\n'
            script += '#	Save secret to AWS Secrets Manager\n'
            script += '#	https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/put-secret-value.html\n'
            script += '#\n'
            script += 'AWS_PROFILE=default\n'
            script += `REGION=${this.environment.aws_region}\n`
            script += `SECRET_NAME=${this.deployment.aws_secretsmanager_secret}\n`
            script += '\n'
            script += vars
            script += '\n'
            script += '#\n'
            script += '# DO NOT CHANGE BELOW HERE\n'
            script += '#\n'
            // script += 'SecretString="{\"db.host\":\"${DB_HOST}\",\"db.port\":\"${DB_PORT}\",\"db.database\":\"${DB_NAME}\",\"db.user\":\"${DB_USERNAME}\",\"db.password\":null}"\n'
            script += `SecretString=$(cat<<ENDDD\n${json}\nENDDD\n`
            // script += '#echo Secret is ${SecretString}\n'
            script += 'export AWS_PROFILE=${AWS_PROFILE}\\\n'
            script += 'aws secretsmanager put-secret-value \\\n'
            script += '    --region ${REGION}\\\n'
            script += '    --secret-id ${SECRET_NAME}\\\n'
            script += '    --secret-string ${SecretString}\n'

            // console.log(`script=${script}`);
            return script
        },

    },

    methods: {
        ...standardStuff.methods,

        // validUrl: function (url) {
        //     return url && (url.startsWith('http://') || url.startsWith('https://'))
        // },

        // Submitting the configuration values to a modal for confirmation (for now)
        // submitConfig() {
        //     this.submitModal = true
        //     console.log(this.variableRecursive)
        // },

        jsonAsString(mode/*value|type|envvar*/) {
            let sep = '    '
            let obj = { }
            let self = this
            this.variableRecursive.forEach((v, i) => {
                self.setValue(obj, mode, '', v.variableName, v.type, v.value)
            })
            let json2 = JSON.stringify(obj, '', 2)
            if (mode === 'value') {
                json2 = json2.split(`"${NUM_START}`).join('')
                json2 = json2.split(`${NUM_END}"`).join('')
                json2 = json2.split(`"${BOOL_START}`).join('')
                json2 = json2.split(`${BOOL_END}"`).join('')
            } else if (mode === 'type') {
                json2 = json2.replace(/"STRING"/g, 'STRING')
                json2 = json2.replace(/"NUMBER"/g, 'NUMBER')
                json2 = json2.replace(/"BOOLEAN"/g, 'BOOLEAN')
            }
            // console.log(`json2(${mode})=`, json2);
            return json2
        },

        setValue: function(obj, mode, sofar, name, type, value) {
            // console.log(`setValue(obj, mode:${mode}, name:${sofar}/${name}, type:${type}, value:${value})`);

            type = 'text'
            if (name === 'host') { type = 'text'; value = 'yarp.yar.yep.com' }
            if (name === 'port') { type = 'number'; value = 123 }
            if (name === 'isAwesome') { type = 'boolean'; value = false }

            // If name is x.y.z, let's find the first bit (x)
            let errmsg = ''
            let pos = name.indexOf('.')
            if (pos >= 0) {
                let prefix = name.substring(0, pos)
                let suffix = name.substring(pos + 1)
                sofar += `${sofar}${prefix}.`
                switch (typeof(obj[prefix])) {
                    case 'undefined':
                        // New object
                        obj[prefix] = { }
                        return this.setValue(obj[prefix], mode, sofar, suffix, type, value)
                        break;
                    case 'object':
                        // Existing object
                        return this.setValue(obj[prefix], mode, sofar, suffix, type, value)
                        break;
                    default:
                        // Not an object, can't set 'y.z'
                        return `Conflict setting ${sofar}.\n`
                }
            } else {
                // New value
                // console.log(`- set it ${name}, mode=${mode}`);
                
                switch (mode) {
                    case 'value':
                        obj[name] = value
                        break

                    case 'envvar':
                        obj[name] = `\${${this.environmentVariableName(name)}}`
                        break

                    case 'type':
                        if (type==='text') {
                            obj[name] = `STRING`
                        } else if (type==='number') {
                            obj[name] = `NUMBER`
                        } else if (type==='boolean') {
                            obj[name] = `BOOLEAN`
                        } else {
                            console.log(`Unknown type for ${sofar}.${name} (${type})`);
                            return `Unknown type for ${sofar}.${name} (${type})\n`
                        }
                        // console.log(`  - obj=`, obj);
                        
                        break
                }
// clog
            }
        },//- setValue

        environmentVariableName: function(name) {
            let mode = this.noSecureValues ? 'type' : 'value'
            // camelCase => snake_case
            let n2 = name.replace(/[\w]([A-Z])/g, function(m) {
                return m[0] + "_" + m[1];
            })
            n2 = n2.toUpperCase();
            n2 = n2.replace(/\./g, '_')
            return n2
        },//- environmentVariableName

        downloadConfigFile: function () {
            const filename = `${this.environmentName}-${this.applicationName}.config`
            let content = this.configFileContent
            var myblob = new Blob([content], {
                type: 'text/json'
            });
            const url = window.URL.createObjectURL(myblob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename) //or any other extension
            document.body.appendChild(link)
            link.click()
        },

        downloadSetEnvironment: function () {
            const filename = `environment-${this.environmentName}-${this.applicationName}.sh`
            let content = this.codeToSetEnvVariable
            var myblob = new Blob([content], {
                type: 'text/plain'
            });
            const url = window.URL.createObjectURL(myblob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename) //or any other extension
            document.body.appendChild(link)
            link.click()
        },

        downloadSetSecret: function () {
            const filename = `set-secret-${this.environmentName}-${this.applicationName}.sh`
            let content = this.codeForSecretsManager
            var myblob = new Blob([content], {
                type: 'text/plain'
            });
            const url = window.URL.createObjectURL(myblob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename) //or any other extension
            document.body.appendChild(link)
            link.click()
        },

        updateDeployment: async function () {
            console.log(`updateDeployment() `, this.deployment);

            const url = standardStuff.apiURL('/deployment')
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            let result = await axios.put(url, this.deployment, config)
            // console.log(`API4 returned`, res4.data)
            // const dependencies = res4.data.dependencies
            console.log(`result is `, result);
            
        },

        saveDetails: async function () {
            let self = this
            if (self.updateDelay) {
                clearTimeout(self.updateDelay)
            }
            self.updateDelay = setTimeout(async function () {
                // console.log(`Updating...`, self.deployment);
                self.updateDelay = null
                const url = standardStuff.apiURL('/deployment')
                const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
                let result = await axios.put(url, self.deployment, config)
                // console.log(`result is `, result);
            }, 1000)
        },

        deleteUnusedValue: async function (variableName) {
            console.log(`deleteUnusedValue(${variableName})`);

            for (let i = 0; i < this.unusedValues.length; i++) {
                let uv = this.unusedValues[i]
                if (uv.variableName === variableName) {
                    // this.unusedValues.splice(i, 1)
                    console.log(`Found in position ${i}`);
                    uv.deleted = true
                    
                    return
                }
            }

        },

        saveVariableValues: async function () {
            console.log(`saveNewVariable()`, this.variableRecursive);

            let request = {
                environmentOwner: this.environmentOwner,
                environment: this.environmentName, 
                applicationName: this.applicationName,
                variableValues: {
                    // We'll put the values here
                }
            }
            // Add the known variables
            this.variableRecursive.forEach(v => {
                // if (v.value)
                request.variableValues[v.variableName] = v.value
            })
            this.unusedValues.forEach(uv => {
                if (!uv.deleted && uv.value) {
                    request.variableValues[uv.variableName] = uv.value
                }
            })

            console.log(`values to save=`, request);
            const url = standardStuff.apiURL('/variableValues')
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            await axios.post(url, request, this.axiosConfig)
            this.editingValues = false            
        },

        trimUrl: function (url) {
            const maxlen = 70
            if (url.length > maxlen) {
                // return `${url.substring(0, maxlen)} ...`
                return `...${url.substring(url.length - maxlen)}`
            }
            return url
        }

    }//- methods
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


// Table style:
.displayDiv {
    display: inline-block;
}

.variableNameStyle {
    flex-grow: 2;
    justify-content: space-evenly;
}

.inputStyle {
    flex-grow: 5;
    justify-content: space-evenly;
}

.formStyle {
  margin: 10px 0px;
}

.my-textarea {
    font-family:'Courier New', Courier, monospace;
    font-size: 11px;
    padding-top: 0px;
    height: 300px;
    margin-bottom: 10px;
}

// .myEditing {
//     border: none;
//     //background-color: red;
//     box-shadow: none;
// }

a.my-not-input-a {
    position: relative;
    top: 6px;
}

.my-not-input-p {
    position: relative;
    top: 6px;
}
</style>