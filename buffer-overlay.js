// Build that overlay!
// Triggered by code working from the button up...
var bufferOverlay = function(src, doneCallback) {
    
    if( ! doneCallback ) doneCallback = function () {};
    

	if(xt.options['buffer.op.tpc-disabled']) {
		window.open(src, null, 'height=600,width=850');
	}
	else {
		var temp = document.createElement('iframe');

		temp.allowtransparency = 'true';
		temp.scrolling = 'no';
		temp.id = 'buffer_overlay';
		temp.name = 'buffer_overlay';
		temp.style.cssText = "border:none;height:100%;width:100%;position:fixed!important;z-index:99999999;top:0;left:0;display:block!important;max-width:100%!important;max-height:100%!important;padding:0!important;background: none; background-color: transparent; background-color: rgba(0, 0, 0, 0.1);"; 

		temp.src = src;

		var footer = document.createElement('div');
		footer.id = 'buffer_widget_footer';
		footer.style.cssText = "z-index:999999999;background: #ffffff url(https://d389zggrogs7qo.cloudfront.net/images/bookmarklet_icon.png) 35px 16px no-repeat; background-size: 30px; box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1); border-top: 1px solid #ccc; border-bottom-left-radius: 4px; height: 60px; width: 100%; position: fixed; bottom: 0; right: 0;";
		footer.innerHTML = '<ul style="float: right; margin-top: 21px; margin-right: 20px; min-width: 170px;"> <li style="list-style-type: none; background:none;"><a          href="https://bufferapp.com/app" target="_blank" style="background: #eee; background: -moz-linear-gradient(top, #ffffff 0%, #ececec 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #ffffff), color-stop(100%, #ececec)); background: -webkit-linear-gradient(top, #ffffff 0%, #ececec 100%); background: -o-linear-gradient(top, #ffffff 0%, #ececec 100%); background: -ms-linear-gradient(top, #ffffff 0%, #ececec 100%); background: linear-gradient(top, #ffffff 0%, #ececec 100%); border: 1px solid #aaa; border-top: 1px solid #ccc; border-left: 1px solid #ccc; padding: 8px 10px; font-size: 12px; font-weight: bold; text-decoration: none; text-shadow: 0 1px #fff; cursor: pointer; font-family: \'HelveticaNeue\',\'Helvetica Neue\',Helvetica,Arial,sans-serif !important; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; -moz-background-clip: padding; -webkit-background-clip: padding-box; background-clip: padding-box;"><i class="ss-standard ss-reply"></i> Visit Buffer Dashboard</a></li> </ul>'; 
		document.body.appendChild(footer);

		var footerHoverCss = document.createElement('style');
		footerHoverCss.type="text/css";
		footerHoverCss.innerHTML = "#buffer_widget_footer a{color: #5f5f5f!important;opacity: 0.8;-moz-opacity: 0.8;-webkit-opacity: 0.8;-o-opacity: 0.8;} #buffer_widget_footer a:hover{color: #4f4f4f!important;opacity: 1;-moz-opacity: 1;-webkit-opacity: 1;-o-opacity: 1;}";
		document.body.appendChild(footerHoverCss);

		document.body.appendChild(temp);

	}
    // Bind close listener
    // Listen for when the overlay has closed itself
    bufferpm.bind("buffermessage", function(overlaydata) {
        document.body.removeChild(temp);
        document.body.removeChild(footer);
        bufferpm.unbind("buffermessage");
        setTimeout(function () {
            doneCallback(overlaydata);
        }, 0);
        window.focus();
    });
    
};

// bufferData is triggered by the buffer_click listener in
// the buffer-browser-embed file, where it's passed a port
// to communicate with the extension and data sent from the
// background page.
var bufferData = function (port, src) {

    if (window.top !== window) {
        return;
    }


	// When it's done, fire buffer_done back to the extension
	bufferOverlay(src, function (overlaydata) {
		port.emit("buffer_done", overlaydata);
	});

};

