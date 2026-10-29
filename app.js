'use strict';
const $ = id => document.getElementById(id);
const canvas = $('preview'), ctx = canvas.getContext('2d');
const formats = {avatar:{w:768,h:768,label:'头像'},portrait:{w:900,h:1350,label:'卡面'},landscape:{w:1600,h:900,label:'剧情'}};
const themes = {jade:{ink:'#124d49',light:'#c8efe0',metal:'#efd4a1'},rose:{ink:'#68344e',light:'#f8d8df',metal:'#f4d5b0'},night:{ink:'#252d56',light:'#cad5f5',metal:'#e7d5ab'}};
let customColor=null;
let pdfDocument=null,pdfName='',pdfCurrentPage=1;
let format='portrait', theme='jade', source=null, loadVersion=0, drag=null;
const crops=Object.fromEntries(Object.keys(formats).map(key=>[key,{zoom:1,x:0,y:0,angle:0}]));
function line(points,color,width=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function textFit(text,x,y,maxWidth,size,color,font='sans-serif',align='left') {ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';while(size>8){ctx.font=`${size}px ${font}`;if(ctx.measureText(text).width<=maxWidth)break;size-=1;}ctx.fillText(text,x,y);}
function geometry(){const {w,h}=formats[format],crop=crops[format];if(!source)return {dw:w,dh:h,ox:0,oy:0,angle:0};const angle=crop.angle*Math.PI/180,co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));
const projectedW=w*co+h*si,projectedH=w*si+h*co,scale=Math.max(projectedW/source.width,projectedH/source.height)*crop.zoom;
const dw=source.width*scale,dh=source.height*scale;return {dw,dh,ox:Math.max(0,(dw-projectedW)/2),oy:Math.max(0,(dh-projectedH)/2),angle};}

