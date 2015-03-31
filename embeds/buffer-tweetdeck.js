;(function() {

  // document.body.classList.add('buffer-inserted');

  var $actionItem = $([
    '<li class="tweet-action-item">',
      '<a class="js-buffer-action tweet-action position-rel" href="#" rel="buffer">',
        '<i class="icon icon-buffer txt-right"></i>',
        '<span class="is-vishidden">Buffer</span> ',
      '</a>',
    '</li>'
  ].join(''));


  var conifg = [

    // Streams
    {
      placement: 'tweekdeck-stream',
      selector: '.js-stream-item .js-tweet-actions:not(.buffer-inserted)',
      $button: $([
        '<li class="tweet-action-item">',
          '<a class="js-buffer-action tweet-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer txt-right"></i>',
            '<span class="is-vishidden">Buffer</span> ',
          '</a>',
        '</li>'
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
        var $streamItem = $(el).parents('.js-stream-item');

        var $text = $streamItem.find('.js-tweet-text');
        var $screenname = $streamItem.find('.username');
        var screenname = $screenname.text().trim().replace(/^@/, '');
        var text = 'RT @' + screenname + ': ' + $text.text().trim() + '';
        var displayName = $streamItem.find('.fullname').text().trim();

        return {
          text: text,
          placement: this.placement,
          retweeted_tweet_id: $streamItem.attr('data-key'),
          // NOTE - we may not really need the user id after all...
          // retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name: screenname,
          retweeted_user_display_name: displayName
        };
      }
    }

  ];


  var insertButton = function(target) {
    $(target.selector).each(function(i, el) {
      var $button = target.insert(el);
      $button.on('click', function(e) {
        e.preventDefault();
        xt.port.emit('buffer_click', target.getData(el));
      })
    });
  };

  var insertButtons = function() {
    conifg.forEach(insertButton);
  };

  var tweetdeckLoop = function() {
    insertButtons();
    setTimeout(tweetdeckLoop, 500);
  };


  // Wait for xt.options to be set
  ;(function check() {
    // If tweetdeck is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.twitter'] === 'twitter') {
      tweetdeckLoop();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
