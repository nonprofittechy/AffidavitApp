myapp.controller('clientviewCtrl', function($scope, $http, $state) {
  var j = jQuery.noConflict();
  j(document).ready(function(){
    j("#myCarousel").carousel({interval: false});
  });

  // sets classes of yes/no buttons depending on current click / click history
  function setyes() {
      var j = jQuery.noConflict();
      j('#b1').removeClass('unclicked');
      j('#b1').addClass('clicked');
      j('#b2').removeClass('clicked');
      j('#b2').addClass('unclicked');
  }
  function setno() {
      var j = jQuery.noConflict();
      j('#b2').removeClass('unclicked');
      j('#b2').addClass('clicked');
      j('#b1').removeClass('clicked');
      j('#b1').addClass('unclicked');
  }
  function setunclicked() {
      var j = jQuery.noConflict();
      j('#b2').removeClass('clicked');
      j('#b2').addClass('unclicked');
      j('#b1').removeClass('clicked');
      j('#b1').addClass('unclicked');
  }
  $scope.mediaRecorder;
  // TRANSCRIPTION STUFF
  $scope.result = "";
  $scope.start = function() {
    $scope.recording = true;
    $scope.startDictation();
  };
  $scope.startDictation = function() {
    if (!$scope.recording) {
      return;
    }
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      if ($scope.user.language == "English")
        recognition.lang = "en-US";
      else
        recognition.lang = "es-MX";
      recognition.start();
      recognition.onresult = function(e) {
        $scope.result += e.results[0][0].transcript;
        recognition.stop();
        console.log($scope.result);
        if ($scope.recording)
          $scope.startDictation();
        else
          $scope.videos[$scope.curIndex].response = $scope.result;
      };
      recognition.onerror = function(e) {
        console.log("error");
        recognition.stop();
        // $scope.mediaRecorder.stop();
        // $scope.mediaRecorder.save();
      }
    }
    navigator.getUserMedia(
      {audio: true},
      function(stream) {
        $scope.mediaRecorder = new MediaStreamRecorder(stream);
        $scope.mediaRecorder.mimeType = 'audio/ogg';
        $scope.mediaRecorder.audioChannels = 1;
        $scope.mediaRecorder.ondataavailable = function (blob) {
          // POST/PUT "Blob" using FormData/XHR2
          // console.log("Invoking save");
          $scope.mediaRecorder.save();
          var blobURL = URL.createObjectURL(blob);
          console.log("blob", blob);
          console.log("URL", blobURL);
          console.log("TRY TO SAVE YO");
          $scope.mediaRecorder.save();
          // document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
        };
        $scope.mediaRecorder.start();
        console.log("starting");
        console.log("state", $scope.mediaRecorder.state);
        console.log("recorder started");},
        function errorCallback(e){
          console.error('media error', e);
        }
      );
  };
  $scope.stopDictation = function() {
    $scope.recording = false;
    if ($scope.mediaRecorder == undefined){
      console.log("uh oh");
    }
    $scope.mediaRecorder.stop();
    console.log("state", $scope.mediaRecorder.state);
    // $scope.mediaRecorder.save();


  };

  // returns true if we're on the first page, false otherwise
  $scope.firstpage = function(){
      i = $scope.curIndex;
      i--;
      while(i > -1 && $scope.videos[i].show == false){
          i--;
      }
      if (i == -1){
          return true;
      }
      else {
          return false;
      }
  };

  // returns true if we're on the last page, false otherwise
  /*$scope.lastpage = function(){
      return $scope.curIndex >= $scope.videos.length;
  };*/

  $scope.setbuttons = function() {
      // set whether or not next button is hidden, and classes of true/false buttons
      if ($scope.videos[$scope.curIndex]['yesno'] == true) {
          if ($scope.videos[$scope.curIndex]['response'] === "") {
              //document.getElementById('next').hidden = true;
              setunclicked();
          } else {
              document.getElementById('next').hidden = false;
              if ($scope.videos[$scope.curIndex]['response'] == true) {
                  setyes();
              } else {
                  setno();
              }
          }
      } else {
          document.getElementById('next').hidden = false;
      }
  };

  // set buttons based on whether it's a yes or no question
  $scope.yesno = function() {
    if ($scope.curIndex < $scope.videos.length)
      return $scope.videos[$scope.curIndex]['yesno'];
    else
      return true;
  };

  // view next video
  $scope.next_vid = function(){
      if ($scope.curIndex >= $scope.videos.length - 1) {
        //return;
        $scope.lastpage = true;
        return;
      }
      if($scope.videos[$scope.curIndex].yesno == true &&
         $scope.videos[$scope.curIndex]['response'] == true){
          $scope.curIndex = $scope.videos[$scope.curIndex]['yesJump'];
      } else {
          $scope.curIndex = $scope.videos[$scope.curIndex]['noJump'];
      }
      $scope.curvid = $scope.videos[$scope.curIndex]['url'];
      $scope.setbuttons();
  };

  // when 'yes' clicked on yes/no question
  $scope.yes = function() {
      $scope.videos[$scope.curIndex]['response'] = true;
      //document.getElementById('next').hidden = false;
      setyes();
  };

  // when 'no' clicked on yes/no question
  $scope.no = function() {
      $scope.videos[$scope.curIndex]['response'] = false;
      //document.getElementById('next').hidden = false;
      setno();
  };

  $scope.submit = function() {
      $state.go('history');
  };


  /********************** SCOPE DATA ****************************/
  $scope.curIndex = 0;
  $scope.user = {
        'id': 1,
        'fname': 'James',
        'lname': 'Smith',
        'uname': 'JSmith01',
        'language': 'English',
        'type' : 14, 
        'clients': [2,3,4]
  };
  $scope.videos = videos;
  $scope.curvid = $scope.videos[$scope.curIndex]['url'];
  //document.getElementById('next').hidden = true;
  $scope.progress=0;
  //$scope.saveplace();
  console.log($scope.videos);
});

myapp.filter("trustUrl", ['$sce', function($sce){
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);