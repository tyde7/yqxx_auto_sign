const puppeteer = require("puppeteer");
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const process = require('process');
const { exception } = require("console");
const { parse } = require("path");
is_same_day = function (t) {
  return new Date(t).toDateString() === new Date().toDateString();
};

const passwords = [
  {
    u: process.env.JWC_USERNAME,
    p: process.env.JWC_PASSWORD,
    lat: parseFloat(process.env.SIM_LAT),
    long: parseFloat(process.env.SIM_LONG),
    sa: process.env.WECHAT_ROBOT_HOOK,
    current_pos: process.env.CURRENT_POS
  }
];


(async () => {
  for (let a of passwords) {
    const datestring = new Date().toLocaleDateString("zh-CN");
    // const read = fs.readFileSync("date.txt", "utf-8");
    // if (read === datestring) {
    //   console.debug('signed.');
    //   return;
    // };
    let platformExecutablePath = "";
    let args = [];
    switch (os.platform()) {
      case "windows":
      case "win32":
        platformExecutablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
        break;
      case "darwin":
        platformExecutablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        break;
      case "linux":
        platformExecutablePath = "google-chrome-stable"
        args.push("--no-sandbox")
        break
    }
    const browser = await puppeteer.launch({
      headless: Boolean(process.env.CI),
      executablePath: platformExecutablePath,
      args: args
    });


    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      // 如果文件类型为image,则中断加载
      if (request.resourceType() === 'image') {
        request.abort();
        return;
      }
      // 正常加载其他类型的文件
      request.continue();
    });
    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    await page.type("#username", a.u, { delay: 100 })
    await page.type("#password", a.p, { delay: 100 })
    await page.click('#casLoginForm > p:nth-child(5) > button')
    await page.waitFor(5000)


    console.log("start")
    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    let try_time = 5;
    let latest_upload = "";
    while (try_time > 0) {
      try {
        await page.waitFor(15000);
        latest_upload = await page.evaluate(() => {
          return document.getElementsByClassName("content_title")[1].innerText.split("：")[1];
        });
        break;
      } catch {
        try_time -= 1;
        console.log(`Trytime decreased once. Now is ${try_time}.`)
      }
    }
    if (try_time == 0) {
      await browser.close();
      console.log("Found error. Try_time is zero but iframe is still loading. Critial internet issue?")
      return;
    }
    let resubmit = false;
    status = await page.evaluate(() => {
      return document.getElementsByClassName("content2")[0].getElementsByClassName("content_title")[1].innerText;
    });
    if (is_same_day(latest_upload) && status.search("未提交") >= 0) {
      resubmit = true;
      console.log(`Found status ${status}, going to resubmit.`)
    }
    if (is_same_day(latest_upload) && status.search("未提交") < 0) {
      await browser.close();
      console.log("Signed.")
    }
    else {
      // await page.screenshot({ path: 'tofill.png' })
      const context = browser.defaultBrowserContext()
      await context.overridePermissions("https://xg.hit.edu.cn", ['geolocation'])
      await page.setGeolocation({
        longitude: a.long + parseFloat(Number(Math.random() * 0.00006).toFixed(6)),
        latitude: a.lat + parseFloat(Number(Math.random() * 0.00006).toFixed(6)),
        accuracy: 65
      })
      // await page.evaluateOnNewDocument(function () {
      //   navigator.geolocation.getCurrentPosition = function (cb) {
      //     setTimeout(() => {
      //       cb({
      //         'coords': {
      //           accuracy: 21,
      //           altitude: null,
      //           altitudeAccuracy: null,
      //           heading: null,
      //           latitude: a.lat + parseFloat(Number(Math.random() * 0.00006).toFixed(6)),
      //           longitude: a.long + parseFloat(Number(Math.random() * 0.00006).toFixed(6)),
      //           speed: null
      //         }
      //       })
      //     }, Math.round(Math.random() * 500 + 500))
      //   }
      // });
      console.log(`Resubmit is ${resubmit}`)
      if (resubmit) {
        await page.click('#center > div:nth-child(2)');
      } else {
        await page.click('body > div.content > div.content_nr > div:nth-child(1) > a > div')
      }
      try {
        await page.waitForNavigation();
      } catch (TimeoutException) {
        console.warn("Timeout when reedirect to chart fill page. Maybe should be noticed while debugging.")
      }
      current_pos = a.current_pos;
      // await page.evaluate(() => { document.getElementById("txfscheckbox").checked = true; document.getElementById("tw").value = 36; document.getElementById("tw1").value = 2 + Math.round(Math.random() * 3) });
      await page.evaluate((current_pos) => { $("input#checkbox")[0].checked = true; $("#gnxxdz").val(current_pos) }, current_pos);
      await page.click('body > div.right_btn');
      await page.waitForXPath('//*[@id="nrundefined"]/div[2]');
      await page.click("#nrundefined > div.weui-dialog__ft > a.weui-dialog__btn.primary");
      await page.waitFor(10000);
      console.log("Signed for 每日上报.");

      // 上报上午体温

      await browser.close();
    }
    if (a.sa) {
      r = await fetch(a.sa, {
        body: JSON.stringify({
          "msgtype": "text",
          "text": {
            "content": `${datestring}签到已经完成.`
          }
        }), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'user-agent': 'Mozilla/5.0 nodejs Server',
          'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
      })
      rcode = await r.json()
      console.log(rcode);
    }
    // fs.writeFileSync("date.txt", datestring, "utf-8");
  }
})();



