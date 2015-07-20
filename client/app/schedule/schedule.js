'use strict';

angular.module('serviceSchedulingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/schedule', {
        templateUrl: 'app/schedule/schedule.html',
        controller: 'ScheduleCtrl'
      });
  });