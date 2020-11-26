import urllib.request, urllib.error, urllib.parse
from bs4 import BeautifulSoup
import ssl
import requests
import regex as re
import os
from datetime import date, timedelta
import shutil

today = date.today()

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def is_downloadable(url):
    """
    Does the url contain a downloadable resource
    """
    h = requests.head(url, allow_redirects=True)
    header = h.headers
    content_type = header.get('content-type')
    if 'text' in content_type.lower():
        return False
    if 'html' in content_type.lower():
        return False
    return True


url = 'http://172.26.142.68/dccourse/studdc.php?roll_no=180207'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read()
soup = BeautifulSoup(html, 'html.parser')

rows = [tr.findAll('td') for tr in soup.findAll('tr')]
for it in rows:
    with open('result.csv', 'a') as f:
        f.write(", ".join(str(e).replace('<td>','').replace('</td>','').replace('<td valign="top">', '').replace('<font face="Verdana, Arial, Helvetica, sans-serif" size="2">', '').replace('</font>', '').replace('&amp', '&') for e in it) + '\n')

print(soup)
