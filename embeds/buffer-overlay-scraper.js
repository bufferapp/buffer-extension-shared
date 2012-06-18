;(function () {

  // Only allow this to run in the Buffer iframe
  if( document.location.host.match(/bufferapp.com/i) && xt.iframe ) {

    // Listen for information
    xt.port.on('buffer_data', function (data) {

      console.log('SCRAPER HAS DATA!', data);

      // Create an element in the overlay page with the
      // details scraped externally
      var temp = $('<div/>', {
        'id': 'page-scraper',
        'data-details': encodeURIComponent(JSON.stringify(data))
      }).appendTo('body');

      // Trigger an event to let the overlay know the content is there
      console.log('Firing buffer_details');
      $(temp).trigger('buffer_details');

    });

  }

  // Register overlay scraper
  xt.port.emit("buffer_register_overlay_scraper");

  console.log("overlay scraper in place");

}());