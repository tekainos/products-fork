

$(document).ready(function () {
	// get side navigation element and hide
	var burgerNav = $('#sideNav');	
	burgerNav.hide();
	// call side navigation toggle
	burgerMenuToggle(burgerNav);
	
	
	// call function for dashboard status menu toggle
	dashboardMenuToggle();
});



// toggle for the side navigation menu using burger button
function burgerMenuToggle(menu) {
	var navButton = $('#burgerButton');
	var closeButton = $('#sideNavClose');
	
	navButton.on('click', function() {
		menu.show();
	});
	
	closeButton.on('click', function() {
		menu.hide();
	});	
}



// toggle for the dashboard status menu
function dashboardMenuToggle() {
	var statusContent = $('#SideContent');
	var button = $('#SideContentButton');
	
	// first make sure the status content is showing and the toggle button is inside the content
	if (statusContent.css('display') == 'block') {
			button.addClass('SideContentClose');
		}
	
	
	// after menu visibility check, toggle the button's click
	button.on('click', function() {
		if (statusContent.css('display') == 'block') {
			// shift button to "tab" when clicked
			button.removeClass('SideContentClose').addClass('SideContentOpen');
			// hide the status content column
			statusContent.hide();
			
			// expand the width of the jobs list to full screen on menu collapse
			$('#dashboard').addClass('col-sm-11').removeClass('col-sm-8');
		}
		else {
			// otherwise opens on click
			// shift the button back into status content
			button.removeClass('SideContentOpen').addClass('SideContentClose');
			// show status content column
			statusContent.show();
			
			// expand the width of the jobs list to full screen on menu collapse
			$('#dashboard').removeClass('col-sm-11').addClass('col-sm-8');
		}			
	});
}