(function($) {
  var $lookbook = $('.lookbook');

  // Sets height of aside nav to match
  var prevLookbookHeight = $lookbook.height();

  function setListHeight() {
    var newHeight = $lookbook.height();

    if (prevLookbookHeight != newHeight) {
      $('.lookbook__list').height($lookbook.height());

      $(document.body).trigger("sticky_kit:recalc");

      prevLookbookHeight = $lookbook.height();
    }
  }

  function resizeImage(image, size) {
    var pattern = /\.(jpg|jpeg|png|gif)\?/;
    var url = image.replace(pattern, '_'+size+'.$1?');

    return url;
  }

  function init() {
    var $micro = $('#microtrends').html();
    var $material = $('#materials').html();

    function scrollNav() {
      setListHeight();

      $lookbook.chapters({
        nav: '.lookbook__list',
        header: '.lookbook__microtrend--title',
        subHeader: 'h3'
      });
    }

    function makeSlick($images) {
      $images.slick({
        infinite: true,
        dots: true,
        speed: 600,
        autoplay: true
      })
    }

    function getMaterials(articles) {
      var ids = [];

      // Loop through articles and grab IDs
      for (id in articles) {
        if (articles.hasOwnProperty(id)) {
          var subArticles = articles[id].articles;

          for (subArticle in subArticles) {
            if (subArticles.hasOwnProperty(subArticle)) {
              ids.push(subArticles[subArticle].id);
            }
          }
        }
      }

      Relatable.get({
        query: "article.products",
        id: ids.join(",")
      }, function(articles) {
        for (id in articles) {
          if (articles.hasOwnProperty(id)) {
            article = articles[id];

            // Do this because for whatever reason IE doens't like mustache
            // methods
            for (product in article.products) {
              var _p = article.products[product];
              var url = resizeImage(_p.image.src, 'medium');

              article.products[product].image_url = url;
            }

            var output = Mustache.render($material, articles[id]);
            var $html = $.parseHTML(output);

            $('[data-id="'+id+'"]').find('.materials').html($html);
          }
        }
      });
    }

    function articleImages(article) {
      for (a in article.articles) {
        if (article.articles.hasOwnProperty(a)) {
          var _article = article.articles[a];
          _article.image = resizeImage(_article.image.src, '1024x1024');
          _article.images = [];

          for (meta in _article.metafields) {
            var metafield = _article.metafields[meta];
            var value = metafield.value;

            if (_article.metafields.hasOwnProperty(meta) && value.trim() != '') {
              if (metafield.namespace == 'images') {
                // Do this because for whatever reason IE doens't like mustache
                // methods
                var url = resizeImage(value, '1024x1024');

                _article.images.push(url);
              } else if (metafield.key == 'attachment') {
                _article.attachment = value;
              }
            }
          }
        }
      }

      return article;
    }

    function getMicroTrends(ids) {
      // Get all micro trends
      Relatable.get({
        query: "article.articles",
        id: ids
      }, function(articles) {
        for (id in articles) {
          if (articles.hasOwnProperty(id)) {
            var output = Mustache.render($micro, articleImages(articles[id]));
            var $html = $.parseHTML(output);

            var $macrotrend = $('.lookbook__macrotrend[data-id="'+id+'"]');
            var $header = $macrotrend.find('.macrotrend-header');
            var $microtrends = $macrotrend.find('.microtrends');

            $microtrends.html($html);

            makeSlick($microtrends.find('.images'));
          }
        }

        // Get get materials
        getMaterials(articles);

        // scroll nav
        scrollNav();
      });
    }

    getMicroTrends(Shopify.article_ids);
  }

  Relatable.ready(function() {
    $(function() {
      init();
    })
  });

  function loadImages() {
    // Get all images below screen
    var $images = $lookbook.find('img[data-src]').filter(function() {
      // Bottom of the browser
      var bottom = $(window).height() + $(window).scrollTop();
      var offset = 100;

      var inView = $(this).offset().top < (bottom + offset);

      if (inView && $(this).attr('src') != $(this).data('src')) {
        $(this).attr('src', $(this).data('src'));
      }
    });

  }

  $(window).resize(setListHeight);

  var throttleScroll;

  $(window).scroll(function() {
    clearTimeout(throttleScroll);

    throttleScroll = setTimeout(function() {
      // Lazy load images
      loadImages();

      // Set sidebar height for sticky kit
      setListHeight();
    }, 100);
  });
})(jQuery);
