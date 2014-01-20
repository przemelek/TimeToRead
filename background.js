var redirect_url = window.location.href.replace("background.html","oauth.html");
console.log(redirect_url);

var oauth = new OAuth({
	'request_url': 'https://getpocket.com/v3/oauth/request',
	'authorize_url': 'https://getpocket.com/auth/authorize',  
	'access_url': 'https://getpocket.com/v3/oauth/authorize',
	'redirect_url': redirect_url,
	'consumer_key': consumer_key,
});

// function fetch(url,method,headers,body,callback,async,returnAsXML)
function retrieve(since) {
	var url = "https://getpocket.com/v3/get";
	var body = '{"consumer_key":"'+consumer_key+'","access_token":"'+oauth.getAuthToken()+'","contentType":"article"';
	if (since) {
		body+=',"since":"'+since+'"';
	}
	body+="}";
	var headers = [];	 
	headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});	
	var response = fetch(url,"POST",headers,body,null,false,false);
	//console.log(response);
	return response;
}

function modify(articles) {
	var body =  '{"consumer_key":"'+consumer_key+'","access_token":"'+oauth.getAuthToken()+'","actions":[';
    for (var i=0; i<articles.length; i++) {
		var article = articles[i];
		var minutesToRead = Math.floor(article.word_count/200);
		var itemId = article.item_id;
		var tag = null;
		if (minutesToRead<=1) { tag="1 minute or less"; }
		else if (minutesToRead<=2) { tag="2 minutes or less"; }
		else if (minutesToRead<=5) { tag="5 minutes or less"; }
		else if (minutesToRead<=10) { tag="10 minutes or less"; }
		else if (minutesToRead<=30) { tag="30 minutes or less"; }
		else tag = "30+ minutes";
		var url = "https://getpocket.com/v3/send";
		body +=  '{"action":"tags_add","item_id":"'+itemId+'","tags":["'+tag+'"]},';					
	}
	body=body.substring(0,body.length-1);
	body+=']}';
	var headers = [];
	headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});	
	var response = fetch(url,"POST",headers,body,null,false,false);
	//console.log(response);
}

function addTagsToAllNewPosts() {
	var list = JSON.parse(retrieve(localStorage["since"]));
	//console.log(list.length);
	//console.log(list.list);
	var count = 0;
	var wordsCount = 0;
	var articles = [];
	for (var key in list.list) {
		var article = list.list[key];
		if (article.status!="0") {
			console.log("skip "+article.item_id);
			continue;
		}
		count++;
		articles.push(article);
		if (articles.length==100) {
			modify(articles);
			articles = [];
		}
	}
	if (articles.length!=0) {
		modify(articles);
	}
	// OK, may make problems...
	var list2 = JSON.parse(retrieve(Math.floor(new Date().getTime()/1000)));
	localStorage["since"]=list2.since;
	console.log("count="+count);
	//console.log("wordsCount="+wordsCount);
	setTimeout(addTagsToAllNewPosts,5*60*1000);
}

function init() {
	if (!oauth.isAuthorized()) {	
		oauth.authorize();
		return;
	}
	console.log("authorized");
	
	setTimeout(addTagsToAllNewPosts,0);
}

init();