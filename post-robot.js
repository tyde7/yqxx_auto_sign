const fetch = require('node-fetch');
const fs= require('fs');
(async()=>{
    const datestring = new Date().toLocaleDateString("zh-CN");
    const read = fs.readFileSync("date.txt","utf-8");
    if (read === datestring){
        console.debug('signed.');
        return;
    };
    r = await fetch(" https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5ee9c3b4-5210-40ff-b578-485780b73229", {
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
    fs.writeFileSync("date.txt", datestring,"utf-8");
})()