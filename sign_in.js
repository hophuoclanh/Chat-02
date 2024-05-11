$(document).ready(function(){
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
                window.location.href = 'chat.html'; // Redirect after successful sign-in
            },
            error: function(xhr, status, error) {
                console.error('Sign in failed', xhr.responseJSON.message);
                alert('Sign in failed: ' + xhr.responseJSON.message);
            }
        });
    });
});