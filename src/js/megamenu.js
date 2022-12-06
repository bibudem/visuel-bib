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

  $phone_menu.find('.udem-phone-menu-primary').on('click', close_all);

  // Load mega-menu contents ("prefetch all" strategy!)
  // This is also where megamenu elements are created.
  $root_ul.children('li[data-udem-mega-menu-href]').each(function (i, li) {
    var $li = $(li);

    $li
      .find('.udem-mega-menu-header')
      .text($li.children('a').text())
      .on('click', function () { $li.each(close); });

    // Remove sub-menu if any
    $li.addClass('has-sub').children('.sub-menu').remove();

    // Flag last CType-menu elements of each rows
    $li.find('.udem-mega-menu-inner  div.row > div[class*="col-"]').each(function (e) {
      $(this).find('div.CType-menu').has('ul').find('li:last-child a').each(function (e) {
        $(this).addClass('last-sub-item');
      });
    });
    $(document.body).trigger('udem.addsectionclasses', [$li]);
    $li.trigger('udemMegaMenuItemLoaded');
  });

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

      megamenu_width = $li.hasClass('udem_bootstrap_mega-menu-75') ? (ul_width * 0.75) : ul_width;

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

  $root_ul.on('click', '> .has-sub > a', function (event) {
    var $a = $(this),
      $li = $a.parent(),
      $megamenu = megamenu($li),
      $submenu = $li.children('.udem-mega-menu-loaded, .sub-menu').first();

    if ($submenu.length > 0 || $megamenu) {
      event.preventDefault();
      if ($li.hasClass('open')) {
        $root_ul.children('.has-sub.open').each(close);
      } else {
        $root_ul.children('.has-sub.open').not($li).each(close);
        $li.each(open);
      }
    }
  });

  // Desktop: open sub-menu/mega-menu on mouseenter
  $root_ul.on('mouseenter', '> .has-sub', function (event) {
    if (!isPhoneMenuVisible()) {
      var $li = $(this),
        mega_show_delay = parseInt($li.data('udem-mega-menu-show-delay')),
        mega_hide_delay = parseInt($li.data('udem-mega-menu-hide-delay'));
      clearTimeout(hideTimer);
      clearTimeout(hideOthersTimer);
      if (!$li.hasClass('hover')) {
        $li.addClass('hover');
        showTimer = setTimeout(function () {
          $li.each(open);
        }, mega_show_delay);
        hideOthersTimer = setTimeout(function () {
          $root_ul.children('.has-sub.open').not($li).each(close);
        }, mega_hide_delay);
      }
    }
  });

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

  $root_ul.on('mouseleave', '> .has-sub', function (event) {
    var $li = $(this),
      mega_hide_delay = parseInt($li.data('udem-mega-menu-hide-delay'));

    if (!isPhoneMenuVisible() && !is_hover({ x: event.clientX, y: event.clientY }, this)) {
      clearTimeout(showTimer);
      if ($li.hasClass('hover')) {
        $li.removeClass('hover');
        hideTimer = setTimeout(function () {
          $li.each(close);
        }, mega_hide_delay);
      }
    }
  });

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

