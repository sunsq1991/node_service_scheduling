'use strict';

angular.module('serviceSchedulingApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.addJob = function() {
      if($scope.newJobClient === '' || $scope.newJobLocation === '') {
        return;
      }
      $http.post('/api/schedule', { client: $scope.newJobClient, location: $scope.newJobLocation });
      $scope.newJobClient = '';
      $scope.newJobLocation = '';
    };
    $scope.addWorker = function() {
      if($scope.workerName === '' || $scope.email === '') {
        return;
      }
      $http.post('/api/worker', { workerName: $scope.workerName, email: $scope.email, 
       discription: $scope.discription, notAvaliableDate : $scope.date});
      $scope.workerName = '';
      $scope.email = '';
      $scope.discription = '';
      $scope.date = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
