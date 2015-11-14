(function() {
  'use strict';

  angular
    .module('beam.employee')
    .factory('Employee', Employee);

  Employee.$inject = ['$http'];

  function Employee($http) {
    var baseurl = 'http://10.25.1.55:3001/';
    return {
      search: function(query) {
        return $http.post(baseurl + 'employees/search', query);
      },
      groups: function() {
        return $http.get(baseurl + 'employees/list/groups');
      },
      locations: function() {
        return $http.get(baseurl + 'employees/list/locations');
      },
      departments: function() {
        return $http.get(baseurl + 'employees/list/departments');
      }
    }
  }
})();
