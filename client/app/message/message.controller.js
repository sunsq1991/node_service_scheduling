'use strict';

angular.module('serviceSchedulingApp')
  .controller('MessageCtrl', function ($scope, $http, Auth, socket) {
  $scope.messages = [];
  $scope.userName = "guest";
  
  $http.get('/api/message/').success(function(messages) {
    $scope.messages = messages;
    socket.syncUpdates('message', $scope.messages);
  }); 

  $scope.sendMessage = function(e) {
      if (e.keyCode != 13) return;
      if (Auth.isLoggedIn()) {
        $scope.userName = Auth.getCurrentUser().name;
      }
      else {
        $scope.userName = "guest";
      }
      $http.post('/api/message', {
        text: $scope.messageInput,
        sender: $scope.userName
      }).success(function(messages) {
        $scope.messageInput = "";
        });
    };
});
