from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('register/', views.RegistrationView.as_view(), name='register'),
    path('validate-username/', csrf_exempt(views.ValidateUsernameView.as_view()), name='validate-username'),
    path('validate-email/', csrf_exempt(views.ValidateEmailView.as_view()), name='validate-email'),
    path('validate-password/', csrf_exempt(views.ValidatePasswordView.as_view()), name='validate-password'),
    path('validate-password-match/', csrf_exempt(views.ValidatePasswordMatchView.as_view()), name='validate-password-match'),
    path('activate/<uid64>/<token>/', views.ActivationView.as_view(), name='activate'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]