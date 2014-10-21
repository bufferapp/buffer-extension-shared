/* globals bufferpm */

// Put together a query string for the iframe
var buildSrc = function(data, config) {

  var src = data.local ?
    config.overlay.localendpoint :
    config.overlay.endpoint;

  var qs = '';

  config.attributes.forEach(function(attr, i){
    if ( !data[ attr.name ] ) return;
    if ( qs.length ) qs += '&';
    qs += attr.name + '=' + attr.encode( data[attr.name] );
  });

  if (qs.length) src += '?' + qs;

  return src;
};

var openPopUp = function(src, doneCallback) {

  window.open(src, null, 'height=600,width=850');

  // Bind close listener
  // Listen for when the overlay has closed itself
  bufferpm.bind("buffermessage", function(overlaydata) {
    bufferpm.unbind("buffermessage");
    setTimeout(function () {
      doneCallback(overlaydata);
    }, 0);
    window.focus();
  });
};

/**
 * This is a list of domains that have a strict Content Security Policy
 * This is a temporary work around while we figure out a long term solution
 * to this issue: https://github.com/bufferapp/buffer-chrome/issues/12
 */
var CSPWhitelist = [
  'github.com',
  'education.github.com',
  'medium.com',
  'www.npmjs.org'
];


// Build that overlay!
// Triggered by code working from the button up
var bufferOverlay = function(data, config, doneCallback) {

  if( ! doneCallback ) doneCallback = function () {};
  if( ! config ) return;

  var src = buildSrc(data, config);
  var domain = window.location.hostname;

  if (xt.options['buffer.op.tpc-disabled'] ||
    CSPWhitelist.indexOf(domain) > -1 ) {
    return openPopUp(src, doneCallback);
  }

  // Create the iframe and add the footer:
  var iframe = document.createElement('iframe');

  iframe.allowtransparency = 'true';
  iframe.scrolling = 'no';
  iframe.id = 'buffer_overlay';
  iframe.name = 'buffer_overlay';
  iframe.style.cssText = config.overlay.getCSS();

  iframe.src = src;

  // Testing CSP issues w/ sandboxed iframe
  // var qs = src.split('?')[1];
  // iframe.src = xt.data.get('data/shared/extension.html?' + qs);

  document.body.appendChild(iframe);

  var styleTag = createStyleTag();
  document.body.appendChild(styleTag);

  var dashboardButton = createDashboardButton();
  document.body.appendChild(dashboardButton);

  // Bind close listener
  // Listen for when the overlay has closed itself
  bufferpm.bind('buffermessage', function(overlaydata) {
    
    document.body.removeChild(iframe);
    document.body.removeChild(dashboardButton);

    bufferpm.unbind('buffermessage');
    bufferpm.unbind('buffer_addbutton');
    
    setTimeout(function () {
      doneCallback(overlaydata);
    }, 0);
    
    window.focus();
  });

};

var createStyleTag = function() {
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = [
    '.buffer-floating-btn:hover {',
      'text-decoration: none;',
      'color: #323b43;',
      'cursor: pointer;',
    '}'
  ].join('');

  return style;
};

var createDashboardButton = function() {

  var css = [
    'position: fixed;',
    'top: 10px;',
    'right: 10px;',
    'z-index: 2147483647;',
    'padding: 8px 10px 8px 32px;',
    'background-color: #fff;',
    'background-image: url(https://d389zggrogs7qo.cloudfront.net/images/bookmarklet_icon.png);',
    'background-repeat: no-repeat;',
    'background-size: 15px;',
    'background-position: 11px 12px;',
    'color: #323b43;',
    'border: 0;',
    'text-decoration: none;',
    'border-radius: 2px;',
    'text-decoration: none;',
    'font-size: 14px;',
    'line-height: 1.6;',
    'font-family: "Open Sans", Roboto, Helvetica, Arial;',
    'box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);'
  ].join('');

  var button = document.createElement('a');
  button.href = 'https://bufferapp.com/app';
  button.target = '_blank';
  button.setAttribute('class', 'buffer-floating-btn');
  button.setAttribute('style', css);
  button.innerHTML = 'Go to Buffer';
  
  return button;
};

// getOverlayConfig returns the configuration object for use by bufferOverlay
var getOverlayConfig = function(postData){

  var config = {};

  // Set this to true for using a local server while testing
  config.local = false;

  var segments = window.location.pathname.split('/');

  config.pocketWeb = ( window.location.host.indexOf('getpocket') !== -1 && segments[2] === 'read' );

  // Specification for gathering data for the overlay
  config.attributes = [
    {
      name: "url",
      get: function (cb) {
        if(config.pocketWeb){
          var li = document.getElementsByClassName('original')[0];
          var link = li.getElementsByTagName('a')[0].href;
          cb(link);
        }
        else{
          cb(window.location.href);
        }
      },
      encode: function (val) {
        return encodeURIComponent(val);
      }
    },
    {
      name: "text",
      get: function (cb) {
        if(document.getSelection().toString().length) {
          cb('"' + document.getSelection().toString() + '"');
        }
        else{
          if(config.pocketWeb){
            var header = document.getElementsByClassName('reader_head')[0];
            var title = header.getElementsByTagName('h1')[0].innerHTML;
            cb(title);
          }
          else{
            cb(document.title);
          }
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
    endpoint: "https://bufferapp.com/add/",
    localendpoint: "https://local.bufferapp.com/add/",
    getCSS: function () {
      return [
        'border:none;',
        'height:100%;',
        'width:100%;',
        'position:fixed!important;',
        'z-index:2147483646;',
        'top:0;',
        'left:0;',
        'display:block!important;',
        'max-width:100%!important;',
        'max-height:100%!important;',
        'padding:0!important;',
        'background: none;',
        'background-color: transparent;',
        'background-color: rgba(0, 0, 0, 0.1);'
      ].join('');
    }
  };

  return config;
};

// Method for handling the async firing of the cb
var executeAfter = function(done, count, args, cb) {
  if(done === count) {
    setTimeout(function(){
      cb.apply( null, args );
    }, 0);
  }
};


// Asynchronously gather data about the page and from embedded sources,
// like Twitter or Facebook. Currently the async is a bit over the top,
// and not used, but if we need async down the line, it's there.
var getData = function (postData, cb) {
  var config = getOverlayConfig( postData );
  var count = config.attributes.length;
  var done = 0;
  var data = {};

  config.attributes.forEach(function(attr, i){
    attr.get(function(d){
      done += 1;
      data[ attr.name ] = d;
      executeAfter(done, count, [ data, config ], cb);
    });
  });
};



// bufferData is triggered by the buffer_click listener in
// the buffer-browser-embed file, where it's passed a port
// to communicate with the extension and data sent from the
// background page.
var bufferData = function (port, postData) {

  if (window.top !== window) return;

  // Transform the data somewhat, and then create an overlay.
  // When it's done, fire buffer_done back to the extension
  var createOverlay = function (data, config) {
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
  // gathered all the necessaries
  getData(postData, createOverlay);
};
