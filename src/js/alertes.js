import './vendors/localforage.js'

/* global localforage */

jQuery(function ($) {
  'use strict';

  // Loads Alertes with XHR into #udem-alertes-placeholder
  var $alertes_placeholder = $('#udem-alertes-placeholder').first(),
    alertes_url = $alertes_placeholder.data('udem-alertes-url'),
    display_close_button = $alertes_placeholder.data('udem-alertes-close-button'),
    close_button_label = $alertes_placeholder.data('udem-alertes-close-button-label');

  if ($alertes_placeholder.length < 1) {
    return;
  }

  if (!alertes_url) {
    return;
  }

  /**
   * Display the alert.
   *
   * @param {String} content
   */
  function displayAlert(content, storage) {
    var $inner1, $inner2, $closeBtn;
    $inner1 = $('<div class="udem-alertes-inner1"></div>').appendTo($alertes_placeholder);
    $inner2 = $('<div class="udem-alertes-inner2"></div>').appendTo($inner1);
    $inner2.html(content);
    if ($inner2.text() === '') {
      $alertes_placeholder.html('');
      return;
    }
    $('body').addClass('udem-has-alertes');

    // Display a close button.
    if (display_close_button === 1) {
      $closeBtn = $('<a href="#" class="close" aria-label="' + close_button_label + '" title="' + close_button_label + '">×</a>');
      $inner2.prepend($closeBtn);
      $closeBtn.on('click', function (e) {
        e.preventDefault()
        // If storage, store the close state in it.
        if (typeof storage === 'object') {
          storage.setItem(content, true, function (err) {
            if (err) {
              console.log('ERROR: setItem localforage.', err);
            }
          });
        }
        $alertes_placeholder.remove();
      });
    }
  }

  // Create an alert based on content.
  $.get(alertes_url, function (content, status) {
    var storage;
    if (status !== 'success' || !content) {
      return;
    }

    // If storage and close button, create an alert only if user did not hide it before.
    if (typeof localforage !== 'undefined' && display_close_button === 1) {
      storage = localforage.createInstance({ name: 'udemboostrap-alertes' });

      // Test reading.
      try {
        storage.getItem(content, function (err, state) {
          if (err) {
            displayAlert(content);
            console.log('ERROR: getItem localforage.', err);
          } else {
            if (state !== true) {
              // Clear old entries.
              storage.clear();
              // Display the alert.
              displayAlert(content, storage);
            }
          }
        });
      } catch (e) {
        displayAlert(content);
        console.log('ERROR: getItem localforage.');
      }

      // If no storage, create an alert immediately.
    } else {
      displayAlert(content);
      console.log('ERROR: No localforage found.');
    }
  });
});