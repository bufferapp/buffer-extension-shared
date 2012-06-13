;(function () {

  // Only allow this to run in the Buffer iframe
  if( document.location.host.match(/bufferapp.com/i) && xt.iframe ) {

    // Listen for information
    xt.port.on('buffer_data', function (data) {

      console.log('SCRAPER HAS DATA!', data);

      // Create an element in the overlay page with the
      // details scraped externally
      $('<div/>', {
        'id': 'page-scraper',
        'data-details': encodeURIComponent(JSON.stringify(data))
      }).appendTo('body');

    });

  }

  // Register overlay scraper
  xt.port.emit("buffer_register_overlay_scraper");

  console.log("overlay scraper in place");

}());