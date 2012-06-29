var bufferOverlay = function(data, config, doneCallback) {
    
    if( ! doneCallback ) doneCallback = function () {};
    if( ! config ) return;
    
    var buildSrc = function() {
        var src = config.overlay.endpoint;
        if( data.local ) src = config.overlay.localendpoint;
        
        // Add button attributes
        var first = true, count = 0;
        for(var i=0, l=config.attributes.length; i < l; i++) {
            var a = config.attributes[i];
            if( ! data[a.name] ) continue;
            if( first ) { src += '?'; first = false; }
            count += 1;
            if( count > 1 ) src += '&';
            src += a.name + '=' + a.encode(data[a.name])
        }
        
        return src;
    };
    
    var temp = document.createElement('iframe');
    
	temp.setAttribute('allowtransparency', 'true');
	temp.setAttribute('scrolling', 'no');
	temp.id = 'buffer_overlay';
	temp.name = 'buffer_overlay';
	temp.style.cssText = config.overlay.getCSS();
	
	temp.src = buildSrc();
	
	document.body.appendChild(temp);
    
    // Bind close listener
	bufferpm.bind("buffermessage", function(overlaydata) {
		document.body.removeChild(temp);
		bufferpm.unbind("buffermessage");
		setTimeout(function () {
		    doneCallback(overlaydata);
	    }, 0);
	});
    
};

var bufferData = function (port, postData) {

    if (window.top !== window) {
        return;
    }
    
    var config = {};
    config.local = false;
    config.googleReader = false;
    var segments = window.location.pathname.split('/');
    if( window.location.host.indexOf("google") != -1 && segments[1] == "reader" ) config.googleReader = true;
    config.attributes = [
        {
            name: "url",
            get: function (cb) {
                if( ! config.googleReader ) {
                    cb(window.location.href);
                } else {
                    var href = $("#current-entry .entry-container a.entry-title-link").attr('href');
                    if( ! href ) href = $('.entry').first().find(".entry-container a.entry-title-link").attr('href');
                    cb(href);
                }
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "text",
            get: function (cb) {
                if( document.getSelection() != false ) {
                    cb('"' + document.getSelection().toString() + '"');
                } else if( config.googleReader ) {
                    var text = $("#current-entry .entry-container a.entry-title-link").text();
                    if( ! text ) text = $('.entry').first().find(".entry-container a.entry-title-link").text();
                    cb(text);
                } else {
                    cb(document.title);
                }
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "picture",
            get: function (cb) {
                cb(postData.image);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "embed",
            get: function (cb) {
                cb(postData.embed);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "local",
            get: function (cb) {
                cb(config.local);  
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "version",
            get: function (cb) {
                cb(postData.version);  
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "placement",
            get: function (cb) {
                if( postData.placement ) cb(postData.placement);
                else if( config.googleReader ) cb('google-reader-general');
                else cb('general');
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        }
    ];
    config.overlay = {
        endpoint: (config.local ? 'http:' : document.location.protocol) + '//bufferapp.com/add/',
        localendpoint: (config.local ? 'http:' : document.location.protocol) + '//local.bufferapp.com/add/',
        getCSS: function () { return "border:none;height:100%;width:100%;position:fixed;z-index:99999999;top:0;left:0;display:block;"; }
    };

    var executeAfter = function(done, count, data, cb) {
        if(done === count) {
            setTimeout(function(){
                cb(data)
            }, 0);
        }
    };

    var getData = function (cb) {
        var count = config.attributes.length;
        var done = 0;
        var data = {};
        for(var i=0; i < count; i++) {
            // Wrapped in a self-executing function to ensure we don't overwrite ‘a’
            // and that the correct ‘i’ is used
            (function (i) {
                var a = config.attributes[i];
                a.get(function(d) {
                    done += 1;
                    data[a.name] = d;
                    executeAfter(done, count, data, cb);
                });
            }(i));
        }
    };

    var createOverlay = function (data) {
        if( data.embed ) {
            if( typeof data.embed === "object" ) {
                for( var i in data.embed ) {
                    if( data.embed.hasOwnProperty(i) ) {
                        if( i === "image" ) {
                            data.picture = data.embed[i];
                        } else {
                            data[i] = data.embed[i];
                        }
                    }
                }
                if( data.embed.text && !data.embed.url ) {
                    data.url = null;
                }
                data.embed = null;
            } else {
                data.text = data.embed;
                data.url = null;
                data.embed = null;
            }
        }
        bufferOverlay(data, config, function (overlaydata) {
            port.emit("buffer_done", overlaydata);
        });
    };

    if( $('#buffer_overlay').length === 0 ) {
        getData(createOverlay);
    }
    
};

