const
	hypotenuse = (x, y) => {return (Math.sqrt(x**2+y**2))}
	spectateMode = false,
	mapSize = 600,
	turnSensitivity = 0.1,
	startLength = 20,
	playerSpeed = 2,
	amtOfFood = 100,
	sprintingAtrophy = 0.25,
	playerSizeFloor = 15,
	bodyConsumptionRadius = 2,
	growthRate = 5,
	foodDropConstant = 8,
	snakeWidth = 10,
	mapBorderWidth = 10,
	foodRadius = 5,
	spectateDuration = 200,
	spectateZoom = 0.5,
	bgColor = ["#fff", "#aaa"],
	mapBorderColor = "#000",
	foodColor = "#080",
	pauseKey = "Escape",
	spectatorRotationVelocity = 0.005,
	version = "pgattic v1.10.2";

var
	indexOfSpectate = 1,
	spectatorRotate = 0,
	playerResolution = 1,
	playersInGame = [],
	playerDrawRate = 3, // how many segments of the player are skipped, plus one. higher number = less resolution on their curvature. 
	paused = false,
	food = [],
	seconds = 0,
	frames = 0,
	frameRate = 60,
	spectateCounter = 0,
	relativeGameSpeed = 1,
	
	canvas,
	ctx,
	startDirection,
	startLocation,
	scoreMeters,
	selectedFood = 0,
	startDirection = [Math.PI / 2, 0, Math.PI, Math.PI * (3/2)],
	startLocation = [[0, -200], [200, 0], [-200, 0], [0, 200]],
	players = [
		{
			location: [ startLocation[0] ],
			direction: startDirection[0],
			size: startLength,
			boosting:false,
			right: false,
			left: false,
			up: false,
			color: ["#f00", "#a00"],
			boostColor: ["#f66", "#a66"],
			upKey: "W",
			leftKey: "A",
			downKey: "S",
			rightKey: "D",
			spawnKey: "1",
			inGame: false,
			cpu: spectateMode,
		},
		{
			location: [ startLocation[1] ],
			direction: startDirection[1],
			size: startLength,
			boosting:false,
			right: false,
			left: false,
			up: false,
			color: ["#0a0", "#060"],
			boostColor: ["#6a6", "#363"],
			upKey: "T",
			leftKey: "F",
			downKey: "G",
			rightKey: "H",
			spawnKey: "2",
			inGame: false,
			cpu: spectateMode,
		},
		{
			location: [ startLocation[2] ],
			direction: startDirection[2],
			size: startLength,
			boosting:false,
			right: false,
			left: false,
			up: false,
			color: ["#00f", "#00a"],
			boostColor: ["#66f", "#66a"],
			upKey: "I",
			leftKey: "J",
			downKey: "K",
			rightKey: "L",
			spawnKey: "3",
			inGame: false,
			cpu: spectateMode,
		},
		{
			location: [ startLocation[3] ],
			direction: startDirection[3],
			size: startLength,
			boosting:false,
			right: false,
			left: false,
			up: false,
			color: ["#a0a", "#606"],
			boostColor: ["#a6a", "#636"],
			upKey: "ARROWUP",
			leftKey: "ARROWLEFT",
			downKey: "ARROWDOWN",
			rightKey: "ARROWRIGHT",
			spawnKey: "4",
			inGame: false,
			cpu: spectateMode,
		},
	];

