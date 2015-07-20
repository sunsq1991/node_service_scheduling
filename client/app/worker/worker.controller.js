'use strict';

angular.module('serviceSchedulingApp')
  .controller('workerCtrl', function ($scope, $http, socket) {
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
   
    $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });

    $scope.addWorker = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteWorker = function(person) {
      $http.delete('/api/worker/' + person._id);
      
    };

    $scope.$on('$destroy', function () {
      //socket.unsyncUpdates('jobs');
    });
  });
