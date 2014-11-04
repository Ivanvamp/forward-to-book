var ivSelector = {};

//ivSelector.init();
window.ivSelector = ivSelector;
window.ivSelectorActive = false;

/**
* Обрамляет выделенный текст елементом и заменяет им текст
* @param el Элемент для обрамления
**/	
ivSelector.insertElementInRange = function(el) {
	var range = window.getSelection().getRangeAt(0);	
	el.appendChild(range.extractContents());	
	range.insertNode(el);		
}

/**
* Меняет цвет выделенного текста
* @param tag Тэг обрамления
* @param color Цвет выделения
**/	
ivSelector.changeColorText = function(cls) {
	var newEl = document.createElement('ivTag');
	newEl.setAttribute('class', cls);
	ivSelector.insertElementInRange(newEl);
}

/**
* Добавляет комментарий выделенному тексту
* @param comment Коммментарий
**/	
ivSelector.addComment = function(comment) {	
	var newEl = document.createElement('span');	
	newEl.setAttribute('class', 'ivComment');
	newEl.setAttribute('data-comment', comment);
    newEl.onclick = function() {
        var oldComment = this.getAttribute('data-comment');
        var newComment = prompt('Измените комментарий', oldComment);
        if (newComment !== null) {
            this.setAttribute('data-comment', newComment);
        }
    }
	ivSelector.insertElementInRange(newEl);
}

/**
* Добавляет закладку на блок текста
* @param title Название закладки
**/	
ivSelector.addBookmark = function(title) {	
	var newEl = document.createElement('a');	
	var mainPanel = document.getElementById('ivPanelTool');
	ivSelector.bookmarkIndex++;
	newEl.name = 'ivBookmark-' + ivSelector.bookmarkIndex;
	newEl.setAttribute('class', 'ivBookmark');	
	ivSelector.insertElementInRange(newEl);
	
	newEl = document.createElement('a');	
	newEl.href = '#' + 'ivBookmark-' + ivSelector.bookmarkIndex;
	newEl.insertAdjacentHTML('afterbegin', ivSelector.bookmarkIndex + '. ' + title);
	newEl.setAttribute('title', title);
	ivSelector.mainPanel.appendChild(newEl);
}

/**
* Инициализирует инструментарий
**/
ivSelector.init = function() {
    window.ivSelectorActive = true;

	ivSelector.bookmarkIndex = 0;
	if (ivSelector.mainPanel) {
		ivSelector.mainPanel.style.display = 'block';
	} else {
		ivSelector.mainPanel = {};
		
		ivSelector.move = false;
		ivSelector.moveX = 0;
		ivSelector.moveY = 0;
		
		ivSelector.createPanel();
		
		// Корректировка позиции панели при скроллинге страницы
		document.onscroll = function() {	
			var panPosX = parseInt(ivSelector.mainPanel.style.left, 10),
				panPosY = parseInt(ivSelector.mainPanel.style.top, 10),
				panW = ivSelector.mainPanel.clientWidth,
				panH = ivSelector.mainPanel.clientHeight;

			if (panPosY < window.pageYOffset) {
				ivSelector.mainPanel.style.top = window.pageYOffset + 'px';
			}
			if (panPosY >= (window.pageYOffset + window.innerHeight - panH)) {
				ivSelector.mainPanel.style.top = window.pageYOffset + window.innerHeight - panH + 'px';
			}
			if (panPosX < window.pageXOffset) {
				ivSelector.mainPanel.style.left = window.pageXOffset + 'px';
			}
			/*if (panPosX > (window.pageXOffset + panW + 100)) {
				ivSelector.mainPanel.style.left = panPosX - 100 + 'px';
			}*/		
		};
	}
};

/**
* Скрывает инструментарий
**/
ivSelector.hide = function() {
	ivSelector.mainPanel.style.display = 'none';
    window.ivSelectorActive = false;
}

