

export default {
  debug: true,

  // protocol: 'http',
  // host: 'localhost',
  // port: '9090',
  // version: 'v2',
  // apikey: 'API100ZNCYYE7FK4IIE1IWTOEBFUC',

  protocol: 'https',
  host: 'v4.loginservice.io',
  port: '443',
  version: '2.0',
  apikey: 'API10YL6DW79VUNRMDVM5NMMFXAEX',

  // urlPrefix: Config.loginservice.urlPrefix,
  hints: {
    sitename: 'Juice',
    register: {
      password: true,
      firstname: true,
      middlename: false,
      lastname: true,
      // resumeURL: 'http://localhost:3000/',
      resumeURL: 'https://test-juiceconfig-457805544.ap-southeast-1.elb.amazonaws.com/',
      termsMessage: 'Agree to our terms?',
      termsRoute: '/terms-and-conditions',
    },
    forgot: {
      // resumeURL: 'http://localhost:3000/',
      resumeURL: 'https://test-juiceconfig-457805544.ap-southeast-1.elb.amazonaws.com/'
    },
    usernames: true,
    login: {
      registerMessage: 'Don\'t have an account yet?',
      email: true,
      facebook: false,
      github: false,
      google: false,
      linkedin: false,
      twitter: false,
    }
  }
}
