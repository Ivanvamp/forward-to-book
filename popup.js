/**
 * Обработка клика по расширению
 */
chrome.browserAction.onClicked.addListener(function(tab) {
    var ivSelectorActive;
    // Отправляю запрос контенту таба
    chrome.tabs.sendMessage(tab.id, {method: "getStatus"}, function(response) {
        if (response && response.method == "status"){
            ivSelectorActive = response.data;

            if (ivSelectorActive === false) {
                chrome.tabs.executeScript({
                    code: 'window.ivSelector.init();'
                });
            } else {
                chrome.tabs.executeScript({
                    code: 'window.ivSelector.hide();'
                });
            }
            changeIcon(!ivSelectorActive);
        }
    });
});

/**
 * При активации таба проверяет статус расширения
 */
chrome.tabs.onActivated.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.tabId, {method: "getStatus"}, function(response) {
        if (response && response.method == "status"){
            changeIcon(response.data);
        }
    });
});

/**
 * Меняет иконку
 * @param status Статус расширения
 */
function changeIcon(status) {
    if (status) {
        chrome.browserAction.setIcon({path:"on.png"});
    } else {
        chrome.browserAction.setIcon({path:"off.png"});
    }
}