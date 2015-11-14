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
      .state('root', {
        views: {
          'header': {
            templateUrl: 'templates/header.tpl.html',
            controller: 'HeaderCtrl as header'
          },
          'footer': {
            templateUrl: 'templates/footer.tpl.html',
            controller: 'FooterCtrl as footer'
          }
        }
      })
      .state('root.landing', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'templates/landing.tpl.html',
            controller: 'BaseCtrl as base'
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

    $rootScope.login = function() {
      auth.signin({
        authParams: {
          scope: 'openid profile' // This gets us the entire user profile
        }
      }, function (profile, token) {
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('token', JSON.stringify(token));

        $state.go('root.landing');
      }, function() {
        console.error("Failed to login the user!");
      });
    };

    $rootScope.logout = function() {
      auth.signout();
      localStorage.removeItem('profile');
      localStorage.removeItem('token');

      $state.go('root.landing', {}, {reload: true});
    };
  }

  function BaseCtrl() {
    var vm = this;

    vm.text = 'Look at my cool text';
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
    .controller('BaseCtrl', BaseCtrl);
})();
