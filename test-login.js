const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('request', req => console.log('REQUEST:', req.method(), req.url()));
    page.on('response', resp => console.log('RESPONSE:', resp.url(), resp.status()));
    page.on('dialog', dialog => {
        console.log('ALERT:', dialog.message());
        dialog.dismiss();
    });

    await page.goto('http://localhost:8080');
    await page.waitForSelector('#btn-start');

    await page.type('#player-email', 'test4@test.com');
    await page.type('#player-password', 'password123');

    console.log('Clicking login via evaluate...');
    await page.evaluate(() => {
        console.log('EVALUATE: Clicking button now...');
        document.getElementById('btn-start').click();
    });

    await new Promise(r => setTimeout(r, 1500));

    const isHidden = await page.$eval('#screen-onboard', el => el.classList.contains('hidden'));
    console.log('Is screen-onboard Hidden?', isHidden);

    await browser.close();
})();
