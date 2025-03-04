document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const username = document.getElementById('username-register').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password-register').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Mật khẩu không khớp');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert('Đăng ký thành công');
            window.location.href = 'login.html';
        } else {
            const error = await response.text();
            alert('Đăng ký thất bại: ' + error);
        }
    } catch (error) {
        alert('Đăng ký thất bại: ' + error.message);
    }
});