;(function() {

  var config = {};
  config.base = "http://www.producthunt.com";
  config.buttons = [
    {
      text: "Add to buffer",
      container: 'div.url span:nth-child(2)',
      className: 'buffer-producthunt post--product-link',
      selector: '.buffer-producthunt',
      data: function(elem){
        var titleContainer = $(elem).parents("div.url").children(".post-url.title");
        var title = titleContainer.find("span").text();
        var url = titleContainer.attr("href");
        var subTitle = $(elem).parents("div.url").children(".post-tagline.description").text();

        return {
          text: title + ": " + subTitle,
          url: config.base + url,
          placement: 'ph-add'
        }
      }
    }
  ];

  var createButton = function (btnConfig) {
    var a = document.createElement('a');
    a.setAttribute('class', btnConfig.className);
    a.setAttribute('href', '#');
    var i = document.createElement('span');
    i.setAttribute('class', 'icon icon-buffer');
    $(a).append(i);
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

        var getData = btnConfig.data;

        $(btn).click(function (e) {
          xt.port.emit("buffer_click", getData(btn));
          e.preventDefault();
        });

      });
    }
  };

  var removeExtras = function () {
    $("span.exclusive-badge .buffer-producthunt-button").remove();
  }

  var productHuntLoop = function(){
    insertButtons();
    removeExtras();
    setTimeout(productHuntLoop, 500);
  };

  // Wait for xt.options to be set
  ;(function check() {
    if( xt.options && xt.options['buffer.op.producthunt'] === 'producthunt') {
      productHuntLoop();
    } else {
      setTimeout(check, 2000);
    }
  }());
}());