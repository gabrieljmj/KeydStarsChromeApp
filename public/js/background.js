/**
 * @author Gabriel Jacinto aka. GabrielJMJ <gamjj74@hotmail.com>
 */

'use strict';

let ls = localStorage;

const originalChannels = {"amarelito ": {"notifications": true, "online": false, "last_notification": false}, "xadz": {"notifications": true, "online": false, "last_notification": false}, "kng": {"notifications": true, "online": false, "last_notification": false},"nak": {"notifications": true, "online": false, "last_notification": false}, "Brunobit1": {"notifications": true, "online": false, "last_notification": false}, "edukim": {"notifications": true, "online": false, "last_notification": false}, "kaue": {"notifications": true, "online": false, "last_notification": false}, "thedarkness": {"notifications": true, "online": false, "last_notification": false}, "leko": {"notifications": true, "online": false, "last_notification": false}, "silviosantosdocs": {"notifications": true, "online": false, "last_notification": false}, "gordox": {"notifications": true, "online": false, "last_notification": false}, "mucamuricoca": {"notifications": true, "online": false, "last_notification": false}, "axt": {"notifications": true, "online": false, "last_notification": false},"therealyetz": {"notifications": true, "online": false, "last_notification": false},"keyd": {"notifications": true, "online": false, "last_notification": false},"takeshi": {"notifications": true, "online": false, "last_notification": false},"esa": {"notifications": true, "online": false, "last_notification": false},"robolol": {"notifications": true, "online": false, "last_notification": false},"baiano": {"notifications": true, "online": false, "last_notification": false},"turtle": {"notifications": true, "online": false, "last_notification": false},"hdefkim": {"notifications": true, "online": false, "last_notification": false},"molegel": {"notifications": true, "online": false, "last_notification": false},"coreia": {"notifications": true, "online": false, "last_notification": false},"jukaah": {"notifications": true, "online": false, "last_notification": false},"patopapao": {"notifications": true, "online": false, "last_notification": false},"400kg": {"notifications": true, "online": false, "last_notification": false},"manalol": {"notifications": true, "online": false, "last_notification": false}};

if (!ls.getItem('channels')) {
  ls.setItem('channels',
    JSON.stringify(originalChannels)
  );
}

(function () {
  let currChannels = JSON.parse(ls.getItem('channels'));

  for (let channel in currChannels) {
    if (currChannels.hasOwnProperty(channel)) {
      if (typeof originalChannels[channel] == 'undefined') {
        delete currChannels[channel];
      }
    }
  }

  for (let channel in originalChannels) {
    if (originalChannels.hasOwnProperty(channel)) {
      if (typeof currChannels[channel] == 'undefined') {
        currChannels[channel] = originalChannels[channel];
      }
    }
  }

  ls.setItem('channels', JSON.stringify(currChannels));
})();

(function () {
  ls.removeItem('channels.info');
  let info = {};

  for (let channel in originalChannels) {
    if (originalChannels.hasOwnProperty(channel)) {
      info[channel] = {};
    }
  }

  ls.setItem('channels.info', JSON.stringify(info));
})();

let chs = JSON.parse(ls.getItem('channels')),
  newList = JSON.parse(JSON.stringify(originalChannels));

for (let k in chs) {
  if (chs.hasOwnProperty(k)) {
    newList[k].notifications = chs[k].notifications;
  }
}

ls.removeItem('channels');
ls.setItem('channels', JSON.stringify(newList));

//ls.removeItem('configs')
if (!ls.getItem('configs')) {
  ls.setItem('configs', JSON.stringify({
    notifications: {
      on: true,
      sound: true,
      volumn: 25
    },
    refresh: {
      interval: 30 * 1000
    },
    oldschool: false
  }));
}

let channels = JSON.parse(ls.getItem('channels'));
const configs = JSON.parse(ls.getItem('configs'));

(function () {
  if (typeof configs.notifications.volumn == 'undefined') {
    configs.notifications['volumn'] = 25;
  }

  if (configs.refresh.interval === 30 * 60 * 1000) {
    configs.refresh.interval = 30 * 1000;
  }

  if(typeof configs.oldschool == 'undefined') {
    configs['oldschool'] = false;
  }

  ls.setItem('configs', JSON.stringify(configs));
})();

const playNotificationSound = function () {
  var audio = new Audio('public/sounds/notification.mp3');
  audio.volumn = configs.notifications.volumn / 100;
  audio.play();
}

chrome.browserAction.setBadgeText({text: "0"});

const channelNotify = function (channel, body, data, first) {
  first = typeof first == 'undefined' ? false : first;
  let channelData = channels[channel];

  if (channelData.notifications && configs.notifications.on) {
    let notificationOptions = {
      body: body.replace('%title%', data.data.category.title),
      icon: data.data.url_thumbnail
    };

    if (configs.notifications.sound) {
      notificationOptions.silent = false;
      if (!first) {
        playNotificationSound();
      }
    }

    let n = new Notification(channel, notificationOptions),
      uri = 'http://azubu.tv/' + channel;

    n.onclick = function () {
      window.open(uri);    
    };

    channels = setLastNotification(channel, new Date());
    setTimeout(function () {n.close()}, 25000);
  }
};

const setInfo = function (channel, data) {
  let curr = JSON.parse(ls.getItem('channels.info'));

  if (curr[channel]) {
    curr[channel] = data;
  }

  ls.setItem('channels.info', JSON.stringify(curr));
};

const checkOnline = function (first) {
  localStorage.setItem('keyd_extension_running', true);
  first = typeof first == 'undefined' ? false : first;

  for (let channel in channels) {
    if (channels.hasOwnProperty(channel)) {
      $.ajax({
        method: 'GET',
        url:  'http://api.azubu.tv/public/channel/' + channel + '/info',
        type:   'json',
        async:  false,
        success: function (data) {
          setInfo(channel, data.data);

          if (data.data.is_live) {
            if (!channels[channel].online) {
              channels = setStatus(channel, true);

              channelNotify(channel, 'começou a transmitir %title%', data, first);
            }
          } else {
            if (channels[channel].online) {
              channels = setStatus(channel, false);
            }
          }
        }
      });
    }

    if (first && !!getOnline().length && configs.notifications.sound) {
      playNotificationSound();
    }

    chrome.browserAction.setBadgeText({text: "" + getOnline().length + ""});
    localStorage.removeItem('keyd_extension_running');
  }
};

checkOnline(true);

setInterval(function () { checkOnline(false); }, configs.refresh.interval);
setInterval(function () {
  let online = getOnline(),
    channels = JSON.parse(localStorage.getItem('channels'));

  for (let channel in online) {
    if (online.hasOwnProperty(channel)) {
      let channelName = online[channel],
        channelData = channels[channelName];

      if (channelData.last_notification != false && (new Date - new Date(channelData.last_notification)) >= 60 * 60 * 1000) {
        $.ajax({
          method: 'GET',
          url:  'http://api.azubu.tv/public/channel/' + channelName + '/info',
          type:   'json',
          async:  false,
          success: function (data) {
            if (data.data.is_live) {
              channelNotify(channelName, 'está transmitindo %title%', data, false);
            }
          }
        }); 
      }
    }
  }
}, 500);