switch (numOfPlayers) {
	case 1:
		canvas = [document.getElementById("1")];
		ctx = [canvas[0].getContext("2d")];
		scoreMeters = [document.getElementById("a")];
		players[0].inGame = players[1].inGame = players[2].inGame = players[3].inGame = true;
		players[1].cpu = players[2].cpu = players[3].cpu = true;
		players[1].size = generateAILength();
		players[2].size = generateAILength();
		players[3].size = generateAILength();
		players[0].upKey = "ARROWUP";
		players[0].leftKey = "ARROWLEFT";
		players[0].downKey = "ARROWDOWN";
		players[0].rightKey = "ARROWRIGHT";
		break;
	case 2:
		canvas = [document.getElementById("1"), document.getElementById("2")];
		ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d")];
		scoreMeters = [document.getElementById("a"), document.getElementById("b"), document.getElementById("c"), document.getElementById("d")];
		players.pop();
		players.pop();
		players[1].upKey = "ARROWUP";
		players[1].leftKey = "ARROWLEFT";
		players[1].downKey = "ARROWDOWN";
		players[1].rightKey = "ARROWRIGHT";
		break;
	case 4:
		canvas = [document.getElementById("1"), document.getElementById("2"), document.getElementById("3"), document.getElementById("4")];
		ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d"), canvas[2].getContext("2d"), canvas[3].getContext("2d")];
		scoreMeters = [document.getElementById("a"), document.getElementById("b"), document.getElementById("c"), document.getElementById("d")];
		break;
}
document.getElementById("version").innerHTML = version;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	alert('Are you on mobile? This game was created for PC users only, sorry!')
}

function resize() {
	for (var i of canvas) {
		switch (numOfPlayers) {
			case 1:
				i.width = innerWidth;
				i.height = innerHeight;
				break;
			case 2:
				i.height = innerHeight;
				i.width = innerWidth / 2;
				break;
			case 4:
				i.height = innerHeight / 2;
				i.width = innerWidth / 2;
				break;
		}
	}
}

function generateAILength() {
	return Math.floor(Math.random() * 1980) + 20;
}

window.onresize = () => {
	resize();
}

resize();

onkeydown = () => {
	for (var e = 0; e < numOfPlayers; e++) {
		switch (event.key.toUpperCase()) {
			case players[e].upKey:
				players[e].up = true;
				break;
			case players[e].leftKey:
				players[e].left = true;
				break;
			case players[e].rightKey:
				players[e].right = true;
				break;
			case players[e].spawnKey:
				if (numOfPlayers > 1) {
					if (players[e].inGame) {
						doKill(e);
					}
					players[e].inGame = !players[e].inGame;
				}
		}
	}
	if (event.key == pauseKey) {
		paused = !paused;
		document.getElementById("paused").style.display = paused ? "block" : "none";
		for (var i of canvas) {
			i.style.filter = paused ? "blur(1px)" : "blur(0)";
		}
	}
}

onkeyup = () => {
	for (var e = 0; e < numOfPlayers; e++) {
		switch (event.key.toUpperCase()) {
			case players[e].upKey:
				players[e].up = false;
				break;
			case players[e].leftKey:
				players[e].left = false;
				break;
			case players[e].rightKey:
				players[e].right = false;
				break;
		}
	}
}

function doSpectateCounter () {
	spectateCounter++;
	playersInGame = [];
	for (var e = 0; e < numOfPlayers; e++) {
		if (players[e].inGame) {
			playersInGame.push(e);
		}
	}
	indexOfSpectate = playersInGame[parseInt(spectateCounter / spectateDuration) % playersInGame.length];
}

function AISelectFood(e, closeDistance) {
	var selectedFood;
	for (var i = 0; i < food.length; i++) {
		var x = food[i][0] - players[e].location[0][0];
		var y = food[i][1] - players[e].location[0][1];
		var d = hypotenuse(x, y);
		if (d < closeDistance) {
			closeDistance = d;
			selectedFood = i;
		}
	}
	return [selectedFood, closeDistance];
}

function turnTowards(e, t) {
	var x = t[0] - players[e].location[0][0];
	var y = t[1] - players[e].location[0][1];
	var xn = x * Math.cos(players[e].direction) - y * Math.sin(players[e].direction);
	var yn = x * Math.sin(players[e].direction) + y * Math.cos(players[e].direction);
	if (yn > 0) { players[e].right = true; players[e].left = false; }
	if (yn < 0) { players[e].left = true; players[e].right = false; }
	return [xn, yn];
}

