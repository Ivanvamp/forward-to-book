document.addEventListener("DOMContentLoaded", function () {
	//ivSelector.init();
	window.ivSelector = ivSelector;	
});

var ivSelector = {};

ivSelector.getSelectedText = function() {
// @todo Доделать кроссбраузерность
	var sel = window.getSelection(),
		text = "";

	if (sel.type === 'Range') {
		// @todo Нужна обработка текст в случае вложенности тегов
		// Если текст выделен в пределах одного блока
		if (sel.baseNode === sel.extentNode) {
			text = sel.baseNode.textContent.substring(sel.baseOffset, sel.extentOffset);
		} else {
			text = sel.baseNode.textContent.substring(sel.baseOffset, sel.baseNode.textContent.length) +
				   sel.extentNode.textContent.substring(0, sel.extentOffset);
		}
	}
	return text;
}

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
ivSelector.changeColorText = function(tag, color) {	
	var newEl = document.createElement(tag);	
	newEl.style.backgroundColor = color;	// Это основное изменение цвета
	// Очень не красивый код. Добавляет класс обрамляющему тегу и создает класс в таблице стилей. Тем самым цвет меняется у всех дочерних
	//	newEl.setAttribute('class', 'newStyle');
	//	document.styleSheets[0].deleteRule(777);
	//	document.styleSheets[0].insertRule(".newStyle, .newStyle > * {background-color: " + color + " !important;}", 777);
	// ----- Не подходит, т.к. меняется весь ранее выделенный текст
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
	ivSelector.tag = 'span';
	ivSelector.color = 'red';
	
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
			if (panPosY > (window.pageYOffset + panH + 100)) {
				ivSelector.mainPanel.style.top = panPosY - 100 + 'px';
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
        console.dir(mainPanel.style);
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
	collapsePanel.insertAdjacentHTML('afterbegin', '<>');
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
            // @todo цвета должны быть предопределы заранее и описаны в таблице стилей
            var colorArr = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
            td.style.backgroundColor = '#' + colorArr[Math.floor(Math.random() * 16)] + colorArr[Math.floor(Math.random() * 16)] + colorArr[Math.floor(Math.random() * 16)];

            // Меняет цвет при клике
            td.onclick = function() {
                ivSelector.color = this.style.backgroundColor;
                return (function () {
                    ivSelector.changeColorText(ivSelector.tag, ivSelector.color);
                })();
            };

            // Вызывает запрос на изменение цвета
            td.oncontextmenu = function(e) {
                var color = prompt('Введите новый цвет', this.style.backgroundColor);
                if (color !== null) {
                    this.style.backgroundColor = color;
                }
                e.stopPropagation();
                return false;
            }
            // Запрещаю выделение, чтобы фокус с текста не перескакивал
            /*td.onselectstart = function() {
             return false;
             }*/
            tr.appendChild(td);
        }
        colorPanel.appendChild(tr);
    }
    return colorPanel;
}