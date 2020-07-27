import axios from 'axios';
import standardStuff from '../../lib/standard-stuff';
import Loginservice from '@tooltwist/vue-loginservice';

const url = standardStuff.apiURL('/organisations');
const config = standardStuff.axiosConfig(Loginservice.jwt);
let userName = Loginservice.user;
const params = { 
    params: {
        userName: userName,
    }
};


const state = () => ({
	orgs: null
})

const actions = {
	async init ({ commit }) {
        let { data } = await axios.get(url, params, config)
        console.log('testing')
        commit('SET_ORGS', data.data.organisations)
	}


    // nuxtServerInit ({ commit }, { req }) {
    //   if (req.session.user) {
    //     commit('SET_ORGS', req.session.user)
    //   }
    // }
}

const mutations = {
	SET_ORGS (state, orgs) {
		state.orgs = orgs
	}
}

export default {
    actions,
    mutations,
    state,
}