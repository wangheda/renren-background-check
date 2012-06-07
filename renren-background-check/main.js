var globalFriendList = new Array();
var globalFriendName = new Array();
var globalFriendHead = new Array();
var globalFriendName = new Array();
var globalUserHead = '';
var globalUserId = 0;
var globalUserName = 0;
var globalSignGFL = new Array(1);// get friends list
var globalSignAFS = new Array(1);//all friend's status
var globalSignAFC = new Array(); // all friend's status's comment
var globalStatus = {};
var globalUserId = 0;

// 各步的完成状态
var globalOkWithAuthor = false;
var globalOkWithFriendList = false;
var globalOkWithFriendStatus = false;
var globalOkWithFriendComment = false;


// 状态变量保证各步只运行一次
var globalNotFetchedStatus = true;
var globalNotFetchedComment = true;
var globalNotProcessedComment = true;

// 抓取回复的间隔
var paramInterval = 25;

// 调试配置变量，正式发布全设置为 true
var globalSignGetFriendList = true;//是否抓取好友列表和最近状态
var globalSignGetFriendComment = true;//是否抓取好友状态的回复
var globalSignDoAnalysis = true;//是否对回复进行分析

// 两个Array
var globalWhoCareAboutTA = new Array();
var globalWhoTACareAbout = new Array();

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.agent && request.agent=="renren-background-check") {
		uid = request.user;
		globalUserId = uid;
		console.log('get connneted, background check for '+uid);
		sendResponse({agent:"renren-background-check", message:"main.html get uid="+uid});
		globalUserId = uid;
		getAuthor();
		$('#author').click(function(){
			getAuthor();
		});
		if (localStorage['globalFriendList_'+globalUserId.toString()]){
			// 曾经有数据， 展示数据
			globalUserHead = JSON.parse(localStorage['UserHead_'+globalUserId.toString()]);
			globalUserName = JSON.parse(localStorage['UserName_'+globalUserId.toString()]);
			globalFriendHead = JSON.parse(localStorage['globalFriendHead_'+globalUserId.toString()]);
			globalFriendList = JSON.parse(localStorage['globalFriendList_'+globalUserId.toString()]);
			globalFriendName = JSON.parse(localStorage['globalFriendName_'+globalUserId.toString()]);
			globalFriendSex = JSON.parse(localStorage['globalFriendNaSex_'+globalUserId.toString()]);
			globalWhoCareAboutTA = JSON.parse(localStorage['globalWhoCareAboutTA_'+globalUserId.toString()]);
			globalWhoTACareAbout = JSON.parse(localStorage['globalWhoTACareAbout_'+globalUserId.toString()]);
			$('label#status').html('现在展示的是缓存数据，如果想要刷新，请按“重新生成”键');
			$('#div_status').css('display', 'block');
			$('#div_result').css('display', 'block');
			$('#div_refresh').css('display', 'block');
			displayData();
			$('#refresh').click(function(){
				$('#div_result').css('display', 'none');
				$('#div_refresh').css('display', 'none');
				getNewData();
			});
		} else {
			// 没有数据，抓取数据
			getNewData();
		}
	}
});

// 展示已有数据
function displayData(){
	// 已有数据：
	//localStorage['UserHead_'+globalUserId.toString()] = globalUserHead;
	//localStorage['globalFriendHead_'+globalUserId.toString()] = globalFriendHead;
	//localStorage['globalFriendList_'+globalUserId.toString()] = globalFriendList;
	//localStorage['globalFriendName_'+globalUserId.toString()] = globalFriendName;
	//localStorage['globalWhoCareAboutTA_'+globalUserId.toString()] = globalWhoCareAboutTA;
	//localStorage['globalWhoTACareAbout_'+globalUserId.toString()] = globalWhoTACareAbout;
	Draw_Datagram(  globalUserHead, 
					globalFriendHead,  
					globalFriendList, 
					globalFriendName,
					globalWhoCareAboutTA, 
					globalWhoTACareAbout);
}

