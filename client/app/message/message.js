'use strict';

angular.module('serviceSchedulingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/message', {
        templateUrl: 'app/message/message.html',
        controller: 'MessageCtrl'
      });
  });