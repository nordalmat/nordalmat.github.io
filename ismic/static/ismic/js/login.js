document.addEventListener('DOMContentLoaded', () => {
    const passwordField = document.querySelector('#passwordField');
    const togglePassword = document.querySelector('#togglePassword');

    togglePassword.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text': 'password';
        passwordField.setAttribute('type', type);
        const name = togglePassword.getAttribute('name') === 'eye-outline' ? 'eye-off-outline': 'eye-outline';
        togglePassword.setAttribute('name', name)
    });
});