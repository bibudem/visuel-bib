// primary-nav
jQuery(function ($) {
  'use strict';

  var $primary_nav = $('#udem-primary-nav'),
    $root_ul = $primary_nav.find('> .container > ul').first(),
    $phone_menu = $('#udem-phone-menu'),
    hideTimer,
    hideOthersTimer,
    showTimer;

  function isPhoneMenuVisible() {
    return $phone_menu.is(':visible');
  }

  function init_megamenu($li, $megamenu, content) {
    var $megamenu_inner;

    $megamenu_inner = $('<div></div>').addClass('udem-mega-menu-inner').appendTo($megamenu);

    $('<div></div>').addClass('udem-mega-menu-gapfiller').insertBefore($megamenu_inner);

    $('<div></div>').addClass('udem-mega-menu-header').text($li.children('a').text())
      .on('click', function () { $li.each(close); })
      .insertBefore($megamenu_inner);

    $megamenu_inner.html(content);
  }

  $phone_menu.find('.udem-phone-menu-primary').on('click', close_all);

  // Returns $submenu, or null.
  function submenu($li) {
    var $submenu = $li.find('.sub-menu').first();
    if ($submenu.length === 0) {
      $submenu = null;
    }
    return $submenu;
  }

  // Returns $megamenu, or null.
  function megamenu($li) {
    var $megamenu = $li.find('.udem-mega-menu-item').first();
    if ($megamenu.length === 0) {
      $megamenu = null;
    }
    return $megamenu;
  }

  function getWidth($elm) {
    var elm, rect;
    if ($elm.length > 0) {
      elm = $elm.get(0);
      if (typeof elm.getBoundingClientRect === 'function') {
        rect = elm.getBoundingClientRect();
        return rect.width;
      }
    }
    // Fallback to default jQuery method: may round/floor/ceil the value!
    return $elm.width();
  }

  function update_megamenu_position($li, $megamenu) {
    if (isPhoneMenuVisible()) {
      $megamenu.css({
        top: -($li.offset().top - $root_ul.offset().top) + 'px',
        left: 'auto',
        width: '100%'
      });
      // FIXME Hey! Where this "20" comes from?
      $megamenu.children('.udem-mega-menu-inner').css({
        height: ($primary_nav.height() - 20 - $megamenu.children('.udem-mega-menu-header').height()) + 'px'
      });
    } else {
      var $gapfiller = $megamenu.children('.udem-mega-menu-gapfiller'),
        $lia = $li.children('a').first(),
        megamenu_margin_top,
        megamenu_border_top_width,

        ul_offset_left,
        ul_width,

        li_offset_left,
        li_width,
        li_height,

        lia_border_left_width,
        lia_border_right_width,
        lia_border_total_width,

        gapfiller_width,
        gapfiller_border_left_width,
        gapfiller_border_right_width,
        gapfiller_border_total_width,

        megamenu_width,
        megamenu_left = 0,
        megamenu_min_left = -Infinity,
        megamenu_max_left = Infinity,
        gapfiller_left = 0
        ;
      // TODO refactor this! May have lot of dead code, and optimization opportunities!

      megamenu_margin_top = parseFloat($megamenu.css('margin-top')) || 0;
      megamenu_border_top_width = parseFloat($megamenu.css('border-top-width')) || 0;

      ul_offset_left = $root_ul.offset().left; // FIXME Should we Math.round($root_ul.offset().left);
      ul_width = getWidth($root_ul);
      li_offset_left = $li.offset().left; // FIXME Should we Math.round($li.offset().left);
      li_width = getWidth($li);
      li_height = $li.height();

      lia_border_left_width = parseFloat($lia.css('border-left-width')) || 0;
      lia_border_right_width = parseFloat($lia.css('border-right-width')) || 0;
      lia_border_total_width = lia_border_left_width + lia_border_right_width;

      megamenu_width = $li.hasClass('udem_bootstrap__mega-menu-75') ? (ul_width * 0.75) : ul_width;

      gapfiller_width = li_width + lia_border_total_width;
      gapfiller_border_left_width = parseFloat($gapfiller.css('border-left-width')) || 0;
      gapfiller_border_right_width = parseFloat($gapfiller.css('border-right-width')) || 0;
      gapfiller_border_total_width = gapfiller_border_left_width + gapfiller_border_right_width;

      megamenu_min_left = ul_offset_left - li_offset_left;
      megamenu_max_left = megamenu_min_left + ul_width - megamenu_width;

      megamenu_left = (gapfiller_width + gapfiller_border_total_width - megamenu_width) / 2;
      megamenu_left = Math.max(Math.min(megamenu_left, megamenu_max_left), megamenu_min_left);

      gapfiller_left = -megamenu_left + gapfiller_border_left_width;
      $gapfiller.css({
        top: (-megamenu_margin_top - megamenu_border_top_width) + 'px',
        left: (gapfiller_left - gapfiller_border_total_width - lia_border_total_width) + 'px',
        width: (gapfiller_width) + 'px'
      });

      $megamenu.css({
        top: (li_height) + 'px',
        left: megamenu_left + 'px',
        width: megamenu_width
      });
    }
  }

  function open() {
    var $li = $(this), // Binded to li!
      $submenu,
      $megamenu;

    if (!$li.hasClass('open')) {
      $li.addClass('open');

      $megamenu = megamenu($li);
      if ($megamenu) {
        $root_ul.addClass('udem-mega-menu-open');
        update_megamenu_position($li, $megamenu);
      }

      if (!isPhoneMenuVisible()) {
        // Desktop: Inverser alignement du sub-menu si celui-ci dépasse à droite
        $submenu = submenu($li);
        if ($submenu) {
          $submenu.removeClass('sub-menu-right'); // Avoid bias in calculus
          $submenu.toggleClass('sub-menu-right', $root_ul.offset().left + $root_ul.width() < $submenu.offset().left + $submenu.width());
        }
      }
    }
  }

  function close() {
    var $li = $(this), // Binded to li!
      $megamenu = megamenu($li);

    $li.removeClass('open');

    if ($megamenu) {
      $root_ul.removeClass('udem-mega-menu-open');
    }
  }

  function close_all() {
    $root_ul.children().each(close);
  }

  // $root_ul.on('click', '> .has-sub > a', function (event) {
  //   var $a = $(this),
  //     $li = $a.parent(),
  //     $megamenu = megamenu($li),
  //     $submenu = $li.children('.udem-mega-menu-loaded, .sub-menu').first();

  //   if ($submenu.length > 0 || $megamenu) {
  //     event.preventDefault();
  //     if ($li.hasClass('open')) {
  //       $root_ul.children('.has-sub.open').each(close);
  //     } else {
  //       $root_ul.children('.has-sub.open').not($li).each(close);
  //       $li.each(open);
  //     }
  //   }
  // });

  // Desktop: open sub-menu/mega-menu on mouseenter
  // $root_ul.on('mouseenter', '> .has-sub', function (event) {
  //   if (!isPhoneMenuVisible()) {
  //     var $li = $(this),
  //       mega_show_delay = parseInt($li.data('udem-mega-menu-show-delay')),
  //       mega_hide_delay = parseInt($li.data('udem-mega-menu-hide-delay'));
  //     clearTimeout(hideTimer);
  //     clearTimeout(hideOthersTimer);
  //     if (!$li.hasClass('hover')) {
  //       $li.addClass('hover');
  //       showTimer = setTimeout(function () {
  //         $li.each(open);
  //       }, mega_show_delay);
  //       hideOthersTimer = setTimeout(function () {
  //         $root_ul.children('.has-sub.open').not($li).each(close);
  //       }, mega_hide_delay);
  //     }
  //   }
  // });

  // @param jQuery $element
  // @return object{top,left,width,height}
  function element_rect($element) {
    var rect = $element.offset();
    rect.width = $element.innerWidth();
    rect.height = $element.innerHeight();
    return rect;
  }

  // @param object{x,y} point
  // @param object{top,left,width,height} rect
  // @return boolean
  function point_within(point, rect) {
    return point.x >= rect.left &&
      point.x <= rect.left + rect.width &&
      point.y >= rect.top &&
      point.y <= rect.top + rect.height;
  }

  // Voir: https://atelier.ti.umontreal.ca/jira/browse/CTTYPO3-802
  // @param object{x,y} point
  // @param DOMElement element
  // @return boolean
  function is_hover(point, element) {
    var $element = $(element),
      $children, i;

    if (!$element.is(':visible')) {
      return false;
    }

    if (point_within(point, element_rect($element))) {
      return true;
    }

    // Test also descendants!
    $children = $element.children();
    for (i = 0; i < $children.length; i++) {
      if (is_hover(point, $children[i])) {
        return true;
      }
    }

    return false;
  }

  // $root_ul.on('mouseleave', '> .has-sub', function (event) {
  //   var $li = $(this),
  //     mega_hide_delay = parseInt($li.data('udem-mega-menu-hide-delay'));

  //   if (!isPhoneMenuVisible() && !is_hover({ x: event.clientX, y: event.clientY }, this)) {
  //     clearTimeout(showTimer);
  //     if ($li.hasClass('hover')) {
  //       $li.removeClass('hover');
  //       hideTimer = setTimeout(function () {
  //         $li.each(close);
  //       }, mega_hide_delay);
  //     }
  //   }
  // });

  // Re-compute megamenu position on viewport resize
  function handle_resize() {
    $root_ul.children('.open').each(function () {
      var $li = $(this),
        $megamenu = megamenu($li);
      if ($megamenu) {
        update_megamenu_position($li, $megamenu);
      }
    });
  }
  $(window).on('resize', handle_resize);
});

