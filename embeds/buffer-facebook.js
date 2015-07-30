;(function() {

  // EXT
  // (obj notation)
  var buildElement = function buildElement (parentConfig) {

    var temp = document.createElement(parentConfig[0]);
    if( parentConfig[1] ) temp.setAttribute('class', parentConfig[1]);
    if( parentConfig[2] ) temp.setAttribute('style', parentConfig[2]);

    if ( parentConfig.length > 3 ) {
      var i = 3, l = parentConfig.length;
      for(; i < l; i++) {
        temp.appendChild(buildElement(parentConfig[i]));
      }
    }

    return temp;

  };

  // Listen for share button clicks
  var share = {};
  var isDataFromModal = false;

  // Dictionary of selectors
  var selectors = {

    // .userContentWrapper - new FB news feed, 3/2014
    timelineItem: [
      '.genericStreamStory',
      '.fbTimelineUnit',
      '.UIStandardFrame_Content',
      '.fbPhotoSnowlift',
      '.userContentWrapper',
      '.timelineUnitContainer'
    ].join(', '),

    via: [
      '.passiveName',
      '.actorName',
      '.unitHeader',
      '#fbPhotoPageAuthorName a'
    ].join(', '),

    // .tlTxFe is used on new timeline
    text: [
      '.userContent',
      // photo caption
      '.text_exposed_root',
      // Above video
      '.aboveUnitContent',
      '.messageBody',
      '.tlTxFe',
      '.caption',
      '.fbPhotosPhotoCaption',
    ].join(', '),

    thumb: [
      'img._46-i',
      '.uiScaledImageContainer:not(.fbStoryAttachmentImage) img',
      '.uiPhotoThumb img',
      '.photoUnit img',
      '.fbPhotoImage',
      '.spotlight'
    ].join(', '),

    videoThumb: '.uiVideoThumb img',

    // a.shareLink - page timelines, 3/2014
    // .shareLink a:not([href="#"]) - small embeds on user timeline, ex. YouTube, 3/2014
    // ._52c6 - new newsfeed links, 3/2014
    // a.uiVideoLink - video modal link
    anchor: [
      'a.shareMediaLink',
      '.uiAttachmentTitle a',
      'a.externalShareUnit',
      'a.shareLink',
      'a.uiVideoLink',
      '.shareLink a:not([href="#"])',
      '._52c6',
    ].join(', '),

    // A backup, slower selector logic
    anchorSecondary: 'div:not(.userContent) a[target="_blank"]:not([data-appname])'

  };

  // TODO
  //  - Fix status updates w/ articles inline? Chris Day's profile
  function getClosestShareData(elem) {

    var parent = $(elem).closest(selectors.timelineItem);

    // reset share object on every 'share' button click
    var share = {};

    // find the name of the person that shared the attachment
    share.via = $(selectors.via, parent).first().text();

    // find the message for this attachment, or if none use the attachment caption
    share.text = $(selectors.text, parent).first().text();

    var $thumb = $(selectors.thumb, parent);
    var image = $thumb.attr('src');
    var $videoThumb = $(selectors.videoThumb, parent);
    var $anchor = $(selectors.anchor, parent);

    // If we can't find it, try this alternate, slower search looking for external links
    if ($anchor.length === 0) {
      // We exclude the update's written text that may contain possible links = .userContent
      // and we exclude any possible links to an app that was used to post this, ex. Buffer
      $anchor = $(selectors.anchorSecondary, parent);
    }

    var url = $anchor.attr('href');

    // find picture status
    if ( image ) {
      share.picture = image;

      // Disable this until we add sharing to the image modal
      // share.url = $('a.uiPhotoThumb, a.photo', parent).attr('href');
      share.placement = 'facebook-timeline-picture';
    } else if ($videoThumb.length) {
      share.url = url;
      image = $videoThumb[0].src.replace(/c([0-9]+\.)+[0-9]+\//, '');
      share.picture = image;
      share.placement = 'facebook-timeline-video';
    } else if (url) {
      // find link status
      if ( url[0] === '/' ) url = 'https://facebook.com' + url;
      share.url = url;
      share.placement = 'facebook-timeline-link';
    } else {
      // standard text status
      share.placement = 'facebook-timeline-status';
    }

    // Facebook does some href switching via js on link rollover
    // If the user doesn't rollover, we have some leave facebook url
    if (share.url && share.url.indexOf('facebook.com/l.php?') > -1) {

      var mouseoverAttr = $anchor.attr('onmouseover');

      if (mouseoverAttr.indexOf('LinkshimAsyncLink') > -1) {
        share.url = mouseoverAttr
          .split('"')
          .filter(function(part){
            return part.indexOf('http') === 0;
          })[0];
      }

    }

    return share;
  }

  function getDataFromModal(elem) {

    var $context = $(elem).parents('._5pax');
    var image = $context.find('img._46-i')[0];
    var anchor;

    if (image) {
      image = image.src.replace(/c([0-9]+\.)+[0-9]+\//, '');
      share.picture = image.replace(/[sp][0-9]+x[0-9]+\//, '');

      anchor = $context.find('a._5pc0._5dec')[0];
      if (anchor) share.url = anchor.href;
    } else {
      anchor = $context.find('a._5rwn')[0];
      if (anchor) share.url = anchor.href;
    }

    isDataFromModal = true;

    return share;
  }

  /*  This has been disabled along with the Buffer button being removed from the
      share modal in May 2014.
  $('body').on('click', 'a.share_action_link, a:contains("Share")', function (e) {

    share = getClosestShareData();

    // Woops we failed in getting the data we needed because FB has changed
    // or this is the main feed. Now we just try and grab the url/photo
    // because this needs to be fetched from here. After this we use the
    // modal's data when pressing the "Buffer" button. It's bit more
    // reliable source of info.
    if (share.via === '' &&
        share.text === '' &&
        share.placement === 'facebook-share-status') {
      share = getClosestShareData(e.currentTarget);
    }
  });*/

  var config = {};
  config.base = "https://facebook.com";
  config.time = {
    reload: 800
  };
  config.buttons = [
    {
      name: "status",
      text: "",
      // container: '#pagelet_composer form, .fbTimelineComposerUnit form',
      container: 'form[action^="/ajax/updatestatus"]',
      after: 'ul.uiList > li:first',
      className: 'buffer-facebook-button',
      selector: '.buffer-facebook-button',
      elements:
          ['li', 'pls uiList uiListHorizontalItemBorder uiListHorizontalItem', '',
            ['label', '', '',
              ['a', 'buffer-facebook-button']
            ]
          ],
      default: [
        'width: 15px;',
        'height: 20px;',
        'display: inline-block;',
        'vertical-align: middle;',
        'line-height: 22px;',
        'background: transparent;',
        'background-image: url("https://d389zggrogs7qo.cloudfront.net/images/app/buffer-menu-icon-new.png");',
        'color: white !important;',
        'text-shadow: rgba(0, 0, 0, 0.2) 0px -1px 0px;',
        'font-size: 12px;',
        'font-family: Helvetica, Arial, "lucida grande",tahoma,verdana,arial,sans-serif;',
        '-webkit-font-smoothing: antialiased;',
        'background-position: -22px 1px;',
        'text-decoration: none !important;',
        'top: 1px;',
        'position: relative;'
      ].join(''),
      hover: 'text-decoration: none !important;',
      create: function (btnConfig) {
        var temp = buildElement(btnConfig.elements);

        // If on a timeline page, reduce the font size. Temp hack for now
        if ( $('#pagelet_composer').length === 0) {
          btnConfig.default += 'font-size: 11px;';
        }

        var a = $(temp).find(btnConfig.selector)[0];
        a.setAttribute('style', btnConfig.default);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        $(a).mousedown(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.default + btnConfig.active);
        });

        $(a).mouseup(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.default + btnConfig.hover);
        });

        return temp;

      },
      data: function (elem) {
        return {
          text: $(elem).parents('form').find('textarea.textInput').val(),
          placement: 'facebook-composer'
        };
      },
      clear: function (elem) {
        $(elem).parents('form').find('textarea.textInput').val('');
      }
    },
    {
      // Buffer link under timeline post content: Like · Comment · Share · Buffer
      name: 'timeline-post-buffer',
      text: 'Buffer',
      container: '.commentable_item',
      // after: '.share_action_link',
      // Adjustment made w/ Timeline adjustments noticed by Joel Mar 26 2015
      after: function($container) {
        var $shareBtn = $container.find('.share_root');
        // share_action_link's parent, only if the par is div.uiPopover
        if ($shareBtn.parent().hasClass('uiPopover')) return $shareBtn.parent();
        return $shareBtn;
      },
      default: [].join(''),
      create: function(btnConfig) {

        var span = document.createElement('span');
        var button = document.createElement('a');

        button.setAttribute('style', btnConfig.default);
        button.setAttribute('class', 'buffer-facebook-newsfeed-post-embed');
        button.setAttribute('href', '#');
        button.textContent = btnConfig.text;

        var timelineSpacer = document.createElement('span');
        timelineSpacer.appendChild(document.createTextNode(' \u00A0')); // A space, followed by a nbsp
        timelineSpacer.setAttribute('class', 'buffer-facebook-newsfeed-embed-spacer');

        var tickerSpacer = document.createElement('span');
        tickerSpacer.appendChild(document.createTextNode(' · '));
        tickerSpacer.setAttribute('class', 'buffer-facebook-ticker-embed-spacer');

        span.appendChild(timelineSpacer);
        span.appendChild(tickerSpacer);
        span.appendChild(button);

        return span;
      },
      data: function (elem) {

        var $elem = $(elem);
        var share = getClosestShareData(elem);

        return share;
      },
      clear: function() {
        share = {};
      }

    }
    /* Disabled May 2014 as this doesn't create a native share on facebook,
       it creates a new post from that user. This is planned to eliminate
       user confusion until
    {
      name: "share",
      text: "Buffer",
      container: 'form[action^="/ajax/sharer/submit/"] div.uiOverlayFooter',
      before: '.layerConfirm',
      className: 'buffer-facebook-button',
      selector: '.buffer-facebook-button',
      elements: ['a', 'buffer-facebook-button uiOverlayButton'],
      default: [
        'display: inline-block;',
        'vertical-align: middle;',
        'padding: 0 8px;',
        'margin-right:5px;',
        'line-height: 22px;',
        'background: hsl(116, 39%, 45%);',
        'border: 1px solid #40873B;',
        'border-color: #45963F #45963F #40873B;',
        'border-radius: 2px;',
        'color: white !important;',
        'text-shadow: rgba(0, 0, 0, 0.2) 0px -1px 0px;',
        'font-size: 12px;',
        'font-family: "Helvetica Neue", Helvetica, Arial, "lucida grande", tahoma, verdana, arial, sans-serif;',
        'text-decoration: none !important'
      ].join(''),
      style: '',
      hover: '',
      active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
      create: function (btnConfig) {

        var temp = buildElement(btnConfig.elements);

        var a = $(temp).find(btnConfig.selector)[0];
        if( ! a ) a = temp; // EXT
        a.setAttribute('style', btnConfig.default);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text); // EXT

        $(a).mousedown(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.default + btnConfig.active);
        });

        $(a).mouseup(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.default + btnConfig.hover);
        });

        return temp;

      },
      data: function (elem) {
        var $parent, text;
        // This occurs when the item is shared from the main news feed
        // and/or no share data is/was found. So now we try
        // and grab from the data from the FB share modal instead.
        if(isDataFromModal){

          $parent = $(elem).parents('.uiOverlayFooter').parent().parent().find('.mentionsTextarea');
          text = $parent.val();
          if( text === "Write something..." ) text = undefined;
          if( text ) share.text = text;

          var photoshare = $('.UIShareStage_Image img').attr('src');
          var thumb = $('input[name="attachment[params][images][0]');

          if(thumb.length > 0){
            if($('.UIShareStage_Title')[0].innerText === "Status Update"){
              //Only add text from status update
              share.text = $('.UIShareStage_Summary')[0].innerText;
              //if(share.text === "Write something..." ) text = undefined;
              share.placement = 'facebook-share-status';
            }
            else{
              share.placement = 'facebook-share-link';
            }
          }
          else if(photoshare){
            // Is this maybe a status update share?
            if($('.UIShareStage_Title')[0].innerText === "Status Update"){
              //Only add text from status update
              share.text = $('.UIShareStage_Summary')[0].innerText;
              share.placement = 'facebook-share-status';
            }
            else{
              //Nope it's a photo. So let's share a photo.
              share.placement = 'facebook-share-picture';
            }
          }
        }
        else{
          $parent = $(elem).parents('.uiOverlayFooter').parent().parent().find('.mentionsTextarea');

          // if the user has written a message, allow this to override the default text

          text = $parent.val();
          if( text === "Write something..." ) text = undefined;
          if( text ) share.text = text;
        }

        // Facebook does some href switching via js on link rollover
        // If the user doesn't rollover, we have some leave facebook url
        if (share.url && share.url.indexOf('http://www.facebook.com/l.php?') === 0) {

          var params = share.url.replace('http://www.facebook.com/l.php?','')
            .split('&');

          // Find the real url we want behind the 'u' parameter:
          for ( var i = 0; i < params.length; i++ ){
            if ( params[i].indexOf('u=') === 0 ){
              share.url = params[i].replace('u=','');
              break;
            }
          }

        }

        // fallback placement when we don't know if the attachment is a picture, link or status
        if( !share.placement ) share.placement = 'facebook-share';
        console.log("Share:", share);
        return share;
      },
      clear: function (elem) {
        share = {};
      }
    }*/
  ];

  var bufferEmbed = function bufferEmbed() {

    var insertButtons = function () {

      config.buttons.forEach(function(btnConfig, i){

        // Container can be a selector or a function that returns a
        // jQuery object
        var $container = typeof btnConfig.container === 'function' ?
            btnConfig.container( btnConfig ) :
            $(btnConfig.container);

        $container.each(function () {

          var $container = $(this);

          if ( $container.hasClass('buffer-inserted') ) return;

          $container.addClass('buffer-inserted');

          var btn = btnConfig.create(btnConfig);

          // EXT
          if ( btnConfig.after ) {
            if (typeof btnConfig.after === 'function') {
              btnConfig.after($container).after(btn);
            } else {
              $container.find(btnConfig.after).after(btn);
            }
          } else if ( btnConfig.before ) {
            $container.find(btnConfig.before).before(btn);
          } else {
            $container.append(btn);
          }

          if ( !! btnConfig.activator ) btnConfig.activator(btn, btnConfig);

          if ( !! btnConfig.lastly ) btnConfig.lastly(btn, btnConfig);

          var getData = btnConfig.data;
          var clearData = btnConfig.clear;

          var clearcb = function () {};

          $(btn).click(function (e) {
            clearcb = function () { // allow clear to be called for this button
              if ( !! clearData ) clearData(btn);
            };
            xt.port.emit("buffer_click", getData(btn));
            e.preventDefault();
          });

          xt.port.on("buffer_embed_clear", function () {
            clearcb();
            // prevent clear from being called again, until the button is clicked again
            clearcb = function () {};
          });
        });
      });
    };

    insertButtons();

    // June 2014 - Update the checking here again since most content scripts
    // only fire once onload. FB, when navigating through the site doesn't
    // "retrigger" load events so have to keep trying to add in the button. :)
    setTimeout(bufferEmbed, config.time.reload);
  };

  // Wait for xt.options to be set
  ;(function check() {
    // If facebook is switched on, add the buttons
    if( xt.options && xt.options['buffer.op.facebook'] === 'facebook') {
      bufferEmbed();
    } else {
      setTimeout(check, 50);
    }
  }());

}());
