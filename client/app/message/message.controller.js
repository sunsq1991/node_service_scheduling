'use strict';

angular.module('serviceSchedulingApp')
  .controller('MessageCtrl', function ($scope, $http, Auth, socket) {
  $scope.messages = [];
  $scope.savedMessage = "";
  $scope.userName = "guest";
  $scope.scrollBar = true;
 $scope.clicked = true;
  $scope.alerts = [];
  
  $('.chatbox').addClass('clicked');


  var tempTop=0;

  $http.get('/api/message/').success(function(messages) {
    $scope.messages = messages;
    setTimeout($scope.scrollToBottom, 100);
     
    socket.syncUpdates('message', $scope.messages,function(){
      $scope.alerts = [];
      
       $http.get('/api/message/').success(function(messages) {
    
         var objDiv = $('.message-list')[0];
         if ((Auth.getCurrentUser().name != messages[messages.length-1].sender) && ($('.chatbox').hasClass('clicked')==true)) {
          
          $('.alertMessage').text("New Msg!");
          $('.alertMessage').show();
         };    
          if ($scope.scrollBar) {       
          objDiv.scrollTop = objDiv.scrollHeight;
          }  
       });
       
    }); 

  });

 
 
  $scope.scrollToBottom = function(){
    var objDiv = $('.message-list')[0];
    objDiv.scrollTop = objDiv.scrollHeight;
    $scope.scrollBar = true;
  }


$($('.message-list')[0]).on('scroll',function(){

    tempTop= $($('.message-list')[0]).scrollTop();

    $('.message-list')[0].scrollTop = $('.message-list')[0].scrollHeight;

    if (tempTop==$('.message-list')[0].scrollTop) {
            $scope.scrollBar = true;
        
          // if($('.chatbox').hasClass('clicked')){
          
          // $('.alertMessage').text("New Msg!");
          // $('.alertMessage').show();
          // }  
    }
    else{
          $scope.scrollBar = false;
          $('.message-list')[0].scrollTop= tempTop; 
    } 
  })

  $scope.sendMessage = function(e) {
      if (e.keyCode != 13) return;
      if (!$scope.messageInput) {
        $scope.messageInput = "";
        return;
      }
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
        $scope.savedMessage =  $scope.messageInput;
        $scope.messageInput = "";
        });
    };

  $('.md-toolbar-tools').click(function(){ 
    if (!$scope.clicked){
      $('.chatbox').addClass('clicked');
       $scope.clicked  = true;
       $('#upanddown').removeClass('glyphicon-arrow-down');
       $('#upanddown').addClass('glyphicon-arrow-up');
       return;
    }
    else if ($scope.clicked) {
      $('.chatbox').removeClass('clicked');
      $scope.clicked  = false;
      $('#upanddown').removeClass('glyphicon-arrow-up');
       $('#upanddown').addClass('glyphicon-arrow-down');
           $scope.alerts = [];
            $('.alertMessage').text("");
            $('.alertMessage').hide();
      return;
    }
    
  });

  
});
