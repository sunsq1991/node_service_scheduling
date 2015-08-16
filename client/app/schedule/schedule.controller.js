'use strict';

angular.module('serviceSchedulingApp')
  .controller('ScheduleCtrl', function ($scope, $http, Auth, $filter, socket, $mdDialog, $timeout, $mdSidenav) {
    $scope.user = Auth.getCurrentUser();
    $scope.workers = [];
    $scope.jobs = [];
    $scope.socketSchedule = [];
    $scope.socketWorker = [];
    $scope.workers_raw = [];
    $scope.str_date = $filter('date')(new Date(), 'MM-dd-yyyy');
    $scope.morningJobs = [];
    $scope.afternoonJobs = [];
    $scope.gPlace;
    $scope.page_ready = false;
    $scope.searchJobs = [];
    $scope.focusJobId = null;
    //$scope.is_left_open = true;

    $('body').css('height','initial');
    var updateJobs = function() {
      $scope.morningJobs = [];
      $scope.afternoonJobs = [];
      $scope.saveWorkerNametoJobs();
      for (var i = 0; i < $scope.workers.length; i++) {
        $scope.morningJobs[i] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[i]._id, isMorning:true}), 'slot');
        $scope.afternoonJobs[i] = $filter('orderBy')($filter('filter')($scope.jobs, {worker: $scope.workers[i]._id, isMorning:false}), 'slot');
      }
      if ($scope.page_ready === false) {
        $timeout(function(){
          $scope.page_ready = true;
          if ($scope.focusJobId !== null) {
            $( '#job-' + $scope.focusJobId ).trigger( "click" );
            $scope.focusJobId = null;
          }
        }, 400);
      }
    };

    var updateWorkers = function() {
      var workers = $scope.workers_raw;
      for (var i = 0; i < workers.length; i++) {
          if (workers[i].workerName =='Un-Assigned Job') {
            var unAssignedJob = workers[i];
            workers.splice(i, 1);
            workers.push(unAssignedJob);
          }
        }
        $scope.workers = $filter('filter')(workers, {isAvaliable: true});
    };

    var loadSchadule = function() {
      $scope.page_ready = false;
      $http.get('/api/schedule/' + $scope.str_date ).success(function(schedule) {
        console.log(schedule);
        $scope.jobs = schedule.jobs;

        updateJobs();
        socket.syncUpdates('schedule', $scope.socketSchedule, function(event, socketSchedule, object) {
          console.log(socketSchedule.date);
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
                if (job.make != $scope.editingJob.make) {return false};
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
    $scope.saveWorkerNametoJobs = function(){
      for (var i = $scope.jobs.length - 1; i >= 0; i--) {
          var temp_job_worker_id = $scope.jobs[i].worker;
          for (var j = $scope.workers.length - 1; j >= 0; j--) {
            if (temp_job_worker_id == $scope.workers[j]._id) {
              $scope.jobs[i].workerName = $scope.workers[j].workerName;            
            };
          };
        };
    }
    $scope.loadWorkers = function() {
      $http.get('/api/worker/' + $scope.str_date ).success(function(workers) {
        $scope.workers_raw = workers;
        updateWorkers();
        loadSchadule();
        socket.syncUpdates('worker', $scope.socketWorker, function(event, socketWorker, object) {
          $http.get('/api/worker/' + $scope.str_date ).success(function(update_workers) {
            $scope.workers_raw = update_workers;
            updateWorkers();
            if (!$scope.editingJob) {
              updateJobs();
            }
          });
        });
      });

    };
    $scope.loadWorkers();


    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder",
      distance: 5,
      disabled: false,
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
          if (worker_id) {
            var total_jobs = $filter('filter')(schedule.jobs, {worker: worker_id, isMorning:isMorning});
            var total_hours = 0;
            for (var i = total_jobs.length - 1; i >= 0; i--) {
              total_hours += total_jobs[i].hours;
            }
            if (total_hours > 4) {
              $scope.showMessage("Jobs exceed 4 hours");
            }
          }
        });
      }
    };

    var hidePopover = function(hideOthers) {
      if (hideOthers) {
        if ($('.popover').length > 1) {
          var popover = $('.popover')[0];
          //Set the state of the popover in the scope to reflect this
          var elementScope = angular.element(popover).scope().$parent;
          elementScope.isOpen = false;
          //Remove the popover element from the DOM
          $(popover).remove();
        };
      }
      else {
        $('.popover').each(function () {
          //Set the state of the popover in the scope to reflect this
          var elementScope = angular.element(this).scope().$parent;
          elementScope.isOpen = false;
          //Remove the popover element from the DOM
          $(this).remove();
        });
      }
      $scope.popoverTabIndex = 0;
    };

    $scope.showJob = function(job) {
      if (!$scope.editingJob) {
        if ($scope.showingJob) {
          hidePopover(true);
        }
        $scope.showingJob = job;
        $scope.editPopover.client = job.client;
        $scope.editPopover.location = job.location;
        $scope.editPopover.description = job.description;
        $scope.editPopover.phone = job.phone;
        $scope.editPopover.make = job.make;
        $scope.editPopover.appliance = job.appliance;
        $scope.editPopover.power_type = job.power_type;
        $scope.editPopover.hours = job.hours;
        $scope.editPopover.city = job.city;
        $scope.editPopover.isMorning = job.isMorning;
      }
    };

    $scope.cancelShow = function() {
      $scope.showingJob = null;
      hidePopover();
    };

    $scope.editJob = function() {
      if (!$scope.editingJob) {
        $scope.editingJob = $scope.showingJob;
        $scope.editingJob.editing = true;
        $scope.sortableOptions.disabled = true;
        $('md-tabs').css('min-height', "448px");
        if ($('.morning-popover')) {
          var popover = $($('.morning-popover')[0]).closest('.popover');
          $(popover).animate({
            'marginTop' : "+=120px"
          });
          $('.arrow', popover).animate({
            'marginTop' : "-=120px" //moves up
          });
        }
        $scope.popoverTabIndex = 1;
        $http.put('/api/schedule/' + $scope.str_date, $scope.editingJob);
      }
    };

    $scope.cancelEdit = function() {
      var job = $scope.editingJob;
      job.editing = false;
      $scope.editingJob = null;
      $scope.sortableOptions.disabled = false;
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
      job.make = $scope.editPopover.make;
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
      $scope.sortableOptions.disabled = false;
      $http.put('/api/schedule/' + $scope.str_date, job ).success(function(schedule) {
        var total_jobs = $filter('filter')(schedule.jobs, {worker: job.worker, isMorning:job.isMorning});
        var total_hours = 0;
        for (var i = total_jobs.length - 1; i >= 0; i--) {
          total_hours += total_jobs[i].hours;
        }
        if (total_hours > 4) {
          $scope.showMessage("Jobs exceed 4 hours");
        }
    });
      hidePopover();
    };

    $scope.addJob = function(worker_id, is_morning) {
      if (!$scope.editingJob) {
        if ($scope.showingJob) {
          hidePopover(true);
        }
        $scope.sortableOptions.disabled = true;
        $scope.showingJob = null;
        $scope.editingJob = true;
        $scope.addPopover.worker = worker_id;
        $scope.addPopover.isMorning = is_morning;
        $('.popover').animate({
            'marginTop' : "-=120px"
          });
          $('.popover .arrow').animate({
            'marginTop' : "+=120px"
          });
      }
    };

    $scope.cancelAdd = function() {
      $scope.editingJob = null;
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      $scope.addPopover.phone = '';
      $scope.addPopover.appliance = '';
      $scope.addPopover.make = '';
      $scope.addPopover.power_type = '';
      $scope.addPopover.hours = 1;
      $scope.addPopover.city = '';
      $scope.sortableOptions.disabled = false;
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
        make: $scope.addPopover.make,
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
      $scope.showingJob = null;
      $http.post('/api/schedule/' + $scope.str_date, new_job ).success(function(schedule) {
      $scope.addPopover.client = '';
      $scope.addPopover.location = '';
      $scope.addPopover.description = '';
      $scope.addPopover.phone = '';
      $scope.addPopover.appliance = '';
      $scope.addPopover.make = '';
      $scope.addPopover.power_type = '';
      $scope.addPopover.hours = 1;
      $scope.addPopover.city = '';
      $scope.sortableOptions.disabled = false;
      hidePopover();
      var total_jobs = $filter('filter')(schedule.jobs, {worker: $scope.addPopover.worker, isMorning:$scope.addPopover.isMorning});
      var total_hours = 0;
      for (var i = total_jobs.length - 1; i >= 0; i--) {
        total_hours += total_jobs[i].hours;
      }
      if (total_hours > 4) {
        $scope.showMessage("Jobs exceed 4 hours");
      }
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
        var delete_job = $scope.editingJob;
        $scope.editingJob = null;
        $http.put('/api/schedule/delete/' + $scope.str_date, delete_job ).success(function(schedule) {
          updateJobs();
          $scope.sortableOptions.disabled = false;
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
        $scope.sortableOptions.disabled = false;
        updateJobs();
        });
    };

    $scope.showMessage = function(msg) {
      var alert = $mdDialog.alert()
        .parent(angular.element(document.body))
        .title('Warning')
        .content(msg)
        .ok('Got it');
      $mdDialog.show(alert);
    };

    $scope.openRight = function() {
      hidePopover();
      $scope.searchInput = "";
      $mdSidenav("right")
        .open()
        .then(function(){
          $http.get('/api/schedule/search/jobs' ).success(function(jobs) {
            $scope.searchJobs = jobs;
          });
      });
    };

    $scope.goToJob = function(date, job_id) {
      $scope.searchInput = "";
      $scope.str_date = date;
      $scope.focusJobId = job_id;
      $mdSidenav("right")
        .close()
        .then(function(){
          $scope.loadWorkers();
      });
    };

    $scope.showTemplateUrl = 'components/template/popover-show-card.html';
    $scope.popoverTabIndex = 0;

    $scope.editPopover = {
      editTemplateUrl: 'components/template/popover-edit-card.html',
      client: '',
      location: '',
      description: '',
      phone: '',
      appliance: '',
      make: '',
      power_type: '',
      hours: 1,
      city: '',
      isMorning: false,
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
      make:'',
      power_type: '',
      hours: 1,
      city: ''
    };

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
    $scope.make_option = [
      "Whirlpool",
      "Samsung",
      "GE",
      "Frigidarie",
      "Maytag",
      "Bosch",
      "KitchenAid",
      "Sub-Zero",
      "Jenn-Air",
      "Danby",
      "Thermador",
      "Moffat",
      "Wallmate"
      ];
    $scope.power_type_option = [
      "Regular",
      "Gas"
      ];


    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('schedule');
      if ($scope.editingJob && $scope.editingJob.editing == true) {
        $scope.editingJob.editing = false;
        $http.put('/api/schedule/' + $scope.str_date, $scope.editingJob);
      };
    });
    $scope.reportGenerator = function(){
      // $('.chatbox').hide();
      // window.print();
      // $('.chatbox').show();
      // var tableString = "<table><thead>";
      // var workerColoum = "<th>";
      // for (var i = 0; i < $scope.workers.length; i++) {
      //   workerColoum += $scope.workers.workerName;
      // };
      // workerColoum+= "</th></thead>";

      // tableString+= workerColoum;
      // tableString += '<tbody><tr><td>asdasdads</td></tr></tbody></table>';
      //window.open('http://localhost:9000/report');
      hidePopover();
      //$scope.is_left_open = true;
      $mdSidenav("left").open();
        
    };

    $scope.closeLeft = function() {
      $mdSidenav("left").close();
      //$scope.is_left_open = false;
    }

    $scope.reportExportExcel = function(){
      var blob = new Blob([document.getElementById('haoba').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Report.xls");
    }


  });
