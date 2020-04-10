<template lang="pug">
    section.section
        div(v-if="loggedIn")
            h1.title My Account
            b-tabs(v-model="activeTab", :animated="false")
                b-tab-item(label="Account Details")
                    table(style="width:80%")
                        tr  
                            td(style="justify:right;") 
                                label Full name: 
                            td(style="justify:left;") {{fullname}} (ID: {{user.id}})
                        tr  
                            td(style="justify:right;") 
                                label Email:
                            td(style="justify:left;") {{user.email}}
                        tr  
                            td(style="justify:right;") 
                                label Role:
                            td(style="justify:left;") {{user.role}}
                        tr  
                            td(style="justify:right;") 
                                label Access:
                            td(style="justify:left;") {{user.access}}
                b-tab-item(label="Deployables")
                    b-table(:data="deployables", focusable)
                        template(slot-scope="props")
                            b-table-column(field="project", label="Your Projects")
                                | {{props.row.owner}}:{{ props.row.name }}
                            b-table-column(field="product owner", label="Product Owner")
                                | {{ props.row.product_owner }}
                            b-table-column(field="description", label="Description")
                                | {{ props.row.description }}
                            b-table-column(field="access", label="Access")
                                | {{ props.row.access }}
                b-tab-item(label="Environments")
                    b-table(:data="environments", focusable)
                        template(slot-scope="props")
                            b-table-column(field="project", label="Your Projects")
                                | {{props.row.owner}}:{{ props.row.name }}
                            b-table-column(field="type", label="Type")
                                | {{ props.row.type }}
                            b-table-column(field="description", label="Description")
                                | {{ props.row.description }}
                            b-table-column(field="notes", label="Notes")
                                | {{ props.row.notes }}
</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
    data () {
        return {
            user: [ ],
            deployables: [ ],
            environments: [ ],
        }
    },

    computed: {
        loggedIn: function() {
        if (this.$loginservice && this.$loginservice.user) {
            return true
        }
        return false
        },
        fullname: function() {
        return this.loggedIn ? this.$loginservice.user.fullname : ''
        }
    },

    async asyncData ({ app, params, error }) {
        let userName = app.$nuxtLoginservice.user
        try {
            // Select the deployable for this page
            const url = standardStuff.apiURL('/myaccount')
            const params = { 
                params: {
                    userName: userName.username
                }
            }
            const config = standardStuff.axiosConfig(app.$nuxtLoginservice.jwt)
            console.log(`Calling ${url}`);
            let res = await axios.get(url, params, config)
            console.log(`API returned`, res.data);
            const user = res.data.record

            // Select deployables for this page
            const url2 = standardStuff.apiURL('/usersDeployables')
            const params2 = {
                params: { 
                    userID: user.id
                }
            }
            let res2 = await axios.get(url2, params2, config)
            console.log(`API2 returned`, res2.data);
            const deployables = res2.data.deployables

            // Select environments for this page
            const url3 = standardStuff.apiURL('/accountEnvironments')
            const params3 = {
                params: { 
                    userID: user.id
                }
            }
            let res3 = await axios.get(url3, params3, config)
            console.log(`API3 returned`, res3.data);
            const environments = res3.data.environments

            return {
                user: user,
                deployables: deployables,
                environments: environments,
            }
        } catch (e) {
            console.log(`Could not fetch user details:`, e)
        }
    }
}


</script>
<style scoped>

</style>