
/**
 * Dependencies
 */

var Backbone = require('backbone')
  , cordova = require('cordova-wrapper');

/**
 * Have push?
 */

var push = window.pushNotification
  , currentCallback = null
  , registered = false;

/**
 * Expose `enable`
 */

module.exports.enable = enable;

/**
 * Expose `disable`
 */

module.exports.disable = disable;

/**
 * Register device id and tags
 */

function enable(id, tags, callback) {
  currentCallback = callback || function(){};

  // if you have push...
  if (push) {
    // Register push handler once
    if (!registered) {
      push.registerEvent('push', function(data) {
        cordova.alert({
          title: data.extras.title || 'Perfect'
        , message: data.message
        });
      });

      push.registerEvent('registration', function(deviceToken) {
        useLatestCallback(deviceToken);
      });

      registered = true;
    }

    // check if push is enabled
    push.isPushEnabled(function(enabled) {
      if (enabled) {
        disable();
      } 
      register(id, tags);
    });
  } else {
    callback();
  }
}

/**
 * Use latest callback
 */

function useLatestCallback(deviceToken) {
  currentCallback(deviceToken);
}

/**
 * Register
 */

function register(id, tags) {  
  // Handle Incoming
  document.addEventListener('resume', handleIncoming, false);

  // enable push
  push.enablePush();

  // enable location
  push.enableLocation();

  // enable background location
  push.enableBackgroundLocation();

  // enable auto badge
  push.setAutobadgeEnabled(true, function() {});

  // set the alias to their id
  push.setAlias(id, function() {});
  
  // set the tags so we can find them
  push.setTags(tags, function() {});

  // Register for sound, alert, and badge push notifications
  push.registerForNotificationTypes(push.notificationType.sound | push.notificationType.alert | push.notificationType.badge);
}

/**
 * Disable push
 */

function disable() {
  if (push) {
    document.removeEventListener('resume', handleIncoming);
    push.resetBadge();
    push.disablePush();
    push.disableLocation();
    push.disableBackgroundLocation();
  }
}

/**
 * Handle Incoming
 */

function handleIncoming(data) {
  push.getIncoming(function(data) {
    if (data.extras.url) {
      Backbone.history.navigate(data.extras.url, { trigger: true });
    }
  });
}