function AITurn(e, selectedFood) {
	var [xn, yn] = turnTowards(e, food[selectedFood]);

	if (Math.abs(yn) < calcSnakeWidth(e) / 2 + foodRadius && xn > 0) {
		players[e].left = players[e].right = false;
	}
	if (xn < 0 && xn > - 40 && Math.abs(yn) < 30) {
		players[e].left = false;
		players[e].right = false;
	}
}

function calcAI(e) {
	players[e].left = false;
	players[e].right = false;
	players[e].up = false;
	var closeDistance = mapSize * 2;
	var selectedFood;
	[selectedFood, closeDistance] = AISelectFood(e, closeDistance);

	AITurn(e, selectedFood);

	var selectedBody;
	var closeBodyDist = 300;
	var selectedPlayer;
	for (var i = 0; i < players.length; i++) {
		if (e != i) {
			var x = players[i].location[0][0] - food[selectedFood][0];
			var y = players[i].location[0][1] - food[selectedFood][1];
			var g = hypotenuse(x, y);
			if (g - 10 < closeDistance) {
				players[e].up = true;
			}
			for (var q = 0; q < players[i].location.length; q++) {
				var x = players[i].location[q][0] - players[e].location[0][0];
				var y = players[i].location[q][1] - players[e].location[0][1];
				var d = hypotenuse(x, y);
				if (d < closeBodyDist) {
					closeBodyDist = d;
					selectedBody = q;
					selectedPlayer = i;
				}		
			}
		}
	}
	if (closeBodyDist < 40) {
		var x = players[selectedPlayer].location[selectedBody][0] - players[e].location[0][0];
		var y = players[selectedPlayer].location[selectedBody][1] - players[e].location[0][1];
		var xn = x * Math.cos(players[e].direction) - y * Math.sin(players[e].direction);
		var yn = x * Math.sin(players[e].direction) + y * Math.cos(players[e].direction);
		players[e].up = false;
		if (yn < 0) {
			players[e].right = true;
			players[e].left = false;
		}
		else if (yn > 0) {
			players[e].left = true;
			players[e].right = false;
		}
	}
	if (hypotenuse(players[e].location[0][0], players[e].location[0][1]) > mapSize - 30) {
		turnTowards(e, [0, 0]);
	}
}

function rotatePlayer(e) {
	if (players[e].left) {
		players[e].direction += turnSensitivity * relativeGameSpeed;
	}
	if (players[e].right) {
		players[e].direction -= turnSensitivity * relativeGameSpeed;
	}
}

function movePlayer(e) {
	var x = Math.cos(players[e].direction) * playerSpeed * relativeGameSpeed;
	var y = Math.sin(players[e].direction) * playerSpeed * relativeGameSpeed;
	players[e].location.unshift([players[e].location[0][0] + x, players[e].location[0][1] - y]);
	if (players[e].location.length > players[e].size) {
		players[e].location.pop();
	}
	while (players[e].location.length > players[e].size) {
		players[e].location.pop();
	}
}

function spawnFood() {
	if (food.length < amtOfFood) {
		var rad = Math.random() * Math.PI * 2;
		var dist = Math.random() * (mapSize - foodRadius * 4);
		food.push([Math.floor(Math.cos(rad) * dist), Math.floor(Math.sin(rad) * dist)]);
	}
}

function constrict(e) {
	var playerCopy = players[e];
	for (var i = 1; i < players[e].location.length - 1; i++) {
		players[e].location[i][0] = (((playerCopy.location[i - 1][0] + playerCopy.location[i + 1][0]) / 2));// + players[e].location[i][0]) / 2;
		players[e].location[i][1] = (((playerCopy.location[i - 1][1] + playerCopy.location[i + 1][1]) / 2));// + players[e].location[i][1]) / 2;
	}
}