// 重新抓取数据
function getNewData(){
	if (globalSignGetFriendList){
		// 获取好友列表和好友状态
		setTimeout(function(){
			if (globalOkWithAuthor && globalNotFetchedStatus){
				globalNotFetchedStatus = false;
				$('#div_alert').css('display','none');
				getFriendList(uid);
			} else {
				$('#div_alert').css('display','block');
			}
		}, 1*1000);
	}
	if (globalSignGetFriendComment){
		setInterval(function(){
			if (globalOkWithFriendStatus && globalNotFetchedComment){
				globalNotFetchedComment = false;
				// 获取回复
				FilterStatus();
				//getAllComments();
				getAllComments_Web();
			}
		}, 1.5*1000);
	}
	if (globalSignDoAnalysis){
		setInterval(function(){
			if (globalOkWithFriendStatus && globalOkWithFriendComment && globalNotProcessedComment){
				globalNotProcessedComment = false;
				// 分析并输出结果
				// 分析， 得到 globalWhoCareAboutTA 和 globalWhoTACareAbout ， 与 globalFriendList 和 globalFriendName
				Analysis();
				// 保存分析结果为localStorage
				var globalFriendHead = new Array(globalFriendList.length);
				for (var i=0; i<globalFriendList.length; i++){
					if (globalStatus[globalFriendList[i]]){
						globalFriendHead[i] = globalStatus[globalFriendList[i]].headurl;
					}
				}
				globalUserName = globalStatus[globalUserId].name;
				globalUserHead = globalStatus[globalUserId].headurl;
				localStorage['UserHead_'+globalUserId.toString()] = JSON.stringify(globalUserHead);
				localStorage['UserName_'+globalUserId.toString()] = JSON.stringify(globalUserName);
				localStorage['globalFriendHead_'+globalUserId.toString()] = JSON.stringify(globalFriendHead);
				localStorage['globalFriendList_'+globalUserId.toString()] = JSON.stringify(globalFriendList);
				localStorage['globalFriendName_'+globalUserId.toString()] = JSON.stringify(globalFriendName);
				localStorage['globalWhoCareAboutTA_'+globalUserId.toString()] = JSON.stringify(globalWhoCareAboutTA);
				localStorage['globalWhoTACareAbout_'+globalUserId.toString()] = JSON.stringify(globalWhoTACareAbout);
				
				localStorage['globalFriendSex_'+globalUserId.toString()] = JSON.stringify(globalFriendSex);
				// 分析完毕
				update_status('分析完毕。');					
				// 画图
				displayData();
			}
		}, 2*1000);
	}
}

function getFriendSex(uids){
	var secret_key = "630008bbe5ae4d6fbf3266dfbacd648e";
	var renren = new OAuth2('renren', {
		client_id:'de7d400db676479b9847a0cdecefac2d',
		client_secret:secret_key,
		api_scope:'read_user_status,read_user_comment,read_user_request'    
	});
	
	renren.authorize(function() {
		var status_id  = globalStatus[owner_id].doingArray[index].id;
		var status_name = globalStatus[owner_id].name;
		update_status('开始获取好友"'+status_name+'"状态id为'+status_id+'的状态回复...');
		var params = {}
		params['access_token'] = access_token;
		params['call_id'] = new Date().valueOf();
		params['method'] = 'users.getInfo'
		params['uids'] = uids.join(',');
		params['fields'] = "uid,sex";
		params['v'] = "1.0";
		params['format'] = "json";
		
		//var keyList = ['access_token', 'call_id', 'method', 'v', 'format', 'uid'];
		var param_array = [];			
		
		//遍历表单中调用接口需要的参数，并拼装成"key=value"形式压入数组
		//for (var i=0; i<keyList.length; i++){
		//	param_array.push(keyList[i] + "=" + params[keyList[i]]);
		//}
		for (var key in params){
			param_array.push(key + "=" + params[key]);
		}
		var sig = generateSigFromArray(param_array, secret_key);
		
		params['sig'] = sig;
		
		$.post('http://api.renren.com/restserver.do', params, function(data){
			globalFriendSex = {};
			for (var i=0; i<data.length; i++){
				if (data[i]['sex']){
					globalFriendSex[data[i]['uid']] = 'male';
				} else {
					globalFriendSex[data[i]['uid']] = 'female';
				}
			}
			update_status('成功获取好友性别列表。');
		}, 'json');
	});
}

// get Friend List, if fully loaded, globalSignGFL should be [true, true, ...]
function getFriendList(uid){
	update_status('开始获取好友列表...');
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
		
		if (max_pageNo >= min_pageNo) {
			globalSignGFL = new Array(max_pageNo - min_pageNo + 2);
			globalSignGFL[0] = true;
		}
		
		for (var i=min_pageNo; i<=max_pageNo; i++){
			URL = 'http://friend.renren.com/GetFriendList.do?curpage='+i.toString()+'&id='+uid;
			getFriendPage(URL, i);
		}
		if (max_pageNo < min_pageNo){
			globalOkWithFriendList = true;
			getAllFriendStatus(globalUserId);
		}
	}, 'html');
}

