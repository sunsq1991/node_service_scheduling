'use strict';

angular.module('serviceSchedulingApp')
  .controller('MessageCtrl', function ($scope, $http, Auth, socket) {
  $scope.messages = [];
  $scope.userName = "guest";
  
  $http.get('/api/message/').success(function(messages) {
    $scope.messages = messages;
    setTimeout($scope.scrollToBottom, 100);
     
    socket.syncUpdates('message', $scope.messages,function(){
      $http.get('/api/message/').success(function(messages) {
        var objDiv = $('.message-list')[0];
        objDiv.scrollTop = objDiv.scrollHeight;
      });
    });
 
  });

  $scope.scrollToBottom = function(){
    var objDiv = $('.message-list')[0];
    objDiv.scrollTop = objDiv.scrollHeight;
  };

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
