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

// //Vue.use(Vuex)

// // // Config, api and auth details for axios call
// // const config = standardStuff.axiosConfig(Loginservice._authservice.jwt);

import axios from 'axios';
import standardStuff from '../lib/standard-stuff';

const state = {
    myOrganisations: [ ],
    myPendingRequests: [ ], 
    myAdmins: [ ],
    currentUsername: '',
}

const mutations = {
	SET_ORGS (state, { username, myOrganisations }) {
        state.currentUsername = username
		state.myOrganisations = myOrganisations
    },
    
    SET_REQS (state, { username, myPendingRequests }) {
        state.currentUsername = username
        state.myPendingRequests = myPendingRequests
    },

    SET_CURRENT_USER (state, { username, myOrganisations }) {
        state.currentUsername = username
        state.myOrganisations = myOrganisations
    },

    // SET_ADMINS (state, { username, my})
}

const actions = {
	async checkMyOrgs ({ commit, vm, error }) {
        vm = this._vm

        if (vm.$loginservice.user) {
            try {
                const me = vm.$loginservice.user.username
                const url = standardStuff.apiURL('/organisations');
                const config = standardStuff.axiosConfig(vm.$loginservice.jwt);
    
                const params = { 
                    headers: {
                        'Authorization': 'Bearer ' + vm.$loginservice.jwt
                    },
    
                    params: {
                        userName: me
                    }
                }

                let res = await axios.get(url, params, config) 
                const organisations = res.data.organisations

                commit('SET_ORGS', { username: me, myOrganisations: organisations })

                console.log('state: ', state.myOrganisations) 
            } catch (e) {
                console.log('Error while updating myOrganisations: ', e)
            }
        } else {
            commit('SET_CURRENT_USER', { username: null, myOrganisations: [ ] })
        }

        return
    },
    
    async checkMyRequests ({ commit, vm, error }) {
        vm = this._vm;

        if (vm.$loginservice.user) {
            try {
                const me = vm.$loginservice.user.username
                const url = standardStuff.apiURL('/pendingRequests');
                const config = standardStuff.axiosConfig(vm.$loginservice.jwt);
    
                const params = { 
                    headers: {
                        'Authorization': 'Bearer ' + vm.$loginservice.jwt
                    },
    
                    params: {
                        username: me
                    }
                }

                let res = await axios.get(url, params, config) 
                const pendingRequests = res.data.pendingRequests

                commit('SET_REQS', { username: me, myPendingRequests: pendingRequests })

                console.log('state: ', state.myPendingRequests) 
            } catch (e) {
                console.log('Error while updating myPendingRequests: ', e)
            }
        } else {
            commit('SET_CURRENT_USER', { username: null, myPendingRequests: [ ] })
        }
    },

        
    async checkMyAdmins ({ commit, vm, error }) {
        vm = this._vm;

        if (vm.$loginservice.user) {
            try {
                const me = vm.$loginservice.user.username
                const url = standardStuff.apiURL('/pendingRequests');
                const config = standardStuff.axiosConfig(vm.$loginservice.jwt);
    
                const params = { 
                    headers: {
                        'Authorization': 'Bearer ' + vm.$loginservice.jwt
                    },
    
                    params: {
                        username: me
                    }
                }

                let res = await axios.get(url, params, config) 
                const pendingRequests = res.data.pendingRequests

                commit('SET_REQS', { username: me, myPendingRequests: pendingRequests })

                console.log('state: ', state.myPendingRequests) 
            } catch (e) {
                console.log('Error while updating myPendingRequests: ', e)
            }
        } else {
            commit('SET_CURRENT_USER', { username: null, myPendingRequests: [ ] })
        }
    }


}

const store = () => {
    return new Vuex.Store({
        state,
        mutations,
        actions,
    })
}

export default store