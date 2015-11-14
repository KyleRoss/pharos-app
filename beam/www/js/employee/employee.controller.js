(function() {
  'use strict';

  angular
    .module('beam.employee')
    .controller('EmployeeCtrl', EmployeeCtrl);

  EmployeeCtrl.$inject = ['Employee'];

  function EmployeeCtrl(Employee) {
    var vm = this;
  }
})();
