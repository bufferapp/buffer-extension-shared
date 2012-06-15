/**
 * Buffer Preloaded Overlay
 *
 * Loads in an overlay on every page load, and only passes data to it
 * when a buffer_click event is triggered
 *
 * This file requires jQuery to be present
 */
(function ($) {

	// Test for jQuery
	if( ! $ ) {
		console.log("Overlay requires jQuery.");
	}

	// Configuration
	var config = {};
	config.local = true;
	// Point this at a local or production endpoint
	config.endpoint = (function () {
		var prefix;
		if( config.local ) {
			prefix = 'http://local.';
		} else {
			prefix = document.location.protocol + '//';
		}
		return prefix + 'bufferapp.com/overlay/';
	}());

	// iframe configuration
	config.iframe = {
		id: "buffer_overlay",
		css: {
			hide: {
				position: "fixed",
				top: 0,
				left: 0,
				height: 0,
				width: '100%',
				"z-index": 9999,
				display: 'block',
				border: 'none'
			},
			show: {
				height: "100%"
			}
		}
	};

	var overlay = $('<iframe/>', {
		id: config.iframe.id,
		src: config.endpoint,
		allowtransparency: 'true',
		scrolling: 'no'
	}).css(config.iframe.css.hide).appendTo('body');

	// Wait for buffer_click to show the overlay
	xt.port.on("buffer_click", function () {
		$(overlay).animate(config.iframe.css.show);
	});
	// Bind close listener
	bufferpm.bind("buffermessage", function(overlaydata) {
		$(overlay).css(config.iframe.css.hide);
	});
	// Register the preloaded overlay port with the extension
	xt.port.emit("buffer_register_overlay", {time: (new Date()).getTime()});

	console.log("preloaded overlay");

}(jQuery));