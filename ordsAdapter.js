
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
 
var Client = require('node-rest-client').Client;

//set variable to handle all the required info for the ORDS Server
var ordsServerAddress = "141.144.145.196";//"172.20.10.2";
var ordsServerPort = "";//":443"; //leave blank when port is 80
var ordsServerProtocol = "https";

//End point of ORDS (this might not be required if connecting to APEX ORDS)
var ordsServiceEndpoint = ""; //"context/api/";
var ordsServiceVersion = ""; //"v2";

//authentication/authorization for ORDS service
var ordsUserName = ""; //"username";
var ordsPassword = ""; //"Password";


function getORDSEndpointURL(){
	return ordsServerProtocol + "://" + ordsServerAddress + ordsServerPort; // + "/" + ordsServiceEndpoint + ordsServiceVersion;
}

exports.getORDSServerContext = function(){
	return getORDSEndpointURL();
}

function getBasicAuthorization (username, password){
	return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}

exports.getBasicAuthorization = function (username, password){
	return getBasicAuthorization(username, password);
};


exports.processPOSTRequest = function (ordsURL, request, response){
	var promise = require('request-promise');
	//var FormData = require('form-data');
	var serverURL = ordsURL;
	
	headerItem = {};
	FormItem = {};
	for(i = 0; i < Object.keys(request.body).length; i++){
		var key = Object.keys(request.body)[i];
		var value = request.body[key];
		FormItem[key] = value;
	}
	
	for(i = 0; i < Object.keys(request.headers).length; i++){
		var key = Object.keys(request.headers)[i];
		var value = request.headers[key];
		//ignore host in header
		if(key != "host"){
			headerItem[key] = value;
		}
	}
	
	/*
	var authorization = getBasicAuthorization("username, "password");
	headerItem['Authorization'] = authorization;
	headerItem['Access-Control-Allow-Origin'] = '*';
	*/
	
	var args = {
		method: 'POST',
		uri: serverURL,
		//headers: headerItem,
		formData: FormItem, //{'name':'Zone1', 'slogName':'Zone1'},
		json: true
	};
	
	promise(args)
		.then (function(repos){
			outputData = repos;
			if(repos === undefined){
				repos = "{'status':'0'}";
			}
			showRESTOutput(repos, request, response);
		})
		.catch (function (err){
			console.log("------POST ERROR------------" + err);
			showErrorOutput("API call failed - " + err.message, request, response);
		});
		
};

exports.processGETRequest = function (ordsURL, request, response){
	var promise = require('request-promise');
	//var FormData = require('form-data');
	var serverURL = ordsURL;
	console.log('My URL; ' + serverURL);
	
	headerItem = {};
	
	for(i = 0; i < Object.keys(request.headers).length; i++){
		var key = Object.keys(request.headers)[i];
		var value = request.headers[key];
		//ignore host in header
		if(key != "host"){
			headerItem[key] = value;
		}
	}
	console.log('Headers...' + JSON.stringify(headerItem));
	//if authorization is required
	/*
	var authorization = getBasicAuthorization("username, "password");
	headerItem['Authorization'] = authorization;
	headerItem['Access-Control-Allow-Origin'] = '*';
	*/
	
	var args = {
		method: 'GET',
		uri: serverURL,
		headers: headerItem, //{'name':'Zone1', 'slogName':'Zone1'},
		json: true
	};
	
	promise(args)
		.then (function(repos){
			outputData = repos;
			if(repos === undefined){
				repos = "{'status':'0'}";
			}
			showRESTOutput(repos, request, response);
		})
		.catch (function (err){
			console.log("------GET Error ------------" + err);
			showErrorOutput("API call failed - " + err.message, request, response);
		});
		
};

exports.processPUTRequest = function (ordsURL, request, response){
	var promise = require('request-promise');
	//var FormData = require('form-data');
	var serverURL = ordsURL;
	
	
	headerItem = {};
	
	for(i = 0; i < Object.keys(request.headers).length; i++){
		var key = Object.keys(request.headers)[i];
		var value = request.headers[key];
		//ignore host in header
		if(key != "host"){
			headerItem[key] = value;
		}
	}
	
	/*
	var authorization = getBasicAuthorization("username, "password");
	headerItem['Authorization'] = authorization;
	headerItem['Access-Control-Allow-Origin'] = '*';
	*/
	// Note- Put doesnt use formdata
	var args = {
		method: 'PUT',
		uri: serverURL,
		headers: headerItem,
		json: true
	};
	
	promise(args)
		.then (function(repos){
			outputData = repos;
			if(repos === undefined){
				repos = "{'status':'0'}";
			}
			showRESTOutput(repos, request, response);
		})
		.catch (function (err){
			console.log("------Error 1 ------------" + err);
			showErrorOutput("API call failed - " + err.message, request, response);
		});
		
};

/**
 * showErrorOutput
 * Send Error code and message to the browser or device
 * */
function showErrorOutput(outputData, request, response){
	setResponseHeader(response);
	response.writeHead(500, {
	 'Content-Type': 'text/plain'
	});
	response.write(JSON.stringify(outputData));
	response.end();
    
}

exports.showErrorOutput = function (outputData, request, response){
	showErrorOutput (outputData, request, response);
};

/**
 * showRESTOutput
 * Display the output on part of the response to the end user irrespective of the browser being use (including CURL)
 * */
function showRESTOutput(outputData, request, response){
	console.log(outputData);
    setResponseHeader(response);
    response.writeHead(200, {
	 'Content-Type': 'application/json'
	});
	
	response.write(JSON.stringify(outputData));
	response.end();
}

/**
 * setResponseHeader
 * This method set default headers for CORS and can be altered 
 * depending on the kind of service being provided.
 * */
function setResponseHeader(response){
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Credentials', 'false');
	response.header('X-Powered-By', 'Nigeria Presales Team - Jeffry Amachree')
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    response.header('Access-Control-Allow-Methods', 'POST,PUT,GET');
	//res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	//response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	response.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Content-Type, Accept');
	//response.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept');
}

/**
 * showConsoleLog is used to display output to the console.
 * */
function showConsoleLog(message){
	console.log(new Date() + " > " + message);
}

exports.showLog = function(message) {
	showConsoleLog(message);
};








