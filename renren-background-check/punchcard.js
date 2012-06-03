pagenum = 40;
allloaded = false;
drawed = false;
var fetch_content = [];
var DayHourList;
var Name;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.agent && request.agent=="renren-punchcard") {
		uid = request.user;
		console.log('get connneted, draw punchcard for '+uid);
		sendResponse({agent:"renren-punchcard", message:"punchcard.html get uid="+uid});
		fetch_content = [];
		fetch_page = new Array(pagenum);
		Name = "";
		url = "http://status.renren.com/GetSomeomeDoingList.do";
		console.log('get punchcard of '+uid);
		for ( var i=0; i<pagenum; i++) {
			fetch_page[i] = false;
		}
		for ( var i=0; i<pagenum; i++) {
			num = i;
			$.get(url, {userId:uid, curpage:num.toString()}, 
					function(data) {
						if (Name.length == 0) {
							Name = data.name;
						}
						if (fetch_page[data.curpage] == false) {
							fetch_page[data.curpage] = true;
							if (data.doingArray.length > 0) {
								for (var j=0; j<data.doingArray.length; j++) {
									fetch_content.push(data.doingArray[j].dtime);
								}
							}
							allloaded = true;
							percent = 0.0;
							for (var k=0; k<pagenum; k++) {
								allloaded = allloaded && fetch_page[k];
								if (fetch_page[k]) {
									percent += 1;
								}
							}
							percent /= pagenum;
							if (allloaded && !drawed) {
								drawed = true;
								DayHourList = Count(fetch_content); 
								CanvasDraw(Name, DayHourList, "#000000");
								ShowColor();
							} else {
								ShowPercent(percent);
							}
						}
					}, "json");
		}
	}
});

function genericOnClick(info, tab) {
    uid = info.linkUrl.match("id=[0-9]+")[0];
    uid = uid.substring(3,uid.length)
}

function Count(List) {
    DayHourList = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    for (var i=0; i<List.length; i++) {
        date = List[i].split(' ')[0].split('-');
        time = List[i].split(' ')[1].split(':');
        thisday = new Date();
        thisday.setFullYear(date[0], date[1]-1, date[2]);
        thisday.setHours(time[0], time[1], time[2]);
        day = thisday.getDay();
        hour = thisday.getHours();
        DayHourList[day][hour] += 1;
    }
	return DayHourList;
}

function ShowPercent(percent) {
	var offset_x = 0;
	var offset_y = 110;
	var canvas = $("#canvas")[0];
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,800,300);
		ctx.font="20px Arial";
		ctx.fillStyle="#000000";
		ctx.fillText("Loading...",offset_x+400-5*10, offset_y+18);
		ctx.strokeRect(offset_x+200,offset_y+30,400,20);
		ctx.fillRect(offset_x+200,offset_y+30, 400*percent, 20);
	}
}

function CanvasDraw(Name, DayHourList, color) {
	var offset_x = -12;
	var offset_y = 12;
	var canvas = $("#canvas")[0];
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,800,300);
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,800,300);
		ctx.font="10px Arial";
		ctx.fillStyle="#BBBBBB";
		ctx.fillText("水人人时间表 @ Chrome Web Store",offset_x+25, offset_y+15);
		ctx.fillStyle=color;
		ctx.setFillColor(color);
		ctx.setStrokeColor(color);
		ctx.moveTo(offset_x+70,offset_y+30);
		ctx.lineTo(offset_x+70,offset_y+250);
		ctx.lineTo(offset_x+800,offset_y+250);
		ctx.stroke(); 
		ctx.font="12px Arial";
		dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		for (var day=0; day<7; day++) {
			ctx.fillText(dayStr[day], offset_x+25, offset_y+45+4+day*30);
		}
		for (var hour=0; hour<24; hour++) {
			if (hour == 0) {
				ctx.fillText(hour.toString()+"am", offset_x+95-4-10+hour*30, offset_y+275);
			} else if (hour == 12) {
				ctx.fillText(hour.toString()+"pm", offset_x+95-4-10+hour*30, offset_y+275);
			} else {
				ctx.fillText(hour.toString(), offset_x+95-4+hour*30, offset_y+275);
			}
		}
		ctx.font="20px Arial";
		ctx.fillText(Name+"的水人人时间表", offset_x+400-6*10-Name.length*14/2, offset_y+18);
		for (var day=0; day<7; day++) {
			for (var hour=0; hour<24; hour++) {
				x = offset_x+95+30*hour;
				y = offset_y+45+30*day;
				radius = DayHourList[day][hour];
				if (radius > 13) {
					radius = 13;
				}
				ctx.beginPath();
				ctx.arc(x,y,radius,0,360,anticlockwise=true);
				ctx.closePath();
				ctx.fill();
			}
		}
	}
}

