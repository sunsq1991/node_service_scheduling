'use strict';

angular.module('serviceSchedulingApp')
  .controller('MessageCtrl', function ($scope, $http, socket,$mdDialog) {

  $scope.messages = null;
    $scope.sortableOptions = {
      cursor: "move",
      connectWith: ".sortable-container",
      placeholder: "sortable-placeholder"
    };
   
    $http.get('/api/message/').success(function(messages) {
      $scope.messages = messages;
      socket.syncUpdates('message', $scope.messages);
    }); 

    $scope.sendMessage = function($event,text){
      var target_date = new Date();
       $http.post('/api/message', { text: text, date: target_date} );
    }
});
