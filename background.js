// use it to "zero" since parameter, when added new tags, or other things cause that you want to perform all operations for all articles.
var sinceKey = "since2";
var redirect_url = window.location.href.replace("background.html","oauth.html");

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
	var bodyObj = {"consumer_key":consumer_key,"access_token":oauth.getAuthToken(),"contentType":"article","sort":"oldest","detailType":"complete"};	

	if (since) {
		bodyObj.since=since;
	}
	var body = JSON.stringify(bodyObj);
	var headers = [];	 
	headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});
	try {
		var response = fetch(url,"POST",headers,body,null,false,false);
		return response;
	} catch (e) {
		// OK, something went wrong, proceed
		return '{"list":{}}';
	}
}

function modify(articles) {
	var bodyObj = {"consumer_key":consumer_key,"access_token":oauth.getAuthToken()};
	bodyObj.actions=new Array();
    for (var i=0; i<articles.length; i++) {
		var article = articles[i];		
		var minutesToRead = Math.floor(article.word_count/200);
		var itemId = article.item_id;
		var tag = null;
		var currentTags = article.tags;
		if (minutesToRead<=1) { tag="1 minute or less"; }
		else if (minutesToRead<=2) { tag="2 minutes or less"; }
		else if (minutesToRead<=5) { tag="5 minutes or less"; }
		else if (minutesToRead<=10) { tag="10 minutes or less"; }
		else if (minutesToRead<=15) { tag="15 minutes or less"; }
		else if (minutesToRead<=30) { tag="30 minutes or less"; }
		else tag = "30+ minutes";
		var tags = ["1 minute or less","2 minutes or less","5 minutes or less","10 minutes or less","15 minutes or less","30 minutes or less","30+ minutes"].filter(function(x) { return x!=tag; });		
		var tagsToRemove = [];
		if (currentTags) {
			for (var tagIdx = 0; tagIdx<tags.length; tagIdx++) {
				if (currentTags[tags[tagIdx]]) {
					tagsToRemove.push(tags[tagIdx]);
				}
			}
		}
		var url = "https://getpocket.com/v3/send";
		var removeTagsAction = null;
		if (tagsToRemove.length!=0) {
			removeTagsAction = {"action":"tags_remove","tags":String(tagsToRemove),"item_id":itemId};
		}
		var addTagAction = null;
		if (!currentTags || (currentTags && !currentTags[tag])) {
			addTagAction = {"action":"tags_add","tags":tag,"item_id":itemId};
		}
		if (removeTagsAction!=null) {
			bodyObj.actions.push(removeTagsAction);
		}
		if (addTagAction) {
			bodyObj.actions.push(addTagAction);
		}
	}
	if (bodyObj.actions.length>0) {
		var body = JSON.stringify(bodyObj);
		var headers = [];
		headers.push({"name":"Content-Type","value":"application/json; charset=UTF8"});	
		try {
			var response = fetch(url,"POST",headers,body,null,false,false);
			// OK, here we should pass value calculated from response....
			return true;
		} catch(e) {
			return false;
		}
	}
	return true;
}

function addTagsToAllNewPosts() {
	var list = JSON.parse(retrieve(localStorage[sinceKey]));
	var count = 0;
	var wordsCount = 0;
	var articles = [];
	var canUpdateSince = true;
	var needToUpdateSince = false;
	for (var key in list.list) {
		var article = list.list[key];
		if (article.status!="0") {
			console.log("skip "+article.item_id);
			continue;
		}
		count++;
		wordsCount+=article.word_count*1;
		articles.push(article);
		if (articles.length==100) {
			canUpdateSince&=modify(articles);
			needToUpdateSince = true;
			articles = [];
		}
	}
	if (articles.length!=0) {
		canUpdateSince&=modify(articles);
		needToUpdateSince = true;
	}
	if (needToUpdateSince && canUpdateSince) {
		// OK, may make problems...	
		updateSince();
	}
	
	console.log("count="+count);
	console.log("wordsCount="+wordsCount);
	setTimeout(addTagsToAllNewPosts,5*60*1000);
}

function updateSince() {
	var list2 = JSON.parse(retrieve(Math.floor(new Date().getTime()/1000)));
	if (list2.since) {
		if (list2.since>localStorage[sinceKey]*1) {
			localStorage[sinceKey]=list2.since;
			// publish since
			var sinceObj = {};
			sinceObj[sinceKey]=list2.since;
			chrome.storage.sync.set(sinceObj);
		}
	}
}

function init() {
	if (!oauth.isAuthorized()) {
		oauth.authorize();
		return;
	}
	console.log("authorized");
	console.log(localStorage[sinceKey]);
	setTimeout(addTagsToAllNewPosts,1*1000);
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
	if (namespace=='sync') {
		var obj = changes[sinceKey];
		if (obj) {
			var sinceVal = obj.newValue;
			if (sinceVal) {
				var localSinceVal = localStorage[sinceKey];
				if (localSinceVal) {
					if (localSinceVal*1<sinceVal*1) {
						localStorage[sinceKey]=sinceVal;
					}
				} else {
					localStorage[sinceKey]=sinceVal;
				}				
			}
		}
	}
});

chrome.storage.sync.get(function(items) {
	if (items[sinceKey]) {
		localStorage[sinceKey]=items[sinceKey];
	}
	init();
});