'use strict';

angular.module('serviceSchedulingApp')
  .controller('workerCtrl', function ($scope, $http, socket,$mdDialog) {
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
   
    $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });

     $scope.addWorker = function() {
      if($scope.workerName === '' || $scope.email === '') {
        return;
      }
      $http.post('/api/worker', { workerName: $scope.workerName, email: $scope.email, 
       discription: $scope.discription, currentStatus: $scope.currentStatus, notAvaliableDate : $scope.date});
      $scope.workerName = '';
      $scope.email = '';
      $scope.discription = '';
      $scope.date = '';
      $scope.currentStatus ='';

      $http.get('/api/worker/').success(function(worker) {
        $scope.worker = worker;
      });
      $('.addWorkerArea').toggle();
    };

    $scope.deleteWorker = function(person) {
      $http.delete('/api/worker/' + person._id);
      $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });

    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('worker');
    });

    $scope.showConfirm = function(ev) {
      $('.addWorkerArea').toggle();
  
    };
  });
