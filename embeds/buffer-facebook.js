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
        var parent = $(this).closest('.genericStreamStory, .fbTimelineUnit, .UIStandardFrame_Content, .fbPhotoSnowlift');

        // reset share object on every 'share' button click
        share = {};

        // find the name of the person that shared the attachment
        share.via = $('.passiveName, .actorName, .unitHeader, #fbPhotoPageAuthorName a', parent).first().text();

        // find the message for this attachment, or if none use the attachment caption
        // .tlTxFe is used on new timeline
        share.text = $('.messageBody, .tlTxFe, .caption, .fbPhotosPhotoCaption', parent).first().text();

        var thumb = $('.uiPhotoThumb img, .photoUnit img, .fbPhotoImage, .spotlight', parent).attr('src');
        var url = $('a.shareMediaLink, .uiAttachmentTitle a, a.externalShareUnit', parent).attr('href');

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
            if(image){
                image = image.src.replace(/c([0-9]+\.)+[0-9]+\//, '');
                share.picture = image.replace(/[sp][0-9]+x[0-9]+\//, '');

                var anchor = context.find('a._5pc0._5dec')[0];
                if(anchor) share.url = anchor.href;
            }
            else{
                var anchor = context.find('a._5rwn')[0];
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
            text: "Buffer",
            container: '#pagelet_composer > div > div > form > div > div + div + div > div',
            after: 'ul.uiList > li:first',
            className: 'buffer-facebook-button',
            selector: '.buffer-facebook-button',
            elements:
                    ['li', 'pls uiList uiListHorizontalItemBorder uiListHorizontalItem', '',
                        ['label', '', '',
                            ['a', 'buffer-facebook-button']
                        ]
                    ],
            default: 'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
            style:   'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 10px;margin-top: 0px;display: block;',
            hover:   'background: hsl(116, 39%, 42%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); text-decoration: none;',
            active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
            create: function (btnConfig) {
                var temp = buildElement(btnConfig.elements);
                
                var a = $(temp).find(btnConfig.selector)[0];
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

                return temp;
                
            },
            data: function (elem) {
                return {
                    text: $(elem).parents('form').find('textarea.textInput').val(),
                    placement: 'facebook-composer'
                }
            },
            clear: function (elem) {
                $(elem).parents('form').find('textarea.textInput').val('');
            }
        },
        {
            name: "share",
            text: "Buffer",
            container: 'form[action="/ajax/sharer/submit/"] div.uiOverlayFooter',
            before: '.layerConfirm',
            className: 'buffer-facebook-button',
            selector: '.buffer-facebook-button',
            elements: ['a', 'buffer-facebook-button uiOverlayButton uiButton uiButtonLarge'],
            default: 'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 6px 1px; margin-right:5px;',
            style:   'background: hsl(116, 39%, 45%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 45%) 95%, hsl(116, 39%, 60%) 96%); border: 1px solid #40873B; color: white !important;padding: 3px 6px 1px; margin-right:5px;',
            hover:   'background: hsl(116, 39%, 42%); background: -webkit-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); background: -moz-linear-gradient(bottom, hsl(116, 39%, 42%) 95%, hsl(116, 39%, 55%) 96%); text-decoration: none;',
            active:  'background: hsl(116, 39%, 40%); text-decoration: none;',
            create: function (btnConfig) {
                
                var temp = buildElement(btnConfig.elements);    
                
                var a = $(temp).find(btnConfig.selector)[0];
                if( ! a ) a = temp; // EXT
                a.setAttribute('style', btnConfig.default);
                a.setAttribute('href', '#');
                $(a).text(btnConfig.text); // EXT

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

                return temp;
                
            },
            data: function (elem) {
                // This occurs when the item is shared from the main news feed and/or no share data is/was found. So now we try
                // and grab from the data from the FB share modal instead.
                if(getDataFromModal){

                    var $parent = $(elem).parents('.uiOverlayFooter').parent().parent().find('.mentionsTextarea');
                    var text = $parent.val();
                    if( text === "Write something..." ) text = undefined;
                    if( text ) share.text = text;

                    var photoshare = $('.UIShareStage_Image img').attr('src');
                    var thumb = $('input[name="attachment[params][images][0]');
                    
                    //console.log("PHOTOSHARE", photoshare);
                    //console.log("THUMB", thumb);

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
                    var $parent = $(elem).parents('.uiOverlayFooter').parent().parent().find('.mentionsTextarea');

                    // if the user has written a message, allow this to override the default text
                    
                    var text = $parent.val();
                    if( text === "Write something..." ) text = undefined;
                    if( text ) share.text = text;
                }

                // fallback placement when we don't know if the attachment is a picture, link or status
                if( !share.placement ) share.placement = 'facebook-share';
                console.log("Share:", share);
                return share;
            },
            clear: function (elem) {
                share = {};
            }
        }
    ];

    var bufferEmbed = function bufferEmbed() {

        var insertButtons = function () {

            var i, l=config.buttons.length;
            for ( i=0 ; i < l; i++ ) {

                var btnConfig = config.buttons[i];
                
                $(btnConfig.container).each(function () {
                    
                    var container = $(this);
                    
                    if ( $(container).hasClass('buffer-inserted') ) return;

                    $(container).addClass('buffer-inserted');

                    var btn = btnConfig.create(btnConfig);

                    // EXT
                    if ( btnConfig.after ) $(container).find(btnConfig.after).after(btn);
                    else if ( btnConfig.before ) $(container).find(btnConfig.before).before(btn);
                    else $(container).append(btn);

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