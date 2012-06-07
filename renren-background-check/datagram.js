// JavaScript Document
function Draw_Datagram(  globalUserHead, 
					globalUserName,
					globalFriendHead,  
					globalFriendList, 
					globalFriendName,
					globalFriendSex, 
					globalWhoCareAboutTA, 
					globalWhoTACareAbout) {
	// Your have access to:
	// $('#canvas_result1'), 
	// $('#canvas_result2'),
	// $('#canvas_result3'),
	// $('#canvas_result4')
	// 决定如何画什么图后告诉我，我来设计一下版式
	// 你有这些资源：
	// globalUserHead 被调查用户的小头像链接
	// 以下数组维度相同，且同一下标的元素是针对同一个人的
	// globalFriendHead 用户好友的小头像链接列表
	// globalFriendList 用户好友的id列表
	// globalFriendName 用户好友的名字列表
	// globalWhoCareAboutTA 用户好友中谁关心TA的分数列表
	// globalWhoTACareAbout 用户好友中TA关心谁的分数列表
	Draw_Subgram(  globalUserHead, 
					globalUserName,
					globalFriendHead,  
					globalFriendList, 
					globalFriendName,
					globalFriendSex, 
					globalWhoCareAboutTA,
					"#canvas_result1");
	Draw_Subgram(  globalUserHead, 
					globalUserName,
					globalFriendHead,  
					globalFriendList, 
					globalFriendName,
					globalFriendSex, 
					globalWhoTACareAbout,
					"#canvas_result2");
}

function Draw_Subgram(globalUserHead, 
				globalUserName,
				globalFriendHead,  
				globalFriendList, 
				globalFriendName,
				globalFriendSex, 
				CaringList,
				choose_exp) {
	// Show who cares about TA
	var canvas = $(choose_exp)[0];
	canvas.width = 640;
	canvas.height = 640;
	if (canvas.getContext) {
	    var ctx = canvas.getContext('2d');
	    var centerX = 320;
	    var centerY = 320;
	    var maxAllowedRadius = 280;
	    var minAllowedRadius = 70;
	    var length = CaringList.length;
	    var maxValue = getMaximum(CaringList);
	    var whoCareAboutTAArray = new Array();
        
	    // First pass the data to build the data object
	    for (var i=0, j=0; i<length; i++) {
	        if (globalWhoCareAboutTA[i] > 0) {
	            // Create a new object
	            var object = new Object ();
	            object['name'] = globalFriendName[i];
	            object['headurl'] = globalFriendHead[i];
	            object['score'] = CaringList[i];
	            object['sex'] = globalFriendSex[globalFriendList[i]];
	            object['radius'] = 0;
	            object['theta'] = 0;
	            
	            var blurIndex = Math.floor(Math.random()*3);
	            if (object.sex === 'male') {
	                object['blur'] = globalBlurEffectNames[blurIndex];
	            } else {
	                object['blur'] = globalBlurEffectNames[blurIndex+3];
	            }
	            
	            // Add the object into the array
	            whoCareAboutTAArray[j] = object;
	            j++;
	        }
	    }
	    
	    // Sorting the array with score from highest to lowest
	    whoCareAboutTAArray.sort(arraySorting);
	    
	    // Determining the threshold value and index
	    var thresholdValue = 0;
	    var thresholdIndex = 14;
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        if (whoCareAboutTAArray[i].score === 0) {
	            thresholdIndex = (i-1>14)?14:(i-1);
	            break;
	        }
	    }
	    thresholdValue = whoCareAboutTAArray[thresholdIndex].score;
	    
	    // Deleting all the objects whose score is lower than the threshold value
        whoCareAboutTAArray.splice(thresholdIndex+1, whoCareAboutTAArray.length-thresholdIndex-1);
        
	    // closeFriendNum: the number of the scores bigger than percentage*maxValue
	    var minValue = whoCareAboutTAArray[whoCareAboutTAArray.length-1].score;
	    var closeScoreMark = (1.0-(1.0-minValue/maxValue)*0.25)*maxValue;
	    var closeFriendNum = 0;
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        if (whoCareAboutTAArray[i].score > closeScoreMark) {
	            closeFriendNum++;
	        }
	    }
	    
        // Parameters of the radius equation: radius = A*score+B
        var A = (maxAllowedRadius-minAllowedRadius)/(thresholdValue-maxValue);
        var B = maxAllowedRadius-A*thresholdValue;
        
        // Fourth pass the data objects to set the radius and theta.
        for (var i=0; i<whoCareAboutTAArray.length; i++) {
            var object = whoCareAboutTAArray[i];
            var delta = Math.pow(-1, Math.floor(Math.random()*10))*Math.PI/40;
            object.radius = A*object.score+B;
            if (i<closeFriendNum) {
                object.theta = Math.PI*2/closeFriendNum*i+delta;
            }
            else {
                var unit = Math.PI*2/(thresholdIndex+1-closeFriendNum);
                var index = i-closeFriendNum;
                object.theta = index*unit+Math.PI/9*5;
            }    
        }
                	    
	    // Draw the user in the center: globalUserName required!
	    DrawRenRenUser(ctx, globalUserHead, centerX, centerY, 36, globalUserName, 'center', 'none');
	    
	    // Draw others
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        var headurl = whoCareAboutTAArray[i].headurl;
	        var x = centerX+Math.cos(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var y = centerY+Math.sin(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var sex = whoCareAboutTAArray[i].sex;
	        var name = whoCareAboutTAArray[i].name;
	        var blur = whoCareAboutTAArray[i].blur;
	        DrawRenRenUser(ctx, headurl, x, y, 24, name, sex, blur);
	        DrawLine(ctx, x, y, centerX, centerY, sex, blur);
	    }
	}
}


