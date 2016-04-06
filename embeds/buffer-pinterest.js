;(function() {

  var config = [

    // Stream Pins
    {
      placement: 'pinterest-stream-pins',
      selector: '.Pin.Module:not(.buffer-inserted, .hideHoverUI)',
      $button: $([
        '<div class="pin-action-item Button btn">',
          '<a class="js-buffer-action pin-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer"></i>',
          '</a>',
        '</div>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted');

        $actions
          .find('.pinImageActionButtonWrapper')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $(el).find('.pinImg');
        var image = $img.attr('src');
        var pinLink;
        var pinIdParts;
        var pinId;
        var text;
        var $source;
        var source;
        var pageSource;
        var pinSourceRegex;
        var pinSourceMatches;

        // Grab text from image alt attribute
        text = $img.attr('alt');

        $source = $(el).find('.pinNavLink');

        // If we haven't found a link, try to get it from the page's source using
        // some regex magic
        if ($source.length === 0) {
          pinLink = $img.closest('a').attr('href');
          pinIdParts = pinLink.split('/');
          pinId = pinIdParts[pinIdParts.length - 2];

          pageSource = document.body.innerHTML;

          // That regex looks into inline JSON to find the "link" field in the pin object
          // that follows that pin's id field. If we ever need something more robust to make
          // sure we get the right "link" field, I've come up with this more involved regex:
          // /"id":\s*"22447698119542969"(?:,\s*"[^"]+":\s*(?:\d+(?:\.\d+)?|\w+|"[^"]+"|{(?:(?:{[^}]*})?|[^}])*}|\[[^]]*]))*,\s*"link":\s*("[^"]+")/i
          pinSourceRegex = RegExp('"id":\\s*"' + pinId + '".*?"link":\\s*("[^"]+")');

          pinSourceMatches = pageSource.match(pinSourceRegex);

          if (pinSourceMatches) source = JSON.parse(pinSourceMatches[1]);
        }

        // If we still haven't found a link, default to the domain name
        if ($source.length === 0 && !source) {
          $source = $(el).find('.pinDomain');
        }

        source = source || $source.attr('href') || $source.text();

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    },
    // Single Pins
    {
      placement: 'pinterest-single-pin',
      selector: '.PinActionBar:not(.buffer-inserted)',
      $button: $([
        '<div class="pin-action-item action-bar Button btn">',
          '<a class="js-buffer-action pin-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer"></i>',
          '</a>',
        '</div>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $(el).parents('.closeupActionBarContainer')
                        .siblings('.closeupContainer')
                        .find('.pinImage');

        var image = $img.attr('src');
        // Grab text from image alt attribute
        var text = $img.attr('alt');

        var source = $(el).closest('.Closeup').find('.paddedPinLink').attr('href');

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    },
    // Pin Action Popup Pin
    {
      placement: 'pinterest-pin-popup',
      selector: '.SelectList li.item .BoardLabel:not(.buffer-inserted)',
      $button: $([
        '<div class="pin-action-item action-bar Button btn">',
          '<a class="js-buffer-action pin-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer"></i>',
          '</a>',
        '</div>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $(el).parents('.boardsWrapper').siblings('.pinContainer').find('.pinImg');
        if (!$img) { // Default to grab .pinImg from a top-down approach rather than navigating from $(el) if that does not find it
          $img = $('.pinImg');
        }

        var image = $img.attr('src');
        // Grab text from image alt attribute
        var text = $img.attr('alt');

        // Grab full url from board behind modal
        var $source = $(document).find('img[src="'+image+'"]').parents('.pinHolder').siblings('.pinNavLink');
        var source = $source.attr('href');

        // If that didn't work, the Pin may have been open directly (there's no board in the
        // background): there may be a pinterestapp:source meta tag we'll try to get it from
        if (!source) source = $('meta[name=\'pinterestapp:source\']').attr('content');

        if(!source){
          if(window.location.search){
            var params = window.location.search.split('&');

            var urlIndex = -1;
            for(var i = 0; i < params.length; i++){
              if(params[i].indexOf('url=') > -1){
                urlIndex = i;
                break;
              }
            }

            if(urlIndex > -1){
              source = decodeURIComponent(params[urlIndex].split("=")[1]);
            }
          }

        }

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    }
  ];

  var insertButton = function(target) {
    $(target.selector).each(function(i, el) {
      var $button = target.insert(el);
      $button.on('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        xt.port.emit('buffer_click', target.getData(el));
      })
    });
  };

  var insertButtons = function() {
    config.forEach(insertButton);
  };

  var pinterestLoop = function() {
    insertButtons();
    setTimeout(pinterestLoop, 500);
  };

  var start = function() {

    // Add class for css scoping
    document.body.classList.add('buffer-pinterest');

    // Start the loop that will watch for new DOM elements
    pinterestLoop();
  };

  // Make sure we get the fullsize image
  // Example src: 'https://s-media-cache-ak0.pinimg.com/236x/55/1f/ac/551fac47c0dacff21f04012cb5c020cf.jpg'
  var getFullSizeImageUrl = function(url) {
    var urlParts = url.split('/');
    var isPinterestImage = urlParts[2].indexOf('pinimg.com') != -1;

    // Non-Pinterest images should already be full-size
    if (!isPinterestImage) return url;

    urlParts[3] = '736x'; // 736 is the Pinterest standard for fullsize images
    return urlParts.join('/');
  };

  // Wait for xt.options to be set
  ;(function check() {
    // If Pinterest is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.pinterest'] === 'pinterest' || typeof xt.options['buffer.op.pinterest'] == 'undefined') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
