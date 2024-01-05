document.addEventListener("DOMContentLoaded", function (e) {
	console.log("Работаем");

	// разыне константы

	// сколько итераций игры должно произовйти, чтобы сущности поменяли цельи
	const cyclesToChangeTargets = 3;

	// сколько итераций игры должно произовйти, чтобы сущности поменяли направление к цели
	const cyclesToChangeDirections = 6;

	// таймаут после игрового цикла
	const cycleTimeout = 100;

	// максимальное расстояние между столнувшимися объектами
	const collisionDist = 20;

	// множитель скорости сущностей (или максимальная их скорость)
	const speedMultiplier = 5;

	// создаём экран приветствия
	// обёртка и начальный экран
	const wrapper = document.querySelector(".wrapper");
	const greetings = document.querySelector(".greetings");

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
			this.ref.style.left = new_x + "px";
			this.ref.style.top = new_y + "px";
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
			let target = targets[i];
			let targetCords = [rpsElements[target].x, rpsElements[target].y];
			let ownCords = [rpsElem.x, rpsElem.y];

			let v = [targetCords[0] - ownCords[0], targetCords[1] - ownCords[1]];
			let vSigns = [v[0] < 0 ? -1 : 1, v[1] < 0 ? -1 : 1];

			// У ТЕБЯ ТУТ ПРОБЛЕМА:
			// vector[1] ТЕОРЕТИЧЕСКИ МОЖЕТ БЫТЬ РАВЕН НУЛЮ,
			// ИЗ-ЗА ЧЕГО k МОЖЕТ СТАТЬ РАВНЫМ Infinity
			// ПОПЫТАЙСЯ ВСЁ СДЕЛАТЬ БЕЗ ПРОМЕЖУТОЧНЫХ ВЫЧИСЛЕНИЙ

			// let k = vector[0] / vector[1];
			// let xn = vectorSigns[0] * Math.sqrt(k ** 2 / (k ** 2 + 1));
			// let yn = vectorSigns[1] * Math.sqrt(1 - xn ** 2);

			let xn = vSigns[0] * Math.sqrt(Math.abs(v[0] ** 2 / (v[0] ** 2 + v[1] ** 2)));

			let yn = vSigns[1] * Math.sqrt(1 - xn ** 2);

			// let direction = directions[i];
			let speed = Math.random() * speedMultiplier;

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
			let rpsElement = rpsElements[i];
			rpsElement.move(cords[i][0], cords[i][1]);
		}

		// создаём очередь столкновений
		let collisionQueue = [];
		for (let i = 0; i < rpsElements.length - 1; i++) {
			for (let j = i + 1; j < rpsElements.length; j++) {
				// считаем дистанцию между элементами
				cds1 = cords[i];
				cds2 = cords[j];

				let dist = Math.sqrt((cds1[0] - cds2[0]) ** 2 + (cds1[1] - cds2[1]) ** 2);
				if (dist <= collisionDist) {
					// если дистанция маленькая, то заносим в очередь
					collisionQueue.push([i, j, dist]);
				}
			}
		}

		// сортируем очередь по возрастанию дистанции между сущностями,
		// чтобы у обработки была хоть какая-то упорядоченность
		collisionQueue.sort((a, b) => {
			return a[2] - b[2];
		});

		// меняем сущностям типы
		collisionQueue.forEach(([i, j, currDist]) => {
			let rpsElem1 = rpsElements[i];
			let rpsElem2 = rpsElements[j];
			if (rpsElem1.type == rpsElem2.type) {
				return;
			}

			// просчитываем тип
			types = [rpsElem1.type, rpsElem2.type];
			let typeToChange;
			if (types.includes("rock") && types.includes("paper")) {
				typeToChange = "paper";
			} else if (types.includes("rock") && types.includes("scissors")) {
				typeToChange = "rock";
			} else if (types.includes("paper") && types.includes("scissors")) {
				typeToChange = "scissors";
			}

			// меняем тип у сущности
			if (rpsElem1.type == typeToChange) {
				rpsElem2.changeType(typeToChange);
			} else {
				rpsElem1.changeType(typeToChange);
			}

			// звук по приколу
			// sound.play();
			// const sound = new Audio("sound1.mp3");
			const sound = new Audio("sound2.mp3");
			sound.volume = 0.1;
			sound.play();
		});
	}
});