// get Friend page, if fully loaded, globalSignGFL should be [true, true, ...]
function getFriendPage(URL, pageNo){
	$.get(URL, {}, function(newdata){
		idList = $('div#list-results div.info a',newdata);
		for (var j=0; j<idList.length; j++){
			selection = /profile\.do\?id=\d+/g.exec(idList[j].href);
			if (selection) {
				friendid = /\d+/g.exec(selection[0])[0];
				globalFriendList.push(friendid);
			}
		}
		globalSignGFL[pageNo] = true;
		update_status('开始获取好友列表...成功获取第'+pageNo+'页。');
		toCrawl = true;
		for (var i=0; i<globalSignGFL.length; i++){
			if (!globalSignGFL[i]){
				toCrawl = false;
			}
		}
		if (toCrawl){
			globalOkWithFriendList = true;
			getAllFriendStatus(globalUserId);
		}
	},'html');
}

function getAllFriendStatus(userid){
	update_status('开始获取好友状态...');
	globalSignAFS = {};
	for (var i=0; i<globalFriendList.length; i++){
		var friendid = globalFriendList[i];
		globalSignAFS[friendid] = false;
	}
	globalSignAFS[userid] = false;
	for (var i=0; i<5; i++){
		getFriendStatusList(userid, i, 0);
	}
	for (var i=0; i<globalFriendList.length; i++){
		var friendid = globalFriendList[i];
		getFriendStatusList(friendid, 0, (i+1)*1000);
	}
}

var globalSignAFSComplete = false;
function getFriendStatusList(friendid, pageNo, time){
	setTimeout(function(){
		tryFriendStatusList(friendid, pageNo);
		setTimeout(function(){
			if (!globalSignAFS[friendid]){
				update_status('获取好友状态不成功，尝试重新获取...好友id: '+friendid);
				tryFriendStatusList(friendid, pageNo);
			}
		}, 10*1000);
		setTimeout(function(){
			if (!globalSignAFS[friendid]){
				update_status('获取好友状态不成功，尝试重新获取...好友id: '+friendid);
				tryFriendStatusList(friendid, pageNo);
			}
		}, 20*1000);
		setTimeout(function(){
			if (!globalSignAFS[friendid]){
				update_status('获取好友状态不成功，不再重新获取...好友id: '+friendid);
				if (globalStatus[friendid]){
					delete globalStatus[friendid];
				}
				globalSignAFS[friendid] = true;
			}
		}, 30*1000);
	}, time);
}

function tryFriendStatusList(friendid, pageNo){
	update_status('开始获取好友状态...好友id: '+friendid);
	url = "http://status.renren.com/GetSomeomeDoingList.do";
	$.get(url, {userId:friendid, curpage:pageNo.toString()}, function(data) {
		if (globalStatus[friendid] && data.doingArray){
			globalStatus[friendid].doingArray = globalStatus[friendid].doingArray.concat(data.doingArray);
		} else if (data.doingArray){
			globalStatus[friendid] = data;
		}
		//console.log(friendid);
		//console.log(data);
		globalSignAFS[friendid] = true;
		friendname = '';
		if (data.name){
			friendname = data.name;
		}
		update_status('成功获取好友状态...好友id: '+friendid+',好友名字:'+friendname);
		globalSignAFSComplete = true;
		for (key in globalSignAFS){
			if (!globalSignAFS[key]){
				globalSignAFSComplete = false;
			}
		}
		if (globalSignAFSComplete){
			globalOkWithFriendStatus = true;
			console.log('ok with friendlsit');
		}
	}, 'json');
}


// user login
function getAuthor(){
	var secret_key = "630008bbe5ae4d6fbf3266dfbacd648e";
	var renren = new OAuth2('renren', {
		client_id:'de7d400db676479b9847a0cdecefac2d',
		client_secret:secret_key,
		api_scope:'read_user_status,read_user_comment,read_user_request'    
	});
	
	renren.authorize(function() {
		globalOkWithAuthor = true;
	});
}

