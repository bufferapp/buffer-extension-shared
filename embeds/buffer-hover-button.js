/**
 * Buffer share buttons visible on hover
 */
;(function(){

  var currentImageUrl = null;

  /**
   * Create a single global button
   */
  var buttonWidth = 100;
  var buttonHeight = 25;
  var dpr = window.devicePixelRatio;
  var backgroundImage = (dpr && dpr > 1) ?
    xt.data.get('data/shared/img/buffer-hover-icon@2x.png') :
    xt.data.get('data/shared/img/buffer-hover-icon@1x.png');

  var button = document.createElement('span');
  button.id = 'buffer-extension-hover-button';

  button.setAttribute('style', [
    'display: none;',
    'position: absolute;',
    'z-index: 8675309;',
    'width: ' + buttonWidth + 'px;',
    'height: ' + buttonHeight + 'px;',
    'background-image: url(' + backgroundImage +');',
    'background-size: ' + buttonWidth +'px ' + buttonHeight + 'px;',
    'opacity: 0.9;',
    'cursor: pointer;'
  ].join(''));
  try {
    document.body.appendChild(button);
  } catch (err) { /* No need to handle this error */ }

  var offset = 5;
  var locateButton = function(e, X, Y) {
    var image = e.target;
    var box = image.getBoundingClientRect();

    if (box.height < 250 || box.width < 350) return;

    // Use image.width and height if available
    var width = image.width || box.width,
        height = image.height || box.height,
        extraXOffset = 0 || X,
        extraYOffset = 0 || Y;

    // In Gmail, we slide over the button for inline images to not block g+ sharing
    if (site.isGmail && 
        window.getComputedStyle(image).getPropertyValue('position') !== 'absolute') {
      extraXOffset = 72;
      extraYOffset = 4;
    }
    
    var x = window.pageXOffset + box.left + width - buttonWidth - offset - extraXOffset;
    var y = window.pageYOffset + box.top + height - buttonHeight - offset - extraYOffset;

    button.style.top = y + 'px';
    button.style.left = x + 'px';
    button.style.display = 'block';

    currentImageUrl = getImageUrl(image);
  };

  var hoverButton = function() {
    button.style.opacity = '1.0';
    button.style.display = 'block';
  };

  var hideButton = function(e) {
    button.style.display = 'none';
    button.style.opacity = '0.9';
  };

  var bufferImage = function(e) {
    if (!currentImageUrl) return;

    e.preventDefault();

    xt.port.emit('buffer_click', {
      picture: currentImageUrl,
      placement: 'hover_button_image'
    });
  };

  $(button)
    .on('click', bufferImage)
    .on('mouseenter', hoverButton)
    .on('mouseleave', hideButton);

  /**
   * Site detection
   */
  var domain = window.location.hostname.replace('www.','');
  var site = {
    isGmail: /mail.google.com/.test(domain),
    isInstagram: /instagram.com/.test(domain)
  };

  var getImageUrl = (function(domain){
    
    if ( site.isInstagram ) {
      return function(el) {
        return el.style.backgroundImage
          .replace('url(','')
          .replace(')','');
      };
    }
    
    return function(el) {
      return el.src;
    };

  }(domain));

  var addBufferImageOverlays = function() {
    var selector = 'img';

    if ( site.isInstagram ) {
      selector = '.Image.timelinePhoto, .Image.Frame';
    }

    $(document)
      .on('mouseenter', selector, locateButton)
      .on('mouseleave', selector, hideButton);
  };

  // List of sites to disable this on:
  var disabledDomains = [
    'bufferapp.com',
    'twitter.com',
    'facebook.com'
  ];
  if (disabledDomains.indexOf(domain) > -1) {
    return;
  }

  (function check() {
      if (!xt.options) {
        return setTimeout(check, 50);
      }
      if (typeof xt.options['buffer.op.image-overlays'] === 'undefined' ||
          xt.options['buffer.op.image-overlays'] === 'image-overlays') {
        addBufferImageOverlays();
      }
  }());

}());