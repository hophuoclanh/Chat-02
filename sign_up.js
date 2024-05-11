$(document).ready(function(){
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:5000/signup',
            type: 'OPTIONS',  // Change this from 'OPTIONS' to 'POST'
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#name').val(),
                phone: $('#phone').val(),
                password: $('#password').val()
            }),
            success: function(response) {
                console.log('Signup successful', response);
                alert('Signup successful! You can now sign in.');
                window.location.href = 'sign_in.html'; // Redirect after signup if needed
            },
            error: function(xhr, status, error) {
                console.error('Signup failed', xhr.responseJSON ? xhr.responseJSON.message : error);
                alert('Signup failed: ' + (xhr.responseJSON ? xhr.responseJSON.message : "An error occurred"));
            }
        });
    });
});