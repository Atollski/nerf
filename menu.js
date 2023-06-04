var menu = {
	items: [
		{	// camera menu
			text: "Camera"
			, radio: "level1"
			, items: [
				{text: "Start", click: () => camera.start(), radio: "camera", deselect: false} // start the camera
				, {text: "Stop", radio: "camera", active: true, deselect: false}  // camera is off by default
				, { // filter submenu
					text: "Filter"
					, items: [
						{text: "None", radio: "filter" , click: () => camera.filter(null), active: true} // no filter by default
						, {text: "Night", radio: "filter", click: () => camera.filter('night')}
						, {text: "Invert", radio: "filter", click: () => camera.filter('invert')}
						, {text: "Grey", radio: "filter", click: () => camera.filter('greyscale')}
						, {text: "Sepia", radio: "filter", click: () => camera.filter('sepia')}
					]
				}
			]
		}
		, {	// systems menu
			text: "HUD"
			, radio: "level1"
			, items: [
				
			]
		}
	]
};

// how to search for element
// let systemsMenu = menu.items.find(item => item.id === "systems");

let menuContainer = document.querySelector("#menu");
drawMenu(menu, menuContainer);

menuContainer.addEventListener("click", event => {
	console.log(event);
	if (event.target.dataset.radio && event.target.classList.contains('active') === false) { // not currently active
		document.querySelectorAll("[data-radio='" + event.target.dataset.radio + "']").forEach(button => button.classList.remove("active"));
	}
	event.target.classList.toggle("active");
	//event.stopPropagation();
});

/**
 * Convert the menu data JSON into a HTML element for display. This is recursively called starting at the root level
 * @param {Object} menu the current menu branch to process. Start with the entire menu object defined above
 * @param {Node} container parent menu element to insert into. Must be <b>ul</b> list 
 * @returns {void} // TODO: Confirm appropriate documentation
 */
function drawMenu(menu, container) {
	// erase container first
	container.innerHTML = "";
	menu.items.forEach(item => {
		let menuItem = document.createElement("li");
		
		// construct the menu from the parameters
		let newItem = document.createTextNode(item.text);
		if (item.radio) menuItem.setAttribute("data-radio", item.radio); // store the radio setting
		if (item.active === true) menuItem.classList.add("active"); // set default active state
		if (item.deselect === false) menuItem.classList.add("prevent-deselect"); // set whether control can be deselected
		if (item.click) menuItem.addEventListener('click', item.click);
		menuItem.appendChild(newItem);
		
		if (item.items) { // recursively add children
			let menuContainer = document.createElement("ul");
			drawMenu(item, menuContainer);
			menuItem.appendChild(menuContainer);
		}
		container.appendChild(menuItem);
	});
}