// Add first and last classes for content section regroupment based on adjacent identical same type (with frame or not).
jQuery(function ($) {
  'use strict';

  /**
   * Get the section frame class applied for a requested node.
   *
   * @param {jQuery} $node
   * @returns {String} sectionFrameClass
   */
  function getSectionFrameClass($node) {
    var sectionFrameClass = '';
    if ($node.length) {
      sectionFrameClass = $.grep(($node.attr('class') || '').split(' '), function (v, i) {
        return v.indexOf('section_frame-') === 0;
      }).join();
    }
    return sectionFrameClass;
  }

  /**
   * Fix the space between two jQuery nodes.
   * Remove margin and replace it by a padding.
   *
   * @param {jQuery} $node1
   * @param {jQuery} $node2
   * @return {undefined}
   */
  function fixSpaceBetween($node1, $node2) {
    var rect1 = $node1.get(0).getBoundingClientRect(),
      rect2 = $node2.get(0).getBoundingClientRect(),
      margin = Math.round((rect2.top - (rect1.top + rect1.height)) * 100) / 100;

    // There is nothing to fix.
    if (margin === 0) {
      return;
    }

    removeMarginBottom($node1, rect1.bottom);

    // Update the size with the new position.
    rect2 = $node2.get(0).getBoundingClientRect();
    removeMarginTop($node2, rect2.top);

    $node1.css('paddingBottom', parseFloat($node1.css('paddingBottom')) + margin);
  }

  /**
   * Remove the margin-bottom for all the first childs of a node.
   *
   * @param {jQuery} $node
   * @param {Number} bottom
   */
  function removeMarginBottom($node, bottom) {
    var rect = $node.get(0).getBoundingClientRect(),
      marginBottom = parseFloat($node.css('marginBottom')),
      visibleChildren = $node.children().filter(':visible');
    if (marginBottom && rect.bottom + marginBottom > bottom) {
      $node.css('marginBottom', 0);
    }
    if (visibleChildren.length) {
      removeMarginBottom(visibleChildren.last(), bottom);
    }
  }

  /**
   * Remove the margin-top for all the first childs of a node.
   *
   * @param {jQuery} $node
   * @param {Number} top
   */
  function removeMarginTop($node, top) {
    var rect = $node.get(0).getBoundingClientRect(),
      marginTop = parseFloat($node.css('marginTop')),
      visibleChildren = $node.children().filter(':visible');
    if (marginTop && rect.top - marginTop < top) {
      $node.css('marginTop', 0);
    }
    if (visibleChildren.length) {
      removeMarginTop(visibleChildren.first(), top);
    }
  }

  $(document.body).on('udem.addsectionclasses', function (e, $parent) {
    var firstClass = 'first-of-section',
      lastClass = 'last-of-section',
      pageTitleFramedClass = 'udem-page-title',
      jsInitializedClass = 'udem-js-initialized',
      whiteFrameClass = 'section_frame-101',
      cscSelector = '.csc-frame-default',
      whiteFrameElements,
      portraitPrefix = 'udemportraits-mode-Portrait-annonce',
      $pageTitle,
      $firstMainContent,
      $portraits,
      $beforePortraits;

    $parent = $parent instanceof jQuery ? $parent : $(document.body);
    $parent.find(cscSelector).addClass(jsInitializedClass).each(function () {
      var $this = $(this),
        $prev = $this.prev(),
        $next = $this.next(),
        currentFrameClass = getSectionFrameClass($this),
        prevFrameClass = getSectionFrameClass($prev),
        nextFrameClass = getSectionFrameClass($next);

      if ($prev.length === 0 || currentFrameClass !== prevFrameClass || !$prev.is(cscSelector)) {
        $this.addClass(firstClass);
      }
      if ($next.length === 0 || currentFrameClass !== nextFrameClass || !$next.is(cscSelector)) {
        $this.addClass(lastClass);
      }
    });

    $pageTitle = $parent.find('div[class^="' + pageTitleFramedClass + '"]');
    $firstMainContent = $pageTitle.next();

    // Fix behavior of page title and its behavior if it have frame or not.
    $pageTitle.addClass(jsInitializedClass);
    $pageTitle.addClass(firstClass);
    $pageTitle.addClass(lastClass);
    if ($pageTitle.hasClass(pageTitleFramedClass)) {
      $pageTitle.addClass(whiteFrameClass);
      if ($firstMainContent.hasClass(whiteFrameClass)) {
        $pageTitle.removeClass(lastClass);
        $firstMainContent.removeClass(firstClass);
      } else {
        $firstMainContent.addClass(firstClass);
      }
    }

    // Udem-portrait are special. Fix The behavior.
    $portraits = $parent.find('.' + whiteFrameClass + '[class*="' + portraitPrefix + '"]:not(.' + firstClass + ')');
    $beforePortraits = $portraits.prev();
    $beforePortraits.addClass(lastClass);
    $portraits.addClass(firstClass);

    // Finally, replace space between two white frames by a padding.
    whiteFrameElements = $parent.find('.' + whiteFrameClass + ':not(.' + lastClass + '):visible');
    whiteFrameElements.each(function () {
      var $this = $(this);
      if ($this.next().length > 0) {
        fixSpaceBetween($this, $this.next());
      }
    });
  });

  $(document.body).trigger('udem.addsectionclasses');
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