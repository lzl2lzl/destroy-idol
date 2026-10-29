 'use strict';
const SceneEditor=(()=>{
const el=id=>document.getElementById(id);
const resetIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8a6 6 0 1 1 1 7M4 3v5h5"/></svg>';
const definitions={
 dialogue:{label:'对白框',x:16,y:72,w:68,h:19,fill:'#f3faff',text:'今天，也一起划船吧。',title:'并不知道什么叫做可爱',font:28,titleFont:25},
 rank:{label:'RANK',x:4,y:5,w:10,h:11,fill:'#ffffff',outline:2,text:'77',font:42},
 clock:{label:'一行文字',x:70,y:4,w:26,h:6,text:'并不知道是什么但是一行字',font:23},
 auto:{label:'标签',x:75,y:68,w:9,h:4,text:'AUTO',font:22,textColor:'#ffffff'},
 chapter:{label:'章节名',x:8,y:22,w:34,h:8,text:'第一章 · 故事从这里开始',font:28},
 quote:{label:'短句条',x:53,y:43,w:37,h:13,text:'把今天，留在这一刻。',font:30},
 badge:{label:'小徽章',x:84,y:21,w:8,h:14,text:'纪念',font:26}
};
const items=Object.entries(definitions).map(([type,t])=>({id:type,type,included:true,enabled:type==='dialogue',template:'classic',styleEnabled:true,textEnabled:true,follow:true,fill:'#ffffff',accent:'#60bce1',secondary:'#dcaedb',opacity:90,outline:2,textColor:'#465a83',titleColor:'#ffffff',titleOpacity:100,textOpacity:100,font:26,titleFont:25,title:'',textX:type==='clock'?100:['auto','rank','quote','badge'].includes(type)?50:0,textY:50,titleX:0,titleY:50,align:type==='clock'?'right':['auto','rank','quote','badge'].includes(type)?'center':'left',titleAlign:'left',titleDX:0,titleDY:0,bodyDX:0,bodyDY:0,...t}));
let selected='dialogue',onChange=()=>{},getFormat=()=>'',drag=null,textHits=[],lastPart='layer';
const current=()=>items.find(m=>m.id===selected);
function refresh(){
const host=el('sceneChoices');host.replaceChildren();
for(const m of items){
 const section=document.createElement('section');section.className='scene-component';section.dataset.component=m.id;
 const header=document.createElement('div');header.className='restore-row layer-title';
 const label=document.createElement('label');label.className='checkbox';const check=document.createElement('input');check.type='checkbox';check.checked=m.enabled;check.dataset.simpleComponent=m.id;
 label.append(check,document.createTextNode(m.label));
 const reset=document.createElement('button');reset.type='button';reset.className='position-reset';reset.innerHTML=resetIcon+'<span>重置位置</span>';reset.setAttribute('aria-label',m.label+'重置位置');reset.hidden=!m.enabled;
 reset.addEventListener('click',()=>{const t=definitions[m.type];m.x=t.x;m.y=t.y;m.titleDX=m.titleDY=m.bodyDX=m.bodyDY=0;onChange();controls();});
 header.append(label,reset);section.append(header);
 const panel=document.createElement('div');panel.className='scene-component-fields';panel.hidden=!m.enabled;section.append(panel);
 check.addEventListener('change',()=>{m.enabled=check.checked;if(m.enabled)selected=m.id;panel.hidden=!m.enabled;reset.hidden=!m.enabled;onChange();controls();});
 function range(title,key,min,max,step=1){const row=document.createElement('div');row.className='scene-position-row';const label=document.createElement('label');const id='scene-'+m.id+'-'+key;label.htmlFor=id;label.textContent=title;const output=document.createElement('output');output.htmlFor=id;label.append(output);const input=document.createElement('input');input.type='range';input.id=id;input.min=min;input.max=max;input.step=step;input.dataset.position=key;input.addEventListener('input',()=>{selected=m.id;const value=Number(input.value);if(key==='x'||key==='y')m[key]=value;else{const [role,axis]=key.split('-');const t=textHits.find(t=>t.id===m.id&&t.role===role);if(t){const span=axis==='x'?t.moduleW-t.w:t.moduleH-t.h;const local=axis==='x'?t.localX:t.localY;m[(role==='title'?'title':'body')+(axis==='x'?'DX':'DY')]=span*value/100-local;}}onChange();controls();});row.append(label,input);panel.append(row);}
 const moveLabel=document.createElement('div');moveLabel.className='scene-field-caption';moveLabel.textContent=m.type==='dialogue'?'对白框位置':'整体位置';panel.append(moveLabel);range('水平','x',0,100-m.w,.1);range('垂直','y',0,100-m.h,.1);
 function field(title,prop,color,font){const group=document.createElement('div');group.className='scene-text-group';const label=document.createElement('label');label.htmlFor='scene-'+m.id+'-'+prop;label.textContent=title;const input=document.createElement(['dialogue','quote'].includes(m.type)&&prop==='text'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';else input.rows=2;input.id=label.htmlFor;input.value=m[prop];input.maxLength=m.type==='rank'?8:prop==='title'?60:240;input.dataset.property=prop;input.addEventListener('input',()=>{m[prop]=input.value;selected=m.id;onChange();controls();});group.append(label,input);
 const styles=document.createElement('div');styles.className='simple-text-style';for(const [caption,key,type] of [['颜色',color,'color'],['字号',font,'number']]){const lab=document.createElement('label');lab.textContent=caption;const control=document.createElement('input');control.type=type;control.value=m[key];control.dataset.property=key;control.setAttribute('aria-label',m.label+title+caption);if(type==='number'){control.min=10;control.max=60;}control.addEventListener('input',()=>{if(type==='number'&&!control.value)return;m[key]=type==='number'?Math.max(10,Math.min(60,Number(control.value))):control.value;selected=m.id;onChange();controls();});control.addEventListener('change',()=>control.value=m[key]);lab.append(control);styles.append(lab);}group.append(styles);panel.append(group);
 if(m.type==='dialogue'){const role=prop==='title'?'title':'body';range(title+'水平',role+'-x',0,100);range(title+'垂直',role+'-y',0,100);}}
 if(m.type==='dialogue')field('姓名','title','titleColor','titleFont');field(m.type==='dialogue'?'台词':m.type==='rank'?'等级':m.type==='chapter'?'章节名':m.type==='quote'?'短句':m.type==='badge'?'徽章文字':'文字','text','textColor','font');
 const warning=document.createElement('p');warning.className='muted';warning.dataset.overflow=m.id;warning.textContent='文字较多，预览已截断，请缩短内容或减小字号。';warning.hidden=true;panel.append(warning);host.append(section);
}controls();}
function controls(){for(const m of items){const section=document.querySelector('[data-component="'+m.id+'"]');if(!section)continue;for(const input of section.querySelectorAll('[data-position]')){const key=input.dataset.position;let value=m[key];if(key.includes('-')){const [role,axis]=key.split('-'),t=textHits.find(t=>t.id===m.id&&t.role===role);if(!t){input.disabled=true;continue;}const span=axis==='x'?t.moduleW-t.w:t.moduleH-t.h;const local=axis==='x'?t.localX:t.localY;value=span>0?(local+m[(role==='title'?'title':'body')+(axis==='x'?'DX':'DY')])/span*100:0;input.disabled=span<1;}input.value=value;input.previousElementSibling.querySelector('output').textContent=Math.round(Number(input.value))+'%';}}}
function init(change,format){onChange=change;getFormat=format;
const canvas=el('preview');const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.x)*canvas.width/r.width,y:(e.clientY-r.y)*canvas.height/r.height};};
canvas.addEventListener('pointerdown',e=>{if(getFormat()!=='landscape')return;const p=point(e),m=[...items].reverse().find(m=>m.enabled&&p.x>=m.x*canvas.width/100&&p.x<=(m.x+m.w)*canvas.width/100&&p.y>=m.y*canvas.height/100&&p.y<=(m.y+m.h)*canvas.height/100);if(!m)return;e.preventDefault();e.stopImmediatePropagation();canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});selected=m.id;const hit=m.type==='dialogue'?[...textHits].reverse().find(t=>t.id===m.id&&p.x>=t.x-5&&p.x<=t.x+t.w+5&&p.y>=t.y-5&&p.y<=t.y+t.h+5):null;lastPart=hit?.role||'layer';drag={m,start:p,x:m.x,y:m.y,role:lastPart,hit,dx:lastPart==='title'?m.titleDX:m.bodyDX,dy:lastPart==='title'?m.titleDY:m.bodyDY};controls();},true);
function move(dx,dy){if(!drag)return;const m=drag.m;if(drag.role==='layer'){m.x=Math.max(0,Math.min(100-m.w,drag.x+dx/canvas.width*100));m.y=Math.max(0,Math.min(100-m.h,drag.y+dy/canvas.height*100));}else{const key=drag.role==='title'?'title':'body',t=drag.hit;m[key+'DX']=Math.max(-t.localX,Math.min(t.moduleW-t.localX-t.w,drag.dx+dx));m[key+'DY']=Math.max(-t.localY,Math.min(t.moduleH-t.localY-t.h,drag.dy+dy));}onChange();controls();}
canvas.addEventListener('pointermove',e=>{if(!drag)return;e.stopImmediatePropagation();const p=point(e);move(p.x-drag.start.x,p.y-drag.start.y);},true);
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null,true);
canvas.addEventListener('keydown',e=>{if(getFormat()!=='landscape'||!current()||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();const m=current(),step=e.shiftKey?10:2;const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;m.x=Math.max(0,Math.min(100-m.w,m.x+dx/canvas.width*100));m.y=Math.max(0,Math.min(100-m.h,m.y+dy/canvas.height*100));onChange();controls();},true);
refresh();controls();onChange();}
function draw(ctx,W,H,showText,globalColor,styleOpacity=1,metalColor='#e4b66c'){textHits=[];for(const m of items){if(!m.included||!m.enabled)continue;let overflow=false;const x=W*m.x/100,y=H*m.y/100,w=W*m.w/100,h=H*m.h/100,c=m.follow?globalColor:m.accent,secondary=m.follow?metalColor:m.secondary;ctx.save();ctx.translate(x,y);
function path(points){ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();}
function box(bx,by,bw,bh,fill,r=10){ctx.beginPath();if(m.template==='cut'){const k=Math.min(13,bw/5,bh/4);ctx.moveTo(bx+k,by);ctx.lineTo(bx+bw,by);ctx.lineTo(bx+bw,by+bh-k);ctx.lineTo(bx+bw-k,by+bh);ctx.lineTo(bx,by+bh);ctx.lineTo(bx,by+k);ctx.closePath();}else{ctx.roundRect(bx,by,Math.max(1,bw),Math.max(1,bh),Math.min(m.template==='glass'?22:r,bw/2,bh/2));}ctx.fillStyle=fill;ctx.fill();if(m.outline){ctx.lineWidth=m.outline;ctx.strokeStyle=c;ctx.stroke();}}
function line(points,color,width=2){ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,c);grad.addColorStop(1,secondary);
ctx.globalAlpha=m.styleEnabled?m.opacity/100*styleOpacity:0;ctx.shadowColor=m.template==='glass'?c+'80':'transparent';ctx.shadowBlur=m.template==='glass'?10:0;
// Shared cut corners, enamel edging and metallic inlays echo the card frames.
const metal=ctx.createLinearGradient(0,0,w,h);metal.addColorStop(0,secondary);metal.addColorStop(.42,'#fff9eb');metal.addColorStop(.55,secondary);metal.addColorStop(1,'#fff4df');
function contour(bx,by,bw,bh,k){return [[bx,by],[bx+bw-k,by],[bx+bw,by+k],[bx+bw,by+bh],[bx+k,by+bh],[bx,by+bh-k]];}
function plate(bx,by,bw,bh,k,fill){path(contour(bx,by,bw,bh,k));ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();path(contour(bx+5,by+5,bw-10,bh-10,Math.max(3,k-3)));ctx.strokeStyle=metal;ctx.lineWidth=1.5;ctx.stroke();}
function star(sx,sy,r,fill){path([[sx,sy-r],[sx+r*.25,sy-r*.25],[sx+r,sy],[sx+r*.25,sy+r*.25],[sx,sy+r],[sx-r*.25,sy+r*.25],[sx-r,sy],[sx-r*.25,sy-r*.25]]);ctx.fillStyle=fill;ctx.fill();}
if(m.type==='rank'){
 plate(3,3,w-6,h-6,17,'#f5fbfff0');
 path([[9,9],[w-25,9],[w-9,25],[w-9,33],[9,33]]);ctx.fillStyle=c;ctx.fill();
 ctx.fillStyle='#ffffff';ctx.font='600 15px Arial,sans-serif';ctx.textAlign='center';ctx.fillText('RANK',w/2,26);
 line([[20,h-13],[w-35,h-13]],metal,2);star(w-21,h-15,7,c);
}
else if(m.type==='dialogue'){
 const paper=ctx.createLinearGradient(0,h*.23,0,h);paper.addColorStop(0,'#f5fcfff2');paper.addColorStop(1,'#e9f4ffe0');
 plate(3,h*.25,w-6,h*.75-3,23,paper);
 const nameWidth=w*.44;path([[18,3],[nameWidth-15,3],[nameWidth+7,h*.21],[nameWidth,h*.27],[18,h*.27]]);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=metal;ctx.lineWidth=2;ctx.stroke();
 line([[23,8],[nameWidth-18,8]],'#ffffffb0',1);
 line([[23,h-15],[w*.24,h-15]],metal,2);line([[w*.24+8,h-15],[w*.31,h-15]],c,2);
 star(w-26,h-24,10,c);star(w-47,h-18,4,secondary);
}
else if(m.type==='auto'){
 plate(3,3,w-6,h-6,10,c);star(18,h/2,6,'#ffffff');
}
else if(m.type==='clock'){
 plate(3,3,w-6,h-6,13,'#f5fbffdf');
 path([[10,10],[27,10],[17,h-10],[10,h-10]]);ctx.fillStyle=c;ctx.fill();
 star(w-17,h/2,5,secondary);
}

else if(m.type==='chapter'){
 plate(3,8,w-6,h-16,17,'#f5fbffeb');
 path([[9,14],[34,14],[22,h-14],[9,h-14]]);ctx.fillStyle=c;ctx.fill();
 line([[39,h-10],[w*.6,h-10]],metal,2);star(w-23,h/2,8,c);
}
else if(m.type==='quote'){
 const paper=ctx.createLinearGradient(0,0,w,h);paper.addColorStop(0,'#f7fcfff0');paper.addColorStop(1,'#eaf3ffe0');
 plate(3,3,w-6,h-6,22,paper);
 ctx.fillStyle=c;ctx.font='bold 44px Georgia,serif';ctx.textAlign='left';ctx.fillText('“',19,44);
 line([[23,h-15],[w*.32,h-15]],metal,2);star(w-26,h-23,9,c);star(w-44,h-17,4,secondary);
}
else if(m.type==='badge'){
 const points=[[w/2,3],[w-5,h*.24],[w-5,h*.76],[w/2,h-3],[5,h*.76],[5,h*.24]];
 path(points);ctx.fillStyle='#f5fbfff0';ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();
 ctx.save();ctx.translate(w/2,h/2);ctx.scale(.86,.86);ctx.translate(-w/2,-h/2);path(points);ctx.strokeStyle=metal;ctx.lineWidth=2;ctx.stroke();ctx.restore();
 star(w/2,h*.23,10,c);line([[w*.34,h*.77],[w*.66,h*.77]],metal,2);
}

ctx.globalAlpha=m.textOpacity/100;ctx.shadowColor='transparent';ctx.shadowBlur=0;
// Text is independent of the panel opacity, and constrained to its own region.
function text(value,bx,by,bw,bh,size,color,align=m.align,role='body'){if(!showText||!m.textEnabled||!value||bw<=0||bh<=0)return;ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();let rows=[],font=Math.min(size,160);function wrap(){ctx.font=`${m.type==='rank'?'bold italic ':''}${font}px ${m.type==='rank'?'Georgia,serif':'"Microsoft YaHei",sans-serif'}`;rows=[];for(const para of value.split('\n')){let row='';for(const ch of para){if(row&&ctx.measureText(row+ch).width>bw-4){rows.push(row);row='';}row+=ch;}rows.push(row);}}wrap();while(rows.length*font*1.35>bh&&font>8){font--;wrap();}if(rows.length*font*1.35>bh||rows.some(row=>ctx.measureText(row).width>bw)){overflow=true;const capacity=Math.max(1,Math.floor(bh/(font*1.35)));rows=rows.slice(0,capacity);let last=rows.at(-1)||'';while(last&&ctx.measureText(last+'…').width>bw)last=last.slice(0,-1);rows[rows.length-1]=last+'…';}const blockWidth=Math.min(bw,Math.max(0,...rows.map(row=>ctx.measureText(row).width))),blockHeight=rows.length*font*1.35,px=role==='title'?m.titleX:m.textX,py=role==='title'?m.titleY:m.textY;const ox=bx+Math.max(0,bw-blockWidth)*px/100,oy=by+Math.max(0,bh-blockHeight)*py/100;let ddx=role==='title'?m.titleDX:m.bodyDX,ddy=role==='title'?m.titleDY:m.bodyDY;ddx=Math.max(-ox,Math.min(w-ox-blockWidth,ddx));ddy=Math.max(-oy,Math.min(h-oy-blockHeight,ddy));if(role==='title'){m.titleDX=ddx;m.titleDY=ddy;}else{m.bodyDX=ddx;m.bodyDY=ddy;}ctx.translate(ddx,ddy);textHits.push({id:m.id,role,x:x+ox+ddx,y:y+oy+ddy,w:blockWidth,h:blockHeight,localX:ox,localY:oy,moduleW:w,moduleH:h});ctx.globalAlpha=(role==='title'?m.titleOpacity:m.textOpacity)/100;ctx.fillStyle=color;ctx.textBaseline='middle';ctx.textAlign=align;ctx.shadowColor='transparent';ctx.shadowBlur=0;rows.forEach((row,i)=>ctx.fillText(row,ox+(align==='center'?blockWidth/2:align==='right'?blockWidth:0),oy+(i+.5)*font*1.35));ctx.restore();}
const pad=Math.min(20,w*.08);
if(m.type==='dialogue'){text(m.title,32,3,w*.40-20,h*.24,m.titleFont,m.titleColor,m.titleAlign,'title');text(m.text,28,h*.36,w-72,h*.45,m.font,m.textColor);}
else if(m.type==='rank'){text(m.text,16,h*.33,w-30,h*.58,m.font,m.textColor,'left');}
else if(m.type==='auto'){text(m.text,32,5,w-47,h-10,m.font,m.textColor,'center');}
else if(m.type==='chapter'){text(m.text,43,13,w-82,h-26,m.font,m.textColor);}
else if(m.type==='quote'){text(m.text,48,25,w-96,h-53,m.font,m.textColor,'center');}
else if(m.type==='badge'){text(m.text,17,h*.36,w-34,h*.32,m.font,m.textColor,'center');}
else{text(m.text,36,7,w-67,h-14,m.font,m.textColor);}

ctx.restore();const warning=document.querySelector('[data-overflow="'+m.id+'"]');if(warning)warning.hidden=!overflow;}controls();}
return {init,draw};
})();
