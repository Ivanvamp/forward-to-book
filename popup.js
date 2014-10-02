chrome.browserAction.onClicked.addListener(function() {	
	if (window.ivSelectorOff === undefined || window.ivSelectorOff === true) {
		window.ivSelectorOff = false;
		chrome.tabs.executeScript({
			code: 'window.ivSelector.init();'
		});	
		chrome.browserAction.setIcon({path:"on.png"});
	} else {
		window.ivSelectorOff = true;
		chrome.tabs.executeScript({
			code: 'window.ivSelector.hide();'
		});	
		chrome.browserAction.setIcon({path:"off.png"});
	}

});