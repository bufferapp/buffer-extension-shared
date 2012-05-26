;(function () {

  xt.port.on('buffer_details', function (details) {
    console.log("OVERLAY HAS DATA!!!!!!");

	var temp = document.createElement('div');
	temp.setAttribute('id', 'page-scraper');
	temp.setAttribute('data-details', escape(JSON.stringify(details)));
	document.body.appendChild(temp);
  });

  xt.port.emit("buffer_details_request");

}());