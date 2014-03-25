function OAuth(config) {
  this.request_uri = config['request_url'];
  this.authorize_url=config['authorize_url'];
  this.access_url=config['access_url'];
  this.consumer_key=config['consumer_key'];
  this.redirect_url = config['redirect_url'];

  this.authorize = function() {
	 var url = this.request_uri;
	 //Content-Type: application/json; charset=UTF8
	 var headers = [];	 
	 headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});
	 var body = '{"consumer_key":"'+this.consumer_key+'","redirect_uri":"'+this.redirect_url+'"}';
	 var response = fetch(url,"POST",headers,body,null,false,false);
	 response = response.split("=")[1];
	 localStorage["request_token"]=response;
	 var url = "https://getpocket.com/auth/authorize?request_token="+response+"&redirect_uri="+this.redirect_url;
	 console.log(url);
	 chrome.tabs.create({"url":url});
  }
  
  this.isAuthorized = function() {
    if (localStorage["access_token4"]) return true;
	return false;
  }
  
  this.getAuthToken = function() {
	return localStorage["access_token4"];
  }
}