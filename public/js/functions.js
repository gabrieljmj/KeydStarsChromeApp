'use strict';

const getOnline = function () {
  let channels = JSON.parse(localStorage.getItem('channels')),
    online = [];

  for (let ch in channels) {
    if (channels.hasOwnProperty(ch)) {
      if (channels[ch].online) {
        online.push(ch);
      }
    }
  }

  return online;
};

const setNotification = function (channel) {
  let channels = JSON.parse(localStorage.getItem('channels'));
  channels[channel].notifications = channels[channel].notifications ? false : true;
  localStorage.setItem('channels', JSON.stringify(channels));
  return channels[channel].notifications;
};

const getChannelInfo = function (channel) {
  /*var allData;

  $.ajax({
    method: 'GET',
    url:  'http://api.azubu.tv/public/channel/' + channel + '/info',
    type:   'json',
    async:  false,
    success: function (data) {
      allData = data.data;
    }
  });

  return allData;*/

  let all = JSON.parse(localStorage.getItem('channels.info'));
  return all[channel];
};

const setStatus = function (channel, status) {
  let channels = JSON.parse(localStorage.getItem('channels'));
  channels[channel].online = status;
  localStorage.setItem('channels', JSON.stringify(channels));
  
  if (!status) {
    setLastNotification(channel, false);
  }

  return channels;
};

const setLastNotification = function (channel, date) {
  let channels = JSON.parse(localStorage.getItem('channels'));
  channels[channel].last_notification = date;
  localStorage.setItem('channels', JSON.stringify(channels));
  return channels;
};