'use strict';

angular.module('serviceSchedulingApp')
  .controller('MessageCtrl', function ($scope, $http, Auth, socket) {
  $scope.messages = [];
  $scope.userName = "guest";
  if (Auth.isLoggedIn()) {
    $scope.userName = Auth.getCurrentUser().name;
  }
  $http.get('/api/message/').success(function(messages) {
    $scope.messages = messages;
    socket.syncUpdates('message', $scope.messages);
  }); 

  $scope.sendMessage = function($event,text){
    var target_date = new Date();
     $http.post('/api/message', { text: text, date: target_date} );
  };
  $scope.sendMessage = function(e) {
      if (e.keyCode != 13) return;
      $http.post('/api/message', {
        text: $scope.messageInput,
        sender: $scope.userName
      }).success(function(messages) {
        $scope.messageInput = "";
        });
    };
});
