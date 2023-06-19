from django import forms
from .models import Post, Comment
from tinymce.widgets import TinyMCE


class AddPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'ticker', 'body']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'ticker': forms.TextInput(attrs={'class': 'form-control'}),
            'content': TinyMCE(attrs={'cols': 80, 'rows': 30}),
        }


class AddCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['body']
        widget = {
            'body': forms.TextInput(attrs={'class': 'form-control'}),
        }
