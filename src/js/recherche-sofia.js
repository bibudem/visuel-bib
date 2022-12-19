jQuery(function ($) {
  'use strict';

  $(document).on('submit', '.udembib-recherche-sofia form', function (event) {
    var $form = $(this),
      $index_select = $form.find('.udembib-recherche-sofia-index select').first(),
      $exclude_articles_checkbox = $form.find('input.udembib-recherche-sofia-exclude-articles').first(),
      $query_input = $form.find('input.udembib-recherche-sofia-query').first(),
      url_with_articles = $(this).attr('data-url_with_articles'),
      url_without_articles = $(this).attr('data-url_without_articles'),
      query = $query_input.length > 0 ? $query_input.val() : '',
      index = $index_select.length > 0 ? $index_select.val() : '',
      exclude_articles = $exclude_articles_checkbox.length > 0 ? $exclude_articles_checkbox.prop('checked') : false,
      action = exclude_articles ? url_with_articles : url_without_articles;

    if (index !== 'kw') {
      query = index + ':' + query;
    }
    action = action.replace('#T#', window.encodeURIComponent(query));

    event.preventDefault();

    if (action) {
      window.open(action, '_blank');
    }
  });

  $(document).on('input', '.udembib-recherche-sofia form input.form-control', function (event) {
    event.preventDefault();

    var input = $(this),
      close;
    close = input.parent('.input-group').find('.close');

    if (!input.val() || input.val().trim() === '') {
      close.css('display', 'none');
    } else {
      close.css('display', 'inline');
    }
  });

  $(document).on('click', '.udembib-recherche-sofia form .close', function () {
    var closeElement = $(this),
      group;
    group = closeElement.parents('.input-group').first().find('input');
    group.val('');
    closeElement.css('display', 'none');
  });
});