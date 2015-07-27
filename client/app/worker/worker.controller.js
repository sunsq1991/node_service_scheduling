'use strict';

angular.module('serviceSchedulingApp')
  .controller('workerCtrl', function ($scope, $http, socket,$mdDialog,Auth) {
    $scope.worker = null;
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
   
    $http.get('/api/worker/').success(function(worker) {
      $scope.worker = worker;
      socket.syncUpdates('worker', $scope.worker,function(){
         $http.get('/api/worker/').success(function(worker) {
          $scope.worker = worker;
        });
      });
    }); 
    $scope.isAdmin = Auth.isAdmin;
    $scope.addWorker = function() {
      $scope.alerts = [];
      if(!$scope.workerName ) {
        $scope.alerts.push({msg: "Technician name cannot be empty!"});
        return;
      }
      for (var i = $scope.worker.length - 1; i >= 0; i--) {
        if ($scope.workerName === $scope.worker[i].workerName) {
          $scope.alerts.push({msg: $scope.workerName + " already exsit in the system!"});
          return;
        }
      }
     
      $http.post('/api/worker', { workerName: $scope.workerName, email: $scope.email, 
       discription: $scope.discription, isAvaliable: true} );
      $scope.workerName = '';
      $scope.email = '';
      $scope.discription = '';

      $('.addWorkerArea').toggle(500,function(){
      $('.addworkerBtn').text('Add Technician'); 
      $('.addworkerBtn').closest('.addWorkerlink').css('background-color','#428bca');
      });
    };

    $scope.addVacationDate = function(person) {
  
     $("#"+person.workerName).toggle();
     $('.input-daterange').datepicker({
       format: 'mm-dd-yyyy',
       calendarWeeks: true,
       autoclose: true,
       todayHighlight: true
    });
    };
    $scope.addWorkerVacation = function(person,startDate,endDate) {
      $scope.vacationAlerts = [];
      var startDateDate = new Date(startDate);
      var endDateDate  = new Date(endDate);
      $http.put('/api/worker/vacation/' + person._id, { startDate: startDateDate, endDate: endDateDate});
    
     
    };
    $scope.deleteVacationDate = function(person,date){
      $http.put('/api/worker/vacation/delete/'+ person._id, {_id:date._id});
         }


    $scope.deleteWorker = function(person) {
      $http.delete('/api/worker/' + person._id);
     

    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('worker');
    });

    $scope.showConfirm = function(ev) {
      $('.addWorkerArea').slideToggle(500,function(){
        if ($('.addWorkerArea').is(':visible')) {
        $('.addworkerBtn').text('Cancel Add'); 
        $('.addworkerBtn').closest('.addWorkerlink').css('background-color','#457C63');
      }
      else {
        $('.addworkerBtn').text('Add Technician'); 
        $('.addworkerBtn').closest('.addWorkerlink').css('background-color','#428bca');
      }
      });
      var $hiddenEditArea = $('.hiddenEditArea');
      $hiddenEditArea.each(function(){
        var $this = $(this);
          if ($this.is(':visible')) {
            $this.slideToggle();
          };
      });

      
       
    };

    $scope.editWorkerBtn = function(person) {
      $scope.workerName = person.workerName;
      $scope.email = person.email;
      $scope.discription = person.discription;

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
      if ($('.addWorkerArea').is(':visible')) {
          $('.addWorkerArea').slideToggle(function(){
          $scope.workerName = '';
          $scope.email = '';
          $scope.discription = '';
         
          $('.addworkerBtn').text('Add Technician'); 
          $('.addworkerBtn').closest('.addWorkerlink').css('background-color','#428bca');

        });
      };
        $scope.alerts = [];
    };

    $scope.cancelEdit =function(person){
      $('.'+person.workerName).slideToggle();
    };

    $scope.editWorker =function(person,workerName,discription,email){
      var counter = 0;
      $scope.editAlerts = [];
      if(!workerName ) {
        $scope.editAlerts.push({msg: "Technician name cannot be empty!"});
        return;
      }
      for (var i = $scope.worker.length - 1; i >= 0; i--) {
        if (workerName === $scope.worker[i].workerName && person._id != $scope.worker[i]._id) {  
            $scope.editAlerts.push({msg: workerName + " already exsit in the system!"});
            return;     
        }
      }

      $http.put('/api/worker/' + person._id, { workerName: workerName, email: email, 
      discription: discription});

      
    }

    $scope.showConfirmDelete = function(ev,person) {
    // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Delete Comfirmation')
        .content('Would you like to delete your Technician: '+ person.workerName +' ?')
        .ariaLabel('delete')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {
        $scope.deleteWorker(person);
      }, function() {
        
      });
    };
  });
