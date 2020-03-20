<template lang="pug">
div 
  nav.headerStyle(class="navbar" role="navigation" aria-label="main navigation")
    div(class="navbar-brand")
      a(class="navbar-item", href="/")
        .juiceLogo Juice.

    div(class="navbar-end")
      b-navbar-item(href="https://juiceconfig.io", target="_blank") Documentation
      div.seperatorStyle(v-if="loggedIn", separator="true", custom="true") | 
      b-dropdown(v-if="loggedIn", position="is-bottom-left", aria-role="menu")
        a(class="navbar-item", slot="trigger", role="button")
          b-icon(icon="account")
          span {{ fullname }}
          b-icon(icon="menu-down")
        b-dropdown-item(custom aria-role="menuitem") Logged in as {{ fullname }}
        b-dropdown-item(href="/myAccount", value="My Account")
          b-icon(icon="account") 
          | My Account
        b-dropdown-item(value="Logout", @click="doLogout")
          b-icon(icon="logout") 
          | Logout

  client-only
    .section.main-content.contentStyle
      .columns(v-if="loggedIn")
        aside.column.is-3.section
          p.menu-label(v-if="loggedIn")
            //| Welcome, {{fullname}}!
          ul.menu-list
            b-menu-list(label="Menu")
              li(v-for="(item, key) of items", :key="key")
                nuxt-link(:to="item.to", exact-active-class="activeHighlight")
                  b-icon(:icon="item.icon")
                  | {{ item.title }}
          br
          ul.menu-list
            b-menu-list(label="Actions")
              a.href(href="#", @click="doLogout")
                b-icon(icon="logout")
                | Logout
        div.container.column.is-9
          nuxt
      div(v-else)
        nuxt
</template> 

<script>
export default {
  data () {
    return {

      /*
       *  Icons defined at https://materialdesignicons.com
       */
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Deployables',
          icon: 'atom',
          to: { name: 'deployables' }
        },
        {
          title: 'Environments',
          icon: 'cloud',
          to: { name: 'environments' }
        },
        {
          title: 'Users',
          icon: 'account-multiple',
          to: { name: 'users' }
        }
      ],
      isActive: true,
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
  methods: {
    doLogout: function () {
      this.$loginservice.logout()
    }
  }
}
</script>

<style lang="scss">
  // Import Bulma's core
  @import "~bulma/sass/utilities/_all";

  // Set your colors
  $primary: orange;
  $primary-invert: findColorInvert($primary);
  $twitter: #4099FF;
  $twitter-invert: findColorInvert($twitter);

  // Setup $colors to use as bulma classes (e.g. 'is-twitter')
  $colors: (
      "white": ($white, $black),
      "black": ($black, $white),
      "light": ($light, $light-invert),
      "dark": ($dark, $dark-invert),
      "primary": ($primary, $primary-invert),
      "info": ($info, $info-invert),
      "success": ($success, $success-invert),
      "warning": ($warning, $warning-invert),
      "danger": ($danger, $danger-invert),
      "twitter": ($twitter, $twitter-invert)
  );

  $navbar-item-color: white;

  // Links
  $link: $primary;
  $link-invert: $primary-invert;
  $link-focus-border: $primary;

  // Change default media settings 
  $navbar-breakpoint: $tablet;

  // Import Bulma and Buefy styles
  @import "~bulma";
  @import "~buefy/src/scss/buefy";

// Other styles
  .icon {
    margin-right: 6px;
  }

  .buttonStyle {
    padding: 10px;
    margin: 10px;
    color: 255,165,0, 0.9;
  }

  .juiceLogo {
    float: left;
    color: white;
    text-emphasis: bold;
    font-size: 30px;
    font-weight: bold;
    font-style: italic;
    padding: 5px 15px 5px 15px;
    margin: 5px;
  }

  .headerStyle {
    background-color: rgba(255, 166, 0, 0.884);
    
  }

  .activeHighlight {
    background-color: rgba(255, 165, 0, 0.5);
    width: 100%;
    display: flex;
  }

  .seperatorStyle {
    color: white;
    display: flex;
    justify-content: space-evenly;
    margin: 27px 0px;
  }

  .dropMenuStyle {
    text-align: right;
    position: relative;
  }

  .contentStyle {
    padding: 0px;
    margin: 0px;
  }
</style>
