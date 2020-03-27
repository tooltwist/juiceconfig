<template lang="pug">
  client-only
    section.section
      div(v-show="loggedIn")
        // We are logged in
        div(class="tile is-ancestor")
          div(class="tile is-vertical is-11")
            div(class="tile")
              div(class="tile is-parent is-vertical is-8")
                article(class="tile is-child notification is-white")
                  p(class="title") Juice Config 
                  p(class="subtitle") A simple solution
                  ul(style='list-style-type:disc')
                    li Check out the documentation <a href="http://juiceconfig.io">here</a>.
                    li This is to test the format. Blahb lah sdinve lorme ajns  eovine aldneinv. OInskkdm. knscinwe aoicnsjj. 
                    li Some helpful tips
                    li Maybe a noice shot of the docs or an infographic, how cute
                  br
                  p Here are some useful links:
                  div(class="content")
                    .link(v-for="l in links")
                      a(:href="l") {{l}}
              div(class="tile is-parent is-vertical is-5")
                article(class="tile is-child notification is-white")
                  p(class="is-small") Get started quickly with our easy-to-follow tutorial:
                  br
                  div
                    youtube(:video-id="videoId")
                article(class="tile is-child notification is-white")
                  p(is-small) Powered by:
                  a(href="https://tooltwist.com/")
                    img.ttLogoStyle(src="../assets/ttLogo.png") 
                  a(href="https://www.twistresources.com/")
                    img.trLogoStyle(src="../assets/trLogo.png")
                
      .columns(v-show="!loggedIn")
        // Not logged in
        .column.is-3
        .column.is-6
          loginservice-login
        .column.is-3
</template>

<script>
import Vue from 'vue'
import VueYouTubeEmbed from 'vue-youtube-embed'

Vue.use(VueYouTubeEmbed)

export default {
  name: 'HomePage',

  data () {
    return {
      videoId: '6fRvc2UPyfE',
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
.containStyle {
  display: flex;
  justify-content: space-evenly;
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
