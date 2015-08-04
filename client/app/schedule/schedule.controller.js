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
    $scope.gPlace;

    var updateJobs = function() {
      $scope.morningJobs = [];
      $scope.afternoonJobs = [];
      for (var i = 0; i < $scope.workers.length; i++) {
        $scope.morningJobs[i] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[i]._id, isMorning:true}), 'slot');
        $scope.afternoonJobs[i] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[i]._id, isMorning:false}), 'slot');
      }
    };

    var loadSchadule = function() {
      $http.get('/api/schedule/' + $scope.str_date ).success(function(schedule) {
        console.log(schedule);
        $scope.jobs = schedule.jobs;
        updateJobs();
        socket.syncUpdates('schedule', $scope.socketSchedule, function(event, socketSchedule, object) {
          console.log(socketSchedule.date);
          console.log($filter('date')(socketSchedule.date, 'MM-dd-yyyy'));
          console.log($filter('date')(socketSchedule.date, 'MM-dd-yyyy', '+0000'));
          console.log($scope.str_date);
          if (($filter('date')(socketSchedule.date, 'MM-dd-yyyy', '+0000')) === $scope.str_date ) {
            $scope.jobs = socketSchedule.jobs;
            if (!$scope.editingJob) {
              updateJobs();
            }
            else {
              var notChanged = $scope.jobs.filter( function(job){
                if (job._id != $scope.editingJob._id) {return false};
                if (job.client != $scope.editingJob.client) {return false};
                if (job.location != $scope.editingJob.location) {return false};
                if (job.description != $scope.editingJob.description) {return false};
                if (job.phone != $scope.editingJob.phone) {return false};
                if (job.appliance != $scope.editingJob.appliance) {return false};
                if (job.power_type != $scope.editingJob.power_type) {return false};
                if (job.hours != $scope.editingJob.hours) {return false};
                if (job.city != $scope.editingJob.city) {return false};
                if (job.isMorning != $scope.editingJob.isMorning) {return false};
                if (job.worker != $scope.editingJob.worker) {return false};
                return true;
              });
              if (notChanged.length < 1) {
                $scope.showEditUpdatedMessage();
              }
            }
          }
          
        });
      });
    };

    $scope.loadWorkers = function() {
      $http.get('/api/worker/' + $scope.str_date ).success(function(workers) {
        $scope.workers = $filter('filter')(workers, {isAvaliable: true})
        loadSchadule();
      });
    };
    $scope.loadWorkers();

    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder",
      //items: "div:not(.not-sortable)",
      stop: function(e, ui) {
        var jobs_to_update = [];
        if (ui.item.sortable.sourceModel) {
          for (var i = 0; i < ui.item.sortable.sourceModel.length; i++) {
            ui.item.sortable.sourceModel[i].slot=i;
            jobs_to_update.push(ui.item.sortable.sourceModel[i]);
          }
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
        }
        $http.put('/api/schedule/jobs/' + $scope.str_date, {jobs: jobs_to_update} ).success(function(schedule) {
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
        $scope.editPopover.phone = job.phone;
        $scope.editPopover.appliance = job.appliance;
        $scope.editPopover.power_type = job.power_type;
        $scope.editPopover.hours = job.hours;
        $scope.editPopover.city = job.city;
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
      job.phone = $scope.editPopover.phone;
      job.appliance = $scope.editPopover.appliance;
      job.power_type = $scope.editPopover.power_type;
      job.hours = $scope.editPopover.hours;
      if ($scope.editPopover.city && job.location.indexOf($scope.editPopover.city) > -1) {
        job.city = $scope.editPopover.city;
      }
      else{
        job.city = "";
      }
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
      $scope.addPopover.phone = '';
      $scope.addPopover.appliance = '';
      $scope.addPopover.power_type = '';
      $scope.addPopover.hours = 1;
      $scope.addPopover.city = '';
      hidePopover();
      updateJobs();
    };

    $scope.saveAdd = function() {
      var slot = 0;

      var new_job = {
        client: $scope.addPopover.client,
        location: $scope.addPopover.location,
        description: $scope.addPopover.description,
        phone: $scope.addPopover.phone,
        appliance: $scope.addPopover.appliance,
        power_type: $scope.addPopover.power_type,
        hours: $scope.addPopover.hours,
        city: '',
        isMorning: $scope.addPopover.isMorning,
        slot: slot,
        editing: false,
        worker: $scope.addPopover.worker
      }
      if ($scope.addPopover.city && new_job.location.indexOf($scope.addPopover.city) > -1) {
        new_job.city = $scope.addPopover.city;
      }
      $scope.editingJob = null;
      $http.post('/api/schedule/' + $scope.str_date, new_job ).success(function(schedule) {
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      $scope.addPopover.phone = '';
      $scope.addPopover.appliance = '';
      $scope.addPopover.power_type = '';
      $scope.addPopover.hours = 1;
      $scope.addPopover.city = '';
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

    $scope.showEditUpdatedMessage = function() {
    // Appending dialog to document.body to cover sidenav in docs app
      var alert = $mdDialog.alert()
        .parent(angular.element(document.body))
        .title('Alert')
        .content('The Job you are editing has been updated by another user.')
        .ok('Got it');

      $mdDialog.show(alert).then(function() {
        $scope.editingJob = null;
        updateJobs();
        });
    };

    $scope.editPopover = {
      editTemplateUrl: 'components/template/popover-edit-card.html',
      client: '',
      location: '',
      description: '',
      phone: '',
      appliance: '',
      power_type: '',
      hours: 1,
      city: ''
    };

    $scope.addPopover = {
      addTemplateUrl: 'components/template/popover-add-card.html',
      worker: '',
      isMorning: true,
      client: '',
      location: '',
      description: '',
      phone: '',
      appliance: '',
      power_type: '',
      hours: 1,
      city: ''
    };

    $scope.hours_items = [0.5,1.0,1.5,2.0];
    $scope.appliance_option = [
      "Washer",
      "Dryer",
      "Refrigerator/Freezer",
      "Range/Cooktop/Wall Oven",
      "Microwave",
      "Dishwasher",
      "Coin-Op Washer/Dryer",
      "Air Conditioner",
      "Other"
      ];
    $scope.power_type_option = [
      "Regular",
      "Gas",
      "N/A"
      ];

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('schedule');
    });

    $scope.reportGenerate = function(){
      $('.chatbox').hide();
      window.print();
      $('.chatbox').show();
    }
  });