function polygon(points,fill,stroke,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function sparkle(x,y,r,color){polygon([[x,y-r],[x+r*.24,y-r*.24],[x+r,y],[x+r*.24,y+r*.24],[x,y+r],[x-r*.24,y+r*.24],[x-r,y],[x-r*.24,y-r*.24]],color);}
function demo(w,h,t){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#d9faff');g.addColorStop(.45,'#e3e4ff');g.addColorStop(1,'#ffaed8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);polygon([[0,h*.15],[w*.8,0],[w,h*.3],[0,h*.8]],'#ffffff60');polygon([[0,h*.7],[w,h*.25],[w,h*.7],[w*.1,h]],t.light+'60');for(let x=12;x<w;x+=24)for(let y=12;y<h;y+=24){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fillStyle='#ffffff80';ctx.fill();}for(let i=0;i<8;i++)sparkle(w*(.12+(i*.137)% .8),h*(.12+(i*.213)% .65),w*.022,'#ffffffbd');textFit('YOU 2 IDOL',w*.5,h*.43,w*.76,w*.075,'#5467a3','sans-serif','center');textFit('导入图片，变身偶像',w*.5,h*.49,w*.72,w*.027,'#5467a3','sans-serif','center');}
function metallicPaint(w,h){const base=$('metalColor').value,g=Number($('metalGloss').value)/100;function mix(target,amount){return '#'+[1,3,5].map(i=>Math.round(parseInt(base.slice(i,i+2),16)*(1-amount)+target*amount).toString(16).padStart(2,'0')).join('');}const paint=ctx.createLinearGradient(0,0,w,h);[[0,255,.7],[.20,0,.30],[.43,255,.95],[.49,255,.65],[.56,0,.34],[.76,255,.82],[1,0,.12]].forEach(([position,target,strength])=>paint.addColorStop(position,mix(target,strength*g)));return paint;}
function render(){const {w,h}=formats[format],t=themes[theme];canvas.width=w;canvas.height=h;ctx.clearRect(0,0,w,h);if(source){const {dw,dh,ox,oy,angle}=geometry(),c=crops[format];ctx.save();ctx.translate(w/2,h/2);ctx.rotate(angle);ctx.drawImage(source,-dw/2+c.x*ox,-dh/2+c.y*oy,dw,dh);ctx.restore();}else demo(w,h,t);
const frame=format==='avatar'?$('avatarFrame').checked:format==='portrait'?$('portraitFrame').checked:true,showText=true,avatar=format==='avatar',wide=format==='landscape',u=Math.min(w,h),m=u*.025;
const color=customColor || (theme==='jade'?'#22b9df':theme==='rose'?'#ed69b2':'#7972e2');
if(wide){SceneEditor.draw(ctx,w,h,showText,color,Number($('styleOpacity').value)/100,$('metalColor').value);return;}
if(frame){ctx.save();ctx.globalAlpha=Number($('styleOpacity').value)/100;const metal=metallicPaint(w,h);
const outline=d=>[[d,d],[w-u*.11,d],[w-d,u*.11],[w-d,h-d],[u*.11,h-d],[d,h-u*.11]];
polygon(outline(m),null,'#ffffff',u*.024);polygon(outline(m),null,color,u*.017);polygon(outline(m+u*.014),null,metal,u*.008);polygon(outline(m+u*.025),null,'#ffffffb0',u*.002);
if(avatar){polygon([[m,m],[u*.48,m],[u*.42,u*.10],[m,u*.10]],color);}
polygon([[w-m,h-u*.2],[w-m,h-m],[w-u*.23,h-m]],color+'bd');
const bx=u*.105,by=u*(avatar?.19:.11);ctx.save();ctx.translate(bx,by);ctx.rotate(Math.PI/4);ctx.shadowColor='#155c8f50';ctx.shadowBlur=12;ctx.fillStyle=color;ctx.fillRect(-u*.04,-u*.04,u*.08,u*.08);ctx.strokeStyle='white';ctx.lineWidth=u*.004;ctx.strokeRect(-u*.04,-u*.04,u*.08,u*.08);ctx.restore();sparkle(bx,by,u*.025,'#fff');
for(let i=0;i<4;i++)sparkle(w-u*(.07+i*.038),h-u*(.11+i*.032),u*(i%2?.008:.015),'#fff9df');
line([[m+u*.024,h*.65],[m+u*.024,h-u*.13],[u*.13,h-m-u*.024],[w*.58,h-m-u*.024]],'#ffffffc0',u*.003);ctx.restore();}
if(avatar){if(showText){for(const key of ['avatarTop','avatarBottom']){
if(!$(key+'Enabled').checked)continue;const value=$(key).value.trim(),size=Number($(key+'Size').value);ctx.font=`${size}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='alphabetic';
const metrics=ctx.measureText(value),padding=u*.025,width=Math.min(metrics.width,w-padding*2),height=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
const x=padding+(w-padding*2-width)*Number($(key+'X').value)/100,y=padding+Math.max(0,h-padding*2-height)*Number($(key+'Y').value)/100+metrics.actualBoundingBoxAscent;
ctx.save();ctx.shadowColor='#234b79';ctx.shadowBlur=3;ctx.fillStyle=$(key+'Color').value;ctx.fillText(value,x,y,w-padding*2);ctx.restore();
}}return;}

if(showText){const title=$('cardName').value.trim(),num=$('cardNumber').value.trim();
if($('nameLayer').checked){
const base=h*(wide?.81:.83),rise=wide?u*.035:u*.12,left=wide?w*.045:m,right=wide?w*.58:w-m,bh=u*(avatar?.14:.12);
ctx.save();ctx.globalAlpha=Number($('styleOpacity').value)/100;const band=ctx.createLinearGradient(left,base,right,base);band.addColorStop(0,color+'8c');band.addColorStop(.55,'#456eafaa');band.addColorStop(1,color+'72');
polygon([[left,base],[right,base-rise],[right,base-rise+bh],[left,base+bh]],band,metallicPaint(w,h),u*.004);
line([[left,base-u*.009],[right,base-rise-u*.009]],metallicPaint(w,h),u*.004);line([[left,base+bh+u*.009],[right,base-rise+bh+u*.009]],metallicPaint(w,h),u*.004);
ctx.restore();ctx.save();
const padding=u*.045,available=right-left-padding*2;
let fontSize=u*.052;ctx.font=`${fontSize}px "Microsoft YaHei",sans-serif`;
while(ctx.measureText(title).width>available&&fontSize>8){fontSize--;ctx.font=`${fontSize}px "Microsoft YaHei",sans-serif`;}
const metrics=ctx.measureText(title),offset=padding+Math.max(0,available-metrics.width)*Number($('namePosition').value)/100;
ctx.translate(left+offset,base-rise*offset/(right-left)+bh/2);
ctx.transform(1,-rise/(right-left),0,1,0,0);ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#fff';
ctx.fillText(title,0,(metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/2);ctx.restore();

}
if(num&&$('rarityLayer').checked){ctx.save();
const rx=w-u*.065,ry=h-u*.05,maxWidth=u*.44;let size=u*.139;
ctx.textAlign='right';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.miterLimit=2;
function rarityFont(){ctx.font=`bold italic ${size}px Georgia,"Times New Roman","Microsoft YaHei",serif`;}
rarityFont();while(ctx.measureText(num).width>maxWidth&&size>12){size--;rarityFont();}
// Every layer uses the same glyphs and metrics, keeping the metallic edges aligned.
ctx.shadowColor='#17496c66';ctx.shadowBlur=2;ctx.shadowOffsetY=u*.002;
ctx.strokeStyle='#274f70';ctx.lineWidth=u*.007;ctx.strokeText(num,rx,ry);
ctx.shadowColor='transparent';ctx.shadowOffsetY=0;
ctx.strokeStyle=metallicPaint(w,h);ctx.lineWidth=u*.0055;ctx.strokeText(num,rx,ry);
ctx.strokeStyle='#fff9e8';ctx.lineWidth=u*.002;ctx.strokeText(num,rx,ry);
const enamel=ctx.createLinearGradient(0,ry-size*.8,0,ry);enamel.addColorStop(0,'#ffffff');enamel.addColorStop(.28,'#e5fbff');enamel.addColorStop(.48,'#8dd9f0');enamel.addColorStop(.52,'#4094bc');enamel.addColorStop(.83,'#c8f6ff');enamel.addColorStop(1,'#f3fcff');ctx.fillStyle=enamel;ctx.fillText(num,rx,ry);
ctx.restore();}

}
}
function sync(){$('contentHeading').textContent=format==='landscape'?'剧情内容':'图层';document.querySelectorAll('[data-fields]').forEach(el=>el.hidden=!el.dataset.fields.split(' ').includes(format));const c=crops[format];$('rotation').value=c.angle;$('rotationValue').value=c.angle+'°';$('zoom').value=c.zoom;$('zoomValue').value=Math.round(c.zoom*100)+'%';$('panX').value=c.x;$('panY').value=c.y;const {w,h}=formats[format];$('dimensions').textContent=`${w} × ${h} PX`;$('exportSize').textContent=`${$('exportFormat').value.toUpperCase()} · ${w} × ${h}`;document.querySelectorAll('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===format)));render();}
function status(message){$('status').textContent=message;}
function setImportBusy(busy){for(const id of ['zoom','panX','panY','rotation','export'])$(id).disabled=busy||!source;$('pdfPage').disabled=busy;}
function releasePdf(doc){if(doc)doc.destroy().catch(()=>{});}
function useImage(img,info){source=img;Object.keys(crops).forEach(k=>crops[k]={zoom:1,x:0,y:0,angle:0});$('uploadLabel').textContent='更换图片';$('fileInfo').hidden=false;$('fileInfo').textContent=info;status('');sync();}
function pdfError(error){if(error.name==='PasswordException')return 'PDF 有密码保护，请先解锁后导入。';if(error.message==='PDF_DEPENDENCY')return 'PDF 组件无法加载，请完整解压工具文件后重试。';return 'PDF 无法读取，请换一个有效的 PDF 文件。';}
async function importImage(file){if(!file)return;const version=++loadVersion;if(pdfDocument)$('pdfPage').value=pdfCurrentPage;const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name),raster=['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/x-ms-bmp','image/avif'].includes(file.type)||/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);let candidate=null,url=null;try{if(!isPdf&&!raster){status('支持 JPG、PNG、WebP、GIF、BMP、AVIF 或 PDF。');return;}if(file.size>30*1024*1024){status('文件超过 30 MB，请缩小后再导入。');return;}setImportBusy(true);status(isPdf?'正在读取 PDF…':'正在读取图片…');
if(isPdf){candidate=await LocalPDF.open(file);if(version!==loadVersion)return;const image=await LocalPDF.pageImage(candidate,1);if(version!==loadVersion)return;const previous=pdfDocument;pdfDocument=candidate;candidate=null;pdfName=file.name;pdfCurrentPage=1;$('pdfPage').value='1';$('pdfPage').max=pdfDocument.numPages;$('pdfPageCount').textContent='/ '+pdfDocument.numPages;$('pdfPageControls').hidden=pdfDocument.numPages<=1;useImage(image,`${file.name} · 第 1 / ${pdfDocument.numPages} 页`);releasePdf(previous);
}else{url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();if(version!==loadVersion)return;if(img.width*img.height>60000000){status('图片像素过大，请缩小到 6000 万像素以内。');return;}let image=img;if(file.type==='image/gif'||/\.gif$/i.test(file.name)){image=document.createElement('canvas');image.width=img.width;image.height=img.height;image.getContext('2d').drawImage(img,0,0);}const previous=pdfDocument;pdfDocument=null;$('pdfPageControls').hidden=true;useImage(image,`${file.name} · ${img.width} × ${img.height}`);releasePdf(previous);}
}catch(error){if(version===loadVersion)status(isPdf?pdfError(error):'图片无法读取，请换一张有效图片。');}finally{if(url)URL.revokeObjectURL(url);releasePdf(candidate);if(version===loadVersion){if(pdfDocument)$('pdfPage').value=pdfCurrentPage;setImportBusy(false);$('imageInput').value='';}}}
$('pdfPage').addEventListener('change',async()=>{if(!pdfDocument)return;const number=Number($('pdfPage').value);if(!Number.isInteger(number)||number<1||number>pdfDocument.numPages){$('pdfPage').value=pdfCurrentPage;status('请输入有效页码。');return;}const version=++loadVersion,doc=pdfDocument;setImportBusy(true);status('正在读取第 '+number+' 页…');try{const image=await LocalPDF.pageImage(doc,number);if(version!==loadVersion)return;pdfCurrentPage=number;useImage(image,`${pdfName} · 第 ${number} / ${doc.numPages} 页`);}catch(error){if(version===loadVersion){$('pdfPage').value=pdfCurrentPage;status(pdfError(error));}}finally{if(version===loadVersion)setImportBusy(false);}});
$('imageInput').addEventListener('change',e=>importImage(e.target.files[0]));
document.querySelectorAll('[data-format]').forEach(b=>b.addEventListener('click',()=>{format=b.dataset.format;sync();status('');}));
document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{theme=b.dataset.theme;customColor=null;const preset=theme==='jade'?'#22b9df':theme==='rose'?'#ed69b2':'#7972e2';$('metalColor').value=theme==='jade'?'#e4b66c':theme==='rose'?'#bfcde0':'#eed0a1';$('metalHex').value=$('metalColor').value.toUpperCase();$('customColor').value=preset;$('colorHex').value=preset.toUpperCase();$('colorHex').removeAttribute('aria-invalid');$('colorHelp').textContent='';$('colorHelp').hidden=true;document.querySelectorAll('[data-theme]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render();}));
['cardName','namePosition','cardNumber','avatarTop','avatarBottom','avatarFrame','portraitFrame','avatarTopEnabled','avatarBottomEnabled','nameLayer','rarityLayer'].forEach(id=>$(id).addEventListener('input',render));
['zoom','panX','panY'].forEach(id=>$(id).addEventListener('input',()=>{crops[format][{zoom:'zoom',panX:'x',panY:'y'}[id]]=Number($(id).value);sync();}));
$('resetCrop').addEventListener('click',()=>{crops[format]={zoom:1,x:0,y:0,angle:0};sync();status('当前版式的构图已重置。');});
canvas.addEventListener('pointerdown',e=>{if(!source)return;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});drag={x:e.clientX,y:e.clientY,crop:{...crops[format]}};});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect(),g=geometry(),c=crops[format];const dx=(e.clientX-drag.x)*canvas.width/rect.width,dy=(e.clientY-drag.y)*canvas.height/rect.height,co=Math.cos(g.angle),si=Math.sin(g.angle);c.x=g.ox?Math.max(-1,Math.min(1,drag.crop.x+(dx*co+dy*si)/g.ox)):0;c.y=g.oy?Math.max(-1,Math.min(1,drag.crop.y+(-dx*si+dy*co)/g.oy)):0;sync();});

['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>drag=null));
canvas.addEventListener('keydown',e=>{if(!source||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const c=crops[format],step=e.shiftKey?.1:.02;if(e.key==='ArrowLeft')c.x-=step;if(e.key==='ArrowRight')c.x+=step;if(e.key==='ArrowUp')c.y-=step;if(e.key==='ArrowDown')c.y+=step;c.x=Math.max(-1,Math.min(1,c.x));c.y=Math.max(-1,Math.min(1,c.y));sync();});
let enterDepth=0;const zone=$('dropzone');zone.addEventListener('dragenter',e=>{e.preventDefault();enterDepth++;zone.classList.add('dragging');});zone.addEventListener('dragover',e=>e.preventDefault());zone.addEventListener('dragleave',()=>{if(--enterDepth<=0)zone.classList.remove('dragging');});zone.addEventListener('drop',e=>{e.preventDefault();enterDepth=0;zone.classList.remove('dragging');importImage(e.dataTransfer.files[0]);});window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>e.preventDefault());
$('exportFormat').addEventListener('change',sync);
$('export').addEventListener('click',()=>{if(!source||$('export').disabled)return;render();const label=formats[format].label,type=$('exportFormat').value,name=($('cardName').value.trim()||'我的图片').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_');let output=canvas;if(type==='jpg'){output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;const c=output.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,output.width,output.height);c.drawImage(canvas,0,0);}output.toBlob(blob=>{if(!blob){status('导出失败，请重试。');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name}-${label}.${type}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status(type.toUpperCase()+' 已生成，请在下载中查看。');},type==='jpg'?'image/jpeg':'image/png',.94);});

sync();

function applyCustomColor(value){customColor=value.toLowerCase();$('customColor').value=customColor;$('colorHex').value=customColor.toUpperCase();$('colorHex').removeAttribute('aria-invalid');$('colorHelp').textContent='';$('colorHelp').hidden=true;document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed','false'));render();}
$('customColor').addEventListener('input',e=>applyCustomColor(e.target.value));
$('colorHex').addEventListener('input',e=>{const value=e.target.value.trim();if(/^#[0-9a-f]{6}$/i.test(value))applyCustomColor(value);});
$('colorHex').addEventListener('change',e=>{if(!/^#[0-9a-f]{6}$/i.test(e.target.value.trim())){e.target.setAttribute('aria-invalid','true');$('colorHelp').hidden=false;$('colorHelp').textContent='请输入完整的十六进制颜色，例如 #22B9DF；画面保留上次有效颜色。';}});



const avatarDefaults={avatarTop:{X:4,Y:4,Size:31},avatarBottom:{X:97,Y:97,Size:54}};
function updateAvatarControls(){for(const key of Object.keys(avatarDefaults))for(const axis of ['X','Y','Size'])$(key+axis+'Value').value=$(key+axis).value+(axis==='Size'?'px':'%');render();}
for(const key of Object.keys(avatarDefaults))for(const axis of ['X','Y','Size'])$(key+axis).addEventListener('input',updateAvatarControls);
document.querySelectorAll('[data-reset-avatar]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.resetAvatar;for(const [axis,value] of Object.entries(avatarDefaults[key]))$(key+axis).value=value;updateAvatarControls();}));

for(const key of ['avatarTop','avatarBottom']){
const picker=$(key+'Color'),hex=$(key+'Hex'),hint=$(key+'ColorHint');
picker.addEventListener('input',()=>{hex.value=picker.value.toUpperCase();hex.removeAttribute('aria-invalid');hint.textContent='';hint.hidden=true;render();});
hex.addEventListener('input',()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value.trim())){picker.value=hex.value.trim();hex.removeAttribute('aria-invalid');hint.textContent='';hint.hidden=true;render();}});
hex.addEventListener('change',()=>{if(!/^#[0-9a-f]{6}$/i.test(hex.value.trim())){hex.setAttribute('aria-invalid','true');hint.hidden=false;hint.textContent='请输入完整色号，例如 #FF6699；保留上次有效颜色。';}});
}


function setRotation(angle){crops[format].angle=((angle+180)%360+360)%360-180;sync();}
$('rotation').addEventListener('input',e=>setRotation(Number(e.target.value)));

SceneEditor.init(render,()=>format);

for(const key of ['metalGloss','styleOpacity'])$(key).addEventListener('input',()=>{$(key+'Value').value=$(key).value+'%';render();});
$('metalColor').addEventListener('input',()=>{$('metalHex').value=$('metalColor').value.toUpperCase();$('metalHex').removeAttribute('aria-invalid');$('metalHint').hidden=true;render();});
$('metalHex').addEventListener('input',()=>{const value=$('metalHex').value.trim();if(/^#[0-9a-f]{6}$/i.test(value)){$('metalColor').value=value;$('metalHex').removeAttribute('aria-invalid');$('metalHint').hidden=true;render();}});
$('metalHex').addEventListener('change',()=>{if(!/^#[0-9a-f]{6}$/i.test($('metalHex').value.trim())){$('metalHex').setAttribute('aria-invalid','true');$('metalHint').hidden=false;$('metalHint').textContent='请输入完整色号，例如 #C0C8DD。';}});



for(const section of document.querySelectorAll('.editor-section')){
const heading=section.querySelector(':scope > summary');
heading.addEventListener('click',event=>{event.preventDefault();const editor=section.closest('.editor'),before=heading.getBoundingClientRect().top;section.open=!section.open;const after=heading.getBoundingClientRect().top;editor.scrollTop+=after-before;});
}

