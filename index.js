
/**
 * Dependencies
 */

var Backbone = require('backbone')
  , cordova = require('cordova-wrapper');

/**
 * Have push?
 */

var push = window.pushNotification
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
  callback = callback || function(){};

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
      registered = true;
    }

    // check if push is enabled
    push.isPushEnabled(function(enabled) {
      if (enabled) {
        disable();
      } 
      register(id, tags, callback);
    });
  } else {
    callback();
  }
}

/**
 * Register
 */

function register(id, tags, callback) {  
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

  // Get the device id and callback
  push.getPushId(callback);
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
