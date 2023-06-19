from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from tinymce import models as tinymce_models
import yfinance as yf
from requests.exceptions import HTTPError

from .util import get_ticker_data, get_price_currency_default, title_body_ticker_validation, setup_driver, make_logo_search


class Post(models.Model):
    title = models.CharField(max_length=100)
    body = tinymce_models.HTMLField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_posts')
    created_at = models.DateTimeField(default=timezone.now)
    image = models.ImageField(upload_to='posts/uploads', max_length=255, null=True, blank=True)
    ticker = models.CharField(max_length=10)
    init_price = models.DecimalField(max_digits=9, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, null=True, blank=True)

    def __str__(self):
        return f'{self.id}: {self.title} by {self.author}'

    @classmethod
    def create_post(cls, request):
        title = request.POST['title']
        body = request.POST['body']
        ticker = request.POST['ticker'].upper()
        if title_body_ticker_validation(request, title, body, ticker):
            price, currency = get_ticker_data(ticker)
            post = Post(
                title=title, body=body, author=request.user,
                ticker=ticker, init_price=price, currency=currency
            )
            post.save()
            return post
        return None

    def add_image(self):
        print('here')
        try:
            data = yf.Ticker(self.ticker).info
            if data['longName']:
                brand_name = data['longName']
            else:
                brand_name = data['shortName']
            query = str(brand_name) + ' logo png'
            driver = setup_driver(wait_time=3)
            img_url = make_logo_search(driver, query, wait_time=3)
        except:
            img_url = None
        finally:
            self.image = img_url
            self.save()

    def edit(self, request):
        title = request.POST['title']
        body = request.POST['body']
        ticker = request.POST['ticker'].upper()
        if title_body_ticker_validation(request, title, body, ticker):
            if ticker != self.ticker:
                price, currency = get_ticker_data(ticker)
                self.ticker = ticker
                self.init_price = price
                self.currency = currency
            self.title = title
            self.body = body
            self.save()
            return self
        return None


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_likes')

    def __str__(self):
        return f'{self.user} liked {self.post}'


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_comments')
    body = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user} on {self.post}'


class Reply(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_replies')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='comment_replies')
    body = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user} on {self.comment}'

    class Meta:
        verbose_name_plural = "Replies"