function getAllComments_Web(){
	paramInterval_Web = 1;
	time_allocation = 1000;
	var iAFC = 0;
	for (var owner_id in globalStatus){
		if (globalStatus[owner_id].crawl){
			for (var i=0; i<globalStatus[owner_id].doingArray.length; i++){
				comment_count = globalStatus[owner_id].doingArray[i].comment_count;
				owner = globalStatus[owner_id].doingArray[i].userId;
				doingId = globalStatus[owner_id].doingArray[i].id;
				source = globalStatus[owner_id].doingArray[i].rootDoingId;
				if (!source){
					source = doingId;
				}
				t = 3;
				params = {doingId:doingId, owner:owner, source:source, t:t};
				if (comment_count && globalStatus[owner_id].doingArray[i].crawl){
					globalSignAFC.push(false);
					getComment_Web(params, i, time_allocation, iAFC);
					iAFC ++;
					time_allocation += paramInterval_Web * 1000;
				} else {
					globalStatus[owner_id].doingArray[i].replyList = [];
				}
			}
		} else {
			for (var i=0; i<globalStatus[owner_id].doingArray.length; i++){
				globalStatus[owner_id].doingArray[i].replyList = [];
			}
		}
	}
	setTimeout(function(){
		globalOkWithFriendComment = true;
	}, time_allocation+30*1000);
	tmp = new Date((new Date()).valueOf()+time_allocation+30*1000);
	console.log('抓取预计结束时间：'+tmp.toString());
}

function getComment_Web(params, index, time, iAFC){
	setTimeout(function(){
		tryGetComment_Web(params, index, time, iAFC);
		setTimeout(function(){
			if (!globalSignAFC[iAFC]){
				update_status('获取好友状态回复不成功，尝试重新获取...好友id: '+friendid);
				tryGetComment_Web(params, index, time, iAFC);
			}
		}, 8*1000);
		setTimeout(function(){
			if (!globalSignAFC[iAFC]){
				update_status('获取好友状态回复不成功，尝试重新获取...好友id: '+friendid);
				tryGetComment_Web(params, index, time, iAFC);
			}
		}, 16*1000);
		setTimeout(function(){
			if (!globalSignAFC[iAFC]){
				update_status('获取好友状态回复不成功，不再重新获取...好友id: '+friendid);
				globalSignAFC[iAFC] = true;
			}
		}, 24*1000);
	}, time);
}


var gotCount = 0;
function tryGetComment_Web(params, index, time, iAFC){
	$.get('http://status.renren.com/feedcommentretrieve.do', params, function(data){
		if (data){
			globalStatus[params.owner].doingArray[index].replyList = data.replyList;
			globalSignAFC[iAFC] = true;
			status_name = globalStatus[params.owner].name;
			status_id = params.doingId;
			update_status('成功获取好友"'+status_name+'"状态id为'+status_id+'的状态回复。');
			//console.log(gotCount);
			//console.log(data);
			gotCount++;
		}
	}, 'json');
}



// get Statuses of his/her friends
function getAllComments(){
	var secret_key = "630008bbe5ae4d6fbf3266dfbacd648e";
	var renren = new OAuth2('renren', {
		client_id:'de7d400db676479b9847a0cdecefac2d',
		client_secret:secret_key,
		api_scope:'read_user_status,read_user_comment,read_user_request'    
	});
	
	renren.authorize(function() {
		update_status('授权成功，开始获取好友回复...');
		access_token = renren.getAccessToken();
		if (window.console) {
			console.log(access_token); 
		}
		time_allocation = 1000;
		var iAFC = 0;
		for (var owner_id in globalStatus){
			if (globalStatus[owner_id].crawl){
				for (var i=0; i<globalStatus[owner_id].doingArray.length; i++){
					comment_count = globalStatus[owner_id].doingArray[i].comment_count;
					if (comment_count && globalStatus[owner_id].doingArray[i].crawl){
						globalSignAFC.push(false);
						getComment(owner_id, i, time_allocation, secret_key, access_token, iAFC);
						iAFC ++;
						time_allocation += paramInterval * 1000;
					} else {
						globalStatus[owner_id].doingArray[i].replyList = [];
					}
				}
			} else {
				for (var i=0; i<globalStatus[owner_id].doingArray.length; i++){
					globalStatus[owner_id].doingArray[i].replyList = [];
				}
			}
		}
		setTimeout(function(){
			globalOkWithFriendComment = true;
		}, time_allocation+10*1000);
	});
}

