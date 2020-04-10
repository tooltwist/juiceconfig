
export const state = () => ({
  counter: 0,
  isSecureServer: false,
  isSingleUser: false,
  haveSettings: false
})

// export const getters = {
//   isSecureServer: state => async {
//     if (!state.haveSettings) {
//     }
//     return state.isSecureServer
//   },

//   isSingleUser: state => {
//     return state.todos.filter(todo => todo.done)
//     return state.isSecureServer
//   }

// }

export const mutations = {
  increment (state) {
    state.counter++
  },

  update(state, { isSecureServer, isSingleUser}) {
    console.log(`Setting state of Settings(${isSecureServer}, ${isSingleUser})`);
    
    state.isSecureServer = isSecureServer
    state.isSingleUser = isSingleUser
    state.haveSettings = true
  }
}