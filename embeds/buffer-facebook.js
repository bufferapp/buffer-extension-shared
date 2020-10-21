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
      'div[data-testid="Keycommand_wrapper_feed_story"]',
      '.genericStreamStory',
      '.fbTimelineUnit',
      '.UIStandardFrame_Content',
      '.fbPhotoSnowlift',
      '.userContentWrapper',
      '.timelineUnitContainer',
      '.tickerDialogContent > .commentable_item', // target the ticker posts' contents - 11/18/15
      '.fbUserContent',
      '.fbUserPost',
      '.fbUserStory',
      'div[role="article"]'
    ].join(', '),

    via: [
      '.passiveName',
      '.actorName',
      '.unitHeader',
      '#fbPhotoPageAuthorName a',
      'oajrlxb2',
    ].join(', '),

    // .tlTxFe is used on new timeline
    text: [
      'div[data-ad-comet-preview="message"]',
      'div[data-ad-preview="message"]',
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
      '.spotlight',
      'pmk7jnqg',
    ].join(', '),

    videoThumb: 'video ~ div > img',

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
      '._52c6:not(.UFIContainer ._52c6)',
    ].join(', '),

    // A backup, slower selector logic
    anchorSecondary: 'a[target="_blank"]:not([data-appname]):not(.userContent a):not(.UFIContainer a):not([data-tooltip-content])'

  };

  function getClosestShareData(elem) {
    var parent = $(elem).closest(selectors.timelineItem);

    // reset share object on every 'share' button click
    var share = {};

    // find the name of the person that shared the attachment
    share.via = $(selectors.via, parent).first().text();

    // find the message for this attachment, or if none use the attachment caption
    share.text = $(selectors.text, parent).first().clone().find('br').replaceWith('\n').end().text();

    var $thumb = $(selectors.thumb, parent).first();
    var image;

    // Make sure retrieved images are part of the post, not comments below
    if (!$thumb.closest('.UFIContainer').length) {
      var $fullSizeThumbHolder = $thumb.closest('a');
      var $fullSizeThumbMatches = /(?:;|&)src=([^&]+)&/i.exec($fullSizeThumbHolder.attr('ajaxify'));
      var $fullSizeThumb = $fullSizeThumbMatches && $fullSizeThumbMatches[1] && decodeURIComponent($fullSizeThumbMatches[1]);

      if ($fullSizeThumb) image = $fullSizeThumb; // Give priority to largest image if found
        else image = $thumb.attr('src');
    }

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

    // The link to the video in video posts can change a bit between regular video
    // posts, "X liked Y's video", and "X shared Y's video". Since there's no reliable
    // enough way to get the video link based on class names / other DOM cues, we're
    // fetching it by going over all the post's links.
    // Facebook video links can look like 'facebook.com/username/videos/0123456789/'
    // and 'facebook.com/video.php?v=0123456789'
    } else if ($videoThumb.length) {
      var $postLinks = parent.find('a');
      var videoLinkRegex = /(?:\/videos\/\d+\/)|(?:\/video\.php\?v=\d+)/i;
      var videoLink;

      $postLinks.each(function() {
        var href = $(this).attr('href') || '';
        if (videoLinkRegex.test(href)) videoLink = href;
      });

      if (videoLink) share.url = videoLink;
      if (share.url && share.url[0] == '/') share.url = 'https://facebook.com' + share.url;

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

    // Sometimes, href attributes are dynamically updated by Facebook, so we
    // have to extract the url from a string that looks like "https://www.facebook.
    // com/l.php?u=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DBF9TjbdJyUE&h=aAQ[…]"
    if (share.url && share.url.indexOf('facebook.com/l.php?') > -1) {
      var urlMatches = share.url.match(/u=([^&]+)/i); // Capture url inside the u= param
      if (urlMatches) share.url = decodeURIComponent(urlMatches[1]);
    }

    console.log(share);

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
      container: function() {
        // Selector for composer in main dashboard + fb profile
        var $container = $('.composerAudienceWrapper').first().parent().parent();
        // Selector for composer in fb page
        if ($container.length === 0) $container = $('#PageComposerPagelet_ button').last().closest('span').children('div').first();

        if ($container.has('> button')) return $container;
          else return $();
      },
      before: '> button',
      className: 'buffer-facebook-button',
      selector: '.buffer-facebook-button',
      default: [
        'width: 15px;',
        'height: 20px;',
        'display: inline-block;',
        'vertical-align: middle;',
        'background: transparent;',
        'background-image: url("https://d389zggrogs7qo.cloudfront.net/images/app/buffer-menu-icon-new@2x.png");',
        'background-size: 39px 19px;',
        'background-position: -22px 1px;',
        'top: -1px;',
        'position: relative;',
        'margin-right: 10px;'
      ].join(''),
      hover: 'text-decoration: none !important;',
      create: function (btnConfig) {
        var button = document.createElement('a');

        button.setAttribute('style', btnConfig.default);
        button.setAttribute('class', 'buffer-facebook-button');
        button.setAttribute('href', '#');
        button.textContent = btnConfig.text;

        return button;
      },
      data: function (elem) {
        var contenteditable =
          $(elem)
            .closest('#pagelet_composer, #PageComposerPagelet_, .fbTimelineComposerUnit')
            .find('[contenteditable]')[0];
        // innerText is prefered for its ability to include line breaks; will fallback to
        // textContent, that doesn't support line breaks, in Firefox < 45
        var text = contenteditable.innerText || contenteditable.textContent;

        return {
          text: $.trim(text) || " ",
          placement: 'facebook-composer'
        };
      },
      clear: function (elem) {
        $(elem).parents('form').find('textarea.textInput').val('');
      }
    },
    {
      // Buffer link under timeline post content: Like · Comment · Share · Buffer
      // New newsfeed UI (May 2019)
      name: 'timeline-post-buffer-new-ui',
      text: 'Buffer',
      container: '.commentable_item',
      after: function($container) {
        var shareBtn = $container.find('a[role="button"]').last().closest('span').parent('span');
        if ($(shareBtn).length) {
          return shareBtn;
        } else {
          return $container.find('._18vi').last();
        }
      },
      default: [
        'color: #606770',
        'font-size: 13px',
        'font-weight: 600',
        "font-family: system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif",
        "margin-left: -16px"
      ].join(';'),
      create: function(btnConfig) {
        var span = document.createElement('span');
        var button = document.createElement('a');

        button.setAttribute('style', btnConfig.default);
        button.setAttribute('class', 'buffer-facebook-newsfeed-post-embed new-ui');
        button.setAttribute('href', '#');
        button.textContent = btnConfig.text;

        span.setAttribute('class', '_18vi');

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

    },
    {
      // Buffer Button under Posts : Like · Comment · Share · Buffer
      // New Facebook UI (2020)
      name: 'new-experience-2020-share-buffer',
      text: 'Buffer',
      container: 'div[role="article"]',
      after: function($container) {
        var shareContainer = $container.find('div[aria-label="Leave a comment"]').parent('span');
        return shareContainer;
      },
      default: [
      ].join(';'),
      create: function(btnConfig) {
        var span = document.createElement('span');
        var button = document.createElement('div');

        button.setAttribute('style', btnConfig.default);
        button.setAttribute('class', 'oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv n05y2jgg hbms080z p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h vul9dhcy f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l f49446kz  _666h  _18vj');//_18vk
        button.setAttribute('role', 'button');
        button.setAttribute('href', '#');

        // Match the Facebook Style by adding the Buffer Icon...
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.marginRight = 5;
        setAttributes(svg, {
          "viewBox" : "0 0 22 22",
          "height": "22px",
          "version": "1.1",
          "fill": "none",
        });

        var ellipseAttr = {
          "stroke-miterlimit": "40",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke": "#a1a4aa",
        };

        var ellipse = document.createElementNS("http://www.w3.org/2000/svg", "path");
        ellipseAttr.d = "M1.28205 5.33333L9.84615 9.46154C9.94872 9.51282 10.0513 9.51282 10.1538 9.46154L18.7179 5.33333C19 5.20513 19 4.82051 18.7179 4.69231L10.1538 0.538462C10.0513 0.487179 9.94872 0.487179 9.84615 0.538462L1.28205 4.66667C1 4.79487 1 5.20513 1.28205 5.33333Z";
        setAttributes(ellipse, ellipseAttr);
        svg.appendChild(ellipse);

        var ellipse2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        ellipseAttr.d = "M1.28205 10.3333L9.84615 14.4615C9.94872 14.5128 10.0513 14.5128 10.1538 14.4615L18.7179 10.3333C19 10.2051 19 9.82051 18.7179 9.6923L16.9231 8.82051L11.1795 11.5641C10.8205 11.7436 10.4103 11.8205 10 11.8205C9.58974 11.8205 9.17949 11.7179 8.82051 11.5641L3.07692 8.79487L1.28205 9.66666C1 9.79487 1 10.2051 1.28205 10.3333Z";
        setAttributes(ellipse2, ellipseAttr);
        svg.appendChild(ellipse2);

        var ellipse3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        ellipseAttr.d = "M18.7179 14.6667L16.9231 13.7949L11.1795 16.5641C10.8205 16.7436 10.4103 16.8205 10 16.8205C9.58974 16.8205 9.17949 16.7179 8.82051 16.5641L3.07692 13.7949L1.28205 14.6667C1 14.7949 1 15.1795 1.28205 15.3077L9.84615 19.4359C9.94872 19.4872 10.0513 19.4872 10.1538 19.4359L18.7179 15.3333C19 15.2051 19 14.7949 18.7179 14.6667Z";
        setAttributes(ellipse3, ellipseAttr)
        svg.appendChild(ellipse3);

        button.appendChild(svg);

        var title = document.createElement("b");
        title.innerText = "Buffer";
        button.appendChild(title);

        span.setAttribute('class', '_18vi');

        span.appendChild(button);

        return span;
      },
      data: function (elem) {
        var $elem = $(elem);

        // There are sometimes "See More" buttons in a post. This was an attempt to tap that button and then share once completed however /add is opened before this is completed and share data is set.
//         if($elem.parents('div[role="article"]').find('div[data-ad-comet-preview="message"]').find('div[role="button"]').length){
//           $elem.parents('div[role="article"]').find('div[data-ad-comet-preview="message"]').find('div[role="button"]').click();
//
//           $(this).delay(500).queue(function() {
//             share = getClosestShareData(elem);
//             return share
//           });
//         } else {
//           share = getClosestShareData(elem);
//           return share
//         }

        share = getClosestShareData(elem);
        return share
      },
      clear: function() {
        share = {};
      }
    }
  ];

  var bufferEmbed = function bufferEmbed() {

    var insertButtons = function () {

      config.buttons.forEach(function(btnConfig, i) {
        // Container can be a selector or a function that returns a
        // jQuery object
        var $container = typeof btnConfig.container === 'function' ?
            btnConfig.container( btnConfig ) :
            $(btnConfig.container);

        $container.each(function () {
          var $container = $(this);

          var bufferButtonAlreadyInserted = $container.hasClass('buffer-inserted');
          if (bufferButtonAlreadyInserted) {
            return;
          }

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

  var setAttributes = function(el, attrs) {
    for(var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

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