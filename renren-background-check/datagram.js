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
	    var centerX = 500;
	    var centerY = 350;
	    var allowedMaxRadius = 350;
	    var length = globalWhoCareAboutTA.length;
	    var maxValue = getMaximum(globalWhoCareAboutTA);
	    var whoCareAboutTAArray = new Array();
        
        // Parameters of the radius equation
	    var maxSqure = Math.pow(maxValue, 2);
	    var B = (5*maxSqure-240)/(maxValue-maxSqure);
	    var A = -5-B;    
	    
	    // First pass the data to build the data object
	    for (var i=0, j=0; i<length; i++) {
	        if (globalWhoCareAboutTA[i] !== 0) {
	            // Create a new object
	            var object = new Object ();
	            object['name'] = globalFriendName[i];
	            object['headurl'] = globalFriendHead[i];
	            object['score'] = globalWhoCareAboutTA[i];
	            object['sex'] = 'male';
	            object['radius'] = A*Math.pow(object.score, 2)+B*object.score+300;
	                    
	            // Add the object into the array
	            whoCareAboutTAArray[j] = object;
	            j++;
	        }
	    }
	    
	    // Second pass the data object to calculate the theta
	    var thetaUnit = Math.PI*2/whoCareAboutTAArray.length;
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        var xFactor = Math.pow(-1, Math.floor(Math.random()*10));
	        var delta = thetaUnit*xFactor*0.25;
	        whoCareAboutTAArray[i].theta = thetaUnit*i;
	    }
	    
	    // Third pass the data object just created to make sure there is no eclipsing
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        var baseScore = whoCareAboutTAArray[i].score;
	        var baseTheta = whoCareAboutTAArray[i].theta;
	        if (baseScore>0.8*maxValue) {
	            for (var j=0; j<whoCareAboutTAArray.length; j++) {
	                if (i===j || whoCareAboutTAArray[j].score < 0.8*maxValue) {
	                    continue;
	                }
	                var theta = whoCareAboutTAArray[j].theta;
	                var absTheta = Math.sqrt(Math.pow(baseTheta-theta, 2));
	                if (absTheta === thetaUnit) {
	                    whoCareAboutTAArray[i].theta -= -0.6*thetaUnit;
	                }
	            }
	        }
	    }
	    
	    // Draw the user in the center
	    DrawRenRenUser(ctx, globalUserHead, centerX, centerY, 32, '', 'center');
	    
	    // Draw others
	    for (var i=0; i<whoCareAboutTAArray.length; i++) {
	        var headurl = whoCareAboutTAArray[i].headurl;
	        var x = centerX+Math.cos(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var y = centerY+Math.sin(whoCareAboutTAArray[i].theta)*whoCareAboutTAArray[i].radius;
	        var sex = whoCareAboutTAArray[i].sex;
	        var name = whoCareAboutTAArray[i].name;
	        DrawRenRenUser(ctx, headurl, x, y, 24, name, sex);
	        DrawLine(ctx, x, y, centerX, centerY, sex);
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

function DrawLine(ctx, x, y, centerX, centerY, sex) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 0.5;
    if (sex === 'male') {
        ctx.strokeStyle = 'blue';   
    }
    else {
        ctx.strokeStyle = 'pink';
    }
    ctx.stroke();
};

function DrawRenRenUser(context, headurl, x, y, radius, name, sex) {
    var img = document.createElement('img');
    var lineColor = (sex==='male')?'blue':'pink';
    img.src = String(headurl);
    img.onload = function() {
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
        context.lineWidth = 3;
        context.strokeStyle = (sex==='center')?'black':lineColor;
        context.stroke();
    };
    
    // Draw the name of the renren user and mark based on sex
    if (sex === 'male') {
        context.beginPath();
        context.moveTo(x, y-radius);
        context.lineTo(x, y-radius*1.6);
        context.lineCap = 'round';
        context.lineWidth = 3;
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.beginPath();
        context.moveTo(x-radius*0.3, y-radius*1.3);
        context.lineTo(x, y-radius*1.6);
        context.lineTo(x+radius*0.3, y-radius*1.3);
        context.lineJoin = 'miter';
        context.lineWidth = 3;
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.font = '8pt Arial';
        context.textAlign = 'center';
        context.fillType = 'black';
        context.fillText(String(name), x, y+radius+12);
    }
    else if (sex === 'female')
    {
        context.beginPath();
        context.moveTo(x, y+radius);
        context.lineTo(x, y+radius*1.6);
        context.lineCap = 'round';
        context.lineWidth = 3;
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.beginPath();
        context.moveTo(x-radius*0.3, y+radius*1.3);
        context.lineTo(x+radius*0.3, y+radius*1.3);
        context.lineCap = 'round';
        context.lineWidth = 3;
        context.strokeStyle = lineColor;
        context.stroke();
        
        context.font = '8pt Arial';
        context.textAlign = 'center';
        context.fillType = 'black';
        context.fillText(String(name), x, y-radius-12);   
    }
};
