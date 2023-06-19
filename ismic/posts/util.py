from decimal import Decimal

from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
import requests
import yfinance as yf
from requests.exceptions import HTTPError
from django.contrib import messages

from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.firefox.options import Options

wait_time = 5


def get_ticker_data(ticker):
    try:
        data = yf.Ticker(ticker).info
        if data['currentPrice']:
            price = data['currentPrice']
        elif data['open']:
            price = data['open']
        else:
            price = data['previousClose']
        currency = data['financialCurrency']
        return price, currency
    except:
        return get_price_currency_default()


def get_price_currency_default():
    return -1, 'USD'


def get_price_change(post):
    curr_price = Decimal(get_ticker_data(post.ticker)[0])
    if curr_price:
        change = round((curr_price - post.init_price) / curr_price * 100, 2)
        return change
    return -1


def title_body_ticker_validation(request, title, body, ticker):
    if not title:
        messages.error(request, 'Title is required!')
    elif not body:
        messages.error(request, 'Body is required!')
    elif not ticker:
        messages.error(request, 'Ticker is required!')
    else:
        return True


def setup_driver(wait_time):
    google_url = 'https://www.google.com/imghp'

    # URL to the webdriver
    webdriver_path = '/usr/bin/geckodriver'
    
    # Options
    firefox_options = Options()
    firefox_options.add_argument('-headless')
    firefox_options.add_argument('--no-sandbox')
    firefox_options.add_argument('--disable-dev-shm-usage')
    
    # Define the driver
    driver = webdriver.Firefox(executable_path=webdriver_path, options=firefox_options)
    time.sleep(wait_time)
    
    # Go to the web page
    driver.get(google_url)
    time.sleep(wait_time)

    # Click on "accept coockies"
    try:
        cookies_button = driver.find_element(By.XPATH, '//button[@id="L2AGLb"]/div')
        driver.execute_script('arguments[0].click();', cookies_button)
    except:
        pass
    return driver


def make_logo_search(driver, brand_name, wait_time=5):
    """
    The goal of this function is to get the logo url from the brand name
    Parameters
    ----------
    driver : web driver (here chrome webdriver)
    brand_name : string. The name of the brand
    wait_time : int. The time to sleep => time needed to uplaod html page
    Returns
    -------
    dict with the brand name and the logo url
    {'Nike': 'https://machin/chouette.fr'}
    """

    # Search query
    search_bar = driver.find_element(By.XPATH, '//textarea[@id="APjFqb" and @type="search"]')
    search_bar.clear()
    search_bar.send_keys(brand_name)
    submit_btn = driver.find_element(By.XPATH, '//button[@type="submit"]')
    driver.execute_script('arguments[0].click();', submit_btn)
    time.sleep(wait_time)

    tools_btn = driver.find_element(By.XPATH, '/html/body/div[2]/c-wiz/div[1]/div/div[1]/div[2]/div[2]/div')
    driver.execute_script('arguments[0].click();', tools_btn)

    color_btn = driver.find_element(By.XPATH, '/html/body/div[2]/c-wiz/div[2]/div[2]/c-wiz[1]/div/div/div[1]/div/div[2]/div/div[1]')
    driver.execute_script('arguments[0].click();', color_btn)

    transparent_btn = driver.find_element(By.XPATH, '/html/body/div[2]/c-wiz/div[2]/div[2]/c-wiz[1]/div/div/div[3]/div/a[3]')
    driver.execute_script('arguments[0].click();', transparent_btn)
    time.sleep(wait_time)

    containers = driver.find_elements(By.XPATH, '/html/body/div[2]/c-wiz/div[3]/div[1]/div/div/div/div/div[1]/div[1]/span/div[1]/div[1]/div')
    for i in range(1, len(containers) + 1):
        if i % 25 == 0:
            continue

        # Get preview image
        img_box = driver.find_element(By.XPATH, f'/html/body/div[2]/c-wiz/div[3]/div[1]/div/div/div/div/div[1]/div[1]/span/div[1]/div[1]/div[{i}]/a[1]/div[1]/img')
        driver.execute_script('arguments[0].click();', img_box)
        preview_src = img_box.get_attribute('src')

        start_time = time.time()
        while True:
            # Wait to get full image
            fir_img = driver.find_element(By.XPATH,'/html/body/div[2]/c-wiz/div[3]/div[2]/div[3]/div[2]/div/div[2]/div[2]/div[2]/c-wiz/div/div/div/div[3]/div[1]/a/img[1]')
            img_src = fir_img.get_attribute('src')
            curr_time = time.time()
            if curr_time - start_time > 10:
                break
            if preview_src != img_src:
                if img_src.endswith(('.png', '.jpg', '.jpeg'), -5):
                    return img_src
    return None


def name_handling(request):
    return request.user.first_name + ' ' + request.user.last_name if (request.user.first_name and request.user.last_name) else request.user.username
    # if request.user.first_name and request.user.last_name:
    #     name = request.user.first_name + ' '+ request.user.last_name
    # else:
    #     name = request.user.username
    # return name