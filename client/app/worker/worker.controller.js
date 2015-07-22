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
    $scope.addWorkerVacation = function(person,startDate,endDate) {
      console.log(startDate,endDate);
      $http.put('/api/worker/vacation/' + person._id, { startDate: startDate, endDate: endDate});
      
      $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });
     
    };
    $scope.deleteVacationDate = function(person,date){
      console.log(date._id);
       $http.put('/api/worker/vacation/delete/'+ person._id, {_id:date._id});
      $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });
    }


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
      $('.addWorkerArea').slideToggle(500);
      var $hiddenEditArea = $('.hiddenEditArea');
      $hiddenEditArea.each(function(){
        var $this = $(this);
          if ($this.is(':visible')) {
            $this.slideToggle();
          };
      });
  
    };

    $scope.editWorkerBtn = function(person) {
      
      var $hiddenEditArea = $('.hiddenEditArea');
      $hiddenEditArea.each(function(){
        var $this = $(this);
          if ($this.is(':visible')) {
            $this.slideToggle();
          };
      });
      if (!$('.'+person.workerName).is(':visible')) {
            $('.'+person.workerName).slideToggle();
          };
    };

    $scope.cancelEdit =function(person){
      $('.'+person.workerName).slideToggle();
    };

    $scope.editWorker =function(person,workerName,discription,email){
      $http.put('/api/worker/' + person._id, { workerName: workerName, email: email, 
      discription: discription});
      
      $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
    });
    }
  });
