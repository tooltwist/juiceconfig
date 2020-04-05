export default {

  methods: {

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