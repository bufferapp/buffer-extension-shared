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
    var getDataFromModal = false;
    $('body').on('click', 'a.share_action_link, a:contains("Share")', function (e) {
        var parent = $(this).closest('.genericStreamStory, .fbTimelineUnit, .UIStandardFrame_Content, .fbPhotoSnowlift, .userContentWrapper');
        // Notes:
        //   .userContentWrapper - new FB news feed, 3/2014

        // reset share object on every 'share' button click
        share = {};

        // find the name of the person that shared the attachment
        share.via = $('.passiveName, .actorName, .unitHeader, #fbPhotoPageAuthorName a', parent).first().text();

        // find the message for this attachment, or if none use the attachment caption
        // .tlTxFe is used on new timeline
        share.text = $('.messageBody, .tlTxFe, .caption, .fbPhotosPhotoCaption', parent).first().text();

        var thumb = $('.uiPhotoThumb img, .photoUnit img, .fbPhotoImage, .spotlight', parent).attr('src');
        var $anchor = $('a.shareMediaLink, .uiAttachmentTitle a, a.externalShareUnit, a.shareLink, .shareLink a:not([href="#"]), ._52c6', parent);
        // Notes: 
        //   a.shareLink - page timelines, 3/2014
        //   .shareLink a:not([href="#"]) - small embeds on user timeline, ex. YouTube, 3/2014
        //   ._52c6 - new newsfeed links, 3/2014

        // If we can't find it, try this alternate, slower search looking for external links
        if ($anchor.length === 0) {
            // We exclude the update's written text that may contain possible links = .userContent
            // and we exclude any possible links to an app that was used to post this, ex. Buffer
            $anchor = $('div:not(.userContent) a[target="_blank"]:not([data-appname])', parent);
        }

        var url = $anchor.attr('href');


        // find picture status
        if( thumb ) {
            // convert the thumbnail link to a link to the fullsize image
            thumb = thumb.replace(/c([0-9]+\.)+[0-9]+\//, '');
            share.picture = thumb.replace(/[sp][0-9]+x[0-9]+\//, '');

            // find a link to the photo within facebook
            share.url = $('a.uiPhotoThumb, a.photo', parent).attr('href');

            // if sharing from an album, share.url will not be set, so
            // we grab the page url
            if( ! share.url ) {
                share.url = document.location.toString();
            }

            share.placement = 'facebook-share-picture';
        }

        // find link status
        else if (url) {
            if( url[0] == "/" ) url = "https://facebook.com" + url;
            share.url = url;
            share.placement = 'facebook-share-link';
        }
        
        // standard text status
        else {
            share.placement = 'facebook-share-status';
        }

        // Woops we failed in getting the data we needed because FB has changed or this is the main feed.
        // Now we just try and grab the url/photo because this needs to be fetched from here.
        // After this we use the modal's data when pressing the "Buffer" button. It's bit more reliable source of info

        if(JSON.stringify(share)=='{"via":"","text":"","placement":"facebook-share-status"}'){
            var context = $(e.currentTarget).parents('._5pax');

            var image = context.find('img._46-i')[0];
            var anchor;
            if(image){
                image = image.src.replace(/c([0-9]+\.)+[0-9]+\//, '');
                share.picture = image.replace(/[sp][0-9]+x[0-9]+\//, '');

                anchor = context.find('a._5pc0._5dec')[0];
                if(anchor) share.url = anchor.href;
            }
            else {
                anchor = context.find('a._5rwn')[0];
                if(anchor) share.url = anchor.href;
            }

            getDataFromModal = true;
        }

    });
    
    var config = {};
    config.base = "https://facebook.com";
    config.time = {
        reload: 800
    };
    config.buttons = [
        {
            name: "status",
            text: "B",
            container: function(btnConfig){
                var $container;

                // On the news feed, FB uses pagelet_composer, on other timeline
                // views it's harder to determine
                var $forms = $('#pagelet_composer form');
                if (!$forms.length) $forms = $('form');

                $forms.each(function(i, j){
                    if (j.action && j.action.indexOf('updatestatus') > -1) {
                        $container = $(j);
                    }
                });

                return $container || $forms.last();
            },
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
                'display: inline-block;',
                'vertical-align: middle;',
                'padding: 0 12px;',
                'line-height: 22px;',
                'background: hsl(116, 39%, 45%);',
                'border: 1px solid #40873B;',
                'border-color: #45963F #45963F #40873B;',
                'border-radius: 2px;',
                'color: white !important;',
                'text-shadow: rgba(0, 0, 0, 0.2) 0px -1px 0px;',
                'font-size: 12px;',
                'font-family: Helvetica, Arial, "lucida grande",tahoma,verdana,arial,sans-serif;',
                '-webkit-font-smoothing: antialiased;',
                'text-decoration: none !important;'
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
        /* Disabled May 2014 as this doesn't create a native share on facebook,
           it creates a new post from that user. This is planned to eliminate
           user confusion until 
        {
            name: "share",
            text: "Buffer",
            container: 'form[action="/ajax/sharer/submit/"] div.uiOverlayFooter',
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
                if(getDataFromModal){

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

            var i, l=config.buttons.length;
            for ( i=0 ; i < l; i++ ) {

                var btnConfig = config.buttons[i];

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
                    if ( btnConfig.after ) $container.find(btnConfig.after).after(btn);
                    else if ( btnConfig.before ) $container.find(btnConfig.before).before(btn);
                    else $container.append(btn);

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
                        clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
                    });
                });  
            }
        };

        insertButtons();
        
        // June 2014 - Update the checking here again since most content scripts only fire once onload. FB, when navigating through
        // the site doesn't "retrigger" load events so have to keep trying to add in the button. :)
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