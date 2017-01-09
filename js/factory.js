(function () {
  'use strict';
  appRoot.factory('FileUploadFactory', ['$q', '$http', function($q, $http) {
    var url = "http://localhost:3000/signedUrl";
    function dataUriToBlob(dataURI) {
			// convert base64/URLEncoded data component to raw binary data held in a string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(dataURI.split(',')[1]);
			else
				byteString = unescape(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			return new Blob([ia], {type:mimeString});
		}
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
					fileUrl = result.data.url;
					var blob = dataUriToBlob(dataURI)
          console.log(result);
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
								uploadXhr = jqXHR;  // To get the ajax XmlHttpRequest
							},
							success: function(response, textStatus, jqXHR) {
								deferred.resolve({url: result.data.data.url, dataUrl: dataURI});
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
  }]);
}());
