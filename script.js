document.addEventListener("DOMContentLoaded", function (e) {
	console.log("Работаем");

	// разыне константы

	// чтобы ушки радовались
	const sound = new Audio("sound1.mp3");
	sound.volume = 0.1;

	// сколько итераций игры должно произовйти, чтобы сущности поменяли цельи
	const cyclesToChangeTargets = 3;

	// сколько итераций игры должно произовйти, чтобы сущности поменяли направление к цели
	const cyclesToChangeDirections = 6;

	// таймаут после игрового цикла
	const cycleTimeout = 100;

	// максимальное расстояние между столнувшимися объектами
	const collisionDist = 20;

	// создаём экран приветствия
	// обёртка и начальный экран
	const wrapper = document.querySelector(".wrapper");
	const greetings = document.querySelector(".greetings");

	// // отбираем параметры запроса
	// const urlParams = new URLSearchParams(window.location.search);
	// const isContinued = Boolean(urlParams.get("continue"));

	// if (isContinued) {
	// 	// просто отрисовываем страницу
	// 	wrapper.classList.remove("hidden");
	// } else {
	// 	// активируем приветственный экран
	// 	greetings.classList.remove("hidden");
	// }

	// кнопка в приветствии
	const letsgoButton = document.getElementById("letsgo");
	letsgoButton.onclick = function (e) {
		greetings.classList.add("hidden");
		wrapper.classList.remove("hidden");
		// setTimeout(() => {
		// 	greetings.classList.add("disabled");
		// }, 1000);
	};

	// кнопка рестарта
	const restartButton = document.getElementById("restart");
	restartButton.onclick = function (e) {
		window.location.reload();
	};

	// делаем ссылки кнопками
	const buttons = document.querySelectorAll(".tools__button");
	buttons.forEach((button) => {
		button.onclick = (e) => {
			e.preventDefault();
			return false;
		};
	});

	// переключение кнопок
	let shift = "none";

	// изменение стилей при активации
	function activateButton(buttonID, buttonsSelector) {
		const buttons = document.querySelectorAll(buttonsSelector);
		buttons.forEach((button) => {
			button.classList.remove("active");
		});

		const activeButton = document.getElementById(buttonID);
		activeButton.classList.add("active");
	}

	const rockButton = document.getElementById("rock-button");
	rockButton.onclick = function (e) {
		shift = "rock";
		activateButton("rock-button", ".tools__button");
	};

	const paperButton = document.getElementById("paper-button");
	paperButton.onclick = function (e) {
		shift = "paper";
		activateButton("paper-button", ".tools__button");
	};

	const scissorsButton = document.getElementById("scissors-button");
	scissorsButton.onclick = function (e) {
		shift = "scissors";
		activateButton("scissors-button", ".tools__button");
	};

	const randomButton = document.getElementById("random-button");
	randomButton.onclick = function (e) {
		shift = "random";
		activateButton("random-button", ".tools__button");
	};

	const deleteButton = document.getElementById("delete-button");
	deleteButton.onclick = function (e) {
		shift = "delete";
		activateButton("delete-button", ".tools__button");
	};

	// делаем кнопки чуть красивее, если сайт открыт на мобилке
	if (
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
			navigator.userAgent
		)
	) {
		rockButton.style.padding = "5px";
		randomButton.style.padding = "5px";
	}

	// перемещнеие окна с инструментами
	const tools = document.getElementById("tools");
	const toolsBar = document.getElementById("drag-bar");
	let toolsRect = tools.getBoundingClientRect();
	const toolsCords = {
		clickX: 0,
		clickY: 0,
		startX: 0,
		startY: 0,
		width: toolsRect["width"],
		height: toolsRect["height"],
	};

	function moveToolsBar(e) {
		let dx = e.pageX - toolsCords.clickX;
		if (toolsCords.startX + dx <= 0) {
			x = 0;
		} else if (toolsCords.startX + toolsCords.width + dx >= document.documentElement.clientWidth) {
			x = document.documentElement.clientWidth - toolsCords.width;
		} else {
			x = toolsCords.startX + dx;
		}

		let dy = e.pageY - toolsCords.clickY;
		if (toolsCords.startY + dy <= 0) {
			y = 0;
		} else if (toolsCords.startY + toolsCords.height + dy >= document.documentElement.clientHeight) {
			y = document.documentElement.clientHeight - toolsCords.height;
		} else {
			y = toolsCords.startY + dy;
		}
		tools.style.left = x + "px";
		tools.style.top = y + "px";

		// console.log(startX + " " + startY);
	}

	toolsBar.onpointerdown = function (e) {
		toolsCords.clickX = e.pageX;
		toolsCords.clickY = e.pageY;
		let toolsRect = tools.getBoundingClientRect();
		toolsCords.startX = toolsRect["x"];
		toolsCords.startY = toolsRect["y"];
		document.addEventListener("pointermove", moveToolsBar);
	};
	toolsBar.onpointerup = function (e) {
		toolsCords.startX = 0;
		toolsCords.startY = 0;
		document.removeEventListener("pointermove", moveToolsBar);
	};

	// создание элементов на игровом поле
	let rpsElements = [];

	// направления к сущностям
	let directions = [];
	let targets = [];

	// класс сущности
	class RpsElement {
		constructor(ref, type, x, y) {
			this.ref = ref;
			this.type = type;
			this.x = x;
			this.y = y;
		}

		changeType(type) {
			this.type = type;
			this.ref.classList.remove("rock");
			this.ref.classList.remove("paper");
			this.ref.classList.remove("scissors");
			this.ref.classList.add(type);
		}

		move(new_x, new_y) {
			this.x = new_x;
			this.y = new_y;
			this.ref.style.left = String(new_x) + "px";
			this.ref.style.top = String(new_y) + "px";
		}

		delete() {
			// удаляем сущность из массива
			let elemIndex = 0;
			rpsElements.forEach((rpsElement, i) => {
				if (rpsElement.ref == this.ref) {
					elemIndex = i;
				}
			});
			rpsElements.splice(elemIndex, 1);

			// удаляем сущность с экрана
			this.ref.classList.add("hidden");
			setTimeout(() => this.ref.remove(), 1000);
		}
	}

	// игровое поле
	const field = document.getElementById("field");

	// размеры поля
	const widthInput = document.getElementById("width");
	widthInput.onchange = function (e) {
		if (this.value < 30) {
			this.value = 30;
		} else if (this.value > 100) {
			this.value = 100;
		}
		width = this.value;
		// field.style.width = width + "vw";
		field.style.width = width + "%";
	};

	const heightInput = document.getElementById("height");
	heightInput.onchange = function (e) {
		if (this.value < 30) {
			this.value = 30;
		} else if (this.value > 100) {
			this.value = 100;
		}
		height = this.value;
		// field.style.height = height + "vh";
		field.style.height = height + "%";
	};

	// клики по полю
	field.onclick = function (e) {
		if (shift == "none" || shift == "delete") {
			return;
		}

		// рассчёт координат
		let fieldRect = field.getBoundingClientRect();
		let x0 = fieldRect["x"];
		let y0 = fieldRect["y"];
		// console.log(x0 + " " + y0);

		let x1 = e.clientX;
		let y1 = e.clientY;

		let x = x1 - x0;
		let y = y1 - y0;
		// console.log(x + " " + y);

		// создание элемента
		elem = document.createElement("div");
		elem.classList.add("rps-element");
		elem.classList.add("rps-element-helper");
		elem.classList.add("hidden");
		elem.style.top = y + "px";
		elem.style.left = x + "px";

		// выбор типа элемента
		elem.classList.add(shift);

		// добавление функции удаления
		elem.onclick = function (e) {
			e.stopPropagation();

			if (shift == "delete") {
				rpsElements.forEach((rpsElement) => {
					if (rpsElement.ref == this) {
						rpsElement.delete();
					}
				});
			}

			return false;
		};

		// добавление элемента
		rpsElements.push(new RpsElement(elem, shift, x, y));
		this.append(elem);
		setTimeout(() => elem.classList.remove("hidden"), 100);
		// console.dir(elem);
	};

	// начало игры
	const startButton = document.getElementById("start");
	startButton.onclick = function (e) {
		shift = "none";
		rpsElements.forEach((rpsElem) => {
			rpsElem.ref.classList.remove("rps-element-helper");
		});

		// убираем инструменты
		const tools = document.getElementById("tools");
		tools.classList.add("hidden");
		setTimeout(() => tools.classList.add("disabled"), 1000);

		// удаление сущностей за пределами поля
		const fieldRect = field.getBoundingClientRect();
		let fieldWidth = fieldRect["width"];
		let fieldHeight = fieldRect["height"];

		let i = 0;
		while (i < rpsElements.length) {
			let rpsElement = rpsElements[i];
			let x = rpsElement.x;
			let y = rpsElement.y;

			if (x > fieldWidth || x < 0 || y > fieldHeight || y < 0) {
				rpsElement.delete();
				continue;
			}
			i++;
		}

		// заменяем рандомные элементы на обычные
		rpsElements.forEach((rpsElem) => {
			if (rpsElem.type != "random") {
				return;
			}
			rpsElem.ref.classList.remove("random");

			rand = Math.random();
			if (rand < 0.33) {
				rpsElem.ref.classList.add("rock");
				rpsElem.type = "rock";
			} else if (rand < 0.66) {
				rpsElem.ref.classList.add("paper");
				rpsElem.type = "paper";
			} else {
				rpsElem.ref.classList.add("scissors");
				rpsElem.type = "scissors";
			}
		});

		// НУЖНО ДЛЯ КАЖДОЙ СУЩНОСТИ СГЕНЕРИРОВАТЬ СВОЙ СПИСОК ЦЕЛЕЙ,
		// К КОТОРЫМ ОНА МОЖЕТ ПРИБЛИЖАТЬСЯ ИЛИ ОТ КОТОРЫХ МОЖЕТ УБЕГАТЬ
		// прописываем для каждой сущности направления к другим сущностям

		// запускаем игровой цикл
		let cycleCounter = 0;

		gameIntervalID = setInterval(() => {
			// console.log(cycleCounter);
			// проверяем, все ли элементы одного типа
			let rockCount = 0;
			let paperCount = 0;
			let scissorsCount = 0;
			rpsElements.forEach((rpsElement) => {
				type = rpsElement.type;
				switch (type) {
					case "rock":
						rockCount++;
						break;
					case "paper":
						paperCount++;
						break;
					case "scissors":
						scissorsCount++;
						break;
				}
			});

			let len = rpsElements.length;
			if (rockCount == len || paperCount == len || scissorsCount == len) {
				clearInterval(gameIntervalID);
				// всплывает кнопочка с рестартом
				setTimeout(() => {
					restartButton.classList.remove("hidden");
				}, 1000);
				return;
			}

			// нужно ли обновлять цели
			if (cycleCounter % cyclesToChangeTargets == 0) {
				targets = [];
				// directions = [];
				for (let i = 0; i < rpsElements.length; i++) {
					let target = i;
					while (target == i) {
						target = Math.round(Math.random() * (rpsElements.length - 1));
					}
					targets.push(target);
					// directions.push(Math.random() < 0.5 ? -1 : 1);
				}
			}

			// нужно ли обновить направления
			if (cycleCounter % cyclesToChangeDirections == 0) {
				directions = [];
				for (let i = 0; i < rpsElements.length; i++) {
					directions.push(Math.random < 0.66 ? 1 : -1);
				}
			}

			gameCycle();

			cycleCounter++;
		}, cycleTimeout);
	};

	// один игровой цикл
	function gameCycle() {
		// генерируем рандомное перемещение

		cords = [];
		rpsElements.forEach((rpsElem, i) => {
			// Этот способ передвижения заставляет сущностей колебаться около начальной точки
			// speed = Math.random() * 10;
			// // speed = (Math.random() * 4) ** 2;
			// // speed = Math.random() ** 4 * 10;

			// sign_x = Math.random() < 0.5 ? -1 : 1;
			// sign_y = Math.random() < 0.5 ? -1 : 1;

			// dx = Math.random();
			// dy = Math.sqrt(1 - dx ** 2);

			// motion = [sign_x * dx * speed, sign_y * dy * speed];

			// new_x = rpsElem.x + motion[0];
			// new_y = rpsElem.y + motion[1];

			// Этот способ будет направлять сущность ко второй рандомной сущности
			let target = targets[i];
			let targetCords = [rpsElements[target].x, rpsElements[target].y];
			let ownCords = [rpsElem.x, rpsElem.y];

			let vector = [targetCords[0] - ownCords[0], targetCords[1] - ownCords[1]];
			let vectorSigns = [vector[0] < 0 ? -1 : 1, vector[1] < 0 ? -1 : 1];
			let k = vector[0] / vector[1];

			let xn = vectorSigns[0] * Math.sqrt(k ** 2 / (k ** 2 + 1));
			let yn = vectorSigns[1] * Math.sqrt(1 - xn ** 2);

			// let speed = (Math.random() * 10) ** 2;
			let direction = directions[i];
			let speed = Math.random() * 5;
			// ДЛЯ ЭТОЙ ФИЗИКИ ДВИЖЕНИЯ НУЖНО СДЕЛАТЬ НОРМАЛЬНЫЕ ГРАНИЦЫ ПОЛЯ
			// let motion = [xn * speed * direction, yn * speed * direction];
			let motion = [xn * speed, yn * speed];
			let new_x = rpsElem.x + motion[0];
			let new_y = rpsElem.y + motion[1];

			cords.push([new_x, new_y]);
		});

		// перемещаем элементы
		// ТУТ ДОЛЖНА БЫТЬ ПРОВЕРКА НА УХОД ЗА ГРАНИЦЫ ПОЛЯ
		for (let i = 0; i < cords.length; i++) {
			rpsElement = rpsElements[i];
			rpsElement.move(cords[i][0], cords[i][1]);
		}

		// создаём очередь смены типов, которая выполнится после
		let typeQueue = [];
		// проверяем наличие столкновений
		for (let i = 0; i < rpsElements.length - 1; i++) {
			for (let j = i + 1; j < rpsElements.length; j++) {
				cds1 = cords[i];
				cds2 = cords[j];

				// сравниваем минимальное расстояние с расстоянием между элементами
				let dist = Math.sqrt((cds1[0] - cds2[0]) ** 2 + (cds1[1] - cds2[1]) ** 2);
				if (dist <= collisionDist) {
					console.log("COLLISION");
					rpsElem1 = rpsElements[i];
					rpsElem2 = rpsElements[j];

					// смотрим, какого типа станут элементы после столкновения
					let types = [rpsElem1.type, rpsElem2.type];
					let typeToChange = "none";
					if (types.includes("rock") && types.includes("paper")) {
						typeToChange = "paper";
					} else if (types.includes("rock") && types.includes("scissors")) {
						typeToChange = "rock";
					} else if (types.includes("paper") && types.includes("scissors")) {
						typeToChange = "scissors";
					}

					// заносим смену типа в очередь
					if (typeToChange != "none") {
						typeQueue.push([i, typeToChange]);
						typeQueue.push([j, typeToChange]);
					}
				}
			}
		}

		// меняем тип у столкнувшихся объектов
		typeQueue.forEach(([i, type]) => {
			rpsElement = rpsElements[i];
			rpsElement.changeType(type);

			// звук по приколу
			sound.play();
		});
	}
});
