var globalFriendList = new Array();
var globalUserId = 0;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.agent && request.agent=="renren-background-check") {
		uid = request.user;
		console.log('get connneted, background check for '+uid);
		sendResponse({agent:"renren-background-check", message:"main.html get uid="+uid});
		globalUserId = uid;
		getFriendList(uid);
	}
});


function getFriendList(uid){
	pageNo = 0;
	URL = 'http://friend.renren.com/GetFriendList.do?curpage='+pageNo.toString()+'&id='+uid;
	$.get(URL, {}, function(data){
		Group = $('div.page > a', data);
		var min_pageNo = 1;
		var max_pageNo = 0;
		for (var i=0; i<Group.length; i++){
			var string = Group[i].href;
			var selection = /curpage=\d+/g.exec(string);
			var integer = 0;
			if (selection){
				integer = parseInt(selection[0].slice(8));
				if (integer > max_pageNo){
					max_pageNo = integer;
				}
			}
		}
		console.log('min:'+min_pageNo.toString()+' max:'+max_pageNo.toString());
		idList = $('div#list-results div.info a',data);
		for (var j=0; j<idList.length; j++){
			selection = /profile\.do\?id=\d+/g.exec(idList[j].href);
			if (selection) {
				friendid = /\d+/g.exec(selection[0])[0];
				globalFriendList.push(friendid)
			}
		}
		for (var i=min_pageNo; i<=max_pageNo; i++){
			URL = 'http://friend.renren.com/GetFriendList.do?curpage='+i.toString()+'&id='+uid;
			$.get(URL, {}, function(newdata){
				idList = $('div#list-results div.info a',newdata);
				for (var j=0; j<idList.length; j++){
					selection = /profile\.do\?id=\d+/g.exec(idList[j].href);
					if (selection) {
						friendid = /\d+/g.exec(selection[0])[0];
						globalFriendList.push(friendid)
					}
				}
			},'html')
		}
	}, 'html')
}
