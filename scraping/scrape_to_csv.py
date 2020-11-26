import urllib.request, urllib.error, urllib.parse
from bs4 import BeautifulSoup
import ssl
import requests

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for roll_no in range(170001, 170831):
    url = 'http://172.26.142.68/dccourse/studdc.php?roll_no={}'.format(roll_no)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read()
    soup = BeautifulSoup(html, 'html.parser')

    rows = [tr.findAll('td') for tr in soup.findAll('tr')]
    flag = True
    for it in rows:
        if flag:
            flag = False
            continue
        it = it[0:3] + [roll_no]
        with open('result.csv', 'a') as f:
            f.write(", ".join(str(e).replace('<td>','').replace('</td>','').replace('<td valign="top">', '').replace('<font face="Verdana, Arial, Helvetica, sans-serif" size="2">', '').replace('</font>', '').replace('&amp', '&') for e in it) + '\n')

    # print(soup)
