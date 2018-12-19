
// set progress bar max amount
var progressMaxAmount = 100;
// set current total
var currentTotal = 73;


	// get the progress element
  var progressBar = document.getElementById('progress');
  
  
  // fill progress bar
  if (currentTotal >= progressMaxAmount) {
    progressBar.style.width = "0%";
  }
  else {
    // convert to percentage
    var donationPercentage = (currentTotal / progressMaxAmount) * 100;
	// fill progress bar with additional change
    progressBar.style.width = donationPercentage + "%";
  }
