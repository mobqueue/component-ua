
/**
 * Dependencies
 */

var Backbone = require('backbone')
  , cordova = require('cordova-wrapper');

/**
 * Have push?
 */

var push = window.pushNotification;

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
    // check if push is enabled
    push.isPushEnabled(function(enabled) {
      if (enabled) {
        callback();
      } else {
        register(id, tags, callback);
      }
    });
  } else {
    callback();
  }
}

/**
 * Register
 */

function register(id, tags, callback) {
  // on register
  push.registerEvent('registration', callback);
  
  // push
  push.registerEvent('push', function(data) {
    cordova.alert({
      title: data.extras.title || 'Perfect'
    , message: data.message
    });
  });

  // Handle Incoming
  document.addEventListener('resume', handleIncoming, false);

  // enable push
  push.enablePush();

  // enable location
  push.enableLocation();

  // enable background location
  push.enableBackgroundLocation();

  // enable auto badge
  push.setAutobadgeEnabled(true);

  // set the alias to their id
  push.setAlias(id);
  
  // set the tags so we can find them
  push.setTags(tags);

  // Register for sound, alert, and badge push notifications
  push.registerForNotificationTypes(push.notificationType.sound | push.notificationType.alert | push.notificationType.badge);
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
