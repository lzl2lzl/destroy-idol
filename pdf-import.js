'use strict';
const LocalPDF=(()=>{
let ready=null;
function script(path){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(path,document.baseURI).href;s.onload=resolve;s.onerror=()=>reject(new Error('PDF_DEPENDENCY'));document.head.append(s);});}
async function prepare(){if(!ready)ready=(async()=>{await script('vendor/pdf-api.js');await script('vendor/pdf-resources.js');pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([PDF_WORKER_SOURCE],{type:'text/javascript'}));})();try{await ready;}catch(error){ready=null;throw error;}}
class LocalBinaryDataFactory{
async fetch({kind,filename}){const folder={cMapUrl:'cmaps',standardFontDataUrl:'standard_fonts',wasmUrl:'wasm'}[kind],value=PDF_LOCAL_ASSETS[folder+'/'+filename];if(!value)throw new Error('Missing local PDF asset: '+filename);const binary=atob(value);return Uint8Array.from(binary,c=>c.charCodeAt(0));}}
async function open(file){await prepare();const task=pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer()),BinaryDataFactory:LocalBinaryDataFactory,useWorkerFetch:false,isEvalSupported:false,maxImageSize:60000000,verbosity:0});try{return await task.promise;}catch(error){await task.destroy().catch(()=>{});throw error;}}
async function pageImage(doc,number){const page=await doc.getPage(number),base=page.getViewport({scale:1});if(!Number.isFinite(base.width)||!Number.isFinite(base.height)||base.width<=0||base.height<=0)throw new Error('Invalid PDF page');const scale=Math.min(3600/Math.max(base.width,base.height),Math.sqrt(12000000/(base.width*base.height)));const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(viewport.width));canvas.height=Math.max(1,Math.ceil(viewport.height));await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'#ffffff'}).promise;page.cleanup();return canvas;}
return {open,pageImage};
})();
