'use strict';

angular.module('serviceSchedulingApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': "Worker",
      'link': '/worker'
    },{
      'title': "Schedule",
      'link': '/schedule'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
       $location.path('/login')
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
    $scope.generateReport = function(){
      $('.chatbox').hide();
      window.print();
      $('.chatbox').show();
    };
  });