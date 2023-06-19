from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('add-post/', views.add_post, name='add-post'),
    path('edit-post/<int:id>', views.edit_post, name='edit-post'),
    path('<int:id>', views.post_entry, name='post-entry'),
    path('delete-post/<int:id>', views.delete_post, name='delete-post'),
    path('like/', views.like, name='like'),
    path('add-comment/', views.add_comment, name='add-comment'),
    path('edit-comment/', views.edit_comment, name='edit-comment'),
    path('delete-comment/', views.delete_comment, name='delete-comment'),
    path('get-replies/', views.get_replies, name='get-replies'),
    path('add-reply/', views.add_reply, name='add-reply'),
    path('edit-reply/', views.edit_reply, name='edit-reply'),
    path('delete-reply/', views.delete_reply, name='delete-reply'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)