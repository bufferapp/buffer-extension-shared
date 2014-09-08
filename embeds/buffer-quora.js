;(function() {

  // Only run this script on Quora:
  if ( window.location.host.indexOf('quora.com') === -1 ) return;

  var config = {};
  config.buttons = [
    {
      text: 'Buffer',
      container: '.ActionBar',
      before: '.share_link',
      containerClassName: 'action_item',
      data: function (element) {

        var title, link, placement, $parent, $author;

        var $title = $('h1:not(.header_logo)').clone();
        var isQuestionPage = !!$title.length;

        // Question page
        if (isQuestionPage) {

          $parent = $(element).parents('.Answer');
          $author = $parent.find('.feed_item_answer_user a.user');

          // Find and sanitize a question title
          $title.find('div').remove();
          title = $title.text();

          // Just grab the current page URL, we don't need to do voodoo here
          link = window.location.href.replace(window.location.search, '');
          placement = 'quora-page';

        // Home page feed
        } else {

          $parent = $(element).parents('.feed_item');
          $author = $parent.find('.feed_item_answer_user a.user');

          // Find and sanitize a question title
          var $question = $parent.find('.QuestionText .link_text').clone();
          $question.find('div, span').remove();
          title = $question.text();

          // Prefix link with the domain URL as we only have an URI
          link = 'https://www.quora.com' + $parent.find('a.question_link').attr('href');
          placement = 'quora-feed';
        }

        // If it's an answer...
        if ($author.length) {
          title = 'Answer by ' + $author.text() + ' to ' + title;
          placement += '-answer';

          // If it's not an answer page, construct the author's answer url:
          if (link.search(/\/answer\//)) {
            if (link[ link.length - 1 ] !== '/') link += '/';
            link += 'answer' + $author.attr('href');
          }

        } else {
          placement += '-question';
        }

        return {
          text: title,
          url: link,
          placement: placement
        };

      }
    }
  ];

  var createButton = function (cfg) {

    // Buffer link itself
    var a = document.createElement('a');
    a.setAttribute('href', '#');
    $(a).text(cfg.text);

    // Container for button and separator
    var c = document.createElement('div');
    c.setAttribute('class', cfg.containerClassName);
    $(c).append(a);

    return c;
  };

  var insertButtons = function () {

    config.buttons.forEach(function(btnConfig, i){

      $(btnConfig.container).each(function(){

        var $container = $(this);

        if ($container.hasClass('buffer-inserted')) {
          return;
        }

        var button = createButton(btnConfig);

        var getData = btnConfig.data;

        $(button).children('a').on('click', function (e) {
          xt.port.emit('buffer_click', getData(button));
          e.preventDefault();
        });

        $container.addClass('buffer-inserted');

        // Insert button
        // Implementing complex logic where to insert Buffer button makes no sense.
        // Quora is changing its' layout often, share button stays always on place.
        $container.find(btnConfig.before).parent().parent().before(button);

        $container.append(button);
      });

    });

    setTimeout(insertButtons, 800);
  };

  ;(function check(){
    if (!xt.options) {
      return setTimeout(check, 50);
    }
    if (typeof xt.options['buffer.op.quora'] === 'undefined' ||
        xt.options['buffer.op.quora'] === 'quora') {
      insertButtons();
    }
  }());

}());
