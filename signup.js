$(document).ready(function(){
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:5000/signup', // Make sure this matches your server's API endpoint
            type: 'OPTIONS',
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