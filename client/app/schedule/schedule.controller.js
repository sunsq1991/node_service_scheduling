'use strict';

angular.module('serviceSchedulingApp')
  .controller('ScheduleCtrl', function ($scope, $http, Auth, $filter, socket, $mdDialog) {
    $scope.user = Auth.getCurrentUser();
    $scope.workers = [];
    $scope.jobs = [];
    $scope.socketSchedule = [];
    $scope.str_date = $filter('date')(new Date(), 'MM-dd-yyyy');
    $scope.morningJobs = [];
    $scope.afternoonJobs = [];

    var updateJobs = function() {
      for (var index in $scope.workers) {
        $scope.morningJobs[index] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[index]._id, isMorning:true}), 'slot');
        $scope.afternoonJobs[index] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[index]._id, isMorning:false}), 'slot');
      }
    };

    $http.get('/api/worker/').success(function(workers) {
      console.log(workers);
      $scope.workers = workers;
    });

    $scope.loadSchadule = function() {
      $http.get('/api/schedule/' + $scope.str_date ).success(function(schedule) {
        console.log(schedule);
        $scope.jobs = schedule.jobs;
        updateJobs();
        socket.syncUpdates('schedule', $scope.socketSchedule, function(event, socketSchedule, object) {
          console.log(socketSchedule.date);
          console.log($scope.str_date);
          if ($filter('date')(socketSchedule.date, 'MM-dd-yyyy') === $scope.str_date ) {
            $scope.jobs = socketSchedule.jobs;
            if (!$scope.editingJob) {
              updateJobs();
            }
          }
          
        });
      });
    };

    $scope.loadSchadule();

    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder",
      items: "div:not(.not-sortable)",
      stop: function(e, ui) {
        var jobs_to_update = [];
        console.log(ui.item);
        if (ui.item.sortable.sourceModel) {
          for (var i = 0; i < ui.item.sortable.sourceModel.length; i++) {
            ui.item.sortable.sourceModel[i].slot=i;
            jobs_to_update.push(ui.item.sortable.sourceModel[i]);
          }
        console.log(ui.item.sortable.sourceModel);
        }
        if (ui.item.sortable.droptargetModel) {
          var isMorning = (ui.item.sortable.droptarget[0].dataset.section == "morning");
          var worker_id = ($scope.workers[ui.item.sortable.droptarget[0].dataset.workerindex]._id);
          for (var i = 0; i < ui.item.sortable.droptargetModel.length; i++) {
            ui.item.sortable.droptargetModel[i].slot = i;
            ui.item.sortable.droptargetModel[i].isMorning = isMorning;
            ui.item.sortable.droptargetModel[i].worker = worker_id;
            jobs_to_update.push(ui.item.sortable.droptargetModel[i]);
          };
          console.log(ui.item.sortable.droptargetModel);
        }
        console.log(jobs_to_update);
        $http.put('/api/schedule/jobs/' + $scope.str_date, {jobs: jobs_to_update} ).success(function(schedule) {
          console.log(schedule);
          //$scope.date = schedule.date;
          //$scope.str_date = $filter('date')($scope.date, 'MM/dd/yyyy');
        });
      }
    };

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
        $http.put('/api/schedule/' + $scope.str_date, job);
      }
    };

    $scope.cancelEdit = function() {
      var job = $scope.editingJob;
      job.editing = false;
      $scope.editingJob = null;
      hidePopover();
      $http.put('/api/schedule/' + $scope.str_date, {_id: job._id, editing: job.editing});
    };

    $scope.saveEdit = function() {
      var job = $scope.editingJob;
      job.client = $scope.editPopover.client;
      job.location = $scope.editPopover.location;
      job.description = $scope.editPopover.description;
      job.editing = false;
      delete job.slot;
      $scope.editingJob = null;
      $http.put('/api/schedule/' + $scope.str_date, job ).success(function(schedule) {
      console.log(schedule);
      //$scope.date = schedule.date;
      //$scope.str_date = $filter('date')($scope.date, 'MM/dd/yyyy');
    });
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
      updateJobs();
    };

    $scope.saveAdd = function() {
      var slot = 0;
      var new_job = {
        client: $scope.addPopover.client,
        location: $scope.addPopover.location,
        description: $scope.addPopover.description,
        isMorning: $scope.addPopover.isMorning,
        slot: slot,
        editing: false,
        worker: $scope.addPopover.worker
      }
      $scope.editingJob = null;
      $http.post('/api/schedule/' + $scope.str_date, new_job ).success(function(schedule) {
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      hidePopover();
      });
    };

    $scope.showDeleteConfirm = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('Delete Comfirmation')
        .content('Would you like to delete this job ?')
        .ariaLabel('delete')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {
        $http.put('/api/schedule/delete/' + $scope.str_date, $scope.editingJob ).success(function(schedule) {
          $scope.editingJob = null;
          updateJobs();
        });
      }, function() {
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
      socket.unsyncUpdates('schedule');
    });
  });