// get Replied of the statuses crawled
var gotCount = 0;
function getComment(owner_id, index, time, secret_key, access_token, iAFC){
	setTimeout(function(){
		if (globalStatus[owner_id]) {
			var status_id  = globalStatus[owner_id].doingArray[index].id;
			var status_name = globalStatus[owner_id].name;
			update_status('开始获取好友"'+status_name+'"状态id为'+status_id+'的状态回复...');
			var params = {}
			params['access_token'] = access_token;
			params['call_id'] = new Date().valueOf();
			params['method'] = 'status.getComment'
			params['owner_id'] = owner_id;
			params['status_id'] = status_id;
			params['page'] = '1';
			params['count'] = '100';
			params['v'] = "1.0";
			params['format'] = "json";
			
			//var keyList = ['access_token', 'call_id', 'method', 'v', 'format', 'uid'];
			var param_array = [];			
			
			//遍历表单中调用接口需要的参数，并拼装成"key=value"形式压入数组
			//for (var i=0; i<keyList.length; i++){
			//	param_array.push(keyList[i] + "=" + params[keyList[i]]);
			//}
			for (var key in params){
				param_array.push(key + "=" + params[key]);
			}
			var sig = generateSigFromArray(param_array, secret_key);
			
			params['sig'] = sig;
			
			$.post('http://api.renren.com/restserver.do', params, function(data){
				globalStatus[owner_id].doingArray[index].replyList = data;
				globalSignAFC[iAFC] = true;
				update_status('成功获取好友"'+status_name+'"状态id为'+status_id+'的状态回复。');
				//console.log(gotCount);
				gotCount++;
			}, 'json');
		} else {
			console.log(owner_id+' not found');
		}
	}, time);
}


// filter by user status
// 过滤， 30天小于20条就过滤掉
function FilterStatus(){
	update_status('正在对状态进行过滤...');
	for (var userid in globalStatus){
		if (userid != globalUserId){
			var doingArray = globalStatus[userid].doingArray;
			if (doingArray && doingArray.length >= 20){
				// total doing count >= 20
				var Nday = 30;
				var Nstatus = 10;// < 20
				// 仅保留前 Nstatus 条
				globalStatus[userid].doingArray = globalStatus[userid].doingArray.slice(0, Nstatus);
				doingArray = globalStatus[userid].doingArray;
				globalStatus[userid].crawl = true;
				var Nstatus = Math.min(20,Nstatus);
				var now_time = new Date();
				for (var i=0; i<Nstatus; i++){
					globalStatus[userid].doingArray[i].crawl = true;
					that_time = new Date(doingArray[i].dtime);
					interval_tmp = (now_time-that_time)/1000/3600/24;
					if (interval_tmp > Nday){
						globalStatus[userid].crawl = false;
						break;
					}
				}
			} else {
				globalStatus[userid].crawl = false;
			}
		} else {
			globalStatus[userid].crawl = true;
			for (var i=0; i<globalStatus[userid].doingArray.length; i++){
				globalStatus[userid].doingArray[i].crawl = true;
			}
		}
	}
}
// globalStatus

