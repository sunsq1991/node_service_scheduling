'use strict';

angular.module('serviceSchedulingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/main', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });