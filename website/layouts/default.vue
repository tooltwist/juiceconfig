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
          span Menu
            b-tag(v-show="$store.state.myPendingRequests.length > 0", rounded, type="is-danger is-outlined") {{ $store.state.myPendingRequests.length }}
          b-icon(icon="menu-down")
        b-dropdown-item(custom aria-role="menuitem") Signed in as&nbsp;
          b {{ username }} 
        hr(class="dropdown-divider")
        b-dropdown-item(href="/myAccount", value="My Account")
          b-icon(icon="account") 
          span My Account
            b-tag(v-show="$store.state.myPendingRequests.length > 0", rounded, type="is-danger is-outlined") {{ $store.state.myPendingRequests.length }}
        b-dropdown-item(value="Logout", @click="doLogout")
          b-icon(icon="logout") 
          | Logout

  client-only
    .section.main-content.contentStyle
      .columns(v-if="loggedIn")
        aside.column.is-3.section
          p.menu-label
            i Welcome, {{ username }}
            br
          ul.menu-list
            b-menu-list(label="")
              select.select(v-model="userDefault")
                option(disabled) Switch account view:
                option(v-for="user in listOfUserOptions", :value="user") {{ user }}
          ul.menu-list
            b-menu-list(label="")
              li(v-for="(item, key) of items", :key="key")
                nuxt-link(v-if="item.title != 'Users'", :to="`/user/${userDefault}/${item.to.name}`", exact-active-class="activeHighlight")
                  b-icon(:icon="item.icon")
                  | {{ item.title }}
                nuxt-link(v-if="(userDefault != username) && (item.title == 'Users') && isAdmin()", :to="`/user/${userDefault}/${item.to.name}`", exact-active-class="activeHighlight")
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
import axios from 'axios';
import standardStuff from '../lib/standard-stuff';
import store from 'vuex';
 
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
          // 'index.vue'
          to: { name: 'home' }
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
    }
  },

  computed: {
    // Returns true if user is logged in
    loggedIn: function() {
      return (this.$loginservice && this.$loginservice.user) ? true : false;
    },

    // Returns the username provided by loginservice account or null if not logged in
    username: function() {
      return this.loggedIn ? this.$loginservice.user.username : '';
    },

    // Returns filtered list of users organisations from VueX store
    listOfOrgs: function() {
      return this.$store.state.myOrganisations;
    },

    // Returns filtered list of users orgs and username for switching dashboard view 
    listOfUserOptions: function() {
      let users = [];

      users[0] = this.$loginservice.user.username; // personal account

      let i = 1; 
      this.listOfOrgs.forEach(user => {
        users[i] = user.org_username; // org accounts 
        i++;
      })

      return users;
    },

    // Getter returns the current user, setter updates currentUsername in VueX store
    userDefault: {
      get: function() { // getter
        let currentUsername = this.$store.state.currentUsername;
        return (this.username == '') ? '' : currentUsername;
      },

      set: function(value) { // setter 
        // Update store with new user
        this.$store.dispatch('checkUser', {
          user: value,
        });

        // Import admins to check the permissions for new state.currentUsername
        this.$store.dispatch('checkMyAdmins');

        // Update url 
        this.$router.push(`/user/${value}/home`);
      },
    }, 
  },

  mounted() {
    console.log('Mounted');
    this.$store.dispatch('checkUser', { 
      user: this.userDefault, // empty string when initialising 
    });
    this.$store.dispatch('checkMyOrgs');
    this.$store.dispatch('checkMyRequests');
    this.$store.dispatch('checkMyAdmins');
  },

  methods: {
    ...standardStuff.methods,

    doLogout: function() {
      this.$loginservice.logout();
      this.$router.push('/');
    },

    // Returns true if username is an admin or owner of selected organisation
    isAdmin: function() { 
      let admins = this.$store.state.myAdmins;

      for (let i = 0; i < admins.length; i++) {
        if (admins[i].user_username == this.username) {
          return true;
        } 
      }
      
      return false;
    },
  },  
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
