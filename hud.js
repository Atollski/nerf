const canvas = document.querySelector("canvas"); // output for HUD
const context = canvas.getContext('2d');

var alpha = 0;
var beta = 0;
var gamma = 0;


//hud.prototype.sight = roundSight;

/**
 * Implementation of round type signt
 * @returns {roundSight}
 */
function roundSight() {
	this.radius = 0.3;
	
	context.fillStyle = 'rgb(0, 220, 0)';
	context.strokeStyle = 'rgb(0, 220, 0)';
	context.translate(this.centre.x, this.centre.y); // temp translate for compass function
	// render compass
	context.translate(-this.centre.x, -this.centre.y); // return back again
	context.font = "20px Arial";
	
	/*
	context.fillText("a: " + alpha.toFixed(0) + "°", 10, 50);
	context.fillText("b: " + beta.toFixed(0) + "°", 10, 80);
	context.fillText("g: " + gamma.toFixed(0) + "°", 10, 110);
	context.fillText("?: " + orientation.pitch.toFixed(2), 10, 140);
	*/
   
	context.translate(this.centre.x, this.centre.y);

	context.rotate(this.orientation.roll);

	context.font = (this.scale * 0.04) + "px Arial";
	context.textAlign = 'center';
	context.fillText(this.orientation.azimuth.toFixed(0).padStart(3, '0'), 0, -this.scale * (this.radius - 0.06));
	
	
	// outer circle
	context.lineWidth = this.scale / 100;
	context.beginPath();
	context.arc(
		0
		,0
		,this.scale * 0.3
		,0
		, Math.PI * 2
	); // reticule
	context.stroke();

	this.crosshair();

	this.elevation();
	// reset to centre
	context.translate(-this.centre.x, -this.centre.y);
	
	
}

function elevationOutside() {
	// elevation
	let tick = 5.0;
	let pitchCentre = Math.round((this.orientation.pitch * radToDeg) / tick) * tick;
	for (let pitchTick = -50; pitchTick <= 50; pitchTick += tick) {
		let bar = {};
		bar.pitch = pitchCentre - pitchTick;
		bar.y = (pitchTick - (pitchCentre - this.orientation.pitch * radToDeg)) * (this.scale * this.radius * (1.0 / 60));
		bar.x = Math.sqrt((this.radius * this.radius * this.scale * this.scale) - (bar.y * bar.y));
		bar.width = this.scale * this.radius * (Math.abs(bar.pitch) % 15 > 0 ? 0.1 : 0.15);
		context.lineWidth = this.scale / 300;

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
			context.font = (this.scale * 0.025) + "px Arial";
			context.textAlign = 'left';
			context.fillText(
				bar.pitch.toFixed(0)
				,-bar.x + bar.width + this.scale * this.radius * 0.04
				,bar.y + this.scale * 0.009
			);
			context.textAlign = 'right';
			context.fillText(
				bar.pitch.toFixed(0)
				,bar.x - bar.width - this.scale * this.radius * 0.04
				,bar.y + this.scale * 0.009
			);
		}
	}
}

function crosshairCircle() {
	// centre
	context.beginPath();
	context.arc(
		0
		,0
		,this.scale * 0.02
		,0
		, Math.PI * 2
	); // reticule
	context.stroke();

	// drop indicator

	context.lineWidth = this.scale / 150
	for (let elevation = 1;
		this.elevation < 6; this.elevation++) {
		let bar = (scale * 0.01 * (7 - this.elevation))
		context.beginPath();
		context.moveTo(-bar, (this.elevation * scale * 0.05));
		context.lineTo(bar, (this.elevation * scale * 0.05));
		context.stroke();
	}
}

function crosshairCross() {
	
}

function crosshairT() {
	
}

/**
 * Initialise heads up display
 * @returns {undefined}
 */
const hud = {
	sight: roundSight
	,crosshair: crosshairCircle
	,elevation: elevationOutside
	,colour: 'rgb(0, 220, 0)'
	,render() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		this.scale = Math.min(canvas.width, canvas.height);
		this.centre = {
			x: canvas.width / 2
			, y: canvas.height / 2
		};
		this.orientation = compass(alpha, beta, gamma);

		// define default display behaviours
//		this.colour = 'rgb(0, 220, 0)';
	//	this.sight = roundSight; // define default sight type
//		this.crosshair = crosshairCircle; // default circle crosshair
//		this.elevation = elevationOutside; // elevation marker on border of HUD


		// call gunsight!
		this.sight();
	}
};

hud.render(); // start the HUD immediately
