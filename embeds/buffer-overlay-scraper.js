;(function () {

  // Only allow this to run in the Buffer iframe
  if( window !== window.top && document.location.host.match(/bufferapp.com/i) ) {

    // Listen for information
    xt.port.on('buffer_details', function (details) {

      console.log("Overlay has details", details);

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

}());