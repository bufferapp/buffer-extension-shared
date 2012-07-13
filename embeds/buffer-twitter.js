;(function() {

    $('head').append('<style> .tweet .action-buffer-container i, .tweet.opened-tweet .action-buffer-container i, .tweet.opened-tweet.hover .action-buffer-container i  { background-position: -3px -3px; } .tweet.hover .action-buffer-container i { background-position: -3px -21px; }');

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
    config.buttons = [
        {
            name: "composer",
            text: "Buffer",
            container: 'div.tweet-button-sub-container, div.tweet-button',
            after: '.tweet-counter',
            default: '',
            className: 'buffer-tweet-button btn disabled',
            selector: '.buffer-tweet-button',
            style: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); background: -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

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
            ignore: function(container) {
                if( $(container).closest('.dm-dialog').length > 0 ) return true;
                return false;
            },
            data: function (elem) {
                var text = $(elem).parents('.tweet-button-container').siblings('.text-area').find('.twitter-anywhere-tweet-box-editor').val() || $(elem).parents('.tweet-button').siblings('.tweet-content').find('.tweet-box').val();

                return {
                    text: text,
                    placement: 'twitter-composer'
                };
            },
            clear: function (elem) {
                $('.twitter-anywhere-tweet-box-editor').val(' ');
            },
            activator: function (elem, btnConfig) {
                var target = $(elem).parents('.tweet-button-container').siblings('.text-area').find('.twitter-anywhere-tweet-box-editor');
                if( target.length < 1) target = $(elem).parents('.tweet-button').siblings('.tweet-content').find('.tweet-box');
                $(target).on('keyup focus blur change paste cut', function (e) {
                    var val = $(this).val();
                    var counter = $(elem).siblings('.tweet-counter').text() || $(elem).siblings('.tweet-counter').val();
                    if ( val.length > 0 && counter > -1 && val !== "Compose new Tweet...") {
                        $(elem).removeClass('disabled').attr('style', btnConfig.style);
                    } else {
                        $(elem).addClass('disabled').attr('style', btnConfig.default);
                    }
                });
            }
        },
        {
            name: "retweet",
            text: "Buffer Retweet",
            container: '#retweet-tweet-dialog div.modal-footer, #retweet-dialog .twttr-prompt',
            after: '.cancel-action, .js-prompt-ok',
            className: 'buffer-tweet-button btn',
            selector: '.buffer-tweet-button',
            default: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            style: 'background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px; font-weight: bold;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 8px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

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
                var c = $(elem).closest('.retweet-tweet-dialog, #retweet-dialog');
                return {
                    text: 'RT @' + c.find('.stream-item-header .username, .twttr-reply-screenname').text().trim() + ': ' + c.find('.js-tweet-text').text().trim() + '',
                    placement: 'twitter-retweet'
                }
            }   
        },
        {
            name: "twitter-button",
            text: "Buffer",
            container: 'div.ft',
            after: '#char-count',
            default: 'margin-right: 8px; background: #eee; background: -webkit-linear-gradient(bottom, #eee 25%, #f8f8f8 63%); background: -moz-linear-gradient(bottom, #eee 25%, #f8f8f8 63%); border: 1px solid #999; color: #444 !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;',
            className: 'button',
            selector: '.button',
            style: 'margin-right: 8px; background: #4C9E46; background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); background: -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%); border: 1px solid #40873B; color: white !important; text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;',
            hover: 'background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            active: 'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5); background: #40873B; background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%); background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
            create: function (btnConfig) {

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
                var target = $(elem).parents('.ft').siblings('.bd').find('#status');
                var activate = function () {
                    var val = $(target).val();
                    var counter = $(elem).siblings('#char-count').val();
                    if ( val.length > 0 && counter > -1) {
                        $(elem).removeClass('disabled').attr('style', btnConfig.style);
                    } else {
                        $(elem).addClass('disabled').attr('style', btnConfig.default);
                    }
                };
                $(target).on('keyup focus blur change paste cut', function (e) {
                    activate();
                });
                activate();
            }
        },
        {
            name: "buffer-permalink-action",
            text: "Buffer",
            container: '.permalink div.stream-item-footer .tweet-actions',
            after: '.action-fav-container',
            default: '',
            className: 'buffer-action',
            selector: '.buffer-action',
            style: '',
            hover: '',
            active: '',
            create: function (btnConfig) {

                var li = document.createElement('li');
                li.className = "action-buffer-container";

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className + " with-icn");
                a.setAttribute('href', '#');

                var i = document.createElement('i');
                i.setAttribute('class', 'sm-embed'); // let Twitter set the bg color
                i.setAttribute('style', 'top: -2px; position: relative; margin-right: 4px; width: 16px; height: 16px; background-image: url(' + xt.data.get('data/shared/img/twttr-sprite.png') + ')!important; background-repeat: no-repeat; background-position: -5px -5px;');

                $(a).append(i);

                var b = document.createElement('b');
                $(b).text(btnConfig.text);

                $(a).append(b);

                $(li).append(a);

                return li;


            },
            data: function (elem) {
                var c = $(elem).closest('.tweet');
                // Grab the tweet text
                var text = c.find('.js-tweet-text').first();
                // Iterate through all links in the text
                $(text).children('a').each(function () {
                    // Don't modify the screenames and the hastags
                    if( $(this).attr('data-screen-name') ) return;
                    if( $(this).hasClass('twitter-atreply') ) return;
                    if( $(this).hasClass('twitter-hashtag') ) return;
                    // swap the text with the actual link
                    var original = $(this).text();
                    $(this).text($(this).attr("href")).attr('data-original-text', original);
                });
                // Build the RT text
                var rt = 'RT ' + c.find('.username').first().text().trim() + ': ' + $(text).text() + '';
                // Put the right links back
                $(text).children('a').each(function () {
                    if( ! $(this).attr('data-original-text') ) return;
                    $(this).text($(this).attr('data-original-text'));
                });
                // Send back the data
                return {
                    text: rt,
                    placement: 'twitter-permalink'
                }
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
            name: "buffer-action",
            text: "Buffer",
            container: '.stream div.stream-item-footer .tweet-actions',
            after: '.action-fav-container',
            default: '',
            className: 'buffer-action',
            selector: '.buffer-action',
            style: '',
            hover: '',
            active: '',
            create: function (btnConfig) {

                var li = document.createElement('li');
                li.className = "action-buffer-container";

                var a = document.createElement('a');
                a.setAttribute('class', btnConfig.className + " with-icn");
                a.setAttribute('href', '#')

                var i = document.createElement('i');
                i.setAttribute('class', 'sm-embed'); // let Twitter set the bg colors
                i.setAttribute('style', 'position: relative; top: 0px; margin-right: 4px; width: 13px; height: 13px; background-image: url(' + xt.data.get('data/shared/img/twttr-sprite-small.png') + ')!important; background-repeat: no-repeat;');

                $(a).append(i);

                var b = document.createElement('b');
                $(b).text(btnConfig.text);

                $(a).append(b);

                $(li).append(a);

                return li;


            },
            data: function (elem) {
                var c = $(elem).closest('.tweet');
                // Grab the tweet text
                var text = c.find('.js-tweet-text').first();
                // Iterate through all links in the text
                $(text).children('a').each(function () {
                    // Don't modify the screenames and the hastags
                    if( $(this).attr('data-screen-name') ) return;
                    if( $(this).hasClass('twitter-atreply') ) return;
                    if( $(this).hasClass('twitter-hashtag') ) return;
                    // swap the text with the actual link
                    var original = $(this).text();
                    $(this).text($(this).attr("href")).attr('data-original-text', original);
                });
                // Build the RT text
                var rt = 'RT ' + c.find('.username').first().text().trim() + ': ' + $(text).text() + '';
                // Put the right links back
                $(text).children('a').each(function () {
                    if( ! $(this).attr('data-original-text') ) return;
                    $(this).text($(this).attr('data-original-text'));
                });
                // Send back the data
                return {
                    text: rt,
                    placement: 'twitter-feed'
                };
            },
            clear: function (elem) {
            },
            activator: function (elem, btnConfig) {

                if( $(elem).closest('.in-reply-to').length > 0 ) {
                    $(elem).find('i').css({'background-position-y': '-21px'});
                }
            }
        }
    ];

    var insertButtons = function () {

        var i, l=config.buttons.length;
        for ( i=0 ; i < l; i++ ) {

            var btnConfig = config.buttons[i];
            
            $(btnConfig.container).each(function () {
                
                var container = $(this);
                
                if( !! btnConfig.ignore ) {
                    if( btnConfig.ignore(container) ) return;
                }
                
                if ( $(container).hasClass('buffer-inserted') ) return;

                $(container).addClass('buffer-inserted');

                var btn = btnConfig.create(btnConfig);

                $(container).find(btnConfig.after).after(btn);

                if ( !! btnConfig.activator) btnConfig.activator(btn, btnConfig);
                
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
                    clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
                });
                
            });

        }

    };

    var twitterLoop = function bufferTwitter() {
        insertButtons();
        setTimeout(bufferTwitter, 500);
    };

    // Wait for xt.options to be set
    ;(function check() {
        // If twitter is switched on, start the main loop
        if( xt.options && xt.options['buffer.op.twitter'] === 'twitter') {
            twitterLoop();
        } else {
            setTimeout(check, 50);
        }
    }());
    


    
}());