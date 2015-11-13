(function() {
  'use strict';

  function HeaderCtrl($mdSidenav, $mdDialog, $state, auth) {
    var vm = this;

    vm.openMenu = function () {
      $mdSidenav('menu').open();
    };

    vm.closeMenu = function () {
      $mdSidenav('menu').close();
    };

    vm.openAccountMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };
  }

  HeaderCtrl.$inject = ['$mdSidenav', '$mdDialog', '$state', 'auth'];

  angular
    .module('beam')
    .controller('HeaderCtrl', HeaderCtrl);
})();