// data analysis, generate datagram
// 中间结果使用全局变量，分析结果使用 localStorage
function Analysis(){
	update_status('正在进行分析...');
	// 谁最关心TA
	globalWhoCareAboutTA = new Array(globalFriendList.length);
	// TA最关心谁
	globalWhoTACareAbout = new Array(globalFriendList.length);
	// name and uid
	globalFriendName = new Array(globalFriendList.length);
	for (var i=0; i<globalFriendList.length; i++){
		globalFriendList[i] = parseInt(globalFriendList[i]);
		globalWhoCareAboutTA[i] = 0;
        globalWhoTACareAbout[i] = 0;
		if (globalStatus[globalFriendList[i]]){
			globalFriendName[i] = globalStatus[globalFriendList[i]].name;
		} else {
			globalFriendName[i] = '';
		}
	}
	Amount_User = 0;
	Amount_Friend = 0;
	for (var friend in globalStatus){
		for (var i_doing in globalStatus[friend].doingArray){
			var doing = globalStatus[friend].doingArray[i_doing];
			if (doing.replyList){
				for (var i=0; i<doing.replyList.length; i++ ){
					reply = doing.replyList[i];
					if (globalFriendList.indexOf(parseInt(reply.ubid)) >= 0 || parseInt(reply.ubid) == parseInt(globalUserId)){
						if (i == 0){
							// 第一个回复
							if (parseInt(friend) == parseInt(globalUserId)){// 好友回复TA的状态，而且是第一个回复
								globalWhoCareAboutTA[globalFriendList.indexOf(parseInt(reply.ubid))] += 3;
								Amount_User += 3;
							} else if (parseInt(reply.ubid) == parseInt(globalUserId)){// TA回复好友的状态，而且是第一个回复 
								globalWhoTACareAbout[globalFriendList.indexOf(parseInt(friend))] += 3;
								Amount_Friend += 3;
							}
						} else {
							// 非第一个回复
							if (reply.replyContent.match(/回复.+?[:：].+/g)){
								// 回复回复的回复
								reply_name = reply.replyContent.split(/[:：]/g)[0].replace('回复','');
								if (reply_name == globalStatus[globalUserId].name && globalFriendList.indexOf(parseInt(reply.ubid)) >= 0){
									// 好友回复USER的回复
									globalWhoCareAboutTA[globalFriendList.indexOf(parseInt(reply.ubid))] += 1;
									if (parseInt(friend) == parseInt(globalUserId)){
										Amount_User += 1;
									} else {
										Amount_Friend += 1;
									}
								} else if (parseInt(reply.ubid) == parseInt(globalUserId) && globalFriendName.indexOf(reply_name) >= 0) {
									// USER 回复了好友的回复。 
									globalWhoTACareAbout[globalFriendName.indexOf(reply_name)] += 1;
									if (parseInt(friend) == parseInt(globalUserId)){
										Amount_User += 1;
									} else {
										Amount_Friend += 1;
									}
								}
							} else {
								// 直接回复，但不是第一个
								if (parseInt(reply.ubid) == parseInt(globalUserId)){
									// USER 回复好友
									globalWhoTACareAbout[globalFriendList.indexOf(parseInt(friend))] += 2;
									if (parseInt(friend) == parseInt(globalUserId)){
										Amount_User += 2;
									} else {
										Amount_Friend += 2;
									}
								} else if (parseInt(friend) == parseInt(globalUserId)){
									// 好友回复 USER
									globalWhoCareAboutTA[globalFriendList.indexOf(parseInt(reply.ubid))] += 2;
									Amount_User += 2;
								}
							}
						}
					}
				}
			}
		}
	}
	console.log('从用户状态中获得：'+Amount_User.toString());
	console.log('从好友状态中获得：'+Amount_Friend.toString());
}



// ================== User Interface ===================
// display proceeding infomation


// display results
function update_status(status){
	$('#status').html(status);
}

// share to renren (may be partly, secondary consideration)



// testing function
function testCheckFriendStatusComments(){
	var total_non_zero_count = 0;
	for (key in globalStatus){
		if (globalStatus[key]){
			var a = globalStatus[key].doingArray;
			for (var i=0; i<a.length; i++){
				if (a[i].comment_count > 0){
					total_non_zero_count ++;
				}
			}
		}
	}
	console.log('total_non_zero_count:'+total_non_zero_count.toString());
}

function testFilterStatus(){
	var total_non_zero_count = 0;
	for (var userid in globalStatus){
		if (userid != globalUserId){
			var doingArray = globalStatus[userid].doingArray;
			if (doingArray && doingArray.length >= 20){
				var non_zero_count = 0;
				// total doing count >= 20
				var Nday = 30;//
				var Nstatus = 20;// 固定不变
				var Nstatus = Math.min(20,Nstatus);
				var now_time = new Date();
				for (var i=0; i<Nstatus; i++){
					that_time = new Date(doingArray[i].dtime);
					interval_tmp = (now_time-that_time)/1000/3600/24;
					if (interval_tmp > Nday){
						non_zero_count = 0;
						break;
					}
					if (doingArray[i].comment_count > 0){
						non_zero_count ++;
					}
				}
				total_non_zero_count += non_zero_count;
			}
		}
	}
	console.log('After Filter, total_non_zero_count:'+total_non_zero_count.toString());
}

function testSeeCareAbout(){
	var tmp_globalWhoCareAboutTA = {}
	var tmp_globalWhoTACareAbout = {}
	console.log('WhoCareAboutTA:')
	for (var i=0; i<globalFriendList.length; i++){
		if (globalWhoCareAboutTA[i]){
			console.log(globalFriendName[i]+':'+globalWhoCareAboutTA[i].toString());
		}
	}
	console.log('WhoTACareAbout:')
	for (var i=0; i<globalFriendList.length; i++){
		if (globalWhoTACareAbout[i]){
			console.log(globalFriendName[i]+':'+globalWhoTACareAbout[i].toString());
		}
	}
}