function dataURItoBlob(canvasToDataURL) {
    var decoded_str = atob(canvasToDataURL.split(",")[1]);
    var mimetype = canvasToDataURL.split(",")[0].split(":")[1].split(";")[0];
    var array = new ArrayBuffer(decoded_str.length);
    var data = new Uint8Array(array);
    for (var i = 0; i < decoded_str.length; i++) {
        data[i] = decoded_str.charCodeAt(i)
    }
    var bb = new window.WebKitBlobBuilder();
    bb.append(array);
    return bb.getBlob(mimetype);
}

function SaveCanvas(){
	var canvas = $("#canvas")[0];
	var canvasToDataURL = canvas.toDataURL('image/png');
	function onInitFs(fs) {
		filename = 'renren.png';
		fs.root.getFile(filename, {create: true}, function(fileEntry) {

			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwriteend = function(e) {
					console.log('Write completed.');
				};
			
				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				};

				fileWriter.write(dataURItoBlob(canvasToDataURL));
				
			}, errorHandler);
			imgURL = fileEntry.toURL();
			localStorage['imgURL'] = imgURL;
		}, errorHandler);
	}
	
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.TEMPORARY, 800*300*24, onInitFs, errorHandler);
	
	function errorHandler(e) {
		var msg = '';
		
		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error: ' + msg);
	}
}


var origin_color = '#000000';
function ShowColor(){
	$('#div_donate').css('display', 'block');
	$('#div_share').css('display', 'block');
	$('#div_color').css('display', 'block');
	// color
	$('#div_color > button.color_set').click(function(){
		var color_code = $(this).attr('title');
		var background_color = $(this).css('background-color');
		CanvasDraw(Name, DayHourList, background_color);
		$('#canvas').css('border-color', background_color);
		origin_color = $(this).css('background-color');
	});
	$('#div_color > button.color_set').hover(function(){
		var color_code = $(this).attr('title');
		var background_color = $(this).css('background-color');
		CanvasDraw(Name, DayHourList, background_color);
		$('#canvas').css('border-color', background_color);
	},function(){
		CanvasDraw(Name, DayHourList, origin_color);
		$('#canvas').css('border-color', origin_color);
	});
	// donate
	$('#div_donate > #donate').click(function(){
		chrome.tabs.create({url:"donate.html"}, function(tab){});
	});
	// share
	$('#div_share > #save_pic').click(function(){
		// 保存图片
		SaveCanvas();
		var imgURL = localStorage['imgURL'];
		setTimeout(function(){
			chrome.tabs.create({url:imgURL}, function(tab){});
		}, 100);
	});
	$('#div_share > #share_pic').click(function(){
		// 上传到人人网
		photoUpload();
	});
}

function photoUpload(){
	setTimeout(function(){
		var secret_key = "e62453b0192f421f8ed94cfcbffdbd75";
		var renren = new OAuth2('renren', {
			client_id:'96705cdf63434065a97458100281b4ac',
			client_secret:'e62453b0192f421f8ed94cfcbffdbd75',
			api_scope:'photo_upload'    
		});
		
		renren.authorize(function() {
			access_token = renren.getAccessToken();
			if (window.console) {
				console.log(access_token); 
			}
			
			var params = {};
			params['access_token'] = access_token;
			params['call_id'] = new Date().valueOf();
			params['method'] = "photos.upload";
			params['v'] = "1.0";
			params['format'] = "json";
			
			var keyList = ['access_token', 'call_id', 'method', 'v', 'format'];
			var param_array = [];			
			
			//遍历表单中调用接口需要的参数，并拼装成"key=value"形式压入数组
			for (var i=0; i<keyList.length; i++){
					param_array.push(keyList[i] + "=" + params[keyList[i]]);
			}
			var sig = generateSigFromArray(param_array, secret_key);
			
			params['sig'] = sig;
			var canvas = $("#canvas")[0];
			var canvasToDataURL = canvas.toDataURL('image/png');
			
			params['upload'] = canvasToDataURL;
			
			$.post('http://api.renren.com/restserver.do', params, function(data){
				console.log(data);
			}, 'json')
	
		});
	}, 100);
}