module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    // '@nuxtjs',
    // 'plugin:nuxt/recommended',
    'plugin:vue/essential'
  ],
  // add your custom rules here
  rules: {
    // "no-trailing-spaces": false
  }
}
