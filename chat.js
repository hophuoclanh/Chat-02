$(document).ready(function(){
    
    addMessage("Hello, this is a test!", "khalid", "incoming");
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });

    var socket = new WebSocket('ws://localhost:6789');

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data); // Assuming the server sends JSON data
        console.log('Message from server: ', data);
        addMessage(data.message, data.user, data.type);
    };

    function sendMessage() {
        var input = document.getElementById('messageInput');
        if (input.value.trim() !== '') {
            // Assuming you send JSON data to the server
            socket.send(JSON.stringify({ message: input.value, user: 'yourUsername', type: 'outgoing' }));
            addMessage(input.value, 'yourUsername', 'outgoing');  // Display the message in the UI as outgoing
            input.value = '';  // Clear the input after sending
        }
    }

    document.getElementById('send').addEventListener('click', function() {
        sendMessage();
    });

    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addMessage(msg, user, type) {
        console.log('Adding message:', msg, 'User:', user, 'Type:', type);  // Debug output
        var messages = document.getElementById('messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = type === 'incoming' ? 'd-flex justify-content-start mb-4' : 'd-flex justify-content-end mb-4';
        var userImage = getUserImage(user, type);  // Make sure this function is correct
        console.log('User Image URL:', userImage);  // Debug: Check the image URL
    
        msgDiv.innerHTML = `
            <div class="img_cont_msg">
                <img src="${userImage}" class="rounded-circle user_img_msg">
            </div>
            <div class="msg_cotainer${type === 'incoming' ? '' : '_send'}">
                ${msg}
                <span class="msg_time${type === 'incoming' ? '' : '_send'}">${new Date().toLocaleTimeString()}, Today</span>
            </div>`;
        messages.appendChild(msgDiv);
    }
    

    function getUserImage(username, type) {
        var userImages = {
            'khalid': 'https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg',
            'yourUsername': 'https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256',
            'default': 'path_to_default_image.jpg' // Ensure you have a default image
        };
        return userImages[username] || userImages['default'];
    }
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:5000/signup', // Make sure this matches your server's API endpoint
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#name').val(),
                phone: $('#phone').val(),
                password: $('#password').val()
            }),
            success: function(response) {
                console.log('Signup successful', response);
                alert('Signup successful! You can now sign in.');
                window.location.href = '/signin.html'; // Redirect after signup if needed
            },
            error: function(xhr, status, error) {
                console.error('Signup failed', xhr.responseJSON.message);
                alert('Signup failed: ' + xhr.responseJSON.message);
            }
        });
    });
});