/**
* Создает главную панель с элементами управления
**/
ivSelector.createPanel = function() {
	var mainPanel = document.createElement('div'),				// Основная панель
		buttonAC = document.createElement('button'),			// Кнопка для добавления комментария
		buttonABM = document.createElement('button'),			// Кнопка для добавления закладки
		titlePanel = document.createElement('div'),				// Заголовок панели с кнопками управления
		collapsePanel = document.createElement('div');			// Сворачивание/разворачивание панели

	mainPanel.id = 'ivPanelTool';
	mainPanel.setAttribute('class', 'expand');
	mainPanel.style.top = window.pageYOffset + 'px';
	mainPanel.style.left = window.innerWidth - 200 - 20 + 'px';
	mainPanel.style.display = 'block';

    mainPanel.oncontextmenu = function(e) {
        if (isNaN((parseInt(mainPanel.style.opacity)))) {
            mainPanel.style.opacity = 0.75;
        }
        if (mainPanel.style.opacity <= 0.25) {
            mainPanel.style.opacity = 1;
        }
        else {
            mainPanel.style.opacity -= 0.25;
        }
        return false;
    }

	titlePanel.id = 'ivTitlePanel';
	titlePanel.insertAdjacentHTML('afterbegin', 'Перетаскиваемая панель');
	
	collapsePanel.id = 'ivCollapseButton';
	collapsePanel.textContent  = '<>';
	collapsePanel.onclick = function() {
		ivSelector.collapseExpandPanel();
	}
	
	titlePanel.onmousedown = function(mouseEvt) {
		var evt = mouseEvt || window.event/*IE*/;
		var target = mouseEvt.target || mouseEvt.srcElement/*IE*/;
		ivSelector.move = true;
		ivSelector.tempOnmousemove = document.onmousemove; // Сохраняю предыдущий обработчик
		ivSelector.moveX = evt.offsetX;
		ivSelector.moveY = evt.offsetY;
		document.onmousemove = function(mouseEvt) {
			var evt = mouseEvt || window.event/*IE*/;
			if (!ivSelector.move) {return;}
			ivSelector.mainPanel.style.left = evt.clientX + window.pageXOffset - ivSelector.moveX + 'px'; 
			ivSelector.mainPanel.style.top = evt.clientY + window.pageYOffset - ivSelector.moveY + 'px'; 
		}
	}
	
	titlePanel.onmouseup = function() {
		ivSelector.move = false;
		document.onmousemove = ivSelector.tempOnmousemove;
	}
	
	buttonAC.id = 'btnSetColor'
	buttonAC.insertAdjacentHTML('afterbegin', 'Комментировать');
	buttonAC.onclick = function() {
		ivSelector.addComment(prompt('Введите комментарий'));
	}
	
	buttonABM.id = 'btnAddBookmark'
	buttonABM.insertAdjacentHTML('afterbegin', 'Закладировать');
	buttonABM.onclick = function() {
		ivSelector.addBookmark(prompt('Описание закладки'));
	}	
	
	
	mainPanel.appendChild(titlePanel);
	mainPanel.appendChild(collapsePanel);
	mainPanel.appendChild(buttonAC);
	mainPanel.appendChild(buttonABM);
	mainPanel.appendChild(ivSelector.createColorBlock());
	ivSelector.mainPanel = mainPanel;
	document.body.appendChild(mainPanel);
}

/**
* Сворачивает/разворачивает панель
**/
ivSelector.collapseExpandPanel = function() {
	if (ivSelector.mainPanel.getAttribute('class') == 'expand') {
		ivSelector.mainPanel.setAttribute('class', 'collapse');
	} else {
		ivSelector.mainPanel.setAttribute('class', 'expand');
	}
}

/**
 * Создает блок цветов
 * @returns {HTMLElement}
 */
ivSelector.createColorBlock = function() {
    var colorPanel = document.createElement('table');			// Панель цветов
    for (var i = 0; i < 3; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < 3; j++) {
            var td = document.createElement('td');
            td.setAttribute('class', 'selStyle' + (j + i * 3));

            // Меняет цвет при клике
            td.onclick = function() {
                var cls = this.getAttribute('class');
                return (function () {
                    ivSelector.changeColorText(cls);
                })();
            };

            // Вызывает запрос на изменение цвета
            td.oncontextmenu = function(e) {
                var color = prompt('Введите новый цвет', window.getComputedStyle(this).backgroundColor);
                if (color !== null) {
                    var rules = window.getMatchedCSSRules(this);
                    for (var r = 0, len = rules.length; r < len; r++) {
                        if (rules[r].selectorText.indexOf(this.className) > -1) {
                            rules[r].style.backgroundColor = color;
                        }
                    }
                }
                e.stopPropagation();
                return false;
            }
            tr.appendChild(td);
        }
        colorPanel.appendChild(tr);
    }
    return colorPanel;
}

/**
 * Обрабатывает сообщение от расширения
 */
if (chrome.runtime.onMessage !== undefined) {
    // Вешать обработчик только если это расширение Chrome
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method == 'getStatus') {
            sendResponse({data: window.ivSelectorActive, method: "status"});
        }
    });
}