function killPlayer(e) {
	if (hypotenuse(players[e].location[0][0], players[e].location[0][1]) > mapSize) {
		doKill(e);
	}
	for (var i = 0; i < players.length; i++) {
		if (i != e && players[i].inGame) {
			for (var c = 0; c < players[i].location.length; c++) {
				var x = players[e].location[0][0] - players[i].location[c][0];
				var y = players[e].location[0][1] - players[i].location[c][1];
				if (hypotenuse(x, y) < (calcSnakeWidth(e) + calcSnakeWidth(i)) / 2) {
					doKill(e);
				}
			}
		}
	}
}

function doKill(e) {
	for (var i = 0; i < players[e].location.length; i++) {
		if (i % foodDropConstant == 0) {
			food.push([players[e].location[i][0], players[e].location[i][1]])
		}
	}
	players[e].location = [
		startLocation[e]
	];
	players[e].direction = startDirection[e];
	players[e].size = startLength;
}

function eatFood(e) {
	for (var i = 0; i < food.length; i++) {
		var x = players[e].location[0][0] - food[i][0];
		var y = players[e].location[0][1] - food[i][1];
		var dist = hypotenuse(x, y);
		if (dist < 15) {
			food[i][0] += x/4;
			food[i][1] += y/4;
		}
		if (dist < calcSnakeWidth(e) / 2 + foodRadius) {
			food.splice(i, 1);
			players[e].size += growthRate;
		}
	}

	for (var q = 3; q < players[e].location.length; q++) { // q is 3 because the firt few body segments act as the "head" anyway
		for (var i = 0; i < food.length; i++) {
			var x = players[e].location[q][0] - food[i][0];
			var y = players[e].location[q][1] - food[i][1];
			if (hypotenuse(x, y) < bodyConsumptionRadius) {
				food.splice(i, 1);
				players[e].size += growthRate;
			}
		}
	}
}

function calculate() {
	doSpectateCounter();
	spectatorRotate += spectatorRotationVelocity;
	for (var e = 0; e < players.length; e++) {
		if (players[e].inGame) {
			if (players[e].cpu && food.length > 0) { calcAI(e) }
			rotatePlayer(e);
			movePlayer(e);
			if (players[e].up && players[e].size > playerSizeFloor) {
				players[e].boosting = true;
				movePlayer(e);
				players[e].size -= sprintingAtrophy;
			} else {
				players[e].boosting = false;
			}
			constrict(e);
			killPlayer(e);
			eatFood(e);
		}
	}
	spawnFood();
}

function drawBG(e) {
	ctx[e].beginPath();
	ctx[e].arc(0, 0, mapSize + snakeWidth, 0, Math.PI * 2);
	ctx[e].fillStyle = makeGradient(bgColor, e);
	ctx[e].fill();
	ctx[e].lineWidth = mapBorderWidth;
	ctx[e].strokeStyle = mapBorderColor;
	ctx[e].stroke();
	ctx[e].closePath();
}

function drawPlayer(e) {
	for (var v = 0; v < players.length; v++) {
		if (players[v].inGame) {
			ctx[e].lineCap = "round";
			ctx[e].lineWidth = calcSnakeWidth(v);
			var targetColor = players[v].boosting ? players[v].boostColor : players[v].color;
			ctx[e].strokeStyle = makeGradient(targetColor, e);
			ctx[e].beginPath();
			ctx[e].moveTo(players[v].location[0][0], players[v].location[0][1]);
			for (var i = 0; i < players[v].location.length; i += playerDrawRate) {
				ctx[e].lineTo(players[v].location[i][0], players[v].location[i][1]);
			}
			ctx[e].lineTo(players[v].location[players[v].location.length - 1][0], players[v].location[players[v].location.length - 1][1])
			ctx[e].stroke();
			ctx[e].beginPath();
			ctx[e].arc(players[v].location[0][0], players[v].location[0][1], calcSnakeWidth(v) / 4, 0, Math.PI * 2);
			ctx[e].fillStyle = compassColor(v);
			ctx[e].fill();
		}
	}
}

