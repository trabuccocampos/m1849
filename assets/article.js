(function($) {
  function init() {
    var $micro = $('#microtrends').html();
    var $material = $('#materials').html();

    function makeSlick($images) {
      $images.slick({
        infinite: true,
        dots: true,
        easing: 'easeOutQuint',
        speed: 500,
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
          _article.images = [];

          for (meta in _article.metafields) {
            var metafield = _article.metafields[meta];
            var value = metafield.value;

            if (_article.metafields.hasOwnProperty(meta) && value.trim() != '') {
              if (metafield.namespace == 'images') {
                _article.images.push(value);
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

            var $elem = $('[data-id="'+id+'"]').find('.microtrends');
            $elem.html($html);

            makeSlick($elem.find('.images'));
          }
        }

        // Get get materials
        getMaterials(articles);
      });
    }

    getMicroTrends(Shopify.article_ids);
  }
  
  Relatable.ready(function() {
    $(function() {
      init();
    })
  });
})(jQuery);