;(function () {

  console.log("Overlay.", document.location.host);
  console.log(window.frames.length + ':' + parent.frames.length);

  // Only allow this to run in the Buffer iframe
  if( document.location.host.match(/bufferapp.com/i) && parent.frames.length > 0 && window.frames.length === 0 ) {

    // Listen for information
    xt.port.on('buffer_details', function (details) {

      console.log("buffer-overlay-scraper has recieved DATA!!!");

      // Create an element in the overlay page with the
      // details scraped externally
      var temp = document.createElement('div');
      temp.setAttribute('id', 'page-scraper');
      temp.setAttribute('data-details', escape(JSON.stringify(details)));
      document.body.appendChild(temp);

    });

    // Ask for the details
    console.log("buffer-overlay-scraper sending buffer_details_request");
    xt.port.emit("buffer_details_request");

  }

}());