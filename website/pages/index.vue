<template lang="pug">
  client-only
    section.section
      div(v-show="loggedIn")
        // We are logged in
        .columns
          .column.is-8
            h1.title Juice Config
            h2.subtitle A simple solution
            
            ul(style='list-style-type:disc')
              li Check out the documentation <a href="http://juiceconfig.io">here</a>.
              li Updates since you last logged in:  
              li Updates on teams
              li New deployments etc
              li Some helpful tips
            br
          
          .adBarStyle.column.is-4
            br
            p.is-small Get started quickly with our easy-to-follow tutorial:
            br
            div
              // When vid is ready, replace w - https://openbase.io/js/vue-video-player 
              //youtube(:video-id="videoId", host="https://www.youtube.com", SameSite="None", Secure)
            br 
            br
            p(is-small) Powered by:
            br
            a(href="https://tooltwist.com/")
              img.ttlogoSize(src="../assets/ttLogo.png") 
            a(href="https://www.twistresources.com/")
              img(src="../assets/trLogo.png")
                
      .columns(v-show="!loggedIn")
        // Not logged in
        .column.is-3
        .column.is-6
          loginservice-login
        .column.is-3
</template>

<script>
import Vue from 'vue';
//import VueYouTubeEmbed from 'vue-youtube-embed';
import { store } from '../store/index.js';
import { mapActions } from 'vuex';

//Vue.use(VueYouTubeEmbed)

export default {
  name: 'HomePage',

  data () {
    return {
      //videoId: '6fRvc2UPyfE',
      links: [
        `https://bulma.io/`,
        `https://buefy.org/documentation`,
        `https://materialdesignicons.com/`,
        `https://nuxtjs.org/faq/pre-processors/`,
        `https://github.com/axios/axios`,
      ],
    }
  },// - data

  computed: {
    loggedIn: function () {
      return (this.$loginservice && this.$loginservice.user);
    },
  }
}
</script>

<style>
.ttlogoSize {
  height: 11%;
  width: 65%;
  margin: 0px 0px -15px 10px;
}

.ttLogoStyle {
  margin: 5px 0px 0px 0px;
  padding: 5px 0px 0px 0px;
  height: 70%;
  width: 70%;
}

.trLogoStyle {
  margin: 0px;
  padding: 0px 0px 5px 0px;
  height: 100%;
  width: 100%;
  
}
</style>
