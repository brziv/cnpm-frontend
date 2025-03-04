document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const user = await response.json();
                alert('Đăng nhập thành công');
                // Save user data to local storage or session
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = 'form.html';
            } else {
                const error = await response.text();
                alert('Đăng nhập thất bại: ' + error);
            }
        } catch (error) {
            alert('Đăng nhập thất bại: ' + error.message);
        }
    });
});