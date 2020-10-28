import Vue from 'vue'
import Vuex from 'vuex'

// Modules
//import orgs from './modules/orgs.js'

// New module method:
/*
export const state = () => ({
    myOrganisations: [ ],
    myPendingRequests: [ ], 
    myAdmins: [ ],
    currentUsername: '',
   // currentOrg: '',
})

export const mutations = {
	SET_ORGS (state, { username, myOrganisations }) {
        //state.currentUsername = username
		state.myOrganisations = myOrganisations
    },
    
    SET_REQS (state, { username, myPendingRequests }) {
        //state.currentUsername = username
        state.myPendingRequests = myPendingRequests
    },

    SET_CURRENT_ORG (state, { username, myOrganisations }) {
        //state.currentUsername = username // changes to private user acc ??
        state.myOrganisations = myOrganisations
    },

    SET_CURRENT_USER (state, { username }) {
        state.currentUsername = username
    },

    SET_CURRENT_ADMINS (state, { username, myAdmins }) {
        //state.currentUsername = username
        state.myAdmins = myAdmins
    },
}
  

export const actions = {
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

                console.log('checkOrgs myOrganisations: ', state.myOrganisations) 
                //console.log('checkOrgs currentUser: ', state.currentUsername) 
                
            } catch (e) {
                console.log('Error while updating myOrganisations: ', e)
            }
        } else {
            commit('SET_CURRENT_ORG', { username: null, myOrganisations: [ ] })
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

                console.log('checkMyRequests myPendingRequests: ', state.myPendingRequests) 
                //console.log('checkMyRequests currentUser: ', state.currentUsername)

            } catch (e) {
                console.log('Error while updating myPendingRequests: ', e)
            }
        } else {
            commit('SET_CURRENT_ORG', { username: null, myPendingRequests: [ ] })
        }
    },

    async checkUser ({ commit, vm, error }, username) {
        vm = this._vm

        if (vm.$loginservice.user) {
            let user = username.user
            const me = vm.$loginservice.user.username

            if (user == '' || user == null || user == "") {
                console.log('User is null')
                user = me;
            }
            
            commit('SET_CURRENT_USER', { username: user })

            console.log('checkUser currentUsername: ', state.currentUsername)
        } else {
            commit('SET_CURRENT_USER', { username: null })
        }
    },

    async checkMyAdmins ({ commit, vm, error }) {
        vm = this._vm;

        if (vm.$loginservice.user && state.currentUsername != null) { // --> if currentUsername is an org, not private acc or null
            try {
                const me = vm.$loginservice.user.username
                const url = standardStuff.apiURL('/orgAdmins');
                const config = standardStuff.axiosConfig(vm.$loginservice.jwt);

                const params = {
                    headers: {
                        'Authorization': 'Bearer ' + vm.$loginservice.jwt
                    },

                    params: {
                        username: me,
                        org: state.currentUsername,
                    } 
                }

                let res = await axios.get(url, params, config) 
                const admins = res.data.admins

                commit('SET_CURRENT_ADMINS', { username: me, myAdmins: admins })

                console.log('checkMyAdmins myAdmins: ', state.myAdmins) 
                //console.log('checkMyAdmins currentUsername: ', state.currentUsername)

            } catch (e) {
                console.log('Error while updating myAdmins: ', e)
            }
        } else {
            commit('SET_CURRENT_ADMINS', { username: null, myAdmins: [ ] })
        }
    }
}*/


// CURRENT METHOD:
Vue.use(Vuex)

import axios from 'axios';
import standardStuff from '../lib/standard-stuff';

const state = {
    myOrganisations: [ ],
    myPendingRequests: [ ], 
    myAdmins: [ ],
    currentUsername: '',
   // currentOrg: '',
}

const mutations = {
	SET_ORGS (state, { username, myOrganisations }) {
        //state.currentUsername = username
		state.myOrganisations = myOrganisations
    },
    
    SET_REQS (state, { username, myPendingRequests }) {
        //state.currentUsername = username
        state.myPendingRequests = myPendingRequests
    },

    SET_CURRENT_ORG (state, { username, myOrganisations }) {
        //state.currentUsername = username // changes to private user acc ??
        state.myOrganisations = myOrganisations
    },

    SET_CURRENT_USER (state, { username }) {
        state.currentUsername = username
    },

    SET_CURRENT_ADMINS (state, { username, myAdmins }) {
        //state.currentUsername = username
        state.myAdmins = myAdmins
    },
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

                console.log('checkOrgs myOrganisations: ', state.myOrganisations) 
                //console.log('checkOrgs currentUser: ', state.currentUsername) 
                
            } catch (e) {
                console.log('Error while updating myOrganisations: ', e)
            }
        } else {
            commit('SET_CURRENT_ORG', { username: null, myOrganisations: [ ] })
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

                console.log('checkMyRequests myPendingRequests: ', state.myPendingRequests) 
                //console.log('checkMyRequests currentUser: ', state.currentUsername)

            } catch (e) {
                console.log('Error while updating myPendingRequests: ', e)
            }
        } else {
            commit('SET_CURRENT_ORG', { username: null, myPendingRequests: [ ] })
        }
    },

    async checkUser ({ commit, vm, error }, username) {
        vm = this._vm

        if (vm.$loginservice.user) {
            let user = username.user
            const me = vm.$loginservice.user.username
    
            if (user == '' || user == null || user == "") {
                console.log('User is null')
                user = me;
            }
            
            commit('SET_CURRENT_USER', { username: user })

            console.log('checkUser currentUsername: ', state.currentUsername)
        } else {
            commit('SET_CURRENT_USER', { username: null })
        }
    },
    
    async checkMyAdmins ({ commit, vm, error }) {
        vm = this._vm;

        if (vm.$loginservice.user && state.currentUsername != null) { // --> if currentUsername is an org, not private acc or null
            try {
                const me = vm.$loginservice.user.username
                const url = standardStuff.apiURL('/orgAdmins');
                const config = standardStuff.axiosConfig(vm.$loginservice.jwt);

                const params = {
                    headers: {
                        'Authorization': 'Bearer ' + vm.$loginservice.jwt
                    },
    
                    params: {
                        username: me,
                        org: state.currentUsername,
                    } 
                }

                let res = await axios.get(url, params, config) 
                const admins = res.data.admins

                commit('SET_CURRENT_ADMINS', { username: me, myAdmins: admins })

                console.log('checkMyAdmins myAdmins: ', state.myAdmins) 
                //console.log('checkMyAdmins currentUsername: ', state.currentUsername)

            } catch (e) {
                console.log('Error while updating myAdmins: ', e)
            }
        } else {
            commit('SET_CURRENT_ADMINS', { username: null, myAdmins: [ ] })
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