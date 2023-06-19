import json

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views import View
from validate_email import validate_email

from django.contrib.auth.models import User
from .tokens import account_activation_token
from .utils import activate_email, validate_password


class RegistrationView(View):
    def get(self, request):
        return render(request, 'authentication/register.html')

    def post(self, request):
        data = request.POST
        username = data['username']
        email = data['email']
        first_name = data['first_name']
        last_name = data['last_name']
        password1 = data['password1']
        password2 = data['password2']
        if username is not None and not User.objects.filter(username=username).exists():
            if validate_email(email) and not User.objects.filter(email=email).exists():
                validation = validate_password(password1)
                if not validation[0]:
                    messages.error(request, list(validation[1].values())[0])
                # elif not first_name or not last_name:
                #     messages.error(request, 'First name and last name are required!')
                elif password1 != password2:
                    messages.error(request, 'Passwords do not match!')
                else:
                    user = User.objects.create_user(
                        username=username, email=email, password=password1,
                        first_name=first_name, last_name=last_name, is_active=False
                    )
                    activate_email(request, user, email)
                    return redirect(reverse('login'))
            else:
                messages.error(request, 'Email is already taken!')
        else:
            messages.error(request, 'Username is already taken!')
        return render(request, 'authentication/register.html', {
            'username': username,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
        })


class ValidateUsernameView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data['username']
        if len(str(username)) == 0:
            return JsonResponse({'emptyUsernameError': 'Username cannot be none.'}, status=400)
        if len(str(username)) > 64:
            return JsonResponse({'longUsernameError': 'Username cannot be longer than 64 characters.'}, status=400)
        if not str(username).isalnum():
            return JsonResponse({'usernameFormatError': 'Username must contain only alphanumeric characters.'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'usernameAvailabilityError': 'Username is already taken.'}, status=409)
        return JsonResponse({'validUsername': True}, status=200)


class ValidateEmailView(View):
    def post(self, request):
        data = json.loads(request.body)
        email = data['email']
        if len(str(email)) == 0:
            return JsonResponse({'emptyEmailError': 'Email cannot be none.'}, status=400)
        if not validate_email(email):
            return JsonResponse({'emailFormatError': 'Email format is invalid.'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'emailAvailabilityError': 'Email is already taken.'}, status=409)
        return JsonResponse({'validEmail': True}, status=200)


class ValidatePasswordView(View):
    def post(self, request):
        data = json.loads(request.body)
        password = data['password']
        validation = validate_password(password)
        if len(str(password)) == 0:
            return JsonResponse({'emptyPasswordError': 'Password cannot be none.'}, status=400)
        if not validation[0]:
            return JsonResponse(validation[1], status=validation[2])
        return JsonResponse({'validPassword': True}, status=200)


class ValidatePasswordMatchView(View):
    def post(self, request):
        data = json.loads(request.body)
        password1 = data['password1']
        password2 = data['password2']
        if password1 != password2:
            return JsonResponse({'matchingPasswordError': 'Passwords do not match.'}, status=400)
        return JsonResponse({'validPassword': True}, status=200)


class LoginView(View):
    def get(self, request):
        return render(request, 'authentication/login.html')

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect(reverse('index'))
            messages.error(request, 'The username or password is incorrect!')
            return render(request, 'authentication/login.html', {
                'username': username
            })
        messages.error(request, 'Please fill out all fields!')
        return render(request, 'authentication/login.html', {
            'username': username
        })


class ActivationView(View):
    def get(self, request, uid64, token):
        uid = force_str(urlsafe_base64_decode(uid64))
        user = User.objects.filter(pk=uid).first()
        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            messages.success(request, 'Thank you for your profile activation. You can now login to your account.')
            return redirect(reverse('login'))
        messages.error(request, 'Activation link is invalid or expired.')
        return redirect(reverse('index'))


class LogoutView(View):
    def post(self, request):
        logout(request)
        return redirect(reverse('index'))