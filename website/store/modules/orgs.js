import Vue from 'vue';
import axios from 'axios';
import standardStuff from '../../lib/standard-stuff';
import Loginservice from '@tooltwist/vue-loginservice';
import options from '/opt/Development/Projects/juice/juiceconfig/website/protected-config/loginservice-config.js';

Vue.use(Loginservice, options)

// Config, api and auth details for axios call
const url = standardStuff.apiURL('/organisations');
const config = standardStuff.axiosConfig(Loginservice._authservice.jwt);
let userName = Loginservice._authservice.user.username // surely there is a better way of doing this
const params = { 
    params: {
        userName: userName,
    }
};

console.log('Hello from orgs module')
console.log('Config: ', config)
console.log('Loginservice user: ', userName)

const state = () => ({
	organisations: []
})

const mutations = {
	SET_ORGS (state, organisations) {
		state.organisations = organisations
	}
}

const actions = {
	async init ({ commit }) {
        let { data } = await axios.get(url, params, config)
        console.log('testing')
        commit('SET_ORGS', data.data.organisations)
	},

    // // From Vuex tutorial:
    // fetchOrgs(context) {
    //     axios.get(url, params, config).then(response => {
    //         context.commit('SET_ORGS', response.data.organisations)
    //         console.log('Orgs inside module: ', organisations)
    //     })
    // }
}

export default {
    state,
    mutations,
    actions,    
}