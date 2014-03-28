;(function() {
    
    var config = {};
    config.base = "https://moz.com/blog",
    config.buttons = [
        {
            text: "Add to Buffer",
            container: 'span.comment-count',
            className: 'buffer-moz-button',
            selector: '.buffer-moz-button',
            data: function (elem) {
                var article = $(elem).parents().children('.media-body').children('header').find('h1').children('a');
                var title = $(article).text().trim();
                var link = $(article).attr('href').trim();
                
                return {
                    text: title,
                    url: link,
					placement: 'moz-add'
              };
            }
        }
    ];
    
    var createButton = function (btnConfig) {

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        return a;

    };

    var insertButtons = function () {

        var i, l=config.buttons.length;
        for ( i=0 ; i < l; i++ ) {

            var btnConfig = config.buttons[i];
            
            $(btnConfig.container).each(function () {
                
                var container = $(this);
                
                if ( $(container).hasClass('buffer-inserted') ) return;

                $(container).addClass('buffer-inserted');

                var btn = createButton(btnConfig);

                $(container).append(btn);
                
                $(btn).before(' | ');
                
                var getData = btnConfig.data;

                $(btn).click(function (e) {
                    xt.port.emit("buffer_click", getData(btn));
                    e.preventDefault();
                });
                
            });

        }

    };
    
    // Wait for xt.options to be set
    ;(function check() {
        // If moz is switched on, add the buttons
        if( xt.options && xt.options['buffer.op.moz'] === 'moz') {
            insertButtons();
        } else {
            setTimeout(check, 2000);
        }
    }());

}());