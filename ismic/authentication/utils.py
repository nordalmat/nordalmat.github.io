import re

from django.contrib import messages
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .tokens import account_activation_token


def validate_password(password):
    if len(password) < 6:
        return [False, {'lengthPasswordError': 'Password must be at least 6 characters long!'}, 400]
    if re.search('[a-z]', password) is None:
        return [False, {'noLowercasePasswordError': 'Make sure your password has at least one lowercase character in it.'}, 400]
    elif re.search('[0-9]', password) is None:
        return [False, {'noDigitPasswordError': 'Make sure your password has at least one digit in it.'}, 400]
    elif re.search('[A-Z]', password) is None:
        return [False, {'noUppercasePasswordError': 'Make sure your password has at least one uppercase character in it.'}, 400]
    return [True, {'validPassword': True}, 200]


def activate_email(request, user, to_email):
    mail_subject = 'Activate your ISMIC account'
    message = render_to_string('authentication/activate_account.html', {
        'user': user,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        messages.success(request, 'User created! Check your inbox to activate profile!')
    else:
        message.error(request, f'Problem sending email to {to_email}, check if you typed it correctly.')
