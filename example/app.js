var app = angular.module('app',['angular-file-uploader']);
app.config(["fileuploadProvider", function(fileuploadProvider){
  fileuploadProvider.configure({
    url: "http://54.169.218.46:3005/signedUrl"
  });
}]);
app.controller('fileUploadController', ['$scope', function ($scope) {
  $scope.files = [];
  $scope.fileUploaded = function(data){
    console.log(data);
  }
  $scope.fileNotUploaded = function(err){
    console.log(err);
  }
}]);
