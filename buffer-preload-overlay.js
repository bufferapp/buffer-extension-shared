/**
 * Buffer Preloaded Overlay
 *
 * Loads in an overlay on every page load, and only passes data to it
 * when a buffer_click event is triggered
 *
 * This file requires jQuery > 1.7 to be present
 */
(function ($) {

	// Test for jQuery
	if( ! $ ) {
		console.log("Overlay requires jQuery.");
	}

	// Configuration
	var config = {};
	config.local = false;
	// Point this at a local or production endpoint
	config.endpoint = (function () {
		var prefix;
		if( config.local ) {
			prefix = 'http://local.';
		} else {
			prefix = document.location.protocol + '//';
		}
		return prefix + 'bufferapp.com/add/';
	}());

	// iframe configuration
	config.iframe = {
		id: "buffer_overlay",
		css: "position:aboslute;top:0;left:0;height:0;width:0;z-index:9999;"
	};

	// Create and iframe and load the overlay page, but hide it!
	var overlay = $('<iframe/>', {
		id: config.iframe.id,
		src: config.endpoint,
		allowtransparency: 'true',
		scrolling: 'no',
		style: config.iframe.css
	}).appendTo('body');

	console.log(overlay);

}(jQuery));