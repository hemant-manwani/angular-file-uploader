	angular.module('file-uploader', []).factory('FileUploadFactory', ['$q', '$http', function($q, $http) {
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
				if(typeof options=='object' && options.custom==true){
					var date = new Date();
					var validImageExtensions = [".jpg",".png",".jpeg"];
					for(var i=0;i<validImageExtensions.length;i++){
						if(fileName.indexOf(validImageExtensions[i])!==-1){
							fileName = date.getTime()+(Math.floor(Math.random()*90000) + 10000)+validImageExtensions[i];
							break;
						}
					}
				}
				$http.get(appConfig.documentsSign, {
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

					var upload = function() {
						var uploadXhr = null;
						$.ajax({
							type: 'PUT',
							url: result.data.signedUrl,
							data: blob,
							contentType: fileType,
							cache: false,
							async:true,
							processData: false,
							beforeSend: function(jqXHR, settings) {
								uploadXhr = jqXHR;  // To get the ajax XmlHttpRequest
							},
							success: function(response, textStatus, jqXHR) {
								clearInterval(intervalId);
								deferred.resolve({url: fileUrl, dataUrl: dataURI});
							},
							error: function(jqXHR, textStatus, errorThrown) {
								if (++counter <= appConfig.MAX_RETRIES) {
									upload();
								} else {
									clearInterval(intervalId);
									deferred.reject(errorThrown);
								}
							},
							xhr: function() {
								var myXhr = $.ajaxSettings.xhr();
								if (myXhr.upload) {
									myXhr.upload.addEventListener('progress', function (e) {
										if (e.lengthComputable) {
											var percentLoaded = Math.round((e.loaded / e.total) * 100);
											if($(".progressBar").length){
												$(".progressBar").css({width:percentLoaded/100*300});
												$("#percentageCompleteText").text(percentLoaded+'% Complete');
											}
											deferred.notify(percentLoaded);
										}

									}, false);
								}
								return myXhr;
							}
						})
						var intervalId = setInterval(function () {
							if(!navigator.onLine){
								clearInterval(intervalId);
								uploadXhr.abort();
							}
						}, 5000)
					}
					upload();
				})
				.catch(function (error) {
					// MessageFactory.error('There was a problem in uploading your attachment ' + file.name + '.', 'Upload Failed');
					return deferred.reject(error)
				})
				return deferred.promise;
			}
		}
	}])
