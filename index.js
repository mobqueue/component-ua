
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

function enable(id, tags) {
  if (push) {        
    // on register
    push.registerEvent('registration', function(id) {
      // check if push is enabled
      push.isPushEnabled(function(enabled) {
        if (!enabled) {
          cordova.alert({
            title: 'Push Notifications'
          , message: 'Push notifications must be enabled for this app to work. Please check your settings.'
          }, function() {
            setTimeout(function() {
              enable();
            }, 1000);
          });
        }
      });
    });
          
    push.registerEvent('push', function(data) {
      cordova.alert({
        title: data.extras.title || 'Perfect'
      , message: data.message
      }, function() {
        if (data.extras.url) {
          Backbone.history.navigate(data.extras.url, { trigger: true });
        }
      });
    });

    push.getIncoming(function(data) {
      if (data.message) {
        cordova.alert({
          title: data.extras.title || 'Perfect'
        , message: data.message
        }, function() {
          if (data.extras.url) {
            Backbone.history.navigate(data.extras.url, { trigger: true });
          }
        });
      }
    });

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
}

/**
 * Disable push
 */

function disable() {
  if (push) {
    push.resetBadge(function() {});
    push.disablePush();
    push.disableLocation();
    push.disableBackgroundLocation();
  }
}
