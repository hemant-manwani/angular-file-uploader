# Angular file uploader

This angular module is used to make uploads on AWS S3 service. To use this module, inject it in your app using the following

```sh
var your_app = angular.module('your_app',['angular-file-uploader']);
```
In your template somewhere use the following directive with success and error callbacks to know, if a file is uploaded or not.

```sh
<fileuploader success="fileUploaded" error="fileNotUploaded"></fileuploader>
```
Above success and error callbacks can be defined in your controller. For more info see this [example](https://github.com/hemant-manwani/angular-file-uploader/tree/master/example)

You can configure your uploading URL in the provider as follows: 
```sh
app.config(["fileuploadProvider", function(fileuploadProvider){
  fileuploadProvider.configure({
    url: "TARGET_URL"
  });
}]);
```
For refererencing nodejs code to upload on S3 please see [Upload.js](https://github.com/hemant-manwani/s3-node-upload)
