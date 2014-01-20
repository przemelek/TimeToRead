var consumer_key = "<put here your key>";

  function fetch(url,method,headers,body,callback,async,returnAsXML) {
	  	    
        var xhr = new XMLHttpRequest();
		if (async) {
			xhr.onreadystatechange = function() {
			  if (xhr.readyState === 4) {
				if (xhr.status === 200) {
				  callback(xhr.responseText);
				} else {
				  callback(null);
				}
			  }
			}
		}
		xhr.open(method, url, async);
		if (headers!==null) {
			for (var i=0; i<headers.length; i++) {
				xhr.setRequestHeader(headers[i].name,headers[i].value);
			}
		}
		if (body!==null) {
			xhr.send(body);
		} else {
			xhr.send();
		}
		if (!async) {
			if (returnAsXML) {
			    //alert(xhr.responseText);
				return xhr.responseXML;
			} else {
				return xhr.responseText;
			}
		}
      };    
