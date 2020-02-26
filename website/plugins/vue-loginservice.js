import Vue from 'vue';
import Loginservice from '@tooltwist/vue-loginservice';
import options from '../protected-config/loginservice-config';

Vue.use(Loginservice, options)

export default ({ app }, inject) => {
    inject('nuxtLoginservice', Loginservice._authservice)
}
