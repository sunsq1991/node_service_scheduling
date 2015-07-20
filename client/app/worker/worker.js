'use strict';

angular.module('serviceSchedulingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/worker', {
        templateUrl: 'app/worker/worker.html',
        controller: 'workerCtrl'
      });
  });