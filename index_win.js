const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false,
    // 从chrome://version拿到可执行地址，填到下面
  executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage();
  await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
  await page.screenshot({path: 'login.png'});
  await page.type("#username",'<用户名>', {delay: 100})
  await page.type("#password",'<密码>', {delay: 100})
  await page.click('#casLoginForm > p:nth-child(5) > button') 
  await page.waitFor(5000)
  
  await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');

  await page.screenshot({path: 'tofill.png'})
  await page.click('body > div.content > div.content_nr > div:nth-child(1) > a > div')
  await page.waitForNavigation();
  await page.evaluate(()=>{document.getElementById("txfscheckbox").checked=true});
  await page.screenshot({path: 'fillform.png'})
  await page.click('body > div.right_btn');
  await page.waitForNavigation();
  await page.screenshot({path: 'finish.png'})
  await browser.close();
})();

