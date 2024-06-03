$(document).ready(function(){
    var socket;
    var token = localStorage.getItem('token'); // Retrieve the token stored during sign-in
    var currentChatUser;

    // Connect to WebSocket server and authenticate using the token
    function connectWebSocket() {
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
            } else if (data.type === 'chat') {
                addMessage(data.message, data.sender, 'incoming');
            }
        };

        socket.onclose = function() {
            console.log('Disconnected from the WebSocket server.');
        };

        socket.onerror = function(error) {
            console.log('WebSocket error:', error);
        };
    }

    function sendMessage() {
        var input = document.getElementById('messageInput');
        if (input.value.trim() !== '') {
            socket.send(JSON.stringify({ action: 'message', message: input.value }));
            addMessage(input.value, 'You', 'outgoing');
            input.value = '';  // Clear the input after sending
        }
    }

    function addMessage(msg, user, type) {
        var messages = document.getElementById('messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = type === 'incoming' ? 'd-flex justify-content-start mb-4' : 'd-flex justify-content-end mb-4';

        msgDiv.innerHTML = `
            <div class="img_cont_msg">
                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg">
            </div>
            <div class="msg_cotainer${type === 'incoming' ? '' : '_send'}">
                ${msg}
                <span class="msg_time${type === 'incoming' ? '' : '_send'}">${new Date().toLocaleTimeString()}, Today</span>
            </div>`;
        messages.appendChild(msgDiv);
    }

    document.getElementById('send').addEventListener('click', function() {
        sendMessage();
    });

    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    $('#searchInput').on('input', function() {
        var query = $(this).val();
        if (query.trim() !== '') {
            $.ajax({
                url: 'http://localhost:5000/search_users',
                type: 'GET',
                data: { query: query },
                success: function(response) {
                    displaySearchResults(response);
                },
                error: function(xhr, status, error) {
                    console.error('Search failed', xhr.responseJSON.message);
                }
            });
        } else {
            $('#searchResults').empty();
        }
    });

    function displaySearchResults(users) {
        var results = $('#searchResults');
        results.empty();
        users.forEach(user => {
            var userItem = `<li class="d-flex bd-highlight search-result" data-id="${user._id}" data-name="${user.name}">
                                <div class="user_info">
                                    <span>${user.name}</span>
                                    <p>${user.phone}</p>
                                </div>
                            </li>`;
            results.append(userItem);
        });

        $('.search-result').click(function() {
            var userId = $(this).data('id');
            var userName = $(this).data('name');
            initiateChat(userId, userName);
        });
    }

    function initiateChat(userId, userName) {
        currentChatUser = userName;
        $('#chatRoomName').text(userName);
        socket.send(JSON.stringify({ action: 'join', nickname: userName, room: userId }));
    }

    connectWebSocket(); // Connect to WebSocket when the chat page loads
});
