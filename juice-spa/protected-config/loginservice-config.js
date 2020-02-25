// Load the configuration. This directory should be included in .gitignore.
import Config from '../protected-config/websiteConfig';

const hints = {
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

export default {
  protocol: Config.loginservice.protocol,
  host: Config.loginservice.host,
  port: Config.loginservice.port,
  version: Config.loginservice.version,
  apikey: Config.loginservice.apikey,
  urlPrefix: Config.loginservice.urlPrefix,
  hints: hints,
  // options: {
  //   hints: {
  //     sitename: 'Juice',
  //     register: {
  //       password: true,
  //       firstname: false,
  //       middlename: false,
  //       lastname: false,
  //       resumeURL: 'http://localhost:3000/',
  //       termsMessage: 'Agree to our terms?',
  //       termsRoute: '/terms-and-conditions'
  //     },
  //     forgot: false,
  //     usernames: true,
  //     login: {
  //       registerMessage: 'Don\'t have an account yet?',
  //       email: true,
  //       facebook: false,
  //       github: false,
  //       google: false,
  //       linkedin: false,
  //       twitter: false,
  //     }
  //   }
  // }
}
