'use strict';

angular.module('serviceSchedulingApp')
  .controller('ScheduleCtrl', function ($scope, $http, socket) {
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
    $scope.workers = [];
    $scope.date = new Date((new Date()).setHours(0, 0, 0, 0));
    $scope.jobs = [];

    $http.get('/api/worker/').success(function(workers) {
      console.log(workers);
      $scope.workers = workers;
    });

    $http.get('/api/schedule/' + $scope.date ).success(function(schedule) {
      console.log(schedule);
      $scope.date = schedule.date;
      $scope.jobs = schedule.jobs;
      //socket.syncUpdates('jobs', $scope.jobs);
    });

    var hidePopover = function() {
      $('.popover').each(function () {
        //Set the state of the popover in the scope to reflect this
        var elementScope = angular.element(this).scope().$parent;
        elementScope.isOpen = false;
        //Remove the popover element from the DOM
        $(this).remove();
      });
    };

    $scope.editJob = function(job) {
      if (!$scope.editingJob) {
        $scope.editingJob = job;
        job.editing = true;
        
        $scope.editPopover.client = job.client;
        $scope.editPopover.location = job.location;
        $scope.editPopover.description = job.description;
      };
    };

    $scope.cancelEdit = function() {
      var job = $scope.editingJob;
      job.editing = false;
      $scope.editingJob = null;
      hidePopover();
    };

    $scope.saveEdit = function() {
      var job = $scope.editingJob;
      job.client = $scope.editPopover.client;
      job.location = $scope.editPopover.location;
      job.description = $scope.editPopover.description;
      job.editing = false;
      $http.put('/api/schedule/' + $scope.date, job ).success(function(schedule) {
      console.log(schedule);
      $scope.date = schedule.date;
      $scope.jobs = schedule.jobs;
    });
      $scope.editingJob = null;
      hidePopover();
    };

    $scope.addJob = function(worker_id, is_morning) {
      if (!$scope.editingJob) {
        console.log('addJob');
        $scope.editingJob = true;
        $scope.addPopover.worker = worker_id;
        $scope.addPopover.isMorning = is_morning;
      };
    };

    $scope.cancelAdd = function() {
      $scope.editingJob = null;
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      hidePopover();
    };

    $scope.saveAdd = function() {
      var slot = 0;
      var new_job = {
        client: $scope.addPopover.client,
        location: $scope.addPopover.location,
        discription: $scope.addPopover.discription,
        isMorning: $scope.addPopover.isMorning,
        slot: slot,
        editing: false,
        worker: $scope.addPopover.worker
      }
      $http.post('/api/schedule/' + $scope.date, new_job ).success(function(schedule) {
      console.log(schedule);
      $scope.date = schedule.date;
      $scope.jobs = schedule.jobs;
      $scope.editingJob = null;
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      hidePopover();
      });
    };

    $scope.editPopover = {
      editTemplateUrl: 'components/template/popover-edit-card.html',
      client: '',
      location: '',
      description: ''
    };

    $scope.addPopover = {
      addTemplateUrl: 'components/template/popover-add-card.html',
      worker: '',
      isMorning: true,
      client: '',
      location: '',
      description: ''
    };

    $scope.$on('$destroy', function () {
      //socket.unsyncUpdates('jobs');
    });
  });
