document.addEventListener('DOMContentLoaded', () => {
    const usernameField = document.querySelector('#usernameField');
    const invalidUsername = document.querySelector('#invalidUsername');

    const emailField = document.querySelector('#emailField');
    const invalidEmail = document.querySelector('#invalidEmail');

    const passwordField1 = document.querySelector('#passwordField1');
    const invalidPassword1 = document.querySelector('#invalidPassword1');

    const passwordField2 = document.querySelector('#passwordField2');
    const invalidPassword2 = document.querySelector('#invalidPassword2');

    const submitButton = document.querySelector('#submitButton');

    const togglePassword1 = document.querySelector('#togglePassword1')
    const togglePassword2 = document.querySelector('#togglePassword2')

    usernameField.addEventListener('keyup', () => {
        const usernameVal = usernameField.value;

        usernameField.classList.remove('is-invalid');

        if(usernameVal.length >= 0) {
            fetch('/auth/validate-username/', {
                body: JSON.stringify({username: usernameVal}),
                method: 'POST'
            })
            .then((result) => {
                if(result.status === 200) {
                    invalidUsername.style.display = 'none';
                    usernameField.classList.add('is-valid')
                    submitButton.disabled = false;
                } else {
                    invalidUsername.style.display = 'block';
                    usernameField.classList.add('is-invalid');
                    submitButton.disabled = true;
                }
                return result.json();
            })
            .then((data) => {
                var values = Object.values(data)
                invalidUsername.innerHTML = `<p>${values[0]}</p>`
            });
        }; 
    });

    emailField.addEventListener('keyup', () => {
        const emailVal = emailField.value;

        emailField.classList.remove('is-invalid')

        fetch('/auth/validate-email/', {
            body: JSON.stringify({email: emailVal}),
            method: 'POST'
        })
        .then((result) => {
            if(result.status === 200) {
                invalidEmail.style.display = 'none';
                emailField.classList.add('is-valid');
                submitButton.disabled = false;
            } else {
                invalidEmail.style.display = 'block';
                emailField.classList.add('is-invalid');
                submitButton.disabled = true;
            }
            return result.json();
        })
        .then((data) => {
            var values = Object.values(data);
            invalidEmail.innerHTML = `<p>${values}</p>`;
        });
    });

    passwordField1.addEventListener('keyup', () => {
        const passwordVal = passwordField1.value;

        passwordField1.classList.remove('is-invalid');
        fetch('/auth/validate-password/', {
            body: JSON.stringify({ password: passwordVal }),
            method: 'POST'
        })
        .then((result) => {
            if(result.status === 200) {
                passwordField1.classList.add('is-valid');
                invalidPassword1.style.display = 'none';
                submitButton.disabled = false;
            } else {
                passwordField1.classList.add('is-invalid')
                invalidPassword1.style.display = 'block';
                submitButton.disabled = true;
            }
            return result.json();
        })
        .then((data) => {
            var values = Object.values(data);
            invalidPassword1.innerHTML = `<p>${values}</p>`
        });
    });

    passwordField2.addEventListener('keyup', () => {
        const passwordVal1 = passwordField1.value;
        const passwordVal2 = passwordField2.value;

        passwordField1.classList.remove('is-invalid');
        passwordField2.classList.remove('is-invalid');
        fetch('/auth/validate-password-match/', {
            body: JSON.stringify({
                password1: passwordVal1,
                password2: passwordVal2
            }),
            method: 'POST'
        })
        .then((result) => {
            if(result.status === 200) {
                passwordField1.classList.add('is-valid');
                passwordField2.classList.add('is-valid');
                invalidPassword2.style.display = 'none';
                submitButton.disabled = false;
            } else {
                passwordField1.classList.add('is-invalid');
                passwordField2.classList.add('is-invalid');
                invalidPassword2.style.display = 'block';
                submitButton.disabled = true;
            }
            return result.json();
        })
        .then((data) => {
            var values = Object.values(data);
            invalidPassword2.innerHTML = `<p>${values}</p>`;
        });
    });

    togglePassword1.addEventListener('click', () => {
        const type = passwordField1.getAttribute('type') === 'password' ? 'text': 'password';
        passwordField1.setAttribute('type', type);
        const name = togglePassword1.getAttribute('name') === 'eye-outline' ? 'eye-off-outline': 'eye-outline';
        togglePassword1.setAttribute('name', name);
    });

    togglePassword2.addEventListener('click', () => {
        const type = passwordField2.getAttribute('type') === 'password' ? 'text': 'password';
        passwordField2.setAttribute('type', type);
        const name = togglePassword2.getAttribute('name') === 'eye-outline' ? 'eye-off-outline': 'eye-outline';
        togglePassword2.setAttribute('name', name);
    });
});