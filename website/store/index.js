import Vue from 'vue'
import Vuex from 'vuex'

// Modules
import orgs from '@/store/modules/orgs.js'

Vue.use(Vuex)

const store = new Vuex.Store({
    state() {
       return { organisations: [] } 
    },
    
    modules: {
        orgs,
    },

    // Example of nuxtServerInit - must use async/await, must be in index.js
    // actions: {
    //   async nuxtServerInit ({ commit }, { req }) {
    //     await dispatch('core/load')
    //            OR if not using asynchronously
    //     if (req.session.user) {
    //       commit('SET_ORGS', req.session.user)
    //     }
    //   }
    // }
})

console.log('Hello from store')
console.log('Orgs = ', store.state.organisations)
console.log('Orgs = ', orgs.state)

//export default store