function compassColor(e) {
	var size = 0;
	var leader = 0;
	for (var i = 0; i < players.length; i++) {
		if (players[i].size > players[leader].size) {
			leader = i;
			size = players[i].size;
		}
	}
	return leader == e ? "#ff0" : "#000";
}

function calcSnakeWidth(v) {
	return (Math.sqrt(players[v].size) / 3) + 5;
}

function drawFood(e) {
	for (var i of food) {
//		if ((Math.sqrt((players[e].location[0][0] - i[0]) ** 2 + (players[e].location[0][1] - i[1]) ** 2)) < (Math.sqrt((canvas[e].width / 2) ** 2 + (canvas[e].height / 2) ** 2))) { // This if statement checks to see if food is within the viewport of the player
			ctx[e].beginPath();
			ctx[e].arc(i[0], i[1], foodRadius, 0, Math.PI * 2);
//			ctx[e].rect(i[0] - 4, i[1] - 4, 8, 8);
			ctx[e].fillStyle = foodColor;
			ctx[e].fill();
//		}
	}
}

function translateCanvas(e) {
	ctx[e].restore();
	ctx[e].save();
	ctx[e].translate(canvas[e].width / 2, canvas[e].height / 2);
	if (!spectateMode || numOfPlayers != 1) {
		if (players[e].inGame) {
			ctx[e].rotate(players[e].direction - Math.PI / 2);
			ctx[e].scale(playerScale(e), playerScale(e));
			ctx[e].translate(-players[e].location[0][0], -players[e].location[0][1]);
			scoreMeters[e].innerHTML = "Score: " + Math.floor(players[e].size);
		}
		else if (playersInGame.length !== 0) {
			ctx[e].rotate(spectatorRotate);
			ctx[e].translate(-players[indexOfSpectate].location[0][0] * spectateZoom, -players[indexOfSpectate].location[0][1] * spectateZoom);
		}
		if (!players[e].inGame) {
			var keys = players[e].upKey + players[e].leftKey + players[e].downKey + players[e].rightKey;
			if (keys.length > 4) {
				keys = "the arrow keys"
			}
			scoreMeters[e].innerHTML = `Press ${players[e].spawnKey} to join! Use ${keys} to control your snake!`;
			ctx[e].scale(spectateZoom, spectateZoom);
		}
	}
}

function playerScale(e) {
	return 10 / calcSnakeWidth(e);
}

function translateCanvasSpectate(e) {
	ctx[e].restore();
	ctx[e].save();
	ctx[e].translate(canvas[e].width / 2, canvas[e].height / 2);
}

function draw() {
	for (var e = 0; e < numOfPlayers; e++) {
		ctx[e].clearRect(-mapSize - innerWidth / 2, -mapSize - innerHeight / 2, mapSize * 2 + innerWidth, mapSize * 2 + 2000 + innerHeight);
		drawBG(e);
		drawFood(e);
		drawPlayer(e);
		translateCanvas(e);
	}
}

function makeGradient(colors, e) {
	return (colors[0]);
/*	var grd = ctx[e].createRadialGradient(0, 0, 0, 0, 0, mapSize);
	grd.addColorStop(0, colors[0]);
	grd.addColorStop(1, colors[1]);
	return grd;*/
}

function main() {
/*	if (new Date().getSeconds() != seconds && performance.now() > 100) {
		frameRate = frames;
		document.getElementById("framerate").innerHTML = "FPS: " + frameRate;
		relativeGameSpeed = 60 / frames;
		frames = 0;
		seconds = new Date().getSeconds();
	}*/
	var now = performance.now();
	frameRate = 1000/(now-seconds);
	document.getElementById("framerate").innerHTML = "FPS: " + Math.round(frameRate);
	seconds = now;
	relativeGameSpeed = 60 / frameRate;
	
	frames++;
	if (!paused) {
		calculate();
	}
	if (frameRate > 50 || frames%2==0) {
		draw();
	}
	requestAnimationFrame(main);
}

requestAnimationFrame(main);
