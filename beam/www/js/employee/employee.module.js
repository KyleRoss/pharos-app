(function() {
  'use strict';

  function config($stateProvider) {
    $stateProvider
      .state('root.employee', {
        url: '/people',
        views: {
          '@': {
            templateUrl: 'templates/employee/employee.tpl.html',
            controller: 'EmployeeCtrl as employee'
          }
        }
      });
  }

  angular
    .module('beam.employee', []);
})();
