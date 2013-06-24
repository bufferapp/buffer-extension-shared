// Build that overlay!
// Triggered by code working from the button up...
var bufferOverlay = function(data, config, doneCallback) {
    
    if( ! doneCallback ) doneCallback = function () {};
    if( ! config ) return;
    
    // Put together a query string for the iframe
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
            src += a.name + '=' + a.encode(data[a.name]);
        }
        
        return src;
    };
    
    var temp = document.createElement('iframe');
    
    temp.allowtransparency = 'true';
    temp.scrolling = 'no';
    temp.id = 'buffer_overlay';
    temp.name = 'buffer_overlay';
    temp.style.cssText = config.overlay.getCSS();
    
    temp.src = buildSrc();

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
var bufferData = function (port, postData) {

    if (window.top !== window) {
        return;
    }
    
    var config = {};
    config.local = false;
    config.googleReader = false;
    var segments = window.location.pathname.split('/');
    if( window.location.host.indexOf("google") != -1 && segments[1] == "reader" ) config.googleReader = true;

    // Specification for gathering data for the overlay
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
                if( config.googleReader ) {
                    var text = $("#current-entry .entry-container a.entry-title-link").text();
                    if( ! text ) text = $('.entry').first().find(".entry-container a.entry-title-link").text();
                    cb(text);
                } else if(document.getSelection() != false) {
                    cb('"' + document.getSelection().toString() + '"');
                } else {
                    cb(document.title);
                }
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "retweeted_tweet_id",
            get: function (cb) {
                cb(postData.retweeted_tweet_id);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "retweeted_user_id",
            get: function (cb) {
                cb(postData.retweeted_user_id);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "retweeted_user_name",
            get: function (cb) {
                cb(postData.retweeted_user_name);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "retweeted_user_display_name",
            get: function (cb) {
                cb(postData.retweeted_user_display_name);
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
        },
        {
            name: "client_assistance",
            get: function (cb) {
                cb('1');
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        }
    ];
    config.overlay = {
        endpoint: (config.local ? 'http:' : document.location.protocol) + '//bufferapp.com/add/',
        localendpoint: (config.local ? 'http:' : document.location.protocol) + '//local.bufferapp.com/add/',
        getCSS: function () { return "border:none;height:100%;width:100%;position:fixed!important;z-index:99999999;top:0;left:0;display:block!important;max-width:100%!important;max-height:100%!important;padding:0!important;background: none; background-color: transparent; background-color: rgba(0, 0, 0, 0.1);"; }
    };

    // Method for handling the async firing of the cb
    var executeAfter = function(done, count, data, cb) {
        if(done === count) {
            setTimeout(function(){
                cb(data)
            }, 0);
        }
    };

    // Asynchronously gather data about the page and from embedded sources,
    // like Twitter or Facebook. Currently the async is a bit over the top,
    // and not used, but if we need aysnc down the line, it's there.
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

    // Transform the data somewhat, and then create an overlay.
    // When it's done, fire buffer_done back to the extension
    var createOverlay = function (data) {
        if( data.embed ) {
            if( typeof data.embed === "object" ) {
                for( var i in data.embed ) {
                    if( data.embed.hasOwnProperty(i) ) {
                        data[i] = data.embed[i];
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

    // It all starts here.
    // createOverlay is the callback that should fire after getData has
    // gathered all the neccessaries
    getData(createOverlay);
    
};

