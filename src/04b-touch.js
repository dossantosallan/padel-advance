/* ---------- tela cheia verdadeira: controles por cima do jogo ----------
   Analógico flutuante: aparece onde o polegar encosta na metade esquerda.
   Botões A, B, PARCEIRO e PAUSA podem ser arrastados e redimensionados no editor (salvos em save.opts.ctl).
   Um toque rápido sem arrastar vira toque na tela do jogo (menus da carreira). */
const CTL_DEF={a:{x:.86,y:.86,s:1},b:{x:.68,y:.92,s:1},sel:{x:.62,y:.78,s:1},start:{x:.9,y:.06,s:1},joy:{s:1},op:.85,dz:1};
const CTL_N={a:'BOTAO A',b:'BOTAO B',sel:'PARCEIRO',start:'PAUSA',joy:'ANALOGICO'},DZ=[.18,.3,.45],DZ_N=['BAIXA','MEDIA','ALTA'];
function ctlCfg(){const o=save.opts;if(!o.ctl)o.ctl=JSON.parse(JSON.stringify(CTL_DEF));for(const k in CTL_DEF)if(o.ctl[k]==null)o.ctl[k]=JSON.parse(JSON.stringify(CTL_DEF[k]));return o.ctl}
let tov=null,joy=null,ctlEdit=null;
function touchInit(){
  try{
    const st=document.createElement('style');st.textContent=`
#tov{position:fixed;inset:0;z-index:20;display:none;touch-action:none;-webkit-user-select:none;user-select:none}
.tb{position:absolute;transform:translate(-50%,-50%);border:0;padding:0;font:16px var(--pixel);color:#05071a;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:pointer;
  box-shadow:0 5px 0 rgba(0,0,0,.45),inset 0 -4px 0 rgba(0,0,0,.25),inset 0 3px 0 rgba(255,255,255,.35);border-radius:50%;outline:3px solid #05071a}
.tb small{position:absolute;top:100%;margin-top:9px;font:8px var(--pixel);color:#f4f6ff;text-shadow:1px 1px 0 #05071a;white-space:nowrap}
.tb.a{width:66px;height:66px;background:radial-gradient(circle at 34% 28%,#fff6c0 0 12%,#ffd23f 38%,#c89a10 75%,#8a6a08)}
.tb.b{width:54px;height:54px;background:radial-gradient(circle at 34% 28%,#e8f6ff 0 12%,#5fb4ff 40%,#2a70c0 75%,#16457e)}
.tb.p{border-radius:9px;width:70px;height:26px;font-size:9px;color:#f4f6ff;background:linear-gradient(#6a74b8,#3a4278 55%,#2b3160)}
.tb.s{border-radius:9px;width:38px;height:32px;font-size:11px;color:#f4f6ff;background:linear-gradient(#4a5498,#2b3160)}
.tb.on{filter:brightness(.72);transform:translate(-50%,-46%);box-shadow:0 2px 0 rgba(0,0,0,.45)}
#joyB,#joyK,#joyG{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}
#joyB{background:radial-gradient(circle,rgba(5,7,26,.25),rgba(5,7,26,.55));box-shadow:0 0 0 3px rgba(244,246,255,.55),inset 0 0 0 12px rgba(244,246,255,.06);display:none}
#joyK{background:radial-gradient(circle at 34% 28%,#c8d0ff 0 14%,#7a84d0 40%,#3a4288 75%,#1c2250);box-shadow:0 5px 0 rgba(0,0,0,.4),0 0 0 3px #05071a;display:none}
#joyG{border:2px dashed rgba(244,246,255,.22);display:none}
#ced{position:fixed;inset:0;z-index:40;display:none;background:rgba(5,7,26,.55);touch-action:none;font-family:var(--pixel);color:#f4f6ff}
#ced .tb{outline:2px dashed rgba(255,255,255,.45);outline-offset:6px}
#ced .tb.sel{outline:2px dashed #ffd23f}
#ced .jw{position:absolute;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(5,7,26,.25),rgba(5,7,26,.55));box-shadow:0 0 0 3px rgba(244,246,255,.55);display:flex;align-items:center;justify-content:center;font:8px var(--pixel);color:#ffd23f;text-align:center;line-height:1.6}
#ced .jw.sel{box-shadow:0 0 0 3px #ffd23f}
#ced .pn{position:absolute;left:50%;top:max(14px,env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(92vw,360px);box-sizing:border-box;padding:14px;border-radius:6px;
  background:linear-gradient(#1e2860,#10163a);box-shadow:0 0 0 3px #05071a,0 0 0 4px #ffd23f,0 8px 0 rgba(0,0,0,.4)}
#ced h3{margin:0 0 6px;font:14px var(--pixel);color:#ffd23f;text-align:center}
#ced p{margin:0 0 12px;font:7px/1.8 var(--pixel);color:#9890d4;text-align:center}
#ced label{display:flex;justify-content:space-between;font:8px var(--pixel);margin:10px 0 6px}
#ced label b{color:#ffd23f;font-weight:400}
#ced input[type=range]{width:100%;accent-color:#ffd23f}
#ced .row{display:flex;gap:10px;margin-top:12px}
#ced .row button{flex:1;font:9px var(--pixel);padding:11px 0;border:0;border-radius:4px;color:#f4f6ff;background:linear-gradient(#4a5498,#2b3160);box-shadow:0 0 0 2px #05071a,0 3px 0 rgba(0,0,0,.4)}
#ced .row button.ok{background:linear-gradient(#ffe680,#ffd23f 50%,#c89a10);color:#05071a}
#ced .dz{display:flex;gap:6px}#ced .dz button{flex:1;font:8px var(--pixel);padding:8px 0;border:0;border-radius:3px;background:#2b3160;color:#f4f6ff}#ced .dz button.on{background:#ffd23f;color:#05071a}
#tov[data-m=ui] .tb:not(.s),#tov[data-m=menu] .tb.p{display:none}
@media (pointer:fine){#tov .tb,#joyG{display:none!important}}`;
    document.head.appendChild(st);
    tov=document.createElement('div');tov.id='tov';
    tov.innerHTML='<div id="joyG"></div><div id="joyB"></div><div id="joyK"></div><button class="tb a" data-k="a">A<small>GOLPE</small></button><button class="tb b" data-k="b">B<small>GLOBO</small></button><button class="tb p" data-k="sel">PARC</button><button class="tb s" data-k="start">II</button>';
    document.body.appendChild(tov);
    tov.querySelectorAll('.tb').forEach(el=>{const k=el.dataset.k,up=()=>{tc[k]=0;el.classList.remove('on')};
      el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();unlock();tc[k]=1;tcTap[k]=1;el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}});
      ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,up))});
    tov.addEventListener('pointerdown',joyDown);tov.addEventListener('pointermove',joyMove);
    ['pointerup','pointercancel'].forEach(t=>tov.addEventListener(t,joyUp));
    cv.addEventListener('pointerup',e=>canvasTapAt(e.clientX,e.clientY));
    addEventListener('resize',ctlLayout);ctlLayout();
  }catch(_){}
}
function ctlLayout(){
  if(!tov)return;const c=ctlCfg(),W=innerWidth,H=innerHeight;
  tov.querySelectorAll('.tb').forEach(el=>{const p=c[el.dataset.k];el.style.left=(p.x*W)+'px';el.style.top=(p.y*H)+'px';el.style.transform=`translate(-50%,-50%) scale(${p.s})`});
  tov.style.opacity=c.op;
  const g=document.getElementById('joyG'),r=60*c.joy.s;g.style.width=g.style.height=(2*r)+'px';g.style.left=(.2*W)+'px';g.style.top=(.84*H)+'px';
}
function joyDown(e){
  if(e.target.closest&&e.target.closest('.tb'))return;e.preventDefault();unlock();
  const c=ctlCfg(),left=e.clientX<innerWidth*.55;
  joy={id:e.pointerId,x0:e.clientX,y0:e.clientY,t:performance.now(),moved:false,stick:left,r:60*c.joy.s};
  try{tov.setPointerCapture(e.pointerId)}catch(_){}
  if(left){const B=document.getElementById('joyB'),K=document.getElementById('joyK');B.style.width=B.style.height=(2*joy.r)+'px';K.style.width=K.style.height=(.8*joy.r)+'px';
    B.style.left=K.style.left=e.clientX+'px';B.style.top=K.style.top=e.clientY+'px';B.style.display=K.style.display='block'}
}
function joyMove(e){
  if(!joy||e.pointerId!==joy.id)return;const dx=e.clientX-joy.x0,dy=e.clientY-joy.y0,d=Math.hypot(dx,dy);if(d>10)joy.moved=true;if(!joy.stick)return;
  const r=joy.r,k=d>r?r/d:1,K=document.getElementById('joyK');K.style.left=(joy.x0+dx*k)+'px';K.style.top=(joy.y0+dy*k)+'px';
  const nx=dx/r,ny=dy/r,t=DZ[ctlCfg().dz]??.3;dp.left=nx<-t?1:0;dp.right=nx>t?1:0;dp.up=ny<-t?1:0;dp.down=ny>t?1:0;
}
function joyUp(e){
  if(!joy||e.pointerId!==joy.id)return;
  if(!joy.moved&&performance.now()-joy.t<350)canvasTapAt(e.clientX,e.clientY);
  joy=null;dp.left=dp.right=dp.up=dp.down=0;['joyB','joyK'].forEach(i=>document.getElementById(i).style.display='none');
}
/* guia discreta do analógico durante a partida */
let tovState='';function tovMode(){const s=['career','ctw','cdeco','cgar'].includes(mode)?'ui':mode==='game'?'game':'menu';if(s!==tovState&&tov){tovState=s;tov.dataset.m=s}}
let joyGShown=null;function joyGuide(){tovMode();try{const v=mode==='game'&&!paused&&!joy&&document.body.classList.contains('full');if(v===joyGShown)return;joyGShown=v;const g=document.getElementById('joyG');if(g)g.style.display=v?'block':'none'}catch(_){}}
/* ---------- editor dos controles ---------- */
function openCtlEditor(){
  save.opts.full=true;applyScreen();
  const c=JSON.parse(JSON.stringify(ctlCfg()));let selK='joy';
  let ed=document.getElementById('ced');if(!ed){ed=document.createElement('div');ed.id='ced';document.body.appendChild(ed)}
  ed.innerHTML=`<div class="pn"><h3>CONTROLES</h3><p>ARRASTE OS BOTOES PARA MOVER<br>O ANALOGICO APARECE ONDE O POLEGAR TOCAR</p>
    <label>&gt; <span id="cN"></span><b id="cS"></b></label><input id="cSz" type="range" min="60" max="160" step="5">
    <label>OPACIDADE<b id="cO"></b></label><input id="cOp" type="range" min="30" max="100" step="5">
    <label>ZONA MORTA</label><div class="dz">${DZ_N.map((n,i)=>`<button data-i="${i}">${n}</button>`).join('')}</div>
    <div class="row"><button id="cDef">PADRAO</button><button id="cOk" class="ok">SALVAR</button></div></div>
    <div class="jw" data-k="joy">ANALOGICO<br>FLUTUANTE</div>
    <button class="tb a" data-k="a">A<small>GOLPE</small></button><button class="tb b" data-k="b">B<small>GLOBO</small></button><button class="tb p" data-k="sel">PARC</button><button class="tb s" data-k="start">II</button>`;
  ed.style.display='block';ctlEdit={c};
  const W=innerWidth,H=innerHeight,$=s=>ed.querySelector(s);
  const paint=()=>{ed.querySelectorAll('.tb').forEach(el=>{const p=c[el.dataset.k];el.style.left=(p.x*W)+'px';el.style.top=(p.y*H)+'px';el.style.transform=`translate(-50%,-50%) scale(${p.s})`;el.classList.toggle('sel',el.dataset.k===selK)});
    const jw=$('.jw'),r=60*c.joy.s;jw.style.width=jw.style.height=(2*r)+'px';jw.style.left=(.2*W)+'px';jw.style.top=(.84*H)+'px';jw.classList.toggle('sel',selK==='joy');
    ed.querySelectorAll('.tb,.jw').forEach(el=>el.style.opacity=c.op);
    $('#cN').textContent=CTL_N[selK];const s=selK==='joy'?c.joy.s:c[selK].s;$('#cS').textContent=Math.round(s*100)+'%';$('#cSz').value=Math.round(s*100);
    $('#cO').textContent=Math.round(c.op*100)+'%';$('#cOp').value=Math.round(c.op*100);ed.querySelectorAll('.dz button').forEach(b=>b.classList.toggle('on',+b.dataset.i===c.dz))};
  $('#cSz').oninput=e=>{const v=e.target.value/100;if(selK==='joy')c.joy.s=v;else c[selK].s=v;paint()};
  $('#cOp').oninput=e=>{c.op=e.target.value/100;paint()};
  ed.querySelectorAll('.dz button').forEach(b=>b.onclick=()=>{c.dz=+b.dataset.i;paint()});
  $('#cDef').onclick=()=>{Object.assign(c,JSON.parse(JSON.stringify(CTL_DEF)));paint()};
  $('#cOk').onclick=()=>{save.opts.ctl=c;store();ed.style.display='none';ctlEdit=null;ctlLayout();sfx.game();if(optRet==='career'){optRet=null;mode='career'}};
  $('.jw').onpointerdown=e=>{e.preventDefault();selK='joy';paint()};
  ed.querySelectorAll('.tb').forEach(el=>{let drag=null;
    el.onpointerdown=e=>{e.preventDefault();e.stopPropagation();selK=el.dataset.k;drag={dx:e.clientX-c[selK].x*W,dy:e.clientY-c[selK].y*H};try{el.setPointerCapture(e.pointerId)}catch(_){}paint()};
    el.onpointermove=e=>{if(!drag)return;const p=c[el.dataset.k];p.x=clamp((e.clientX-drag.dx)/W,.05,.95);p.y=clamp((e.clientY-drag.dy)/H,.04,.97);paint()};
    el.onpointerup=el.onpointercancel=()=>{drag=null}});
  paint();
}
touchInit();
