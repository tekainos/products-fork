
$(document).ready(function() {

	$('#statusPaneButton').on('click', function() {
		if ($(this).hasClass('statusPaneVisible')) {
			$(this).removeClass('statusPaneVisible').addClass('statusPaneHidden');
			
			$('.sideContent').hide();
			
			$('.dashboardLeft').removeClass('col-sm-3').addClass('col-sm-1');
			$('.dashboardRight').removeClass('col-sm-9').addClass('col-sm-11');
		}
		else {
			$(this).removeClass('statusPaneHidden').addClass('statusPaneVisible');
			
			$('.dashboardLeft').removeClass('col-sm-1').addClass('col-sm-3');
			$('.dashboardRight').removeClass('col-sm-11').addClass('col-sm-9');
			
			$('.sideContent').show();
		}
	});

	
});