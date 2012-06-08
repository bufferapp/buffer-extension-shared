;(function () {

  // Only allow this to run in the Buffer iframe
  if( document.location.host.match(/bufferapp.com/i) && xt.iframe ) {

    // Listen for information
    xt.port.on('buffer_details', function (details) {

      // Create an element in the overlay page with the
      // details scraped externally
      var temp = document.createElement('div');
      temp.setAttribute('id', 'page-scraper');
      temp.setAttribute('data-details', escape(JSON.stringify(details)));
      document.body.appendChild(temp);

    });

    // Ask for the details
    xt.port.emit("buffer_details_request");

  }

  console.log("Overlay scraper in place");

}());