<template lang="pug">
  client-only
    section.section
      div(v-show="loggedIn")
        // We are logged in
        h3.title Useful links
        .link(v-for="l in links")
          a(:href="l") {{l}}
          br
      .columns(v-show="!loggedIn")
        // Not logged in
        .column.is-3
        .column.is-6
          loginservice-login
        .column.is-3
</template>

<script>
export default {
  name: 'HomePage',

  data () {
    return {
      links: [
        `https://bulma.io/`,
        `https://buefy.org/documentation`,
        `https://materialdesignicons.com/`,
        `https://nuxtjs.org/faq/pre-processors/`,
        `https://github.com/axios/axios`,
      ]
    }
  },// - data

  computed: {
    loggedIn: function () {
      return (this.$loginservice && this.$loginservice.user)
    }
  }
}
</script>

<style>

</style>
