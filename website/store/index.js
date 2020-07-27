import Vue from 'vue'
import Vuex from 'vuex'

// Modules
import orgs from '@/store/modules/orgs.js'

Vue.use(Vuex)

const store = new Vuex.Store({

    modules: {
        orgs,
    },
})

export default store