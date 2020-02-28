

export default {
  debug: true,
  protocol: 'http',
  host: 'localhost',
  port: '9090',
  version: 'v2',
  apikey: 'API100ZNCYYE7FK4IIE1IWTOEBFUC',
  // urlPrefix: Config.loginservice.urlPrefix,
  hints: {
    sitename: 'Juice',
    register: {
      password: true,
      firstname: false,
      middlename: false,
      lastname: false,
      resumeURL: 'http://localhost:3000/',
      termsMessage: 'Agree to our terms?',
      termsRoute: '/terms-and-conditions',
    },
    forgot: false,
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
