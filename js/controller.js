(function () {
  'use strict';
  appRoot.controller('fileUploadController', ['$scope', 'FileUploadFactory', function ($scope, $fileUploader) {
    $scope.files = [];
    $scope.upload = function(element){
      var file = element.files[0];
      var reader  = new FileReader();
      reader.onload = function(data){
        $fileUploader.uploadToS3(data.target.result, file.name, file.type)
        .then(function(data){
          $scope.files.push({url: data.url, name: file.name});
        })
        .catch(function(err){
          console.log($scope.files.push(file.name + "is not uploaded."))
        })
      }
      reader.readAsDataURL(file);
    }
  }]);
}());
