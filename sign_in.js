$(document).ready(function(){
    let socket;

    $('#signInForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:5000/signin',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                phone: $('#phone').val(),
                password: $('#password').val()
            }),
            success: function(response) {
                console.log('Sign in successful', response);
                // Connect to WebSocket and authenticate
                connectWebSocket(response.token);
                // Redirect to chat page
                window.location.href = 'chat.html';
            },
            error: function(xhr, status, error) {
                console.error('Sign in failed', xhr.responseJSON.message);
                alert('Sign in failed: ' + xhr.responseJSON.message);
            }
        });
    });

    function connectWebSocket(token) {
        socket = new WebSocket('ws://localhost:6789');

        socket.onopen = function() {
            console.log('Connected to the WebSocket server.');
            socket.send(JSON.stringify({ action: 'authenticate', token: token }));
        };

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            console.log('Message from server:', data);
            if (data.type === 'system') {
                alert(data.message);
            }
        };

        socket.onclose = function() {
            console.log('Disconnected from the WebSocket server.');
        };

        socket.onerror = function(error) {
            console.log('WebSocket error:', error);
        };
    }
});
