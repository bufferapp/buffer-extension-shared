;(function() {

  var config = [

    // Stream Pins
    {
      placement: 'pinterest-stream-pins',
      selector: '.pinImageActionButtonWrapper:not(.buffer-inserted)',
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
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $(el).find('.pinImg')
        var image = $img.attr('src');
        // Grab text from image alt attribute
        var text = $img.attr('alt');
        return {
          text: text,
          url: "https://www.pinterest.com",
          picture: image,
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

        return {
          text: text,
          url: "https://www.pinterest.com",
          picture: image,
          placement: this.placement
        };
      }
    }
  ];

  var insertButton = function(target) {
    $(target.selector).each(function(i, el) {
      console.error(el);
      var $button = target.insert(el);
      $button.on('click', function(e) {
        e.preventDefault();
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
  }


  // Wait for xt.options to be set
  ;(function check() {
    start();

    // If Pinterest is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.pinterest'] === 'pinterest') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
