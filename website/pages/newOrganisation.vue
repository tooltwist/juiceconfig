<template lang="pug">
section.section
    h1.title Create a new organisation:
    b-notification(aria-close-label="Close notification")
        | 'Organisations' allow users to work collaboratively in teams and share content. When you create an organisation you will
        | be automatically set as the admin. You can add more admins to share management and you can remove your status as admin 
        | provided that there is at least one existing admin. 
        | This is a paid feature which can be cancelled at any time. 

    form.formStyle
        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Organisation name: 
            .field-body
                .field
                    .control
                        //input.input(v-model="form.orgName")

        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Admin: 
            .field-body
                .field
                    .control {{this.currentUser}}
        .field.is-horizontal
            .field-label.is-normal
                label.label(style="width:200px;") Generated display name: 
            .field-body
                .field
                    .control
                        p ID
    br
    br

    b-notification(aria-close-label="Close notification")
        | You can invite existing users with Juice accounts to join your organisation. This can be done below, 
        | or after the account has been setup in the My Account/Organisations menu. Once the user has accepted 
        | your invitation, they will have access to everything added to your Organisations account. They will 
        | not be able to see deployables, environments or deployments privately added from your personal account.
    
    p Invite users - this will change their status to pending in the 'org_users' db table until they accept the request. If denied, it will delete the record.

    br
    br

    p Payment details! To be added at a later date!

    div.buttons.has-text-weight-normal(style="float:right;")
        b-button.is-primary.is-small(tag="nuxt-link", to="/newDeployable")  Create

</template>

<script>
import axios from 'axios'
import standardStuff from '../lib/standard-stuff'

export default {
    data () {
        return {
            form: {
                orgName: '',
                owner: currentUser,
                displayName: '',
            },
            currentUser: '',
        }

    }, // - data

    // This function transforms the entered organisation name into the correct format for the display name (no spaces, lowercase)
    // The user can change the display name if they do not like the output. 



    async asyncData ({ app, params, error }) {
        let currentUser = app.$nuxtLoginservice.user.username

        return {
            currentUser: currentUser,
        }
    }
}
</script> 

<style scoped>

</style>