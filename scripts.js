$(document).ready(function(){
    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });

    var socket = new WebSocket('ws://localhost:6789');

    socket.onopen = function(event) {
        console.log('Connection established!');
    };

    socket.onmessage = function(event) {
        console.log('Message from server ', event.data);
        var messages = document.getElementById('messages');
        var message = document.createElement('div');
        message.className = 'd-flex justify-content-start mb-4'; // Adjust class based on who sends the message
        message.innerHTML = `<div class="img_cont_msg">
            <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg">
            </div>
            <div class="msg_cotainer">
                ${event.data}
                <span class="msg_time">${new Date().toLocaleTimeString()}</span>
            </div>`;
        messages.appendChild(message);
    };

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

    function sendMessage() {
        var input = document.getElementById('messageInput');
        if(input.value.trim() !== '') {
            socket.send(input.value);  // Sending message to server
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
});