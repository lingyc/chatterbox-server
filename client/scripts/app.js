let rooms = {};

const app = {
  username: '',
  roomname: 'Main',
  friends: {},
  server: 'http://127.0.0.1:3000/'
};

app.init = function() {
  app.fetch();

  app.username = window.location.search.substr(10);

  $('.clear').on('click', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    app.clearMessages();
    return false;
  });
  
  $('#roomSelect').change(e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    let temp;
    if ($('#roomSelect').val() === 'Main') {
      app.roomname = 'Main';
    } else {
      app.roomname = $('#roomSelect').val();
    }
    if (app.roomname) {
      $('.chat').hide();
      for (let i = 0; i < $('.chat').length; i++) {
        temp = $($('.chat')[i]);
        if (temp.data('room') === app.roomname) {
          temp.show();
        }
      }
    } else {
      $('.chat').show();
    }
    return false;
  });

  $('#send').on('submit', app.handleSubmit);

  $('#chats').on('click', '.username', e => {
    e.preventDefault;
    if (!app.friends[$(e.target).text()]) {
      app.addFriend($(e.target));  
    }
  });
};

app.send = function(message) {
  $.ajax({
    url: this.server + 'classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: data => {
      console.log('chatterbox: Message sent', message);
    },
    error: data => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  var data = $.ajax({
    url: this.server + 'classes/messages',
    type: 'GET',
    // data: {order: '-createdAt'},
    contentType: 'application/json',
    success: data => {
      console.log(data);
      app.clearMessages();
      app.populateChat(data.results);
      app.populateRooms(data.results);
    },
    error: data => {
      console.error('chatterbox: Failed to receive message', data);
    }
  });

  app.clearMessages = () => {
    $('#chats').children().remove();
    this.messageLog = [];
  };

  app.addMessage = chatObj => {
    app.send(chatObj);
  };

  app.createMessage = chatObj => {
    const tempMsg = $('<div class="chat"></div>');
    tempMsg.text(chatObj.message);
    const tempUsr = $('<div class="username"></div>');
    tempUsr.text(chatObj.username);
    if (app.friends[chatObj.username]) {
      tempUsr.addClass('friend');
      tempMsg.addClass('bolded');
    }
    tempMsg.prepend(tempUsr);
    return tempMsg;
  };

  app.populateChat = chatList => {
    _.each(chatList, app.showMessage);
    app.messageLog = data;
  };

  app.showMessage = chatObj => {
    // Takes in message
    // gives message data value of objectId
    var $newMsg = app.createMessage(chatObj);
    $newMsg.data('room', chatObj.roomname);
    $newMsg.hide();
    // appends it to the page
    $('#chats').prepend($newMsg);
    if (app.roomname === 'Main' || $newMsg.data('room') === app.roomname) {
      $newMsg.show();
    }
  };

  app.refresh = () => {
    app.fetch();
  };
  
  app.addRoom = roomName => {
    $('#roomSelect').append($(`<option value="${roomName}"></option>`).text(roomName));
    rooms[roomName] = true;
  };

  app.populateRooms = chatList => {
    $('#roomSelect').html('');
    rooms = {Main: true };
    _.each(chatList, chatObj => {
      if (chatObj.roomname !== undefined && chatObj.roomname !== '') {
        rooms[chatObj.roomname] = true;
      }
    });
    _.each(rooms, (val, roomName) => {
      app.addRoom(roomName);
    });
  };

  app.handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    handleFlag = true;

    var post = {};
    post.username = app.username;
    post.message = $('#message').val();
    post.roomname = app.roomname || 'Main';
    app.addMessage(post);
    $('.username').val('');
    $('#message').val('');
  };

  app.addFriend = e => {
    e.addClass('friend');
    e.closest('.chat').addClass('bolded');
    app.friends[e.text()] = true;
  };
};

$('document').ready(() => {

  app.init();

  setInterval(app.refresh, 5000);
});





