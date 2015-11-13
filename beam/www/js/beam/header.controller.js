(function() {
  'use strict';

  function HeaderCtrl($mdSidenav, $mdDialog, store, $state, auth) {
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

  angular
    .module('beam')
    .controller('HeaderCtrl', HeaderCtrl);
})();
