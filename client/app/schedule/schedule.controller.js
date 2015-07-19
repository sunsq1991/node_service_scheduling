'use strict';

angular.module('serviceSchedulingApp')
  .controller('SchedulingCtrl', function ($scope, $http, socket) {
    $scope.jobs = [];

    $http.get('/api/jobs').success(function(jobs) {
      $scope.jobs = jobs;
      socket.syncUpdates('job', $scope.jobs);
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
      socket.unsyncUpdates('thing');
    });
  });
