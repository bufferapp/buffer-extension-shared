;(function() {

    var config = {};
    config.buttons = [
        {
            text: 'Buffer',
            container: '.item_action_bar',
            containerClassName: 'buffer-quora-button-container',
            separatorClassName: 'bullet',
            separatorText: ' &bull; ',
            className: 'buffer-quora-button',
            data: function (element)
            {

                var $parent = $(element).parents('.e_col'),
                    title,
                    link;

                // We'll be using H1 tag to detect a question page
                var $h1 = $('h1');

                // Question page
                if ($h1.length)
                {
                    // Find and sanitize a question title
                    $h1.find('div').remove();
                    title = $h1.text();

                    // If it's an answer...
                    var $author = $parent.find('.answer_user_wrapper');
                    if ($author.length)
                    {
                        title = 'Answer by ' + $author.find('a.user').text() + ' to ' + title;
                    }

                    // Just grab the current page URL, we don't need to do voodoo here
                    link = window.location.href;

                }
                // Home page feed
                else
                {
                    // Find and sanitize a question title
                    var $link_text = $parent.find('.link_text');
                    $link_text.find('div').remove();
                    $link_text.find('span').remove();
                    title = $link_text.text();

                    // If it's an answer...
                    var $author = $parent.find('.feed_item_answer_user');
                    if ($author.length)
                    {
                        title = 'Answer by ' + $author.find('a.user').text() + ' to ' + title;
                    }

                    // Prefix link with the domain URL as we only have an URI
                    link = 'https://www.quora.com' + $parent.find('a.question_link').attr('href');

                }

                return {
                    text: title,
                    url: link,
                    placement: 'quora-action-bar'
                };

            }
        }
    ];

    var createButton = function (cfg)
    {

        // Buffer link itself
        var a = document.createElement('a');
        a.setAttribute('class', cfg.className + ' share_link'); // share_link is added for styling purposes
        a.setAttribute('href', '#');
        $(a).text(cfg.text);

        // Quora style button separator
        var b = document.createElement('span');
        b.setAttribute('class', cfg.separatorClassName);
        $(b).html(cfg.separatorText);

        // Container for button and separator
        var c = document.createElement('span');
        c.setAttribute('class', cfg.containerClassName);
        $(c).append(a).append(b);

        return c;

    };

    var insertButtons = function ()
    {

        var idx,
            l=config.buttons.length;

        for (idx=0 ; idx < l; idx++)
        {

            var btnConfig = config.buttons[idx];

            $(btnConfig.container).each(function()
            {

                var container = $(this),
                    $share_link = $(container).children('a.share_link');

                // If we don't have Share link in the action bar prevent inserting Buffer button
                // This usually happens when user is not logged in
                if (!$share_link.length || $(container).hasClass('buffer-inserted'))
                {
                    return;
                }

                $(container).addClass('buffer-inserted');

                var button = createButton(btnConfig);

                // Insert Buffer button before a Share link, it's more reliable to do so
                $share_link.before(button);

                var getData = btnConfig.data;

                $(button).children('a.share_link').click(function (e)
                {
                    xt.port.emit('buffer_click', getData(button));
                    e.preventDefault();
                });

            });

        }

    };

    ;(function check()
    {
        // I was too lazy to put Quora in the options, let's assume it's turned of by default
        insertButtons();
        setInterval(insertButtons, 2000);
    }());

}());
