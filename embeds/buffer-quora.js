;(function() {

  var config = {};
  config.buttons = [
    {
      text: 'Buffer',
      container: '.item_action_bar',
      after: '.share_link',
      before: '.downvote',
      containerClassName: 'buffer-quora-button-container',
      separatorClassName: 'bullet',
      separatorText: ' &bull; ',
      className: 'buffer-quora-button',
      data: function (element) {

        var $parent = $(element).parents('.e_col'),
          $author,
          title,
          link;

        // We'll be using H1 tag to detect a question page
        var $h1 = $('h1');

        // Question page
        if ($h1.length) {
          // Find and sanitize a question title
          $h1.find('div').remove();
          title = $h1.text();

          // If it's an answer...
          $author = $parent.find('.answer_user_wrapper');
          if ($author.length) {
            title = 'Answer by ' + $author.find('a.user').text() + ' to ' + title;
          }

          // Just grab the current page URL, we don't need to do voodoo here
          link = window.location.href;

        // Home page feed
        } else {

          // Find and sanitize a question title
          var $link_text = $parent.find('.link_text');
          $link_text.find('div').remove();
          $link_text.find('span').remove();
          title = $link_text.text();

          // If it's an answer...
          $author = $parent.find('.feed_item_answer_user');
          if ($author.length) {
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

  var createButton = function (cfg) {

    // Buffer link itself
    var a = document.createElement('a');
    // share_link is added for styling purposes
    a.setAttribute('class', cfg.className + ' share_link');
    a.setAttribute('href', '#');
    $(a).text(cfg.text);

    // Quora style button separator
    var bullet = document.createElement('span');
    bullet.setAttribute('class', cfg.separatorClassName);
    $(bullet).html(cfg.separatorText);

    // Container for button and separator
    var c = document.createElement('span');
    c.setAttribute('class', cfg.containerClassName);
    $(c).append(bullet).append(a);

    return c;
  };

  var insertButtons = function () {

    config.buttons.forEach(function(btnConfig, i){

      $(btnConfig.container).each(function(){

        var $container = $(this);

        // If we don't have Share link in the action bar prevent inserting Buffer button
        // This usually happens when user is not logged in
        if ($container.hasClass('buffer-inserted')) {
          return;
        }

        var button = createButton(btnConfig);

        var getData = btnConfig.data;

        $(button).children('a.share_link').on('click', function (e) {
          xt.port.emit('buffer_click', getData(button));
          e.preventDefault();
        });

        $container.addClass('buffer-inserted');

        // We check for the share count
        var hasShareCount = !!$container.find('.repost_count_link').length;
        if (!hasShareCount) {
          $container.find(btnConfig.after).after(button);
          return;
        }

        // If it has the Downvote, we insert before that element's 
        // previous element
        var $before = $container.find(btnConfig.before);

        if ($before.length) {
          $before.prev().before(button);
          return;
        }

        $container.append(button);
      });

    });

    setTimeout(insertButtons, 800);
  };

  ;(function check(){
    if( xt.options && xt.options['buffer.op.quora'] === 'quora') {
      insertButtons();
    } else {
      setTimeout(check, 50);
    }
  }());

}());
