<template lang="pug">
section.section
    h1.title.is-paddingless.is-marginless Deployment
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
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Service/Website URL: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.website_url", placeholder="https://my-domain.com", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.website_url)", :href="deployment.website_url", target="_blank") &nbsp;{{trimUrl(deployment.website_url)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.website_url}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Healthcheck: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.healthcheck", placeholder="/api/healthcheck", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.website_url)", :href="deployment.website_url+deployment.healthcheck", target="_blank") &nbsp;{{deployment.healthcheck}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.healthcheck}}
            .control
                div(v-if="deployment.deployable_owner == user && deployment.environment_owner == user")
                    button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}

        b-tab-item(label="AWS", v-if="environment.type === 'aws'")
            form.formStyle
                .field.is-horizontal    
                    .field-label.is-normal
                        label.label(style="width:200px;") ECS Service: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.aws_service", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_service)", :href="deployment.aws_service", target="_blank") &nbsp;{{trimUrl(deployment.aws_service)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_service}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Target group: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.aws_targetgroup", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_targetgroup)", :href="deployment.aws_targetgroup", target="_blank") &nbsp;{{trimUrl(deployment.aws_targetgroup)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_targetgroup}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Load balancer: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.aws_loadbalancer", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_loadbalancer)", :href="deployment.aws_loadbalancer", target="_blank") &nbsp;{{trimUrl(deployment.aws_loadbalancer)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_loadbalancer}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Cloudwatch: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.aws_logfile_url", placeholder="URL to ECS Service", @input="saveDetails")
                                a.my-not-input-a(v-else-if="validUrl(deployment.aws_logfile_url)", :href="deployment.aws_logfile_url", target="_blank") &nbsp;{{trimUrl(deployment.aws_logfile_url)}}
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_logfile_url}}
                .field.is-horizontal
                    .field-label.is-normal
                        label.label(style="width:200px;") Secret Name: 
                    .field-body
                        .field
                            .control
                                input.input(v-if="editingDetails", maxlength="256", v-model.trim="deployment.aws_secretsmanager_secret", placeholder="URL to ECS Service", @input="saveDetails")
                                p.my-not-input-p(v-else) &nbsp;{{deployment.aws_secretsmanager_secret}}

            .control
                button.button.is-small.is-success(@click="editingDetails= !editingDetails") {{editingDetails ? 'Done' : 'Edit'}}


        b-tab-item(label="Values")
            div.notification.is-warning(v-if="isSecureEnvironment")
                | This is a secure environment, so you will not be able to
                | specify configuration details here.
                | You will however be able to download templates and scripts to help create configurations.
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
                table.my-values-table
                    tr.is-size-7(v-for="(variable, index) in variableRecursive")
                        td.my-values-td-label
                            b-tooltip(:label="variable.description", position="is-bottom", multilined)
                                | {{ variable.variableName }}
                        td.my-values-td-value
                            input(v-if="editingDetails", style="width:100%;", type="text", v-model="variable.value", :placeholder="variable.example")
                            .my-value(v-else) {{variable.value}}

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
                            b-field(v-if="editingDetails")
                                b-input(
                                    v-model="val.value"
                                    icon-right="close-circle"
                                    icon-right-clickable
                                    @icon-right-click="deleteUnusedValue(val.variableName)")
                            b-field(v-else)
                                p.my-not-input-p &nbsp;{{val.value}}
            br

            div.buttons(v-if="variableRecursive.length != 0", style="float:right;")
                .control(v-if="editingDetails")
                    button.button.is-success(@click="saveVariableValues") Save Changes
                    | &nbsp;&nbsp;
                    button.button.is-light(@click="editingDetails= false") Cancel
                .control(v-else)
                    button.button.is-success(@click="editingDetails= !editingDetails") Edit

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


        b-tab-item(label="Docs")
            br
            section
                .block(style="margin-left: 80px;")
                    b-radio(v-model="docType", size="is-small", name="docType", native-value="markup-table")
                        | Markup Table
                    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    b-radio(v-model="docType", size="is-small", name="docType", native-value="markup-list")
                        | Markup List

            br
            // Documentation in Markup for Wiki
            div(v-if="docType==='markup-table'")
                .notification
                    | Github markup - table
                textarea.textarea.my-textarea(readonly="true", style="font-family: courier;")
                    | {{markupDocumentationTable}}
                button.button.is-small.is-success(@click="downloadMarkupDocumentationTable") Download
            div(v-if="docType==='markup-list'")
                .notification
                    | Github markup - list
                textarea.textarea.my-textarea(readonly="true", style="font-family: courier;")
                    | {{markupDocumentationList}}
                button.button.is-small.is-success(@click="downloadMarkupDocumentationList") Download

        b-tab-item(label="Commands", zv-if="environment.type==='aws'")
            .notification
                h1.title.is-size-5 Provisioning
                p.is-size-6
                    | The following command can help you deploy this project on an ECS cluster, with an ECS service,
                    | Secrets Manager secret, ECR repository and a Continuous integration Code Pipeline.
                br
                code.is-size-7
                    | $ AWS_PROFILE={{std_myProfile(environment)}} aws-explorer -r {{environment.aws_region}} provision
                br
                br
                p.is-size-6
                    | Select 'Application' and then complete the prompts.

            .notification
                h1.title.is-size-5 Connecting
                p.is-size-6
                    | The following command can assist you to log
                    | in to your ECS host servers, or to connect to this project's database:
                br
                code.is-size-7
                    | $ AWS_PROFILE={{std_myProfile(environment)}} aws-explorer \
                    br
                    | &nbsp;&nbsp;&nbsp;&nbsp; -r {{environment.aws_region}} \
                    br
                    | &nbsp;&nbsp;&nbsp;&nbsp; -e {{environment.name}} \
                    br
                    | &nbsp;&nbsp;&nbsp;&nbsp; remote   
