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

    async asyncData ({ app, error }) {
        let jwt = app.$nuxtLoginservice.jwt
        let userName = app.$nuxtLoginservice.user
        console.log('userName = ', userName.username)

        let config = {
            headers: {
                authorization: `Bearer ${jwt}`,
            }
        }

        try {
            // Select the deployable for this page
            const url = standardStuff.apiURL('/myaccount')
            console.log(`Calling ${url}`);
            let res = await axios.get(url, { 
                params: {
                    userName: userName.username
                }
            })
            console.log(`API returned`, res.data);
            const user = res.data.record

            // Select deployables for this page
            const url2 = standardStuff.apiURL('/usersDeployables')
            let res2 = await axios.get(url2, {
                params: { 
                    userID: user.id
                }
            })
            console.log(`API2 returned`, res2.data);
            const deployables = res2.data.deployables

            // Select environments for this page
            const url3 = standardStuff.apiURL('/accountEnvironments')
            let res3 = await axios.get(url3, {
                params: { 
                    userID: user.id
                }
            })
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