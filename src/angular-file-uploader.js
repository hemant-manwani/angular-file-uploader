(function(){
  function fileuploadProvider(){
    var url;
    function dataUriToBlob(dataURI) {
  		var byteString;
  		if (dataURI.split(',')[0].indexOf('base64') >= 0){
        byteString = atob(dataURI.split(',')[1]);
      }else{
        byteString = unescape(dataURI.split(',')[1]);
      }
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var ia = new Uint8Array(byteString.length);
  		for (var i = 0; i < byteString.length; i++) {
  			ia[i] = byteString.charCodeAt(i);
  		}
      return new Blob([ia], {type:mimeString});
  	}
    return{
      configure: function(settings){
        url = settings.url
      },
      $get: function($http, $q){
        return {
    			uploadToS3: function(dataURI, fileName, fileType, options){
    				var deferred = $q.defer(), fileUrl, folderStructure, appendName, counter = 0;
    				if(typeof options=='object' && options.folderStructure!=null){
    					folderStructure = options.folderStructure;
    				}
    				if(typeof options=='object' && options.appendName!=null){
    					appendName = options.appendName;
    				}
    			  $http.get(url, {
    					params: {
    						name: fileName,
    						type: fileType,
    						folder: folderStructure,
    						appendName : appendName
    					}
    				})
    				.then(function (result) {
    					fileUrl = result.data.data.url;
              var blob = dataUriToBlob(dataURI)
              var upload = function() {
    						var uploadXhr = null;
    						$.ajax({
    							type: 'PUT',
    							url: result.data.data.signedUrl,
    							data: blob,
    							contentType: fileType,
    							cache: false,
    							async:true,
    							processData: false,
    							beforeSend: function(jqXHR, settings) {
    								uploadXhr = jqXHR;
    							},
      						success: function(response, textStatus, jqXHR) {
      							deferred.resolve({url: fileUrl, dataUrl: dataURI});
      						},
      						error: function(jqXHR, textStatus, errorThrown) {
      							deferred.reject(errorThrown);
      						},
      					})
      				}
      				upload();
      			})
      			.catch(function (error) {
      				return deferred.reject(error)
      			})
      			return deferred.promise;
      		}
      	}
      }
    }
  };
  var angularFileUploader = angular.module('angular-file-uploader', []);
  angularFileUploader.provider('fileupload', fileuploadProvider);
  angularFileUploader.directive("fileuploader", ['fileupload', function($fileupload){
    return{
      restrict: "E",
      scope: {
        success: "&",
        error: "&"
      },
      template: '<div id="file-uploader-wrapper"><input type="file" id="file-uploader" onchange="angular.element(this).scope().upload(this)"/><div id="file-uploader-title">Drop or click to upload</div></div><style>body{padding-top:50px;padding-bottom:20px}.nomargin{margin:0!important}.nopadding{padding:0!important}#file-uploader-wrapper{position:relative}#file-uploader{width:70%;height:100px;text-indent:-999999px;color:transparent;display:block;margin:0 auto;border:4px solid #93bd88;border-radius:10px}#file-uploader-title{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#846753;z-index:-5;font-size:22px;font-weight:700}.upload-result{width:80%;margin:50px auto 0}.upload-result li{border-width:2px}</style>',
      link: function(scope, elements, attrs){
        scope.upload = function(element){
          var file = element.files[0];
          var reader  = new FileReader();
          reader.onload = function(data){
            $fileupload.uploadToS3(data.target.result, file.name, file.type)
            .then(function(data){
              var success = scope.success();
              success(data);
            })
            .catch(function(err){
              var error = scope.error(err);
              error(err);
            })
          }
          reader.readAsDataURL(file);
        }
      }
    }
  }]);

})();
