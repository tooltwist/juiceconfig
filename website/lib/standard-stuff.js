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

let urlPrefix = null

function apiURL(path) {

  if (urlPrefix) {
    const url = `${urlPrefix}${path}`
    console.log(`API endpoint is ${url}`)
    return url
  }
  const prefix = 'api'

  // Need to find where to call the API
  //  If we have a config file, use it. Otherwise assume the webserver also provides the API.
  const mode = process.env.NODE_ENV // Hard baked in during generate
  console.log(`Mode is ${mode}`);
  if (mode !== 'production') {
    // Development mode - use a config file.
    const webconfig = require('~/protected-config/website-config.js')
    const { protocol, host, port } = webconfig.default
    console.log(`webconfig = `, webconfig);    
    urlPrefix = `${protocol}://${host}:${port}/${prefix}`
    console.log(`Development mode API endpoint is ${urlPrefix}`)
    const url = `${urlPrefix}${path}`
    return url
  }

  // Production mode - assume the web server is the API server.
  const protocol = window.location.protocol
  const host = window.location.hostname
  const port = window.location.port
  urlPrefix = `${protocol}//${host}:${port}/${prefix}`
  console.log(`API endpoint is ${urlPrefix}`)
  const url = `${urlPrefix}${path}`
  return url
}

/*
 *  Return a configuration for axios.
 *  If called from asyncData:
 *    let jwt = app.$nuxtLoginservice.jwt
 * From a component:
 *    let jwt = this.$loginservice.jwt
 */
function axiosConfig(jwt) {
  let config = {
    headers: {
      authorization: `Bearer ${jwt}`,
    }
  }
  return config
}


export default {
  // api_url_prefix,
  // endpoint,
  apiURL,
  axiosConfig,

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

    // Return a string for example commands, for the AWS_PROFILE environment variable.
    std_myProfile: function (environment) {
      if (environment.aws_profile) {
        return environment.aws_profile
      }
      return '<YOUR_PROFILE_HERE>'
    },

    // Return a string for example commands, for the AWS_PROFILE environment variable.
    std_myRegion: function (environment) {
      if (environment.aws_region) {
        return environment.aws_region
      }
      return '<YOUR_PROFILE_HERE>'
    }
  }
}