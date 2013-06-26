//  buffer-tpc-check.js
//  (c) 2013 Sunil Sadasivan
//  Check if third party cookies are disabled
//

;(function () {

	;(function check() {
		//if the 3rd party cookies check is done, remove the iframe
		bufferpm.bind("buffer_3pc_done", function(){
			elem = document.getElementById('buffer_tpc_check');
			if(elem) { elem.parentNode.removeChild(elem); }
			return false;
		});

		//if the 3rd party cookies check is disabled, store it
		bufferpm.bind("buffer_3pc_disabled", function(){
			xt.port.emit("buffer_tpc_disabled");
			return false;
		});

		var iframe = document.createElement('iframe');
		iframe.id = 'buffer_tpc_check';
		iframe.src = 'https://d3ijcis4e2ziok.cloudfront.net/tpc-check.html';
		//iframe.src = 'http://local.bufferapp.com/js/tpc-check.html';
		iframe.style.display="none";
		document.body.appendChild(iframe);
	}());

}());
