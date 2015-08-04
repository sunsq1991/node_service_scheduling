'use strict';

angular.module('serviceSchedulingApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/schedule', {
        templateUrl: 'app/schedule/schedule.html',
        controller: 'ScheduleCtrl'
      }).
      when('/report', {
        templateUrl: 'app/schedule/report.html',
        controller: 'ScheduleCtrl'
      });
  });