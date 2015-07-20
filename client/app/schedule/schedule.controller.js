'use strict';

angular.module('serviceSchedulingApp')
  .controller('ScheduleCtrl', function ($scope, $http, socket) {
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
    $scope.workers = [{name:'Sun'},{name:'Zhu'},{name:'Song'}];
    $scope.date = new Date((new Date()).setHours(0, 0, 0, 0));
    $scope.jobs = [];

    $http.get('/api/schedule/' + $scope.date ).success(function(schedule) {
      console.log(schedule);
      $scope.date = schedule.date;
      $scope.jobs = schedule.jobs;
      //socket.syncUpdates('jobs', $scope.jobs);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      //socket.unsyncUpdates('jobs');
    });
  });
