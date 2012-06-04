// JavaScript Document
function Draw_Datagram( globalUserHead, 
						globalFriendHead,  
						globalFriendList, 
						globalFriendName,
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
	
	// Show who cares about TA
	var canvas = $("#canvas_result1")[0];
	if (canvas.getContext) {
	    var ctx = canvas.getContext('2d');
	    var centerX = 320;
	    var centerY = 320;
	    var maxAllowedRadius = 280;
	    var minAllowedRadius = 55;
	    var length = globalWhoCareAboutTA.length;
	    var maxValue = getMaximum(globalWhoCareAboutTA);
	    var whoCareAboutTAArray = new Array();
        
	    // First pass the data to build the data object
	    for (var i=0, j=0; i<length; i++) {
	        if (globalWhoCareAboutTA[i] > 0) {
	            // Create a new object
	            var object = new Object ();
	            object['name'] = globalFriendName[i];
	            object['headurl'] = globalFriendHead[i];
	            object['score'] = globalWhoCareAboutTA[i];
	            object['sex'] = 'male';
	            object['radius'] = 0;
	            object['theta'] = 0;
	            object['blur'] = 'green';
	            
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
        
        // Second pass the data objects to set the radius and theta.
        for (var i=0; i<whoCareAboutTAArray.length; i++) {
            var object = whoCareAboutTAArray[i];
            var delta = Math.pow(-1, Math.floor(Math.random()*10))*Math.PI/20;
            object.radius = A*object.score+B;
            if (i<closeFriendNum) {
                object.theta = Math.PI*2/closeFriendNum*i+delta;
            }
            else {
                var unit = Math.PI*2/(thresholdIndex+1-closeFriendNum);
                var index = i-closeFriendNum;
                object.theta = index*unit+delta+Math.PI/9*5;
            }    
        }
                	    
	    // Draw the user in the center
	    DrawRenRenUser(ctx, globalUserHead, centerX, centerY, 25, '', 'center', 'blue');
	    
	    // Draw others
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        var headurl = whoCareAboutTAArray[i].headurl;
	        var x = centerX+Math.cos(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var y = centerY+Math.sin(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var sex = whoCareAboutTAArray[i].sex;
	        var name = whoCareAboutTAArray[i].name;
	        var blur = whoCareAboutTAArray[i].blur;
	        DrawRenRenUser(ctx, headurl, x, y, 20, name, sex, blur);
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
        context.lineWidth = 1.5;
        context.strokeStyle = blur;
        context.stroke();
    };
    
    // Draw the name of the renren user and mark based on sex
    DrawSexMark(context, x, y, radius, name, sex, blur);  
};

// Currently support blue, pink, red, green, yellow, orange, purple effects.
function DrawBlurEffect(context, x, y, radius, blurName) {
    var blur = context.createRadialGradient(x, y, 0, x, y, 1.5*radius);
    
    if (blurName === 'blue') {
        blur.addColorStop(0, 'rgba(0,0,255,1)');
        blur.addColorStop(1, 'rgba(0,0,228,0)');
    } else if (blurName === 'pink') {
        blur.addColorStop(0, 'rgba(255,20,147,1)');
        blur.addColorStop(1, 'rgba(255,105,180,0)');
    } else if (blurName === 'red') {
        blur.addColorStop(0, 'rgba(255,0,0,1)');
        blur.addColorStop(1, 'rgba(228,0,0,0)');
    } else if (blurName === 'green') {
        blur.addColorStop(0, 'rgba(0,255,0,1)');
        blur.addColorStop(1, 'rgba(0,228,0,0)');
    } else if (blurName === 'yellow') {
        blur.addColorStop(0, 'rgba(255,215,0,1)');
        blur.addColorStop(1, 'rgba(255,255,0,0)');
    } else if (blurName === 'orange') {
        blur.addColorStop(0, 'rgba(255,165,0,1)');
        blur.addColorStop(1, 'rgba(255,140,0,0)');
    } else if (blurName === 'purple') {
        blur.addColorStop(0, 'rgba(138,43,226,1)');
        blur.addColorStop(1, 'rgba(160,32,240,0)');
    } else {
        console.log('Unsupported blur effect color.');
        return;
    }
    
    context.arc(x, y, 1.5*radius, 0, Math.PI*2, false);
    context.fillStyle = blur;
    context.fill();
};

function DrawSexMark(context, x, y, radius, name, sex, lineColor) {
    context.lineCap = 'round';
    context.lineWidth = 2;
    
    if (sex === 'male') {
        context.beginPath();
        context.moveTo(x, y-radius);
        context.lineTo(x, y-radius*1.6);
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.beginPath();
        context.moveTo(x-radius*0.3, y-radius*1.3);
        context.lineTo(x, y-radius*1.6);
        context.lineTo(x+radius*0.3, y-radius*1.3);
        context.lineJoin = 'miter';
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.font = '8pt Arial';
        context.textAlign = 'center';
        context.fillType = 'black';
        context.fillText(String(name), x, y+radius+16);
    }
    else if (sex === 'female')
    {
        context.beginPath();
        context.moveTo(x, y+radius);
        context.lineTo(x, y+radius*1.6);
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.beginPath();
        context.moveTo(x-radius*0.3, y+radius*1.3);
        context.lineTo(x+radius*0.3, y+radius*1.3);
        context.lineCap = 'round';
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.font = '8pt Arial';
        context.textAlign = 'center';
        context.fillType = 'black';           
        context.fillText(String(name), x, y-radius-16);   
    }
};

function DrawLine(ctx, x, y, centerX, centerY, sex, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;   
    ctx.stroke();
};
