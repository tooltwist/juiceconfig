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
                            td(style="justify:left;") {{fullname}} {{user.id}}
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
                    article(class="message is-gray is-small")
                        div(class="message-body")
                            p These are the deployables created by your account.
                b-tab-item(label="Environments")
                    article(class="message is-gray is-small")
                        div(class="message-body")
                            p These are the environments created by your account.

</template>

<script>
import axios from 'axios'
import webconfig from '~/protected-config/website-config'
const { protocol, host, port } = webconfig
//import standardStuff from '/opt/Development/Projects/juice/juiceconfig/website/lib/standard-stuff.js'

export default {
    data () {
        return {
            user: [ ],
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
            const url = `${protocol}://${host}:${port}/myaccount`
            console.log(`Calling ${url}`);
            let res = await axios.get(url, { 
                params: {
                    userName: userName.username
                }
            })
            console.log(`API returned`, res.data);
            const user = res.data.record

            return {
                user: user,
            }
        } catch (e) {
            console.log(`Could not fetch user details:`, e)
        }
    }
}


</script>
<style scoped>

</style>