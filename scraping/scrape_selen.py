from selenium import webdriver

DRIVER_PATH = '/home/varchasv/Desktop/chromedriver_linux64/chromedriver'
driver = webdriver.Chrome(executable_path=DRIVER_PATH)
driver.get('http://172.26.142.68/dccourse/')

elem = driver.find_element_by_name('roll').send_keys('180847')
elem = driver.find_element_by_name('showlist').click()
