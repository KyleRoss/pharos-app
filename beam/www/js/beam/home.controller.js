(function() {
    'use strict';

    angular.module('beam').controller('HomeCtrl', HomeCtrl);

    function HomeCtrl() {
        var vm = this;

        vm.profile = localStorage.getItem('profile');
    }
})();
