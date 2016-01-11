/**
 * @author Gabriel Jacinto aka. GabrielJMJ <gamjj74@hotmail.com>
 */

'use strict';

const ls = localStorage;

window.onload = function () {
  let online = getOnline(),
    channels = JSON.parse(ls.getItem('channels')),
    configs = JSON.parse(ls.getItem('configs'));

  const createChannel = function (channel, sufix) {
    sufix = typeof sufix == 'undefined' ? '' : sufix;
    let channelData = channels[channel],
      online = channelData.online,
      status = '',
      dataDiv = '',
      data =  getChannelInfo(channel),
      notifications = channelData.notifications,
      notificationsIconClass = !notifications ? 'grayscale' : '',
      notificationsText = notifications ? 'ativadas': 'desativadas',
      notificationsIcon = '<div data-channel="' + channel + '" class="notification-turn-onoff">' +
                  '<img alt="Notificações ' + notificationsText + ' para este canal" title="Notificações ' + notificationsText + ' para este canal" id="notification-icon-' + channel + sufix + '" src="public/images/icons/alarm-128.png" width="24px" class="' + notificationsIconClass + '">' +
                '</div>',
      oldschool = configs.oldschool ? 'oldschool.' : '';

    if (online) {
      status = '-online';
      dataDiv = '<div class="channel-online-data"><small><b>' + data.category.title + '</b> - ' + data.view_count + ' viewers</small></div>';
    }

    return notificationsIcon + '<a href="http://' + oldschool + 'azubu.tv/' + channel + '" target="_blank" class="channel-link"><li id="channel-' + channel + status + '" class="channel">' + 
      '<div class="channel-thumb"><img src="' + data.url_thumbnail + '" height="52px"></div>'+
      '<div class="channel-data"><div class="channel-name"><b>' + channel + '</b></div>' +
      dataDiv + '</div>' +
      '<div style="clear: both"></div></li></a>';
  };

  if (!!online.length) {
    $('#channels #online').html('<div class="channel-list"></div><div style="clear: both"></div>');
  }

  for (let channel in online) {
    if (online.hasOwnProperty(channel)) {
      $('#channels #online .channel-list').append(createChannel(online[channel]));
    }
  }

  for (let channel in channels) {
    if (channels.hasOwnProperty(channel)) {
      $('#channels #all .channel-list').append(createChannel(channel, '-all'));
    }
  }

  $(document).on('click', '.notification-turn-onoff', function () {
    let channel = $(this).attr('data-channel'),
      channelData = channels[channel],
      notifications = channelData.notifications,
      title = 'Notificações ' + (!notifications ? 'ativadas' : 'desativadas') + ' para este canal';
    channels[channel].notifications = notifications ? false : true;

    ls.setItem('channels', JSON.stringify(channels));

    $('div[data-channel="' + channel + '"] #notification-icon-' + channel).attr({alt: title, title: title});
    $('div[data-channel="' + channel + '"] #notification-icon-' + channel + '-all').attr({alt: title, title: title});

    if (!notifications) {
      $('div[data-channel="' + channel + '"] #notification-icon-' + channel).removeClass('grayscale');
      $('div[data-channel="' + channel + '"] #notification-icon-' + channel + '-all').removeClass('grayscale');
    } else {
      $('div[data-channel="' + channel + '"] #notification-icon-' + channel).addClass('grayscale');
      $('div[data-channel="' + channel + '"] #notification-icon-' + channel + '-all').addClass('grayscale');
    }
  });

  $('nav li').on('click', function (el) {
    let tab = $(this).attr('data-open');

    $('nav li').each(function () {
      $(this).removeClass('current');
    });

    $('.tab').hide();
    $(this).addClass('current');
    $(tab).show();
  });

  $('#settings-btn').on('click', function () {
    $('nav li').each(function () {
      $(this).removeClass('current');
    });

    $('.tab').hide();
    $('#settings-tab').show();
  });

  // Settings
  (function () {
    const assign = function (obj, prop, value) {
      if (typeof prop === "string") {
        prop = prop.split(".");
      }

      if (prop.length > 1) {
        var e = prop.shift();
        assign(obj[e] =
             Object.prototype.toString.call(obj[e]) === "[object Object]"
             ? obj[e]
             : {},
             prop,
             value);
      } else {
        obj[prop[0]] = value;
      }
    };

    const setConfig = function (name, value) {
      let config = JSON.parse(ls.getItem('configs'));
      assign(config, name, value);
      ls.setItem('configs', JSON.stringify(config));
    };

    if (configs.notifications.on) {
      $('#notifications-on').prop('checked', true);
    }

    if (configs.oldschool) {
      $('#oldschool').prop('checked', true);
    }

    if (typeof configs.notifications.volumn != 'undefined') {
      $('#notifications-sound-volumn').val(configs.notifications.volumn);
      $('#percent').html(configs.notifications.volumn + '%');
    }

    if (configs.notifications.sound) {
      $('#notifications-sound').prop('checked', true);
    }

    $('#notifications-on').on('click', function () {
      if ($(this).is(':checked')) {
        setConfig('notifications.on', true);
      } else {
        setConfig('notifications.on', false);
      }
    });

    $('#notifications-sound').on('click', function () {
      if ($(this).is(':checked')) {
        setConfig('notifications.sound', true);
      } else {
        setConfig('notifications.sound', false);
      }
    });

    $('#oldschool').on('click', function () {
      if ($(this).is(':checked')) {
        setConfig('oldschool', true);
      } else {
        setConfig('oldschool', false);
      }
    });

    $('#notifications-sound-volumn').on('change', function () {
      setConfig('notifications.volumn', $(this).val());
      $('#percent').html($(this).val() + '%');
    });
  })();
};