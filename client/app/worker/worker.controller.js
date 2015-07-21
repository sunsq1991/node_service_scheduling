'use strict';

angular.module('serviceSchedulingApp')
  .controller('workerCtrl', function ($scope, $http, socket) {
    $scope.worker = null;
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
       discription: $scope.discription});
      $scope.workerName = '';
      $scope.email = '';
      $scope.discription = '';

      $http.get('/api/worker/').success(function(worker) {
        $scope.worker = worker;
      });
      $('.addWorkerArea').toggle();
    };

    $scope.addVacationDate = function(person) {
  
     $("#"+person.workerName).toggle();
     $('.input-daterange').datepicker({
    });
    };
    $scope.addWorkerVacation = function(person) {
      console.log($scope.startDate);
      $http.put('/api/worker/vacation/' + person._id, { startDate: $scope.startDate, endDate: $scope.endDate})
      //$scope.startDate = '';
      //$scope.endDate = '';
      $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });
     
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