function arraySorting(a, b) {
    if (a.score > b.score) {
        return -1;
    } else if (a.score < b.score) {
        return 1;
    } else {
        return 0;
    }
};

function getMaximum(array) {
    var max = 0;
    var length = array.length;
    for (var i=0; i<length; i++) {
        if (max < array[i]) {
            max = array[i];
        }
    }
    return max;
};



// context: the context of the canvas, 2d.
// headurl: the url of the renren user head image.
// x,y: the coordinates of the image circle center.
// radius: the radius of the image circle.
// name: the name of the renren user.
// sex: the sex of the renren user.
// blur: the blur effect color name.
function DrawRenRenUser(context, headurl, x, y, radius, name, sex, blur) {
    var img = document.createElement('img');
    img.src = headurl;
    img.onload = function() {
        // Draw blur effect
        DrawBlurEffect(context, x, y, radius, blur);
        
        // Set the clipping region
        context.save();
        context.beginPath();
        context.arc(x, y, radius, 0, 2*Math.PI, false);
        context.closePath();
        context.clip();
        
        // Draw the head image
        context.drawImage(img, x-radius, y-radius, 2*radius, 2*radius);
        
        // Draw the line of the circle
        context.restore();
        context.beginPath();
        context.arc(x, y, radius, 0, 2*Math.PI, false);
        context.lineWidth = 2;
        context.strokeStyle = blur;
        context.stroke();
    };
    
    // Draw the name of the renren user
    context.font = '8pt Arial';
    context.textAlign = 'center';
    context.fillType = 'black';           
    context.fillText(name, x, y+1.7*radius);  
};

var globalBlurEffectNames = [
    'blue', 'cyan', 'turquoise',
    'yellow', 'orange', 'pink'
];

// Currently support blue, cyan, turquoise, yellow, orange, pink effects.
function DrawBlurEffect(context, x, y, radius, blurName) {
    var blur = context.createRadialGradient(x, y, 0, x, y, 1.5*radius);
    
    if (blurName === 'blue') {
        blur.addColorStop(0, 'rgba(0,0,255,1)');
        blur.addColorStop(1, 'rgba(0,0,225,0)');
    } else if (blurName === 'cyan') {
        blur.addColorStop(0, 'rgba(0,255,255,1)');
        blur.addColorStop(1, 'rgba(0,225,225,0)');
    } else if (blurName === 'turquoise') {
        blur.addColorStop(0, 'rgba(0,206,209,1)');
        blur.addColorStop(1, 'rgba(72,209,204,0)');
    } else if (blurName === 'yellow') {
        blur.addColorStop(0, 'rgba(255,215,0,1)');
        blur.addColorStop(1, 'rgba(255,255,0,0)');
    } else if (blurName === 'orange') {
        blur.addColorStop(0, 'rgba(255,165,0,1)');
        blur.addColorStop(1, 'rgba(255,140,0,0)');
    } else if (blurName === 'pink') {
        blur.addColorStop(0, 'rgba(255,105,180,1)');
        blur.addColorStop(1, 'rgba(255,20,147,0)');
    } else if (blurName === 'none') {
        return;
    } 
    
    context.arc(x, y, 1.5*radius, 0, Math.PI*2, false);
    context.fillStyle = blur;
    context.fill();
};

function DrawLine(ctx, x, y, centerX, centerY, sex, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;   
    ctx.stroke();
};
