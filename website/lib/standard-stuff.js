import webconfig from '~/protected-config/website-config'

// function api_url_prefix() {
//   const { protocol, host, port, prefix } = webconfig
//   const urlPrefix = `${protocol}://${host}:${port}/${prefix}`
//   return urlPrefix
// }

// function endpoint() {
//   const { protocol, host, port } = webconfig
//   const endpoint = `${protocol}://${host}:${port}`
//   return endpoint
// }

function apiURL(path) {
  const { protocol, host, port, prefix } = webconfig
  const url = `${protocol}://${host}:${port}/${prefix}${path}`
  return url
}


export default {
  // api_url_prefix,
  // endpoint,
  apiURL,

  methods: {

    std_environmentName: function(environment) {
      return this.std_toQualifiedName(environment.owner, environment.name)
    },

    std_deployableName: function(environment) {
      return this.std_toQualifiedName(environment.owner, environment.name)
    },

    std_environmentDisplay: function(environment, abbreviate/*optional*/) {
      return this.std_toQualifiedDisplay(environment.owner, environment.name, abbreviate)
    },

    std_deployableDisplay: function(environment, abbreviate/*optional*/) {
      return this.std_toQualifiedDisplay(environment.owner, environment.name, abbreviate)
    },

    /*
     *  Convert owner:name to {owner, name}
     */
    std_fromQualifiedName: function(path, defaultOwner) {
      console.log(`std_fromQualifiedName(${path}, ${defaultOwner})`);
      
      let pos = path.indexOf(':')
      if (pos < 0) {
        // Owner not specified
        if (defaultOwner) {
          return { owner: defaultOwner, name: path }
        } else if (this.$loginservice && this.$loginservice.user) {
          return { owner: this.$loginservice.user.username, name: path }
        } else {
          console.log(`std_fromQualifiedName - defaultUser not provided`);
          return { owner: 'unknown', name: path }
        }
      } else {
        // Owner specified
        let owner = path.substring(0, pos)
        let name = path.substring(pos + 1)
        return {
          owner,
          name
        }
      }
    },

    /*
     *  Convert {owner, name} to owner:name
     */
    std_toQualifiedName: function(owner, name) {
      if (owner) {
        return `${owner}:${name}`
      } else {
        let myname = this.$loginservice.user.username
        return `${myname}:${name}`
      }
    },

    /*
     *  Convert {owner, name} to owner:name, with the owner dimmed,
     *  or simply to name, if the owner is the current user.
     */
    std_toQualifiedDisplay: function(owner, name, abbreviate/*optional*/) {
      let myname = this.$loginservice.user.username
      if (!owner) {
        owner = myname
      }
      if (abbreviate && owner===myname) {
        return `${name}`
      } else {
        return `<span class="juice-owner-dimmed">${owner}:</span>${name}`
        // return `${myname}&nbsp;:&nbsp;<b>${name}</b>`
      }
    },

    stdOwnerPrefix: function(owner) {
      if (!owner) {
        return 'global:'
      }
      if (this.$loginservice && this.$loginservice.user && this.$loginservice.user.username===owner) {
        return ''
      }
      return `${owner}:`
    },


    validUrl: function (url) {
      return url && (url.startsWith('http://') || url.startsWith('https://'))
    },


  }
}