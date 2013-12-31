// buffer-install-check.js
// (c) 2013 Buffer
// Adds an element to our app page that we can use to check if the browser has our extension installed.

;(function() {
	
	var bufferMarkOurSite = function (version) {
		if (window.top !== window) return;

		if(document.location.host.match(/bufferapp.com/i)) {
			var extensionInformation = document.createElement('div');

			extensionInformation.setAttribute('id', 'browser-extension-check');
			extensionInformation.setAttribute('data-version', version);

			document.body.appendChild(extensionInformation);
		}
	};

}());
