// obselete
const puppeteer = require('puppeteer');
is_same_day = function(t)
{
	return new Date(t).toDateString() === new Date().toDateString();
};

const passwords = [{u:"", p:""}];

(async () => {
  for (let a of passwords){
    const browser = await puppeteer.launch({headless: false,
    executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    await page.type("#username",a.u, {delay: 100})
    await page.type("#password",a.p, {delay: 100})
    await page.click('#casLoginForm > p:nth-child(5) > button') 
    await page.waitFor(5000)
    
    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    const latest_upload = await page.evaluate(()=>{
      return document.getElementsByClassName("content_title")[1].innerText.split("：")[1];
    });
    if(is_same_day(latest_upload)){
      await browser.close();
      return;
    }
    await page.screenshot({path: 'tofill.png'})
    await page.click('body > div.content > div.content_nr > div:nth-child(1) > a > div')
    await page.waitForNavigation();
    await page.evaluate(()=>{document.getElementById("txfscheckbox").checked=true});
    await page.click('body > div.right_btn');
    await page.waitForNavigation();
    await browser.close();
  }
})();

