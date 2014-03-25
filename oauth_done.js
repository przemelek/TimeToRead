var url = "https://getpocket.com/v3/oauth/authorize";
var request_token = localStorage["request_token"];
var body = '{"consumer_key":"'+consumer_key+'","code":"'+request_token+'"}';
var headers = [];
headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});
//headers.push({"name":"X-Accept","value":"application/json"});
var response = fetch(url,"POST",headers,body,null,false,false);
var elems = response.split("&");
for (var i=0; i<elems.length; i++) {
  var v = elems[i].split("=");
  if (v[0]=="access_token") v[0]="access_token4";
  localStorage[v[0]]=v[1];
}
chrome.extension.getBackgroundPage().init();
window.close();