const video = document.querySelector("video"); // output for video stream
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;


// add event listener to device orientation change
if (window.DeviceOrientationEvent) {
	window.addEventListener(
		'deviceorientation', function (event) {
			alpha = event.alpha | 0;
			beta = event.beta | 0;
			gamma = event.gamma | 0;
			hud.render();
		}
	);
}

const camera = {
	start() {
		if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
			navigator.mediaDevices.getUserMedia(
				{video: {facingMode: 'environment'}} // forward facing
			).then(stream => {
				video.srcObject = stream;
				hud.render();
			});
		} else {
			hud.render();
		}
	}
	,filter(filter) {
		video.setAttribute("data-filter", filter);
	}
};

/**
 * Converts alpha, beta and gamma rotation data into roll, pitch and yaw, suitable for an artificial horizon
 * @param {number} alpha device rotation sensor value in degrees
 * @param {number} beta device rotation sensor value in degrees
 * @param {number} gamma device rotation sensor value in degrees
 * @returns {compass.commonAnonym$0}
 */
function compass(alpha, beta, gamma) {
	// to radians
	alpha = alpha ? alpha * degToRad : 0; // alpha value
	beta = beta ? beta * degToRad : 0; // beta value
	gamma = gamma ? gamma * degToRad : 0; // gamma value


	var cA = Math.cos(alpha);
	var cB = Math.cos(beta);
	var cG = Math.cos(gamma);
	var sA = Math.sin(alpha);
	var sB = Math.sin(beta);
	var sG = Math.sin(gamma);


	// Calculate Vx and Vy components
	var Vx = -cA * sG - sA * sB * cG;
	var Vy = -sA * sG + cA * sB * cG;

	// Calculate compass heading
	var compassHeading = Math.atan(Vx / Vy);

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