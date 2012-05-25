;(function () {

  console.log("OVERLAY SCRAPER INJECTED.");

  xt.port.on('buffer_details', function (data) {
    console.log("OVERLAY HAS DATA!!!!!!");
    console.log(data);
  });

  xt.port.emit("buffer_details_request");

}());