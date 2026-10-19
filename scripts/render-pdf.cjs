const fs = require('node:fs/promises');
const path = require('node:path');
const {createRequire} = require('node:module');
async function main() {
  const [input='generated/resume.html',output='generated/Roy_Wang_Resume.pdf'] = process.argv.slice(2);
  const modulePath = process.env.PUPPETEER_MODULE_PATH;
  const puppeteer = modulePath ? createRequire(path.resolve(modulePath,'package.json'))('puppeteer') : require('puppeteer');
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.PUPPETEER_EXECUTABLE_PATH?{executablePath:process.env.PUPPETEER_EXECUTABLE_PATH}:{})});
  try {
    const page = await browser.newPage();
    // Resume is self-contained. Do not send personal content or font requests to external services.
    await page.setRequestInterception(true);
    page.on('request',request=>request.url().startsWith('data:')||request.url()==='about:blank'?request.continue():request.abort());
    await page.setContent(await fs.readFile(input,'utf8'),{waitUntil:'load'});
    await page.emulateMediaType('print');
    await page.pdf({path:output,format:'A4',printBackground:true,preferCSSPageSize:true,margin:{top:0,bottom:0,left:0,right:0}});
    if(process.env.RESUME_PREVIEW) {await page.setViewport({width:794,height:1123,deviceScaleFactor:1.3});await page.screenshot({path:process.env.RESUME_PREVIEW,fullPage:true});}
    console.log(`Rendered ${output}`);
  } finally {await browser.close();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
