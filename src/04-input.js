/* ---------- entrada ---------- */
const BTN=['left','right','up','down','a','b','sel','start'];
const down=new Set(),tapped=new Set();const tcTap={};
const tc={},dp={};BTN.forEach(k=>{tc[k]=0;dp[k]=0});
const MAP1={left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],up:['ArrowUp','KeyW'],down:['ArrowDown','KeyS'],a:['KeyJ','KeyZ','Space'],b:['KeyK','KeyX'],sel:['ShiftLeft','ShiftRight'],start:['Enter','Escape']};
const MAP2A={left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'],a:['KeyF'],b:['KeyG'],sel:['KeyQ'],start:[]};
const MAP2B={left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'],a:['KeyL'],b:['KeyK'],sel:['KeyP'],start:[]};
const GAMEKEYS=new Set(Object.values(MAP1).flat().concat(Object.values(MAP2A).flat(),Object.values(MAP2B).flat()));
const mkPad=()=>({cur:{},prev:{}});
const pad1=mkPad(),pad2=mkPad(),menu=mkPad();
addEventListener('keydown',e=>{if(e.target&&/^(TEXTAREA|INPUT)$/.test(e.target.tagName))return;if(mode==='name'){const ch=/^Key[A-Z]$/.test(e.code)?e.code[3]:e.code==='Space'?' ':e.code==='Backspace'?'<':null;if(ch){e.preventDefault();typeQ.push(ch);unlock();return}}if(GAMEKEYS.has(e.code))e.preventDefault();if(!e.repeat)tapped.add(e.code);down.add(e.code);unlock()});
addEventListener('keyup',e=>{down.delete(e.code)});
addEventListener('blur',()=>{down.clear();BTN.forEach(k=>{tc[k]=0;dp[k]=0})});
function fill(pad,map,touch){for(const k of BTN){pad.prev[k]=pad.cur[k]||0;pad.cur[k]=(map[k].some(c=>down.has(c)||tapped.has(c))||(touch&&(tc[k]||tcTap[k]||dp[k])))?1:0}}
function readInput(){fill(menu,MAP1,true);if(twoP){fill(pad1,MAP2A,true);fill(pad2,MAP2B,false)}else{fill(pad1,MAP1,true);fill(pad2,MAP2B,false)}tapped.clear();for(const k in tcTap)tcTap[k]=0}
const prs=(pad,k)=>pad.cur[k]&&!pad.prev[k];
function bindBtn(id,k){
  const el=document.getElementById(id);if(!el)return;
  const up=()=>{tc[k]=0;el.classList.remove('on')};
  el.addEventListener('pointerdown',e=>{e.preventDefault();unlock();tc[k]=1;tcTap[k]=1;el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,up));
}
bindBtn('bA','a');bindBtn('bB','b');bindBtn('bStart','start');bindBtn('bSel','sel');
const dpEl=document.getElementById('dpad');
function dpSet(e){
  const r=dpEl.getBoundingClientRect();
  const dx=(e.clientX-(r.left+r.width/2))/(r.width/2),dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
  dp.left=dx<-.28?1:0;dp.right=dx>.28?1:0;dp.up=dy<-.28?1:0;dp.down=dy>.28?1:0;
  ['up','down','left','right'].forEach(d=>dpEl.classList.toggle(d,!!dp[d]));
}
function dpClear(){dp.left=dp.right=dp.up=dp.down=0;dpEl.className='dpad'}
if(dpEl){
  dpEl.addEventListener('pointerdown',e=>{e.preventDefault();unlock();try{dpEl.setPointerCapture(e.pointerId)}catch(_){}dpSet(e)});
  dpEl.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')dpSet(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>dpEl.addEventListener(t,dpClear));
}
document.addEventListener('contextmenu',e=>{if(!(e.target&&e.target.closest&&e.target.closest('#shareOv')))e.preventDefault()});
