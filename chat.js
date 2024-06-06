$(document).ready(function() {
    var socket;
    var token = localStorage.getItem('token'); // Retrieve the token stored during sign-in
    var currentChatUser;
    var localUserName = localStorage.getItem('username');
    var currentRoom;

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
                if (data.message === 'Authentication successful') {
                    localStorage.setItem('username', data.username);
                    localUserName = data.username;
                    console.log(`Authentication successful, username set to ${localUserName}`);
                } else if (data.message.includes('has joined the room')) {
                    console.log('User joined the room:', data.message);
                }
            } else if (data.type === 'chat' || data.type === 'private_chat') {
                addMessage(data.message, data.sender, 'incoming');
                console.log(`Received message from ${data.sender}: ${data.message}`);
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
            var sender = localUserName;
            var room = currentRoom;

            if (!room) {
                console.log('No current room set');
                return;
            }

            console.log(`Preparing to send message from ${sender} in room ${room}`);

            socket.send(JSON.stringify({
                action: 'private_message',
                sender: sender,
                room: room,
                message: input.value
            }));
            console.log(`Sending message from ${sender} in room ${room}: ${input.value}`);
            addMessage(input.value, 'You', 'outgoing');
            input.value = '';  // Clear the input after sending
        } else {
            console.log('No message to send');
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
            var userItem = `<li class="d-flex bd-highlight search-result" data-name="${user.name}">
                                <div class="user_info">
                                    <span>${user.name}</span>
                                    <p>${user.phone}</p>
                                </div>
                            </li>`;
            results.append(userItem);
        });

        $('.search-result').click(function() {
            var userName = $(this).data('name');
            console.log(`User ${userName} clicked for private chat.`);
            initiatePrivateChat(userName);
        });
    }

    function generateRoomName(...users) {
        return users.sort().join('_');
    }

    function initiatePrivateChat(userName) {
        currentChatUser = userName;
        $('#chatRoomName').text(userName);
        var room = generateRoomName(localUserName, userName);

        console.log(`Initiating private chat with ${userName}. Room: ${room}`);
        console.log(`Current chat user set to ${currentChatUser}`);
        console.log(`Local user: ${localUserName}`);
        currentRoom = room;

        socket.send(JSON.stringify({ action: 'create_room', room: room }));
        socket.send(JSON.stringify({ action: 'join', username: localUserName, room: room }));
    }

    function joinRoom(roomName) {
        currentRoom = roomName; // Set the current chat room to the selected room
        currentChatUser = null; // Invalidate the currentChatUser for group chat
        $('#chatRoomName').text(roomName);

        console.log(`Joining room: ${roomName}`);
        console.log(`Local user: ${localUserName}`);

        socket.send(JSON.stringify({ action: 'join', username: localUserName, room: roomName }));
    }

    // Group chat creation event handlers
    $('#createGroupChatBtn').click(function() {
        $('#createGroupChatModal').modal('show');
    });

    $('#createGroupBtn').click(function() {
        var groupName = $('#groupName').val().trim();
        var groupUsers = $('#groupUsers').val().trim().split(',').map(user => user.trim());
        if (groupName && groupUsers.length > 0) {
            var room = generateRoomName(groupName, ...groupUsers);

            console.log(`Creating group chat with name: ${groupName}, Users: ${groupUsers}`);
            // Send room creation request to the Flask server to save it in the database
            $.ajax({
                url: 'http://localhost:5000/create_room',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ room_name: room, users: groupUsers }),
                success: function(response) {
                    console.log('Room created:', response);
                    socket.send(JSON.stringify({
                        action: 'create_group_chat',
                        groupName: groupName,
                        users: groupUsers,
                        room: room
                    }));
                    $('#createGroupChatModal').modal('hide');
                },
                error: function(xhr, status, error) {
                    console.error('Room creation failed', xhr.responseJSON.message);
                }
            });
        } else {
            alert('Please enter a group name and at least one user.');
        }
    });

    // Search for rooms
    $('#searchRoomInput').on('input', function() {
        var query = $(this).val();
        if (query.trim() !== '') {
            $.ajax({
                url: 'http://localhost:5000/search_rooms',
                type: 'GET',
                data: { query: query },
                success: function(response) {
                    displayRoomSearchResults(response);
                },
                error: function(xhr, status, error) {
                    console.error('Search failed', xhr.responseJSON.message);
                }
            });
        } else {
            $('#roomSearchResults').empty();
        }
    });

    function displayRoomSearchResults(rooms) {
        var results = $('#roomSearchResults');
        results.empty();
        rooms.forEach(room => {
            var roomItem = `<li class="d-flex bd-highlight room-search-result" data-name="${room.name}">
                                <div class="user_info">
                                    <span>${room.name}</span>
                                </div>
                            </li>`;
            results.append(roomItem);
        });

        $('.room-search-result').click(function() {
            var roomName = $(this).data('name');
            console.log(`Room ${roomName} clicked for joining.`);
            joinRoom(roomName);
        });
    }

    connectWebSocket(); // Connect to WebSocket when the chat page loads
});
