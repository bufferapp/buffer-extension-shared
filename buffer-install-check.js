/* globals chrome */
// buffer-install-check.js
// (c) 2013 Buffer
// Adds an element to our app page that we can use to check if the browser has our extension installed.

var bufferMarkOurSite = function (version) {
	if (window.top !== window) return;

	if (document.location.host.match(/bufferapp.com/i)) {

    var $marker = $('#browser-extension-marker');
    if (!$marker.length) return;

    $marker.attr('data-version', version);

    // Trigger a click to let the app know we have the version:
    $marker.trigger('click');
	}
};

// Chrome doesn't expose the version so easily with the permissions 
// we currently require, so we xhr for the manifest file to get the version.
function getVersionForChrome(callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.extension.getURL('/manifest.json'));
  xhr.onload = function (e) {
    var manifest = JSON.parse(xhr.responseText);
    callback(manifest.version);
  }
  xhr.send(null);
}

if (typeof chrome !== 'undefined') {
  getVersionForChrome(bufferMarkOurSite);
}

