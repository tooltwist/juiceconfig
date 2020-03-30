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
                            td(style="justify:left;") {{fullname}}
                        tr  
                            td(style="justify:right;") 
                                label Email:
                            td(style="justify:left;") Display data
                        tr  
                            td(style="justify:right;") 
                                label Role:
                            td(style="justify:left;") Display data
                        tr  
                            td(style="justify:right;") 
                                label Access:
                            td(style="justify:left;") Display data
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
export default {
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
}
</script>
<style scoped>

</style>