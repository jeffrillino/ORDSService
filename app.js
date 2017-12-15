
/**
 * @author Jeffry Boma Amachree
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * 
 * This is a sample code which can be used for production to access webservices and 
 * send the output to the response. This is required when you have a challenge with SSL
 * and authentication. 
 * 
 * This is a middleware platform for Oracle REST Data Service (ORDS) that uses APEX for exposing database tables
 * as REST services. Knowing that ORDS when configured on most system generates SSL with localhost and this is not
 * recognized by most browsers, this NodeJS project mediate the challenge and expose the service 
 * via Oracle Application Container Cloud Service (ACCS) with a secured protocol.
 * 
 * This is ideal for Oracle demo purposes because of the SSL issue
 */
 
var ordsAdapter = require("./ordsAdapter");
var express = require("express");
var app = express();

var cors = require("cors");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data


var context = "ords";

 /*
  * Due to SSL issue with Oracle Demo environment, we will ignore verification of SSL Certificate
  */  
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
* We will also ignore CORS due to demo environment restriction
*/
//app.use(cors({origin: '*'}));
app.use(cors({credentials: false, origin: '*'}));


/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded


/*
* Handle all request coming into this server. Resource must be specified
*/ 
//app.all('/' + context + '/ords', upload.any(), function (request, response) {
app.all('*', upload.any(), function (request, response) {
	var outputData = new String();
	var contentType = "application/json";
	var statusCode = 200;
	
	//handle all kind of request in list (POST, GET, PUT, DELETE)...
	try{
		//get full URL
		var _originalURL = request.originalUrl;
		var _baseURL = request.baseUrl;
		var _path = request.path;
		
		var requestMethod = request.method;
		var ordsURLContext = ordsAdapter.getORDSServerContext();
		var ordsFullURL = ordsURLContext + '' + _originalURL;
		
		console.log('ORDS Server: ' + ordsURLContext);
		console.log('-------------*****---------------');
		console.log('Original URL: ' + _originalURL); // '/admin/new'
		console.log(' <Base URL: ' + _baseURL); // '/admin'
		
		console.log('ORDS fullURL: ' + ordsFullURL); // '/new'
		//console.log('--------------*****--------------');
		
		ordsAdapter.showLog(new Date() + " New request from " + request.ip + " with TLS Connection: " + request.secure);
		
		if(requestMethod == "POST"){
			var count = Object.keys(request.body).length;
			ordsAdapter.processPOSTRequest(ordsFullURL, request, response);
		}else if(requestMethod == "GET"){
			ordsAdapter.processGETRequest(ordsFullURL, request, response);
		}else if(requestMethod == "PUT"){
			ordsAdapter.processPUTRequest(ordsFullURL, request, response);
		}else{
			outputData = "404 - Not sure of what you are looking for.";
			ordsAdapter.showErrorOutput(outputData, request, response);
		}
		
		
		
	}catch(error){
		console.log(error);
		outputData = "500 - " + error.message;
		ordsAdapter.showErrorOutput(outputData, request, response);
	}
	
	
});



//use the system port if defined otherwise use 8080
var port = process.env.PORT || 8080; 
app.listen(port, function() {
	console.log("***************************************************************");
	console.log("------------------- ORDS REST API MEDIATOR ------------------");
	console.log('http[s]://<ip_address/hostname>:[' + port + ']/' + context + '/[PDB Name]/');
	console.log('http[s]://localhost:' + port + '/' + context + '/PDB1/');
	console.log('');
	console.log('Please Note the following:');
	console.log('Content-Type: application/json ');
	console.log('POST method must use formData to send information ');
	console.log('PUT method must use header to send information ');
	console.log('');
	console.log("Service Running and waiting for client request ...");
	console.log("****************************************************************");
});


