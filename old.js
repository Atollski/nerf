const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;

var alpha = 0;
var beta = 0;
var gamma = 0;

var calc = null;
setCalc("0");
reticule();

function init(settings) {
	if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
		navigator.mediaDevices.getUserMedia(
			{video: {facingMode: 'environment'}}
		).then(stream => {
			video.srcObject = stream;
			reticule();
		});
	} else {
		reticule();
	}
	document.querySelector("#menu").hidden = true;
}

if (window.DeviceOrientationEvent) {
	window.addEventListener(
		'deviceorientation', function (event) {
			alpha = event.alpha | 0;
			beta = event.beta | 0;
			gamma = event.gamma | 0;
			reticule();
		}
	);
}

function reticule() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const scale = Math.min(canvas.width, canvas.height);
	const centre = {
		x: canvas.width / 2
		, y: canvas.height / 2
	};
	const radius = 0.3; // main bore radius

	context.fillStyle = 'rgb(0, 220, 0)';
	context.strokeStyle = 'rgb(0, 220, 0)';

	context.translate(centre.x, centre.y); // temp translate for compass function
	let orientation = compass(alpha, beta, gamma);
	context.translate(-centre.x, -centre.y);

	context.font = "20px Arial";
	/*
	context.fillText("a: " + alpha.toFixed(0) + "°", 10, 50);
	context.fillText("b: " + beta.toFixed(0) + "°", 10, 80);
	context.fillText("g: " + gamma.toFixed(0) + "°", 10, 110);
	context.fillText("?: " + orientation.pitch.toFixed(2), 10, 140);
	*/
	context.translate(centre.x, centre.y);

	context.rotate(orientation.roll);

	context.font = (scale * 0.04) + "px Arial";
	context.textAlign = 'center';
	context.fillText(orientation.azimuth.toFixed(0).padStart(3, '0'), 0, -scale * (radius - 0.06));
	// outer circle
	context.lineWidth = scale / 100;
	context.beginPath();
	context.arc(
		0
		,0
		,scale * 0.3
		,0
		, Math.PI * 2
	); // reticule
	context.stroke();

	// centre
	context.beginPath();
	context.arc(
		0
		,0
		,scale * 0.02
		,0
		, Math.PI * 2
	); // reticule
	context.stroke();

	// drop indicator

	context.lineWidth = scale / 150
	for (elevation = 1;
		elevation < 6; elevation++) {
		let bar = (scale * 0.01 * (7 - elevation))
		context.beginPath();
		context.moveTo(-bar, (elevation * scale * 0.05));
		context.lineTo(bar, (elevation * scale * 0.05));
		context.stroke();
	}

	// elevation
	let tick = 5.0;
	let pitchCentre = Math.round((
		orientation.pitch * radToDeg) / tick) * tick;
	for (let pitchTick = -50;
		pitchTick <= 50; pitchTick += tick) {
		let bar = {};
		bar.pitch = pitchCentre - pitchTick;
		bar.y = (pitchTick - (pitchCentre - orientation.pitch * radToDeg)) * (scale * radius * (1.0 / 60));
		bar.x = Math.sqrt((radius * radius * scale * scale) - (bar.y * bar.y));
		bar.width = scale * radius * (Math.abs(bar.pitch) % 15 > 0 ? 0.1 : 0.15);
		context.lineWidth = scale / 300;

		context.beginPath();
		context.moveTo(-bar.x, bar.y);
		context.lineTo(-bar.x + bar.width, bar.y);
		context.stroke();

		context.beginPath();
		context.moveTo(bar.x, bar.y);
		context.lineTo(bar.x - bar.width, bar.y);
		context.stroke();

		if (Math.abs(
			bar.pitch) % 15 === 0) {
			context.font = (scale * 0.025) + "px Arial";
			context.textAlign = 'left';
			context.fillText(
				bar.pitch.toFixed(0)
				,-bar.x + bar.width + scale * radius * 0.04
				,bar.y + scale * 0.009
			);
			context.textAlign = 'right';
			context.fillText(
				bar.pitch.toFixed(0)
				,bar.x - bar.width - scale * radius * 0.04
				,bar.y + scale * 0.009
			);
		}
	}

	// reset to centre
	context.translate(-centre.x, -centre.y);
}

function compass(alpha, beta, gamma) {
	// to radians
	alpha = alpha ? alpha * degToRad : 0; // alpha value
	beta = beta ? beta * degToRad : 0; // beta value
	gamma = gamma ? gamma * degToRad : 0; // gamma value


	var cA = Math.cos(
		alpha);
	var cB = Math.cos(
		beta);
	var cG = Math.cos(
		gamma);
	var sA = Math.sin(
		alpha);
	var sB = Math.sin(
		beta);
	var sG = Math.sin(
		gamma);


	// Calculate Vx and Vy components
	var Vx = -cA * sG - sA * sB * cG;
	var Vy = -sA * sG + cA * sB * cG;

	// Calculate compass heading
	var compassHeading = Math.atan
		(Vx / Vy);

	// Convert compass heading to use whole unit circle
	if (Vy < 0) {
		compassHeading += Math.PI;
	} else if (Vx < 0) {
		compassHeading += 2 * Math.PI;
	}

	return {
		roll: Math.atan2(-sG * cB, sB)
		, pitch: -Math.asin(cB * cG)
		, azimuth: compassHeading / degToRad // Compass Heading (in degrees)
	}; 
}

function fullScreen() {
	document.body.requestFullscreen().then(function () {
		screen.orientation.lock("landscape").then(function () {
			reticule();
		});
	});
}

/**
 * What is this
 * @param {type} formula
 * @returns {setCalc}
 */
function setCalc(formula) {
	this.c = Math.cos;
	this.s = Math.sin;
	this.t = Math.tan;
	this.as = Math.asin;
	this.ac = Math.acos;
	this.at = Math.atan;
	this.at2 = Math.atan2;
	this.PI = Math.PI;
	this.p = function (x, y) {
		let scale = Math.min(canvas.width, canvas.height);
		context.lineWidth = scale / 100;
		context.beginPath();
		context.arc(
			x
			,-y
			,scale * 0.01
			,0
			, Math.PI * 2
		);
		context.stroke();
	}
	this.d2r = (angle) => {
		return angle * (PI / 180);
	}
	this.r2d = (angle) => {
		return angle * (180 / PI);
	}

	try {
		calc = new Function("a", "b", "g", "return " + formula + ";").bind(this);
		calc(0, 0, 0);
		(document.querySelector("#error") || {}).innerHTML = "";
	} catch (err) {
		(document.querySelector("#error") || {}).innerHTML = err;
	}
}
