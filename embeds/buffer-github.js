;(function() {
  
  // Only run this script on github:
  if ( window.location.host.indexOf('github.com') !== 0) return;

  var config = {};
  config.buttons = [
    {
      loggedIn : {
        text: "Buffer",
        container: 'div.repo-list-stats button',
        className: 'buffer-github',
        selector: '.buffer-github',
        data: function (elem) {
            
          var article = $(elem).parents('li.repo-list-item').find('h3.repo-list-name a');
          var description = $(elem).parents('li.repo-list-item').find('p.repo-list-description').text().trim();
          var title = $(article).text().trim().replace(/\s\s+/g, '') + " : " + description;
          var link = 'https://github.com' + $(article).attr('href').trim();
            
          return {
            text: title,
            url: link,
            placement: 'github-add'
          };
        }
      },
      loggedOut : {
        text: "Buffer",
        container: 'div.repo-list-stats a',
        className: 'buffer-github',
        selector: '.buffer-github',
        data: function (elem) {
            
          var article = $(elem).parent().parent().find('h3.repo-list-name a');
          var description = $(elem).parent().parent().find('p.repo-list-description').text().trim();
          var title = $(article).text().trim().replace(/\s\s+/g, '') + " : " + description;
          var link = 'https://github.com' + $(article).attr('href').trim();
            
          return {
            text: title,
            url: link,
            placement: 'github-add'
          };
        }
      }
      
    }
  ];

  var createButtonLoggedIn = function (btnConfig) {

    var cloned = $(btnConfig.container).first().clone();
    cloned.addClass(btnConfig.className);
    cloned.removeClass('js-toggler-target');
    cloned.html('<span class="icon icon-buffer"></span>' + btnConfig.text);
    return cloned;

  };

  var createButtonLoggedOut = function (btnConfig) {

    var cloned = $(btnConfig.container).first().clone();
    cloned.addClass(btnConfig.className);
    cloned.html('<span class="icon icon-buffer"></span>' + btnConfig.text);
    return cloned;

  };

  var insertButtonsLoggedIn = function () {
    
    var i, l=config.buttons.length;
    
    for ( i=0 ; i < l; i++ ) {

      var btnConfig = config.buttons[i].loggedIn;
        
      $(btnConfig.container).each(function () {
          
        var container = $(this);
        
        if ( $(container).parent().hasClass('buffer-inserted') ) return;

        $(container).parent().addClass('buffer-inserted');

        var btn = createButtonLoggedIn(btnConfig);
        
        $(container).parent().append(btn);
        
        var getData = btnConfig.data;

        $(btn).click(function (e) {
          xt.port.emit("buffer_click", getData(btn));
          e.preventDefault();
        });
          
      });

    }

  };
   var insertButtonsLoggedOut = function () {
    
    var i, l=config.buttons.length;
    
    for ( i=0 ; i < l; i++ ) {

      var btnConfig = config.buttons[i].loggedOut;
        
      $(btnConfig.container).each(function () {
          
        var container = $(this);
        
        if ( $(container).parent().hasClass('buffer-inserted') ) return;

        $(container).parent().addClass('buffer-inserted');

        var btn = createButtonLoggedOut(btnConfig);

        $(container).parent().append(btn);
        
        var getData = btnConfig.data;

        $(btn).click(function (e) {
          xt.port.emit("buffer_click", getData(btn));
          e.preventDefault();
        });
          
      });

    }

  };

  var isLoggedIn = function() {
    return $('.header-actions a').text().indexOf('Sign in') < 0;
  };
  var isTrendingPage = function() {
    return window.location.pathname.indexOf('/trending') === 0;
  };

  var githubLoop = function() {
    if(isTrendingPage()) {
      if(isLoggedIn()) {
          insertButtonsLoggedIn();
      } else {
        insertButtonsLoggedOut();
      }  
    }
    setTimeout(githubLoop, 500);
  };
  // Wait for xt.options to be set
  ;(function check() {
    
    // If github is switched on, add the buttons
    if(isTrendingPage() && xt.options && xt.options['buffer.op.github'] === 'github') {
      githubLoop();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());