import threading
import json
from django.contrib import messages
from django.contrib.auth.models import User
from django.core.paginator import PageNotAnInteger, Paginator
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse

from .forms import AddPostForm, AddCommentForm
from .models import Like, Post, Comment, Reply
from .util import get_price_change, name_handling


def index(request):
    latest_posts = Post.objects.all().order_by('-created_at')

    # Pagination
    default_page = 1
    page = request.GET.get('page', default_page)
    items_per_page = 8
    paginator = Paginator(latest_posts, items_per_page)
    try:
        items_page = paginator.page(page)
    except PageNotAnInteger:
        items_page = paginator.page(default_page)
    return render(request, 'posts/index.html', {
        'latest_posts': items_page,
        'carousel_posts': latest_posts[:3],
    })


def add_post(request):
    if request.method == 'POST':
        data = request.POST
        form = AddPostForm(data)
        post = Post.create_post(request)
        if post:
            messages.success(request, 'You sucessfully added the post! It will appear at the feed soon!')
            t = threading.Thread(target=post.add_image, daemon=True)
            t.start()
            return redirect(reverse('index'))
        return render(request, 'posts/add_post.html', {
            'form': form,
        })
    form = AddPostForm() 
    return render(request, 'posts/add_post.html', {
        'form': form,
    })


def edit_post(request, id):
    post = Post.objects.get(id=id)
    if request.method == 'POST':
        data = request.POST
        form = AddPostForm(data)
        if post.edit(request):
            messages.success(request, 'You sucessfully edited the post!')
            t = threading.Thread(target=post.add_image, daemon=True)
            t.start()
            return redirect(reverse('index'))
        return render(request, 'posts/edit_post.html', {
            'form': form,
            'post': post
        })
    form = AddPostForm(instance=post) 
    return render(request, 'posts/edit_post.html', {
        'form': form,
        'post': post
    })


def post_entry(request, id):
    post = Post.objects.get(id=id)
    change = get_price_change(post)
    form = AddCommentForm()

    # Social
    is_liked = False
    if request.user.is_authenticated:
        is_liked = Like.objects.filter(user=request.user, post=post).count()
    likes_count = Like.objects.filter(post=post).count()
    comments = Comment.objects.filter(post=post).order_by('-created_at')
    comments_count = Comment.objects.filter(post=post).count()

    # Pagination 
    default_page = 1
    page = request.GET.get('page', default_page)
    items_per_page = 8
    paginator = Paginator(comments, items_per_page)
    try:
        items_page = paginator.page(page)
    except PageNotAnInteger:
        items_page = paginator.page(default_page)
    return render(request, 'posts/post_entry.html', {
        'post': post,
        'change': change,
        'is_liked': is_liked,
        'form': form,
        'comments': items_page,
        'likes_count': likes_count,
        'comments_count': comments_count,
    })


def delete_post(request, id):
    post = Post.objects.get(id=id)
    post.delete()
    messages.success(request, 'You sucessfully deleted the post!')
    return redirect('index')


def like(request):
    data = json.loads(request.body)
    post_id = int(data['post_id'])
    post = Post.objects.get(id=post_id)
    is_liked = Like.objects.filter(user=request.user, post=post).count()
    if is_liked:
        Like.objects.get(user=request.user, post=post).delete()
    else:
        like = Like.objects.create(user=request.user, post=post)
    post.save()
    return JsonResponse({'likesCount': Like.objects.filter(post=post).count()})


def add_comment(request):
    data = json.loads(request.body)
    post_id = int(data['post_id'])
    body = data['body']
    post = Post.objects.get(id=post_id)
    comment = Comment.objects.create(user=request.user, post=post, body=body)
    name = name_handling(request)
    return JsonResponse({
        'commentsCount': Comment.objects.filter(post=post).count(), 'name': name,
        'commentId': str(comment.id), 'commentBody': comment.body,
    })


def edit_comment(request):
    data = json.loads(request.body)
    comment_id = int(data['comment_id'])
    body = data['body']
    if request.user.is_staff:
        comment = Comment.objects.get(id=comment_id)
    else:
        comment = Comment.objects.get(id=comment_id, user=request.user)
    comment.body = body
    comment.save()
    return JsonResponse({'commentId': comment_id, 'newBody': comment.body})


def delete_comment(request):
    data = json.loads(request.body)
    comment_id = int(data['comment_id'])
    post_id = int(data['post_id'])
    if request.user.is_staff:
        comment = Comment.objects.get(id=comment_id)
    else:
        comment = Comment.objects.get(id=comment_id, user=request.user)
    post = Post.objects.get(id=post_id)
    comment.delete()
    return JsonResponse({'commentsCount': Comment.objects.filter(post=post).count()})


def get_replies(request):
    pass


def add_reply(request):
    data = json.loads(request.body)
    comment_id = int(data['comment_id'])
    body = data['body']
    comment = Comment.objects.get(id=comment_id)
    reply = Reply.objects.create(user=request.user, comment=comment, body=body)
    name = name_handling(request)
    return JsonResponse({
        'name': name, 'replyId': str(reply.id), 'replyBody': reply.body,
    })


def edit_reply(request):
    data = json.loads(request.body)
    reply_id = int(data['reply_id'])
    body = data['body']
    reply = Reply.objects.get(id=reply_id, user=request.user)
    reply.body = body
    reply.save()
    return JsonResponse({'replyId': reply.id, 'newBody': reply.body})


def delete_reply(request):
    data = json.loads(request.body)
    reply_id = int(data['reply_id'])
    reply = Reply.objects.get(id=reply_id, user=request.user)
    comment_id = reply.comment.id
    reply.delete()
    return JsonResponse({'commentId': comment_id})