jQuery(function ($) {
  'use strict';

  // IE9: no flex! So the primary-nav menu items are floating.
  // If some menu entries have a long text, they won't wrap and the menu may flow on multiple lines.
  // The only way to force text wrap is to give a width/max-width.
  // But the number of entries is not fixed!
  // On mobile/tablet, we don't care (dropdown menu)...
  // The menu width is fluid: we need to watch resizes!
  // Can not provide CSS fix "display: table/table-cell", because IE9 parses "flex" and applies "block".

  var $ul = $('#udem-primary-nav > .container > ul');
  if ($ul.length < 1) {
    return;
  }
  if (typeof $ul.prop('currentStyle') === 'undefined') {
    // Not a legacy IE: no need to go further!
    return;
  }

  function equalize_widths($lis) {
    if ($lis.length < 1) {
      return;
    }
    var lis_not_homes_count = 0,
      fluid_width = 0;

    $lis.each(function () {
      if (!$(this).hasClass('home')) {
        lis_not_homes_count++;
      }
    });

    if (lis_not_homes_count > 0) {
      fluid_width = (Math.floor(100000 / lis_not_homes_count) / 1000) + '%';
    }

    $lis.each(function () {
      var $this = $(this);
      if ($this.hasClass('home')) {
        // ".home": apply current min-width
        $this.css({ width: $this.css('minWidth') });
      } else {
        if (fluid_width) {
          $this.css({ width: fluid_width });
        }
      }
    });
  }

  function reflow() {
    var $ul = $('#udem-primary-nav > .container > ul'),
      $phone_menu = $('#udem-phone-menu'),
      is_desktop = $phone_menu.css('display') === 'none',
      ul_display = $ul.css('display'),
      $lis = $ul.children();

    if (is_desktop) {
      if (ul_display === 'flex') {
        // looks like flexbox is applied! (IE >= 10)
        return;
      }
      $ul.css({ display: 'table' });
      $lis.css({ display: 'table-cell', verticalAlign: 'top', cssFloat: 'none' });
      equalize_widths($lis);
    } else {
      if (ul_display === 'table') {
        $ul.css({ display: 'block' });
        $lis.css({ display: 'block', width: 'auto' });
      }
    }
  }

  $(window).on('resize', _.debounce(reflow, 150));
  setTimeout(reflow, 50);
});

