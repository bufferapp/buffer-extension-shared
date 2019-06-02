;(function() {

  // Only run this script on twitter:
  if ( window.location.host.indexOf('twitter.com') !== 0 ) return;

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

  var config = {};
  config.time = {
    success: {
      delay: 2000
    }
  };

  var getTextFromRichtext = function(html) {
    var text;

    // Browsers have different ways of handling contenteditable divs, and the
    // underlying markup is different as a result. Blink/Webkit use divs, Firefox
    // uses brs. ps are here for legacy reasons and can be removed in a few months.
    html = html
      .replace(/<div><br><\/div>/gi, '\n')
      .replace(/<\/div>(\s?)<div>/gi, '\n$1')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br>(?!$)/gi, '\n')
      .replace(/<br>(?=$)/gi, '');

    text = $('<div>')
      .html(html)
      .find('[data-pictograph-text]')
        .replaceWith(function() {
          return $(this).attr('data-pictograph-text');
        })
        .end()
      .text();

    return text;
  };

  config.buttons = [
    {
      // The standalone tweet page after a "Tweet" button has been clicked
      name: "twitter-button",
      text: "Buffer",
      container: 'div.ft',
      after: 'input[type="submit"]',
      default: [
        'margin-left: 8px;',
        'background: #eee;',
        'background: -webkit-linear-gradient(bottom, #eee 25%, #f8f8f8 63%);',
        'background: -moz-linear-gradient(bottom, #eee 25%, #f8f8f8 63%);',
        'border: 1px solid #999;',
        'color: #444 !important;',
        'text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;'
      ].join(''),
      className: 'button',
      selector: '.button',
      style: [
        'margin-left: 8px;',
        'background: #4C9E46;',
        'background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%);',
        'background: -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%);',
        'border: 1px solid #40873B;',
        'color: white !important;',
        'text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;'
      ].join(''),
      hover: [
        'background: #40873B;',
        'background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
        'background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);'
      ].join(''),
      active: [
        'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5);',
        'background: #40873B;',
        'background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
        'background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);'
      ].join(''),
      create: function (btnConfig) {
        window.resizeTo(845,700);
        window.moveTo(screen.availWidth/2-845/2, screen.availHeight/2+700/2);

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('style', btnConfig.default);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        $(a).hover(function () {
          if( $(this).hasClass("disabled") ) {
            $(this).attr('style', btnConfig.default);
            return;
          }
          $(this).attr('style', btnConfig.style + btnConfig.hover);
        }, function() {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style);
        });

        $(a).mousedown(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style + btnConfig.active);
        });

        $(a).mouseup(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style + btnConfig.hover);
        });

        return a;

      },
      data: function (elem) {
        return {
          text: $(elem).parents('.ft').siblings('.bd').find('#status').val(),
          placement: 'twitter-tweetbutton'
        };
      },
      clear: function (elem) {
        window.close();
      },
      activator: function (elem, btnConfig) {
        var $elem = $(elem);
        var $target = $elem
            .parents('form')
            .find('textarea#status');

        $target.on('keyup focus blur change paste cut', function (e) {
          setTimeout(function() {
            var isTweetButtonDisabled = $elem.siblings('input[value=Tweet]').is(':disabled');
            $elem.toggleClass('disabled', isTweetButtonDisabled);
          }, 0);
        });
      }
    },
    {
      // The main composer in the twitter "home" page
      name: "composer",
      text: "Buffer",
      container: [ // Two containers:
        'div.tweet-button-sub-container',
        '.tweet-form:not(.dm-tweetbox):not(.RetweetDialog-tweetForm):not(.is-reply) .tweet-button'
      ].join(','),
      before: '.js-tweet-btn',
      className: 'buffer-tweet-button EdgeButton EdgeButton--primary',
      selector: '.buffer-tweet-button',
      create: function (btnConfig) {
        var button = document.createElement('button');
        button.setAttribute('class', btnConfig.className);

        var spanTweet = document.createElement('span');
        spanTweet.setAttribute('class', 'button-text tweeting-text');
        spanTweet.innerText = btnConfig.text;

        var spanReply = document.createElement('span');
        spanReply.setAttribute('class', 'button-text replying-text');
        spanReply.innerText = btnConfig.text;

        button.appendChild(spanTweet);
        button.appendChild(spanReply);

        return button;
      },
      ignore: function(container) {
        return $(container).closest('.dm-dialog').length ? true : false;
      },
      data: function (elem) {
        var html, text;
        html = $(elem)
          .parents('form')
          .find('.tweet-content .tweet-box')
          .html();

        text = getTextFromRichtext(html);

        return {
          text: text,
          placement: 'twitter-composer'
        };
      },
      clear: function (elem) {
        // Homebox
        var $content = $(elem)
            .parents('form')
            .find('.tweet-content');
        var $target = $content.find('.tweet-box');

        if($(elem).parents('.home-tweet-box').length > 0){
          // If its the home box condense the box after buffer
          $content
            .parents('form')
            .addClass('condensed');
        }

        $target.text('');

        // Modal Close
        // Closes the modal box
        $('#global-tweet-dialog .js-close').click();
      },
      activator: function (elem, btnConfig) {
        var $elem = $(elem);
        var $target = $elem
            .parents('form')
            .find('.tweet-content .tweet-box');

        $target.on('keyup focus blur change paste cut', function (e) {
          setTimeout(function() {
            var isTweetButtonDisabled = $elem.siblings('.js-tweet-btn').is(':disabled');
            $elem.toggleClass('disabled', isTweetButtonDisabled);
          }, 0);
        });
      }
    },
    {
      // The Tweet permalink page - OLD
      name: "buffer-permalink-action",
      text: "Buffer",
      container: '.permalink-tweet div.stream-item-footer .tweet-actions',
      after: '.action-fav-container',
      default: '',
      className: 'buffer-action',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var li = document.createElement('li');
        li.className = "action-buffer-container";

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className + " with-icn");
        a.setAttribute('href', '#');

        var i = document.createElement('i');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        var b = document.createElement('b');
        $(b).text(btnConfig.text);

        $(a).append(b);

        $(li).append(a);

        return li;


      },
      data: function (elem) {
        var $tweet = $(elem).closest('.tweet');
        // Grab the tweet text
        var $text = $tweet.find('.js-tweet-text').first();
        var username = $tweet.find('.username').first().text().trim();
        // Build the RT text
        var rt = getFullTweetText($text, username);

        // Send back the data
        return {
          text: rt,
          placement: 'twitter-permalink',
          retweeted_tweet_id: $tweet.attr('data-item-id'),
          retweeted_user_id: $tweet.data('user-id'),
          retweeted_user_name: $tweet.data('screen-name'),
          retweeted_user_display_name: $tweet.data('name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {

        if( $(elem).closest('.in-reply-to').length > 0 ) {
          $(elem).find('i').css({'background-position-y': '-30px'});
        }

      }
    },
    {
      // October 2014 permalink page update
      //REVIEW - Refactor to share code with the new OCT 2014 stream item below
      name: "buffer-permalink-action-OCT-2014",
      text: "Add to Buffer",
      // NOTE - Possibly switch from permalink one day
      // NOTE - to avoid injection into AUG 2015 stream (see below)
      container: '.permalink .js-actionable-tweet .js-actions:not(.ProfileTweet-actionList--withCircle, .ProfileTweet-actionList)',
      after: '.js-toggleRt',
      default: '',
      className: 'ProfileTweet-action js-tooltip',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var div = document.createElement('div');
        div.className = "action-buffer-container";
        // Normal is 10px, this adds space for display: inline-block hidden space
        // div.style.marginLeft = '12px';

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        a.setAttribute('data-original-title', btnConfig.text); // Tooltip text

        var i = document.createElement('span');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        $(div).append(a);

        return div;
      },
      data: function (elem) {
        var $tweet = $(elem).closest('.js-actionable-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-permalink',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // October 2014 profile & home stream changes
      name: "buffer-profile-stream-OCT-2014",
      text: "Add to Buffer",
      // NOTE - to avoid injection into AUG 2015 stream (see below)
      container: '.js-stream-item .js-actions:not(.ProfileTweet-actionList--withCircle, .ProfileTweet-actionList)',
      after: '.js-toggleRt, .js-toggle-rt',
      //NOTE: .js-toggleRt is new OCT 2014
      default: '',
      className: 'ProfileTweet-action js-tooltip',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var div = document.createElement('div');
        div.className = "action-buffer-container";

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        a.setAttribute('data-original-title', btnConfig.text); // Tooltip text

        var i = document.createElement('span');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        $(div).append(a);

        return div;
      },
      data: function (elem) {

        // NOTE: .js-stream-tweet - new in OCT 2014
        var $tweet = $(elem).closest('.js-tweet, .js-stream-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-feed',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // August 2015 stream changes (circles)
      // Sept 2015 changes extended that button-based markup to all versions of twitter.com,
      // making "--withCircle" a variant of that
      name: "buffer-profile-stream-AUG-2015",
      text: "Add to Buffer",
      container:
        '.js-stream-tweet .js-actions.ProfileTweet-actionList,' +
        '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList,' +
        '.js-stream-tweet .js-actions.ProfileTweet-actionList--withCircle,' +
        '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList--withCircle'
      ,
      after: '.js-toggleRt, .js-toggle-rt',
      default: '',
      selector: '.buffer-action',
      create: function (btnConfig) {

        /* Desired DOM structure:
          <div class="ProfileTweet-action ProfileTweet-action--buffer js-toggleState">
            <button class="ProfileTweet-actionButton js-actionButton" type="button">
              <div class="IconContainer js-tooltip" data-original-title="Add to Buffer">
                <span class="Icon Icon--circleFill"></span> <!-- enabled via CSS for circle variant -->
                <span class="Icon Icon--circle"></span> <!-- enabled via CSS for circle variant -->
                <span class="Icon Icon--buffer"></span>
                <span class="u-hiddenVisually">Buffer</span>
              </div>
            </button>
          <div>
        */

        var action = document.createElement('div');
        action.className = 'ProfileTweet-action ProfileTweet-action--buffer js-toggleState';
        var button = document.createElement('button');
        button.className = 'ProfileTweet-actionButton js-actionButton';
        button.type = 'button';
        var iconCntr = document.createElement('div');
        iconCntr.className = 'IconContainer js-tooltip';
        iconCntr.setAttribute('data-original-title', btnConfig.text); // tooltip text
        var icon = document.createElement('span');
        icon.className = 'Icon Icon--buffer';
        var circle = document.createElement('span');
        circle.className = 'Icon Icon--circle';
        var circleFill = document.createElement('span');
        circleFill.className = 'Icon Icon--circleFill';
        var text = document.createElement('span');
        text.className = 'u-hiddenVisually';
        text.textContent = 'Buffer';

        iconCntr.appendChild(circleFill);
        iconCntr.appendChild(circle);
        iconCntr.appendChild(icon);
        iconCntr.appendChild(text);
        button.appendChild(iconCntr);
        action.appendChild(button);

        return action;
      },
      data: function (elem) {

        // NOTE: .js-stream-tweet - new in OCT 2014
        var $tweet = $(elem).closest('.js-tweet, .js-stream-tweet, .js-actionable-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-feed',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // 2019 "New Twitter" Timeline
      name: "buffer-profile-stream-MAY-2019",
      text: "Add to Buffer",
      container:
        "[data-testid='tweet'] > div:nth-child(2) > div:nth-child(2)"
      ,
      after: 'div:first',
      default: '',
      selector: '.buffer-action',
      create: function (btnConfig) {
        /* Desired DOM structure:
/*
        <div class="css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md">
           <div aria-haspopup="true" aria-label="18 Retweets. Retweet" role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-bztko3 r-lrvibr" data-testid="retweet">
              <div dir="ltr" class="css-901oao r-1awozwy r-1re7ezh r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">
                 <div class="css-1dbjc4n r-xoduu5">
                    <div class="css-1dbjc4n r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>
                    <svg viewBox="0 0 24 24" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                       <g>
                          <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path>
                       </g>
                    </svg>
                 </div>
                 <div class="css-1dbjc4n r-xoduu5 r-1udh08x"><span dir="auto" class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-1n0xq6e r-bcqeeo r-d3hbe1 r-1wgg2b2 r-axxi2z r-qvutc0"><span dir="auto" class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">18</span></span></div>
              </div>
           </div>
        </div>
*/
        var action = document.createElement('div');
        action.className = 'ProfileTweet-action ProfileTweet-action--buffer js-toggleState';

        var button = document.createElement('button');
        button.style.backgroundColor = 'none';
        button.style.background = "none";
        button.style.border = "none";
        button.style.marginTop = "3px";
        button.style.marginRight = "40px";
        button.style.cursor = "pointer";
        button.className = 'ProfileTweet-actionButton js-actionButton';
        button.type = 'button';

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        setAttributes(svg, {
          "viewBox" : "0 0 22 22",
          "height": "22px",
          "version": "1.1",
          "fill": "none",
        });

        var ellipseAttr = {
          "stroke-miterlimit": "20",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke": "#657786",
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
        action.appendChild(button);

        return action;
      },
      data: function (elem) {

	  	// Find the Tweet container
  	  	var $tweet = $(elem).closest('article');
        var $tweetContent = $tweet.find("[data-testid=tweet] > div:nth-child(2) > div:first");

  	  	// Fetch the single time element, from there we can grab the href from the parent to get the screen name and status id.
  	  	var $link = $tweet.find('time').parent();
  	  	var tweetStatusURL = $link.attr('href');
  	  	// result : /mjtsai/status/1131268140887883779

  	  	var statusID = tweetStatusURL.split(/\//)[3];
  	  	var screenname = tweetStatusURL.split(/\//)[1];

  	  	// Fetch the avatar src which gives us the user id...
  	  	var avatarURL = $tweet.find('img').first().attr('src');
  	  	// result: https://pbs.twimg.com/profile_images/1107099224699740160/hvMb9LQF_bigger.jpg
        var userID = avatarURL.split(/\//)[4];

  	  	// Not depending on dynamic classes, but dom structure may change often...
  	  	// Grab the display name
        var display_name = $tweetContent.find('div:first > div:first > div:first > a > div > div:first > div:first > span > span').text();
  	  	// Grab the status text...
        var text = $tweet.find('[data-testid=tweet] > div:nth-child(2) > div:first > div:nth-child(2)').text();
        // If it's a reply to a tweet, check if it contains Replying to, and grab the next div if so
        if (text) {
          if (text.includes('Replying to')) {
            text = $tweet.find('[data-testid=tweet] > div:nth-child(2) > div:first > div:nth-child(3)').text();
          }
          if (text.includes('(link:')){
            //removes the twitter link data that is hidden in the dom on twitter but still gets picked up in selector
            // (link:google.com) google.com
            text = text.replace(/ *\(link[^)]*\) */g, " ");
          }
        }

        var tweetContentLink = $tweetContent.find('div:nth-child(3) > div > div > a[role=link]');
        var tweetContentURL = tweetContentLink.attr('href');
        //if not undefined, add a space before the url. If undefined, return empty string
        if (tweetContentURL && !tweetContentURL.startsWith('/')) {
          tweetContentURL = ' ' + tweetContentURL;
        } else {
          tweetContentURL = '';
        }
  	  	// Construct the text...
        var formattedText = 'RT @' + screenname + ': ' + text.trim() + tweetContentURL;
        // Send back the data
        return {
          text: formattedText,
          placement: 'twitter-feed',
          retweeted_tweet_id:          statusID,
          retweeted_user_id:           userID,
          retweeted_user_name:         screenname,
          retweeted_user_display_name: display_name
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // 2019 "New Twitter" Individual Tweet
      name: "buffer-profile-tweet-MAY-2019",
      text: "Add to Buffer",
      container: "article[data-testid='tweetDetail'] > div:last",
      after: 'div:nth-child(2)',
      default: '',
      selector: '.buffer-action',
      create: function (btnConfig) {
        /* Desired DOM structure:
/*
        <div class="css-1dbjc4n r-1iusvr4 r-18u37iz r-16y2uox r-1h0z5md">
           <div aria-haspopup="true" aria-label="18 Retweets. Retweet" role="button" data-focusable="true" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-11cpok1 r-bztko3 r-lrvibr" data-testid="retweet">
              <div dir="ltr" class="css-901oao r-1awozwy r-1re7ezh r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-ad9z0x r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0">
                 <div class="css-1dbjc4n r-xoduu5">
                    <div class="css-1dbjc4n r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>
                    <svg viewBox="0 0 24 24" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi">
                       <g>
                          <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path>
                       </g>
                    </svg>
                 </div>
                 <div class="css-1dbjc4n r-xoduu5 r-1udh08x"><span dir="auto" class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-1n0xq6e r-bcqeeo r-d3hbe1 r-1wgg2b2 r-axxi2z r-qvutc0"><span dir="auto" class="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">18</span></span></div>
              </div>
           </div>
        </div>
*/

        var action = document.createElement('div');
        action.className = 'ProfileTweet-action ProfileTweet-action--buffer js-toggleState';

        var button = document.createElement('button');
        button.style.backgroundColor = 'none';
        button.style.background = "none";
        button.style.border = "none";
        button.style.marginTop = "12px";
        button.style.cursor = "pointer";
        button.className = 'ProfileTweet-actionButton js-actionButton';
        button.type = 'button';

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        setAttributes(svg, {
          "viewBox" : "0 0 22 22",
          "height": "22px",
          "version": "1.1",
          "fill": "none",
        });

        var ellipseAttr = {
          "stroke-miterlimit": "20",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke": "#657786",
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
        action.appendChild(button);

        return action;
      },
      data: function (elem) {

	  	// Find the Tweet container
  	  	var $tweet = $(elem).closest('article');

  	  	// Fetch the single time element, from there we can grab the href from the parent to get the screen name and status id.
  	  	var $link = $tweet.find('time').parent();
  	  	var tweetURL = document.URL;
  	  	// result : /mjtsai/status/1131268140887883779

  	  	var statusID = tweetURL.split(/\//)[5];
  	  	var screenname = tweetURL.split(/\//)[3];

  	  	// Fetch the avatar src which gives us the user id...
  	  	var avatarURL = $tweet.find('img').first().attr('src');
  	  	// result: https://pbs.twimg.com/profile_images/1107099224699740160/hvMb9LQF_bigger.jpg
  	  	var userID = avatarURL.split(/\//)[4];

  	  	// Not relying on dynamic classes, only DOM hierarchy. Still may likely change often...
  	  	// Grab the display name
        var display_name = $tweet.find('li > div > div:last > div > div:first > a > div > div:first > div:first > span > span').text();
  	  	// Grab the status text...
        var text = $tweet.find('li').next().text();
        // don't display content like link('google.com/test/test') google.com
        if (text && text.includes('(link:')){
          text = text.replace(/ *\(link[^)]*\) */g, " ");
        }
        var tweetContentLink = $tweet.find('div:nth-child(4) > div > div > a[role=link]');
        var tweetContentURL = tweetContentLink.attr('href');
        if (tweetContentURL && !tweetContentURL.startsWith('/')) {
          tweetContentURL = ' ' + tweetContentURL;
        } else {
          tweetContentURL = '';
        }
  	  	// Construct the text...
        var formattedText = 'RT @' + screenname + ': ' + text.trim() + tweetContentURL;
        // Send back the data
        return {
          text: formattedText,
          placement: 'twitter-feed',
          retweeted_tweet_id:          statusID,
          retweeted_user_id:           userID,
          retweeted_user_name:         screenname,
          retweeted_user_display_name: display_name
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // Retweet modal window
      name: "retweet",
      text: "Buffer Retweet",
      container: '.tweet-form.RetweetDialog-tweetForm .tweet-button',
      before: '.retweet-action',
      className: 'buffer-tweet-button EdgeButton EdgeButton--primary',
      selector: '.buffer-tweet-button',
      create: function (btnConfig) {
        var button = document.createElement('button');
        button.setAttribute('class', btnConfig.className);

        var spanTweet = document.createElement('span');
        spanTweet.setAttribute('class', 'button-text tweeting-text');
        spanTweet.innerText = btnConfig.text;

        var spanReply = document.createElement('span');
        spanReply.setAttribute('class', 'button-text replying-text');
        spanReply.innerText = btnConfig.text;

        button.appendChild(spanTweet);
        button.appendChild(spanReply);

        return button;
      },
      data: function (elem) {
        var $elem = $(elem);
        var $dialog = $elem.closest('.retweet-tweet-dialog, #retweet-dialog, #retweet-tweet-dialog');
        var $tweet = $dialog.find('.js-actionable-tweet').first();

        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var $text = $tweet.find('.js-tweet-text').first();
        var text = getFullTweetText($text, screenname);

        var commentHtml = $elem.closest('form.is-withComment').find('.tweet-content .tweet-box').html();
        var comment = commentHtml? getTextFromRichtext(commentHtml) : '';

        return {
          text:                        text,
          placement:                   'twitter-retweet',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name'),
          retweet_comment:             comment
        };
      },
      activator: function (elem, btnConfig) {
        var $elem = $(elem);
        var $target = $elem.closest('form').find('.tweet-content .tweet-box');

        $target.on('keyup focus blur change paste cut', function(e) {
          setTimeout(function() {
            var isTweetButtonDisabled = $elem.siblings('.retweet-action').is(':disabled');
            $elem.toggleClass('disabled', isTweetButtonDisabled);
          }, 0);
        });
      }
    }

  ];
  // Parse a tweet a return text representing it
  // NOTE: some more refactoring can be done here, e.g. taking care of
  // expanding short links in a single place
  var getFullTweetText = function($text, screenName) {
    var $clone = $text.clone();

    // Expand URLs
    $clone.find('a[data-expanded-url]').each(function() {
      this.textContent = this.getAttribute('data-expanded-url');
    });

    // Replace emotes with their unicode representation
    $clone.find('img.twitter-emoji, img.Emoji').each(function(i, el) {
      $(el).replaceWith(el.getAttribute('alt'));
    });

    // Prepend space separator to hidden links
    $clone.find('.twitter-timeline-link.u-hidden').each(function() {
      this.textContent = ' ' + this.textContent;
    });
    return 'RT @' + screenName + ': ' + $clone.text().trim() + '';
  };

  var insertButtons = function () {

    config.buttons.forEach(function(btnConfig){

      $(btnConfig.container).each(function () {

        var $container = $(this);

        if( !! btnConfig.ignore ) {
          if( btnConfig.ignore($container) ) return;
        }

        if ( $container.hasClass('buffer-inserted') ) return;

        $container.addClass('buffer-inserted');

        var btn = btnConfig.create(btnConfig);

        if (btnConfig.after) $container.find(btnConfig.after).after(btn);
        else if (btnConfig.before) $container.find(btnConfig.before).before(btn);

        if ( !! btnConfig.activator) btnConfig.activator(btn, btnConfig);

        var getData = btnConfig.data;
        var clearData = btnConfig.clear;

        var clearcb = function () {};

        $(btn).click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('disabled'))
            return;

          // allow clear to be called for this button
          clearcb = function () {
            if ( !! clearData ) clearData(btn);
          };

          xt.port.emit("buffer_click", getData(btn));
        });

        xt.port.on("buffer_embed_clear", function () {
          clearcb();
          clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
        });

      });

    });

  };

  /**
   * Remove extra buttons that are not needed or wanted
   */
  var removeExtras = function () {
    $('.replies .buffer-tweet-button').remove();
    $('.inline-reply-tweetbox .buffer-tweet-button').remove();
  };

  var twitterLoop = function twitterLoop() {
    insertButtons();
    removeExtras();
    setTimeout(twitterLoop, 500);
  };

  // Add class for css scoping, try this twice in case the scripts load strangely
  var addBufferClass = function(argument) {
    document.body.classList.add('buffer-twitter');
    setTimeout(addBufferClass, 2000);
  }

  var start = function() {
    addBufferClass();
    twitterLoop();
  };

  var setAttributes = function(el, attrs) {
    for(var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  // Wait for xt.options to be set
  ;(function check() {
    // If twitter is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.twitter'] === 'twitter') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());
}());
