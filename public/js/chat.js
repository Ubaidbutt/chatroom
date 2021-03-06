let socket = io();

let scrollToBottom = () => {
    // SELECTOR
    let messages = jQuery ('#messages');
    let newMessage = messages.children('li:last-child');

    // HEIGHTS
    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on ('connect', () => {
    console.log (`Connected to server. `);

    let params = jQuery.deparam (window.location.search);

    socket.emit ('join', params, (err) => {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log ('No error. ');
        }
    });
});

socket.on ('updateUserList', (users) => {
    let ol = jQuery('<ol></ol>');

    users.forEach ((user) => {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on ('disconnect', () => {
    console.log (`Disconnect from server. `);
});

socket.on ('newMsg', (msg) => {
    let formattedTime = moment(msg.createdAt).format('h:mm a');
    let template = jQuery ('#message-template').html();

    let html = Mustache.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on ('newLocationMsg', (msg) => {
    let formattedTime = moment(msg.createdAt).format('h:mm a');
    let template = jQuery ('#location-message-template').html();

    let html = Mustache.render (template, {
        url: msg.url,
        from: msg.from,
        createdAt: formattedTime 
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery ('#message-form').on ('submit', (e) => {
    e.preventDefault();

    let msgTextbox = jQuery ('[name=message]');

    socket.emit ('createMsg', {
        from: 'User',
        text: msgTextbox.val()
    }, () => {
        msgTextbox.val('');
    });
});

let locationButton = jQuery ('#send-location');
locationButton.on ('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser. ');
    }

    locationButton.attr ('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition ((position) => {
        locationButton.removeAttr ('disabled').text('Send Location');
        socket.emit ('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, () => {
        locationButton.removeAttr ('disabled').text('Send Location');
        alert ('Unable to fetch location. ');
    });
});