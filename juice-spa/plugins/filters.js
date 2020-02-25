import Vue from 'vue';

Vue.filter('yesno', function (value) {
    return value ? 'Yes' : 'No';
});