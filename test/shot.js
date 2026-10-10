const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1500}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/'+process.argv[2]);await p.waitForTimeout(1200);await p.screenshot({path:process.argv[3]});await b.close()})();
