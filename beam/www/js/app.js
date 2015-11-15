(function() {
  'use strict';

  function config(authProvider, jwtInterceptorProvider, $httpProvider, $stateProvider, $urlRouterProvider) {

    // Auth Stuff Below
    authProvider.init({
      domain: 'ninja.auth0.com',
      clientID: 'tXb0W77xs2uD72q7XkhaWxNzKltLvH7u',
      callbackURL: location.href
    });

    jwtInterceptorProvider.tokenGetter = [function() {
      return localStorage['token'];
    }];

    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push('httpInterceptor');


    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('landing', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'templates/landing.tpl.html',
            controller: 'LandingCtrl as land'
          }
        }
      })
      .state('home', {
        url: '/home',
        views: {
          '@': {
            templateUrl: 'templates/home.tpl.html',
            controller: 'HomeCtrl as home'
          }
        }
      });
  }

  function run($rootScope, $location, auth, jwtHelper, $state) {
    auth.hookEvents();

    // Check if a user is logged in when they try to transition to a different state
    $rootScope.$on('$locationChangeStart', function() {
      var token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!auth.isAuthenticated) {
            auth.authenticate(JSON.parse(localStorage.getItem('token')), token);
          }
        } else {
          $rootScope.isAuthenticated = false;
          $location.path('/');
        }
        $rootScope.isAuthenticated = auth.isAuthenticated;
      }
    });

    $rootScope.login = function(username, password) {
      auth.signin({
        connection: 'Username-Password-Authentication',
        username: username,
        password: password,
        authParams: {
          scope: 'openid name email'
        }
      }, function (profile, token) {
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('token', JSON.stringify(token));

        $state.go('home');
      }, function() {
        console.error("Failed to login the user!");
      });
    };

    $rootScope.logout = function() {
      auth.signout();
      localStorage.removeItem('profile');
      localStorage.removeItem('token');

      $state.go('landing', {}, {reload: true});
    };
  }

  function LandingCtrl() {
    var vm = this;

    vm.bizzles = new Array(100);
    for (var i =0; i < vm.bizzles.length; i++) {
      vm.bizzles[i] = {
        i: "butts"
      };
    }
    vm.text = 'What are you looking for?';
  }

  angular
    .module('beam', [
      'auth0',
      'ui.router',
      'ngMaterial',
      'angular-jwt',
      'ngMdIcons',
      'common.interceptors.http',
      'ngCordova'
    ])
    .config(config)
    .run(run)
    .controller('LandingCtrl', LandingCtrl);
})();