jQuery(function ($) {
  'use strict';

  // TODO Some DRY refactoring can be done here!

  var $phone_menu = $('#udem-phone-menu'),
    $breadcrumb = $('#udem-breadcrumb'),
    $secondary_nav = $('#udem-secondary-nav'),
    $navs = $([]); // Will hold phone-menu targets

  // Makes the phone menu sticky
  if ($phone_menu.length) {
    $phone_menu.affix({
      offset: {
        top: function () {
          return (this.top = $phone_menu.position().top);
        }
      }
    });
  }

  // Helper to fix navigation menus position when uncollapsed by the phone-menu
  function phone_menu_bottom() {
    if (!$phone_menu.length) {
      return 0;
    }

    var top = $phone_menu.position().top,
      hgt = $phone_menu.height(),
      dst = $(document).scrollTop();
    if (dst < top) {
      return top + hgt - dst;
    }
    return top + hgt;
  }

  // Phone-menu items behaves like collapse triggers for their targets
  $('#udem-phone-menu a[href^="#"]').each(function (i, trigger) {
    var $trigger = $(trigger),
      $element = $($trigger.attr('href'));

    if ($element.length < 1) {
      return;
    }

    $navs.push($element.get(0));

    $trigger.attr('data-toggle', 'collapse').addClass('collapsed');
    // FIXME adding the collapse class on document ready make the menus appears few millisecond on slow phone/tablet
    $element.addClass('collapse').collapse({ toggle: false });
    $element.on('show.bs.collapse', function () {
      // when a menu is shown, hide other menus
      $('#udem-phone-menu a[href^="#"]').each(function (i, _trigger) {
        if (_trigger !== trigger) {
          $(_trigger.getAttribute('href')).collapse('hide');
        }
      });
    });
  });

  $navs.on('show.bs.collapse', function (event) {
    var $this = $(this);
    // console.log('show.bs.collapse: ', this, this.className);
    $this.css({ top: phone_menu_bottom() + 'px' });
    // Hide secondary-nav if it is uncollapsed!
    $secondary_nav.removeClass('in');
  });

  $phone_menu.on('affixed.bs.affix affixed-top.bs.affix', function (event) {
    $navs.css({ top: phone_menu_bottom() + 'px' });
  });
  $(document).on('scroll', function (event) {
    // On mobile, only the end of scrolling will be triggered!
    // And no timeOut/interval will be fired during the scroll...
    // We could use touchmove events, but it can become stressfull for the browser!
    if ($navs.hasClass('collapse') && $navs.hasClass('in')) {
      $navs.css({ top: phone_menu_bottom() + 'px' });
    }
  });

  $(window).on('resize', function () {
    if ($phone_menu.css('display') === 'none') {
      // Window resized and phone menu not displayed?
      // That means that we are back on desktop!
      // Remove affix "top" specific style!
      $navs.attr('style', function (i, style) {
        if (style && typeof style.replace === 'function') {
          return style.replace(/(^|\s+|;)top\s*:[^;]+(;|$)/, '');
        }
      });
    } else {
      // phone menu displayed? We may got back to phone/tablet!
      $navs.css({ top: phone_menu_bottom() + 'px' });
    }
  });

  // Makes the breadcrumb sticky
  if ($phone_menu.length) {
    $breadcrumb
      .on('affix.bs.affix', function (event) {
        $(this).css({
          top: $phone_menu.height()
        });
      })
      .affix({
        offset: {
          top: function () {
            return (this.top = $phone_menu.position().top + $phone_menu.height());
          }
        }
      });
  }

  // Helper to fix navigation menus position when uncollapsed by the phone-menu
  function breadcrumb_bottom() {
    var top = $breadcrumb.position().top,
      hgt = $breadcrumb.height(),
      dst = $(document).scrollTop();
    if (dst < top) {
      return top + hgt - dst;
    }
    return top + hgt;
  }

  if ($secondary_nav.length > 0) {
    $secondary_nav.on('show.bs.collapse', function (event) {
      $(this).css({ top: breadcrumb_bottom() + 'px' });
    });

    $breadcrumb.on('affixed.bs.affix affixed-top.bs.affix', function (event) {
      $secondary_nav.css({ top: breadcrumb_bottom() + 'px' });
    });
    $(document).on('scroll', function (event) {
      if ($secondary_nav.hasClass('collapse') && $secondary_nav.hasClass('in')) {
        $secondary_nav.css({ top: breadcrumb_bottom() + 'px' });
      }
    });

    $(window).on('resize', function () {
      if ($phone_menu.css('display') === 'none') {
        // Window resized and phone menu not displayed?
        // That means that we are back on desktop!
        // Uncollapse and restore secondary nav desktop style.
        $secondary_nav.attr('style', function (i, style) {
          if (style && typeof style.replace === 'function') {
            return style.replace(/(^|\s+|;)top\s*:[^;]+(;|$)/, '');
          }
        });
        $secondary_nav.removeClass('in').removeClass('collapse');
        $secondary_nav.attr('aria-expanded', null);
      }
    });
  }
});