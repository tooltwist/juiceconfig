import Vue from 'vue'
import Vuex from 'vuex'

// Modules
//import orgs from './modules/orgs.js'

Vue.use(Vuex)

// export const store = new Vuex.Store({
//     state() {
//        return { organisation: 'bird' } 
//     },
    
//     //modules: {
//         //orgs: orgs,
//     //},

//     // Example of nuxtServerInit - must use async/await, must be in index.js
//     // actions: {
//     //   async nuxtServerInit ({ commit }, { req }) {
//     //     await dispatch('core/load')
//     //            OR if not using asynchronously
//     //     if (req.session.user) {
//     //       commit('SET_ORGS', req.session.user)
//     //     }
//     //   }
//     // }
// })

//export default store

import axios from 'axios';
import standardStuff from '../lib/standard-stuff';

const state = {
    myOrganisations: [],
    currentUsername: '',
}

const mutations = {
	SET_ORGS (state, { username, myOrganisations }) {
        state.currentUsername = username
		state.myOrganisations = myOrganisations
    },
    
    SET_CURRENT_USER (state, { username, myOrganisations }) {
        state.currentUsername = username
        state.myOrganisations = myOrganisations
    }
}

const actions = {
	async checkMyOrgs ({ commit }) {
        let vm = this._vm
        console.log('vm: ', vm)
        if (vm.$loginservice.user) {
            const me = vm.$loginservice.user.username
            const url = standardStuff.apiURL('/organisations');

            const params = { 
                headers: {
                    'Authorization': 'Bearer ' + vm.$loginservice.jwt
                },

                params: {
                    userName: me
                }
            }

            let { data } = await axios.get(url, params)
            console.log('data: ', data)

            commit('SET_ORGS', { username: me, myOrganisations: data.organisations })

        } else {
            commit('SET_CURRENT_USER', { username: null, myOrganisations: [ ] })
        }

        return
	},
}

const store = () => {
    return new Vuex.Store({
        state,
        mutations,
        actions,
    })
}

export default store