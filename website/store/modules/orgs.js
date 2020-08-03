// Couldn't import this module to index.js... will seperate later once function is working properly.

// //import Vue from 'vue';
// import axios from 'axios';
// import standardStuff from '../../lib/standard-stuff';

// //Vue.use(Vuex)

// // // Config, api and auth details for axios call
// // const config = standardStuff.axiosConfig(Loginservice._authservice.jwt);
// // let userName = Loginservice._authservice.user.username 

// const state = () => ({
//     myOrganisations: [],
//     currentUsername: '',
// })

// const mutations = {
// 	SET_ORGS (state, { username, myOrganisations }) {
//         state.currentUsername = username
// 		state.myOrganisations = myOrganisations
//     },
    
//     SET_CURRENT_USER (state, { username, myOrganisations }) {
//         state.currentUsername = username
//         state.myOrganisations = myOrganisations
//     }
// }

// const actions = {
// 	async checkMyOrgs ({ commit, vm }) {
//         if (vm.$loginservice.user) {
//             const me = vm.$loginservice.user.username
//             console.log('Me: ', me)

//             // if (me === state.currentUsername) {
//             //     return
//             // }

//             const url = standardStuff.apiURL('/organisations');
//             console.log('Url: ', url)

//             const params = { 
//                 headers: {
//                     'Authorization': 'Bearer ' + vm.$loginservice.jwt
//                 },

//                 params: {
//                     userName: me
//                 }
//             }
//             console.log('Params: ', params)

//             let { data } = await axios.get(url, params, config)
//             console.log('Data: ', data)

//             commit('SET_ORGS', { username: me, myOrganisations: data.data.organisations })

//         } else {
//             commit('SET_CURRENT_USER', { username: null, myOrganisations: [ ] })
//         }

//         console.log('Finishing checkMyOrgs')
        
//         return
// 	},
// }

// export default {
//     state,
//     mutations,
//     actions,    
// }