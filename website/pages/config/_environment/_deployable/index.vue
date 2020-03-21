<template lang="pug">
section.section
    h1.title(class="is-paddingless is-marginless") Create a New Configuration
    p(class="is-size-5 has-text-weight-semibold is-italic") Deployment {{ deployableName }} on {{ environmentName }}
    br
    p Insert variable values:
    form(v-for="(variable, index) in variableRecursive") 
        div.formStyle(class="field is-horizontal")
            div(class="field-label is-normal")
                label(class="label", style="width:200px;") {{ variable.variableName }}: 
            div(class="field-body")
                div(class="field")
                    p(class="control")
                        input(class="input", style="width:100%;", type="text", v-model="variable.value", placeholder="Configuration Value")
    br
    div(class="field is-grouped is-grouped-right")
        p(class="control")
            a(@click="submitConfig", class="button is-primary", style="background-color:orange") Submit
        p(class="control")
            b-button(class="button is-danger is-outlined is-light", tag="nuxt-link", to="/environments") Cancel

    // Submit Modal 
    div(v-show="submitModal")
        transition(name="modal")
            div(class="modal-mask")
                div(class="modal-wrapper")
                    div(class="modal-container")
                        div(class="modal-header")
                            slot(name="header")
                                div(class="is-size-5 has-text-weight-semibold") Add New Configuration:
                                i Adding new configuration for {{ deployableName }} on {{ environmentName }}
                            div(class="modal-body")
                                slot(name="body")
                                    article(class="message is-info is-small")
                                        div(class="message-body") Please check fields for missing or incorrect values before saving.
                                    div.formStyle(v-for="variables in variableRecursive")
                                        p {{variables.variableName}}: {{variables.value}}
                            div(class="buttons is-centered")
                                b-button(@click.stop="saveNewVariable",  type="is-light", size="is-small")  Save    
                                b-button(@click="submitModal = false", type="is-danger", size="is-small") Cancel
</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig

export default {
    data () {
        return {
            environmentName: '',
            deployableName: '',
            variables: [],
            deployables: [],
            environments: [],
            dependencies: [],
            submitModal: false,
            variableRecursive: [],
        }
    },

    methods: {
        // Submitting the configuration values to a modal for confirmation (for now)
        submitConfig() {
            this.submitModal = true
            console.log(this.variableRecursive)
        }
    },

    async asyncData ({ app, params, error }) {
        let environmentName = params.environment
        let deployableName = params.deployable
        try {

        let jwt = app.$nuxtLoginservice.jwt

        let config = {
            headers: {
                authorization: `Bearer ${jwt}`,
            }
        }   
           
        // Select the environment for this page
        const url = `${protocol}://${host}:${port}/environmentIndex`
        console.log(`Calling ${url}`);
        let res = await axios.get(url, { 
            params: {
                environmentName: environmentName
            }
        })
        console.log(`API returned`, res.data);
        const environment = res.data.record

        // Import deployables to be used in deployments form
        const url2 = `${protocol}://${host}:${port}/deployables`
        let res2 = await axios.get(url2, config)

        const deployables = res2.data.list

        // Select the variables for this deployable
        const url3 = `${protocol}://${host}:${port}/variables`
        let res3 = await axios.get(url3, { 
            params: {
                deployableName: deployableName
            }
        })
        console.log(`API3 returned`, res3.data);
        const variables = res3.data.variables

        // Import dependencies with 'deployableName' as parent
        const url4 = '${protocol}://${host}:${port}/dependencies1'
        let res4 = await axios.get(url4, {
            params: {
                deployableName: deployableName
            }
        })
        console.log(`API4 returned`, res4.data)
        const dependencies = res4.data.dependencies

        // // Select all variables for dependencies
        // const url5 = '${protocol}://${host}:${port}/variablesAll'
        // let res5 = await axios.get(url5)
        
        // const variablesDepend = res5.data.variables

        // Variables for dependencies and deployable (recursive array data)
        const url6 = '${protocol}://${host}:${port}/variablesConfig'
        let res6 = await axios.get(url6, {
            params: {
                deployable: deployableName
            }
        })
        console.log(`API6 returned`, res6.data)
        const variableRecursive = res6.data

        return {
            environmentName: environmentName,
            deployableName: deployableName,
            environment: environment,
            deployables: deployables,
            variables: variables,
            dependencies: dependencies,
            variableRecursive: variableRecursive,
        }
        } catch (e) {
            console.log(`Could not fetch data:`, e)
        }
    }
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

</style>