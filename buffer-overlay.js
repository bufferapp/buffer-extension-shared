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
  'medium.com',
  'www.npmjs.org'
];

var forceXFrameOptions = function(){
  var m = document.createElement('meta');
  m.setAttribute('http-equiv', 'X-Frame-Options');
  m.setAttribute('content', 'ALLOW-FROM bufferapp.com');

  var h = document.querySelector('head');
  h.appendChild(m);
};

forceXFrameOptions();

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
  var temp = document.createElement('iframe');

  temp.allowtransparency = 'true';
  temp.scrolling = 'no';
  temp.id = 'buffer_overlay';
  temp.name = 'buffer_overlay';
  temp.style.cssText = config.overlay.getCSS();

  temp.src = src;

  // Testing CSP issues w/ sandboxed iframe
  // var qs = src.split('?')[1];
  // temp.src = xt.data.get('data/shared/extension.html?' + qs);

  var footerButtonBaseCSS = [
    'display: inline-block;',
    'border: 1px solid #aaa;',
    'border-top: 1px solid #ccc;',
    'border-left: 1px solid #ccc;',
    'padding: 6px 20px;',
    'font-size: 13px;',
    'font-weight: bold;',
    'line-height: 22px;',
    'text-decoration: none;',
    'text-shadow: 0 1px #fff;',
    'cursor: pointer;',
    'font-family: \'HelveticaNeue\',\'Helvetica Neue\',Helvetica,Arial,sans-serif !important;',
    '-moz-border-radius: 3px;',
    'border-radius: 3px;',
    '-moz-background-clip: padding;',
    '-webkit-background-clip: padding-box;',
    'background-clip: padding-box;',
    'box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),inset 0 1px 0 rgba(255, 255, 255, 0.2);'
  ].join('');

  var footerButtonWhiteCSS = [
    footerButtonBaseCSS,
    'background: #f8f8f8;',
    'background: -moz-linear-gradient(top, #ffffff 0%, #f8f8f8 100%);',
    'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #ffffff), color-stop(100%, #f8f8f8));',
    'background: -webkit-linear-gradient(top, #ffffff 0%, #f8f8f8 100%);',
    'background: -o-linear-gradient(top, #ffffff 0%, #f8f8f8 100%);',
    'background: -ms-linear-gradient(top, #ffffff 0%, #f8f8f8 100%);',
    'background: linear-gradient(top, #ffffff 0%, #f8f8f8 100%);'
  ].join('');

  var footerButtonBlueCSS = [
    footerButtonBaseCSS,
    'background: #168EEA;',
    'background: -moz-linear-gradient(top, #1F93EB 0%, #168EEA 100%);',
    'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #1F93EB), color-stop(100%, #168EEA));',
    'background: -webkit-linear-gradient(top, #1F93EB 0%, #168EEA 100%);',
    'background: -o-linear-gradient(top, #1F93EB 0%, #168EEA 100%);',
    'background: -ms-linear-gradient(top, #1F93EB 0%, #168EEA 100%);',
    'background: linear-gradient(top, #1F93EB 0%, #168EEA 100%);',
    'box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),inset 0 1px 0 rgba(255, 255, 255, 0.2);',
    'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);',
    'border: 1px solid #1277C5;'
  ].join('');

  var footerButtonIconCSS = [
    'display: inline-block;',
    'width: 10px;',
    'height: 11px;',
    'margin-right: 4px;',
    'background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEwcHgiIGhlaWdodD0iMTRweCIgdmlld0JveD0iMCAwIDEwIDE0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDx0aXRsZT5TbGljZSAxPC90aXRsZT4KICAgIDxkZXNjcmlwdGlvbj5DcmVhdGVkIHdpdGggU2tldGNoIChodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gpPC9kZXNjcmlwdGlvbj4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlIDEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTbGljZSAyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1LjAwMDAwMCwgNS4wMDAwMDApIHNjYWxlKDEsIC0xKSB0cmFuc2xhdGUoLTUuMDAwMDAwLCAtNS4wMDAwMDApIHRyYW5zbGF0ZSgwLjAwMDAwMCwgMS4wMDAwMDApIiBmaWxsPSIjNDQ0NDQ0Ij4KICAgICAgICAgICAgPHBhdGggZD0iTTAsNCBDMCw0LjA3NDA3NDA3IDAuMDI3MDA2MTcyOCw0LjEzMTY4NzI0IDAuMDgxMDE4NTE4NSw0LjE3MjgzOTUxIEw0LjY2NDM1MTg1LDcuOTUwNjE3MjggQzQuNzMzNzk2Myw4LjAwODIzMDQ1IDQuODA3MDk4NzcsOC4wMTQ0MDMyOSA0Ljg4NDI1OTI2LDcuOTY5MTM1OCBDNC45NjE0MTk3NSw3LjkyMzg2ODMxIDUsNy44NjAwODIzIDUsNy43Nzc3Nzc3OCBMNSw1Ljc3Nzc3Nzc4IEM2LjU0MzIwOTg4LDUuNzc3Nzc3NzggNy43NDg4NDI1OSw1LjM0MTU2Mzc5IDguNjE2ODk4MTUsNC40NjkxMzU4IEM5LjQ4NDk1MzcsMy41OTY3MDc4MiA5Ljk0NTk4NzY1LDIuMzk5MTc2OTUgMTAsMC44NzY1NDMyMSBDMTAsMC43Njk1NDczMjUgOS45NDU5ODc2NSwwLjY5OTU4ODQ3NyA5LjgzNzk2Mjk2LDAuNjY2NjY2NjY3IEw5Ljc5MTY2NjY3LDAuNjY2NjY2NjY3IEM5LjczNzY1NDMyLDAuNjY2NjY2NjY3IDkuNjc1OTI1OTMsMC43MDM3MDM3MDQgOS42MDY0ODE0OCwwLjc3Nzc3Nzc3OCBDOS4yNDM4MjcxNiwxLjI2MzM3NDQ5IDguNjU3NDA3NDEsMS42MjU1MTQ0IDcuODQ3MjIyMjIsMS44NjQxOTc1MyBDNy4wMzcwMzcwNCwyLjEwMjg4MDY2IDYuMDg3OTYyOTYsMi4yMjIyMjIyMiA1LDIuMjIyMjIyMjIgTDUsMC4yMjIyMjIyMjIgQzUsMC4xNjQ2MDkwNTMgNC45ODA3MDk4OCwwLjExMzE2ODcyNCA0Ljk0MjEyOTYzLDAuMDY3OTAxMjM0NiBDNC45MDM1NDkzOCwwLjAyMjYzMzc0NDkgNC44NTMzOTUwNiwwIDQuNzkxNjY2NjcsMCBDNC43Mzc2NTQzMiwwIDQuNjk1MjE2MDUsMC4wMTY0NjA5MDUzIDQuNjY0MzUxODUsMC4wNDkzODI3MTYgTDAuMDgxMDE4NTE4NSwzLjgyNzE2MDQ5IEMwLjAyNzAwNjE3MjgsMy44NjgzMTI3NiAwLDMuOTI1OTI1OTMgMCw0IEwwLDQgWiBNMCw0IiBpZD0iU2hhcGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);',
    'opacity: 0.8;'
  ].join('');

  var footer = document.createElement('div');
  footer.id = 'buffer_widget_footer';
  footer.style.cssText = "z-index:2147483647;background: #ffffff url(https://d389zggrogs7qo.cloudfront.net/images/bookmarklet_icon.png) 35px 16px no-repeat; background-size: 30px; box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1); border-top: 1px solid #ccc; border-bottom-left-radius: 4px; height: 60px; width: 100%; position: fixed; bottom: 0; right: 0;";
  footer.innerHTML = [
    '<ul id="buffer_widget_footer_list" style="float: right; margin-top: 13px; margin-right: 20px; min-width: 170px;">',
      '<li style="list-style-type: none; background:none; width: auto; display: inline-block;">',
        '<a href="https://bufferapp.com/app" target="_blank" class="buffer_widget_button_white" style="' + footerButtonWhiteCSS + '">',
          '<i style="' + footerButtonIconCSS + '"></i> Visit Buffer Dashboard',
        '</a>',
      '</li>',
    '</ul>'
  ].join('');

  document.body.appendChild(footer);

  var footerHoverCss = document.createElement('style');
  footerHoverCss.type="text/css";
  footerHoverCss.innerHTML = [
    '#buffer_widget_footer a{color: #777!important;opacity:1.0!important;}',
    '#buffer_widget_footer a:hover{color: #444!important;}',
    '#buffer_widget_footer a.buffer_widget_button_white:hover{background-image:none !important;background-color:#fff !important;}',
    '#buffer_widget_footer a.buffer_widget_button_blue{color:#fff!important;}',
    '#buffer_widget_footer a.buffer_widget_button_blue:hover{background-image:none !important;background-color:#2D99EC !important;}',
    '#buffer_widget_footer a:hover i{opacity:1.0;}'
  ].join('');

  document.body.appendChild(footerHoverCss);

  document.body.appendChild(temp);

  // Returns a button and it's surrounding list element to insertion into
  // the footer
  function createButtonListElement(id, url, text, color){
    // Color options: 'blue' or 'white'
    color = color || 'blue';
    var style = color === 'blue' ? footerButtonBlueCSS : footerButtonWhiteCSS;

    var li = document.createElement('li');
    li.style.cssText = 'list-style-type: none; background:none; width: auto; display: inline-block; margin-right: 8px;';
    li.innerHTML = [
      '<a id="' + id + '" href="' + url + '" target="_blank" class="buffer_widget_button_blue" style="' + style + '">',
        text,
      '</a>'
    ].join('');

    return li;
  }

  // Given data sent via postmessage, this prepends a new button in the footer
  function prependButton(buttonData){
    var ul = footer.children[0];
    var firstLi = ul.children[0];
    var id = 'buffer_footer_button_insert';

    var li = createButtonListElement(id, buttonData.url, buttonData.text, buttonData.color);

    ul.insertBefore(li, firstLi);

    // Send the iframe click info via postmessage for any new buttons.
    // Original button data is passed back to the listening iframe
    document.getElementById( id ).addEventListener('click', function(){
      bufferpm({
        target: temp.contentWindow,
        type: 'buffer_buttonclick',
        data: buttonData
      });
    }, false);

  }

  // Bind the event so the extension can add a call-to-action button in
  // the footer which is in the page's DOM, not the iframe itself
  bufferpm.bind('buffer_addbutton', prependButton);

  // Bind close listener
  // Listen for when the overlay has closed itself
  bufferpm.bind("buffermessage", function(overlaydata) {
    document.body.removeChild(temp);
    document.body.removeChild(footer);
    bufferpm.unbind("buffermessage");
    bufferpm.unbind('buffer_addbutton');
    setTimeout(function () {
      doneCallback(overlaydata);
    }, 0);
    window.focus();
  });

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
