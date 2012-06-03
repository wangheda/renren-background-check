

function genericOnClick(info, tab) {
    uid = info.linkUrl.match("id=[0-9]+")[0];
    uid = uid.substring(3,uid.length)
    chrome.tabs.create({url:"main.html"}, function(tab){
        chrome.tabs.sendRequest(tab.id, {agent:"renren-background-check", user:uid}, function(response){
            if (response.agent && response.agent=="renren-background-check") {
                console.log(response.message);
            }
        });
    });
}

var property = {"title": "对TA进行背景调查", 
"contexts":["link"], 
"targetUrlPatterns":["http://www.renren.com/profile.do*"], 
"documentUrlPatterns":["http://*.renren.com/*"],
"onclick": genericOnClick};


var mid = chrome.contextMenus.create(property);