</template>

<script>
import axios from 'axios'
import standardStuff from '../../../../../lib/standard-stuff'

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
            variables: [],
            unusedValues: [],
            deployables: [],
            environment: {},
            dependencies: [],
            variableRecursive: [],
            user: '',

            activeTab: 0,
            noSecureValues: true,
            editingDetails: false,
            updateDelay: null,

            configType: 'file',
            docType: 'markup-list',
        }
    },

    computed: {
        // Returns true if the environment is secure
        isSecureEnvironment: function () {
            return (this.environment && this.environment.is_secure_environment) ? true : false;
        }, // - isSecureEnvironment

        configFileContent: function () {
            let mode = this.noSecureValues ? 'type' : 'value';
            return this.jsonAsString(mode);
        }, // - configFileContent

        codeToSetEnvVariable: function( ) {
            let mode = this.noSecureValues ? 'type' : 'value';
            let json = this.jsonAsString(mode);
            let script = `export JUICE_CONFIG=env:::$(cat<<ENDDD\n${json}\nENDDD`;
            return script;
        }, // - codeToSetEnvVariable

        codeForSecretsManager: function( ) {
            let mode = this.noSecureValues ? 'type' : 'value';
            let json = this.jsonAsString('envvar');

            let vars = '';
            this.variableRecursive.forEach((v, i) => {
                let value = v.value;
                let type = v.type;
                vars += `\n# ${v.variableName}${v.description ? ('  -  '+v.description) : ''}\n`;

                if (v.example) {
                    vars += `#   [e.g. ${v.example}]\n`;
                }

                let envvar = this.environmentVariableName(v.variableName);
                switch (type) {
                    case 'number':
                        vars += `${envvar}=${this.noSecureValues ? 'NUMBER' : value}\n`;
                        break;
                    case 'boolean':
                        vars += `${envvar}=${this.noSecureValues ? 'BOOLEAN' : value}\n`;
                        break;
                    case 'text':
                    case 'string':
                    default:
                        vars += `${envvar}=${this.noSecureValues ? 'STRING' : `"${value}"`}\n`;
                        break;
                }
            })

            let script = '';
            script += '#/bin/bash\n';
            script += '#\n';
            script += '#	Save secret to AWS Secrets Manager\n';
            script += '#	https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/put-secret-value.html\n';
            script += '#\n';
            script += 'AWS_PROFILE=default\n';
            script += `REGION=${this.environment.aws_region}\n`;
            script += `SECRET_NAME=${this.deployment.aws_secretsmanager_secret}\n`;
            script += '\n';
            script += vars;
            script += '\n';
            script += '#\n';
            script += '# DO NOT CHANGE BELOW HERE\n';
            script += '#\n';
            // script += 'SecretString="{\"db.host\":\"${DB_HOST}\",\"db.port\":\"${DB_PORT}\",\"db.database\":\"${DB_NAME}\",\"db.user\":\"${DB_USERNAME}\",\"db.password\":null}"\n'
            script += `SecretString=$(cat<<ENDDD\n${json}\nENDDD\n`;
            // script += '#echo Secret is ${SecretString}\n'
            script += 'export AWS_PROFILE=${AWS_PROFILE}\\\n';
            script += 'aws secretsmanager put-secret-value \\\n';
            script += '    --region ${REGION}\\\n';
            script += '    --secret-id ${SECRET_NAME}\\\n';
            script += '    --secret-string ${SecretString}\n';

            return script;
        }, // - codeForSecretsManager

        markupDocumentationTable () {
            let str = '';
            str += `&nbsp;\n`
            str += `### Configuration variables for \`${this.applicationName}\`\n`;
            str += `_Generated by [Juice](http://juiceconfig.io) ${new Date()}_  \n`;
            str += `&nbsp;\n`;
            str += `| Name | Type | Example | Description |\n`;
            str += `| ---- | ---- | ------- | ----------- |\n`;

            this.variableRecursive.forEach((v, i) => {
                let value = v.value;
                let type = v.type;
                str += `| ${v.variableName} | ${v.type} | ${v.example} | ${v.description} |\n`;
            })

            return str;
        }, // - markupDocumentationTable

        markupDocumentationList () {
            let str = '';
            str += `&nbsp;\n`;
            str += `### Configuration variables for \`${this.applicationName}\`\n`;
            str += `_Generated by [Juice](http://juiceconfig.io) ${new Date()}_  \n`;
            str += `&nbsp;\n`;

            this.variableRecursive.forEach((v, i) => {
                let value = v.value;
                let type = v.type;
                str += '- - -\n';
                str += `#### \`${v.variableName}\`\n`;
                str += `| Description: | ${v.description ? ('**'+this.wikiText(v.description)+'**') : ''} |\n`;
                str += `| ----: | :----- |\n`;
                str += `| Type: | ${v.type} |\n`;
                str += `| Mandatory: | ${v.mandatory ? 'yes' : 'no' } |\n`;

                if (v.example) {
                    str += `| Example: | \`${this.wikiText(v.example)}\`  |\n`;
                }
            })

            return str;
        }, // - markupDocumentationList
    },

    methods: {
        ...standardStuff.methods,

        jsonAsString(mode/*value|type|envvar*/) {
            let sep = '    ';
            let obj = { };
            let self = this;

            this.variableRecursive.forEach((v, i) => {
                self.setValue(obj, mode, '', v.variableName, v.type, v.value);
            })

            let json2 = JSON.stringify(obj, '', 2);

            if (mode === 'value' || mode === 'envvar') {
                json2 = json2.split(`"${NUM_START}`).join('');
                json2 = json2.split(`${NUM_END}"`).join('');
                json2 = json2.split(`"${BOOL_START}`).join('');
                json2 = json2.split(`${BOOL_END}"`).join('');

            } else if (mode === 'type') {
                json2 = json2.replace(/"STRING"/g, 'STRING');
                json2 = json2.replace(/"NUMBER"/g, 'NUMBER');
                json2 = json2.replace(/"BOOLEAN"/g, 'BOOLEAN');
            }

            return json2;
        }, // - jsonAsString

        setValue: function(obj, mode, sofar, name, type, value) {
            // console.log(`setValue(obj, mode:${mode}, sofar:${sofar}, name:${name}, type:${type}, value:${value})`);

            // type = 'text'
            // if (name === 'host') { type = 'text'; value = 'yarp.yar.yep.com' }
            // if (name === 'port') { type = 'number'; value = 123 }
            // if (name === 'isAwesome') { type = 'boolean'; value = false }

            // If name is x.y.z, let's find the first bit (x)
            let errmsg = '';
            let pos = name.indexOf('.');

            if (pos >= 0) {
                let prefix = name.substring(0, pos);
                let suffix = name.substring(pos + 1);
                // console.log(` - prefix=${prefix}`);
                // console.log(` - suffix=${suffix}`);
                sofar = `${sofar}${prefix}.`;

                switch (typeof(obj[prefix])) {
                    case 'undefined':
                        // New object
                        obj[prefix] = { };
                        return this.setValue(obj[prefix], mode, sofar, suffix, type, value);
                        break;
                    case 'object':
                        // Existing object
                        return this.setValue(obj[prefix], mode, sofar, suffix, type, value);
                        break;
                    default:
                        // Not an object, can't set 'y.z'
                        return `Conflict setting ${sofar}.\n`;
                }

            } else {
                // New value
                // console.log(`- set it ${name}, mode=${mode}`);

                // let path = sofar ? `${sofar}.${name}` : name
                let path = `${sofar}${name}`;
                // console.log(`Zpath=${path}`);
                
                switch (mode) {
                    case 'value':
                        obj[name] = value;
                        break;

                    case 'envvar':
                        // obj[name] = `YARPX\${${this.environmentVariableName(name)}}`
                        if (type==='string' || type==='text') {
                            obj[name] = `\${${this.environmentVariableName(path)}}`;
                        } else if (type==='number') {
                            obj[name] = `${NUM_START}\${${this.environmentVariableName(path)}}${NUM_END}`;
                        } else if (type==='boolean') {
                            obj[name] = `\${${this.environmentVariableName(path)}}`;
                        } else {
                            console.log(`Unknown type for ${sofar}.${name} (${type})`);
                            return `Unknown type for ${sofar}.${name} (${type})\n`;
                        }
                        break;

                    case 'type':
                        if (type==='string' || type==='text') {
                            obj[name] = `STRING`;
                        } else if (type==='number') {
                            obj[name] = `NUMBER`;
                        } else if (type==='boolean') {
                            obj[name] = `BOOLEAN`;
                        } else {
                            console.log(`Unknown type for ${sofar}.${name} (${type})`);
                            return `Unknown type for ${sofar}.${name} (${type})\n`;
                        }
                        break;
                }
            }
        }, // - setValue

        environmentVariableName: function(name) {
            let mode = this.noSecureValues ? 'type' : 'value';

            // camelCase => snake_case
            let n2 = name.replace(/[\w]([A-Z])/g, function(m) {
                return m[0] + "_" + m[1];
            });

            n2 = n2.toUpperCase();
            n2 = n2.replace(/\./g, '_');
            n2 = n2.replace(/UR_L/g, 'URL');

            return n2;
        }, // - environmentVariableName

        downloadConfigFile: function () {
            const filename = `${this.environmentName}-${this.applicationName}.config`;
            let content = this.configFileContent;
            var myblob = new Blob([content], {
                type: 'text/json'
            });
            const url = window.URL.createObjectURL(myblob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
        }, // - downloadConfigFile

        downloadSetEnvironment: function () {
            const filename = `environment-${this.environmentName}-${this.applicationName}.sh`;
            let content = this.codeToSetEnvVariable;
            var myblob = new Blob([content], {
                type: 'text/plain',
            });
            const url = window.URL.createObjectURL(myblob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
        }, // - downloadSetEnvironment

        downloadSetSecret: function () {
            const filename = `set-secret-${this.environmentName}-${this.applicationName}.sh`;
            let content = this.codeForSecretsManager;
            var myblob = new Blob([content], {
                type: 'text/plain',
            });
            const url = window.URL.createObjectURL(myblob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
        }, // - downloadSetSecret

        downloadMarkupDocumentationTable: function () {
            const filename = `config-documentation-${this.environmentName}-${this.applicationName}-table.md`;
            let content = this.markupDocumentationTable;
            var myblob = new Blob([content], {
                type: 'text/plain',
            });
            const url = window.URL.createObjectURL(myblob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
        }, // - downloadMarkupDocumentationTable

        downloadMarkupDocumentationList: function () {
            const filename = `config-documentation-${this.environmentName}-${this.applicationName}-list.md`;
            let content = this.markupDocumentationList;
            var myblob = new Blob([content], {
                type: 'text/plain',
            });
            const url = window.URL.createObjectURL(myblob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();
        }, // - downloadMarkupDocumentationList

        // Save edited values for deployment
        saveDetails: async function () {
            let self = this;

            if (self.updateDelay) {
                clearTimeout(self.updateDelay);
            }

            self.updateDelay = setTimeout(async function () {
                self.updateDelay = null;
                const url = standardStuff.apiURL('/deployment');
                const config = standardStuff.axiosConfig(self.$loginservice.jwt);
                let result = await axios.put(url, self.deployment, config);
            }, 1000)
        }, // - saveDetails

        deleteUnusedValue: async function (variableName) {
            console.log(`deleteUnusedValue(${variableName})`);

            for (let i = 0; i < this.unusedValues.length; i++) {
                let uv = this.unusedValues[i];

                if (uv.variableName === variableName) {
                    console.log(`Found in position ${i}`);
                    uv.deleted = true;
                    return;
                }
            }
        }, // - deleteUnusedValue

        // Save variables values for new deployment
        saveVariableValues: async function () {
            console.log(`saveNewVariable()`, this.variableRecursive);

            let request = {
                environmentOwner: this.environmentOwner,
                environmentName: this.environmentName, 
                applicationName: this.applicationName,
                variableValues: {
                    // We'll put the values here
                }
            };

            // Add the known variables
            const DEBUG = true;

            this.variableRecursive.forEach(v => {
                if (!DEBUG || v.value) {
                    request.variableValues[v.variableName] = v.value;
                }
            })

            this.unusedValues.forEach(uv => {
                if (!uv.deleted && uv.value) {
                    request.variableValues[uv.variableName] = uv.value;
                }
            })

            const url = standardStuff.apiURL('/variableValues');
            const config = standardStuff.axiosConfig(this.$loginservice.jwt);
            let response = await axios.post(url, request, config);
            this.editingDetails = false;
        }, // - saveVariableValues

        trimUrl: function (url) {
            const maxlen = 70;

            if (url.length > maxlen) {
                // return `${url.substring(0, maxlen)} ...`
                return `...${url.substring(url.length - maxlen)}`;
            }

            return url;
        }, // - trimUrl

        // Escape characters for Wiki markdown
        wikiText: function (text) {
            if (!text) return '';
            let result = '';

            while (text.length > 0) {
                let c = text.charAt(0);
                text = text.substring(1);

                if (c === '\n') {
                    result += '<br/>';
                } else if (c==='|' || c==='*' || c==='_') {
                    result += '\\|';
                } else {
                    result += c;
                }
            }

            return result;
        } // - wikiText

    },//- methods

    async asyncData ({ app, params, error }) {
        let username = app.$nuxtLoginservice.user.username;
        let {owner:environmentOwner, name:environmentName} = standardStuff.methods.std_fromQualifiedName(params.environment, username);
        let applicationName = params.application;
        let user = params.userName;
        console.log(`deployment=> ${environmentOwner}, ${environmentName}, ${applicationName}`);
    
        try {
            // Params and config for all API calls
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt);

            let params = { 
                params: {
                    environmentOwner,
                    environmentName,
                    applicationName,
                }
            }

            // Select this deployment for this page
            let url = standardStuff.apiURL('/deployments');
            let res = await axios.get(url, params, config);
            if (res.data.deployments.length > 1) {
                return error({status: 500, message: 'Returned too many deployments'});
            }
            const deployment = res.data.deployments[0];
            console.log(`deployment: `, deployment);

            // Select the environment for this page
            url = standardStuff.apiURL('/environmentIndex');
            res = await axios.get(url, params, config);
            if (res.data.record.length > 1) {
                return error({status: 500, message: 'Returned too many environments'});
            }
            const environment = res.data.record;
            console.log(`environment: `, environment);

            // Import deployables to be shown in dropdown
            url = standardStuff.apiURL('/deployables');
            res = await axios.get(url, config);
            const deployables = res.data.deployables;
            console.log(`deployables: `, deployables);

            // Variables for dependencies and deployable (recursive array data)
            url = standardStuff.apiURL(`/deployable/${deployment.deployable_owner}:${deployment.deployable}/variablesConfig`);
            res = await axios.get(url, config);
            const variableRecursive = res.data;
            console.log(`variableRecursive: `, res.data);

            // Select variable values for this deployment
            url = standardStuff.apiURL(`/deployment/${environmentOwner}:${environmentName}/${applicationName}/variableValues`);
            res = await axios.get(url, config);
            const variableValues = res.data.variableValues;
            console.log(`variableValues: `, variableValues);

            // If we have any values defined that are not used, we might want
            // to keep them - perhaps they'll be added back to the deployable.
            let unusedValues = [ ];

            // Patch the variable values in to the variable list
            // This is inefficient, but the list isn't too long...
            variableValues.forEach((vv) => {
                let used = false;

                for (let i = 0; i < variableRecursive.length; i++) {
                    let v = variableRecursive[i];

                    if (v.variableName === vv.variable_name) {
                        v.value = vv.value;
                        used = true;
                        break;
                    }
                } //- for

                // If this value is not used by any defined variable, let's put it in the "unused values" list.
                if (!used) {
                    unusedValues.push({
                        variableName: vv.variable_name,
                        value: vv.value,
                        deleted: false,
                    })
                }
            }) // - variableValues.forEach

            console.log(`unusedValues: `, unusedValues);

            return {
                environmentOwner,
                environmentName,
                applicationName,
                deployment: deployment,
                environment: environment,
                deployables: deployables,
                variableRecursive: variableRecursive,
                user: user,
                unusedValues,
            }

        } catch (e) {
            console.log(`Could not fetch data:`, e);
        }
    },
}
</script>

<style lang="scss" scoped>
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

.my-values-table {
    border: solid 1px #333;
    width: 100%;
    tr {
        // border-bottom: solid 1px red;
    //   border-bottom: solid 1px #ededed;
        border-bottom: solid 1px #ddd;
    //   padding-top: 2px;
    //   padding-bottom: 2px;
        // height: 25px;
    }

    .my-values-td-label {
        padding-left: 5px;
        border-right: solid 1px #ddd;
        font-size: 13px;
        color: #333;
    }

    .my-values-td-value {
        // background-color: yellow;
        width: 50%;
        padding-left: 5px;
        padding-top: 0px;
        padding-bottom: 0px;
        input {
            border-style: none;
            font-size: 13px;
            // font-size: 14px;
            // ::placeholder {
            //     color: red;
            // }
        }
        input::-webkit-input-placeholder,
        input::-ms-input-placeholder,
        input::placeholder {
            color:#aaf;
        }
        .my-value {
            font-size: 13px;
        }
    }
}

</style>