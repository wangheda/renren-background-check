// JavaScript Document

$(document).ready(function(){
	var window_width = window.innerWidth;
	var window_height = window.innerHeight;
	var panel_width = parseInt(window_width/5)
	$('div.display').css('height', window_height-2*parseInt($('div.display').css('padding-top')));
	$('div.display').css('margin-right', panel_width);
	$('div.friend_panel').css('height', window_height);
	$('div.friend_panel').css('width', panel_width);
	
});