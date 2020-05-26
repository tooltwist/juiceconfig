<template lang="pug">
div
  nav.headerStyle.navbar.mobileStyle(role="navigation" aria-label="main navigation")
    div.navbar-brand.juiceHeaderLogo.mobile
      //a.navbar-item.linkStyle(href="/")
        img.juiceHeadStyle(src="../assets/header-logo.png") 
        //- v-if(class="mobile")
          br
          // New logo will need to be properly sized 
    
      a(class="navbar-item", href="/")
          .juiceLogo Juice.

    div.navbar-end.mobileStyle
      b-navbar-item(href="https://juiceconfig.io", target="_blank") Docs
      div.seperatorStyle.mobile(v-if="loggedIn", separator="true", custom="true") | 
      b-dropdown(v-if="loggedIn", position="is-bottom-left", aria-role="menu")
        a.navbar-item(slot="trigger", role="button")
          b-icon(icon="account")
          span Account
          b-icon(icon="menu-down")
        b-dropdown-item(custom aria-role="menuitem") Logged in as&nbsp;
          b {{ username }}
          | .
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
            i Welcome, {{username}}!
          ul.menu-list
            //b-menu-list(label="Menu")
            b-menu-list(label="")
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
  footer.footer
    div.content.has-text-centered
      p <strong>Juice Config</strong> by <a href="https://tooltwist.com">Tooltwist</a>. The source code is licensed <a href="http://opensource.org/licenses/mit-license.php"> MIT</a>. The website content is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA 4.0</a>.
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
          icon: 'android-studio',
          to: { name: 'deployables' }
        },
        {
          title: 'Environments',
          icon: 'cloud-outline',
          to: { name: 'environments' }
        },
        {
          title: 'Applications',
          icon: 'rocket',
          to: { name: 'deployments' }
        },
        {
          title: 'Users',
          icon: 'account-multiple-outline',
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
    username: function() {
      return this.loggedIn ? this.$loginservice.user.username : ''
    }
  },

  methods: {
    doLogout: function () {
      this.$loginservice.logout();
      this.$router.push('/');
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
  @media (min-width: 0em) and (max-width: 48em) {
    div.mobile {
      display: none;
    }
    div.mobileStyle {
      display: flex;
      padding: 5px;
      margin: 0px;
      //justify-content: space-evenly;
      float: right;
    }
  }


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

  .juiceHeaderLogo {
    float: left;
    display: flex;
    width: 100px;
    height: 100px;  
    box-sizing: border-box;
    //object-fit: cover;
  }

  .linkStyle {
    //display: flex; 
    width: 100%;
    height: 100px;
    overflow: visible;
    //position: absolute;
  }

  .juiceHeadStyle {
    width: 150px;
    height: 150px;
    margin: 0px 20px;
    //object-fit: cover;
    box-sizing: border-box;
    border: 0;
    position: absolute;
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
    margin: 35px 0px;
  }

  .dropMenuStyle {
    text-align: right;
    position: relative;
  }

  .contentStyle {
    padding: 0px;
    margin: 0px;
  }

  .sidenav {
    position: fixed;
    z-index: 1;
    top: 80px;
    left: 10px;
    overflow-x: hidden;
  }
</style>
