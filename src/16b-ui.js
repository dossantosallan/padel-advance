/* ---------- interface 16 bits da carreira ----------
   Tudo desenhado em pixels físicos (320x576) dentro de hi(). Cada elemento clicável é registrado em uiHits
   durante o desenho; o toque na tela e o direcional usam essa lista (navegação por geometria). */
const UIC={};
function uCache(key,w,h,draw){let c=UIC[key];if(!c){c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);const g=c.getContext('2d');if(g){g.imageSmoothingEnabled=false;const keep=cx,ks=silH;cx=g;silH=null;try{draw()}finally{cx=keep;silH=ks}}UIC[key]=c}return c}
const BAY4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const mixh=(a,b,t)=>{const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function gradRaw(w,h,c1,c2,steps){const P=[];for(let i=0;i<=steps;i++)P.push(mixh(c1,c2,i/steps));
  for(let j=0;j<h;j++){const t=j/Math.max(1,h-1)*steps,i=Math.floor(t),f=t-i;Rh(0,j,w,1,P[Math.min(i,steps)]);if(i<steps&&f>0){cx.fillStyle=P[i+1];for(let k=0;k<w;k++)if(BAY4[j&3][k&3]/16<f)cx.fillRect(k,j,1,1)}}}
function uGrad(x,y,w,h,c1,c2,steps=6){if(w<1||h<1)return;cx.drawImage(uCache('g'+w+'_'+h+c1+c2+steps,w,h,()=>gradRaw(w,h,c1,c2,steps)),Math.round(x),Math.round(y))}
function uShadow(x,y,w,h){Rh(x+3,y+4,w,h,'rgba(0,0,0,.38)');Rh(x+1,y+2,w,h,'rgba(0,0,0,.19)')}
function uBevel(x,y,w,h,col,d=.14){uGrad(x,y,w,h,shd(col,d),shd(col,-d),4);Rh(x,y,w,1,shd(col,.4));Rh(x,y,1,h,shd(col,.22));Rh(x,y+h-1,w,1,shd(col,-.45));Rh(x+w-1,y,1,h,shd(col,-.3))}
function uPanel(x,y,w,h,col='#1a2254',edge='#3a4488',hi){uShadow(x,y,w,h);Rh(x,y,w,h,'#05071a');uGrad(x+1,y+1,w-2,h-2,shd(col,.1),shd(col,-.18),5);Rh(x+1,y+1,w-2,1,edge);Rh(x+1,y+2,w-2,1,'rgba(255,255,255,.06)');Rh(x+1,y+h-2,w-2,1,'rgba(0,0,0,.35)');if(hi)Rh(x+1,y+1,3,h-2,hi)}
function uBar(x,y,w,v,col){Rh(x,y,w,7,'#05071a');Rh(x+1,y+1,w-2,5,'#0a0e28');const f=Math.max(0,Math.round((w-2)*clamp(v,0,1)));if(f>0){uGrad(x+1,y+1,f,5,shd(col,.25),shd(col,-.3),3);Rh(x+1,y+1,f,1,shd(col,.55));Rh(x+f,y+1,1,5,shd(col,.6))}}
function uT(s,x,y,c,al,sz){cx.font=(sz||8)+'px "Press Start 2P", monospace';cx.textAlign=al||'left';cx.textBaseline='top';cx.fillStyle='#05071a';cx.fillText(s,x+1,y+1);cx.fillStyle=c;cx.fillText(s,x,y)}
function uBtn(x,y,w,h,lab,col,on,ic){uShadow(x,y,w,h);Rh(x,y,w,h,'#05071a');uBevel(x+1,y+1,w-2,h-2,col,.16);Rh(x+3,y+3,w-6,Math.floor(h/3),'rgba(255,255,255,.1)');Rh(x+1,y+h-4,w-2,3,shd(col,-.45));
  if(ic==='play'){const cy=y+h/2;gPoly(cx,[[x+14,cy-8],[x+14,cy+8],[x+27,cy]],'#05071a');gPoly(cx,[[x+16,cy-5],[x+16,cy+4],[x+23,cy]],shd(col,.25))}else if(ic)uIcon(ic,x+8,y+h/2-10,1.2);uT(lab,x+w/2+(ic?9:0),y+h/2-5,col===ACC?'#05071a':WHITE,'center');if(on)uFocus(x,y,w,h)}
function uFocus(x,y,w,h){const b=(frame>>3)%2?ACC:'#fff2a0',L=6;for(const[px,py,sx,sy]of[[x-2,y-2,1,1],[x+w+1,y-2,-1,1],[x-2,y+h+1,1,-1],[x+w+1,y+h+1,-1,-1]]){Rh(sx>0?px:px-L+1,py,L,2,b);Rh(px,sy>0?py:py-L+1,2,L,b)}}
function uVignette(){cx.drawImage(uCache('vig',320,576,()=>{for(let i=0;i<24;i++){const a=(.2*(24-i)/24).toFixed(3);cx.fillStyle=`rgba(0,0,0,${a})`;cx.fillRect(0,i*2,320,2);cx.fillRect(0,576-(i+1)*2,320,2);cx.fillRect(i,0,1,576);cx.fillRect(319-i,0,1,576)}}),0,0)}
/* ícones 16x16 com três tons, contorno e sombra (cache por tipo/escala) */
function uIconRaw(k,s){
  const P=(px,py,w,h,c)=>Rh(2+px*s,2+py*s,w*s,h*s,c);
  if(k==='house'){P(2,7,12,8,'#f0e4c8');P(10,7,4,8,'#cbb894');P(1,7,14,1,'#8a2018');for(let i=0;i<6;i++){P(7-i,1+i,2+i*2,1,i<2?'#ff6a52':'#e8403a');P(8+i,1+i,1,1,'#a82a20')}P(6,10,4,5,'#6b4423');P(6,10,4,1,'#8a5a32');P(9,12,1,1,'#ffd23f');P(3,9,2,2,'#7fd0ff');P(3,9,1,1,'#ffffff');P(11,2,2,3,'#7a7a8a')}
  else if(k==='cal'){P(1,2,14,13,'#f4f6ff');P(12,3,3,12,'#cdd2e6');P(1,2,14,4,'#e8403a');P(1,2,14,1,'#ff7a6a');P(4,0,2,4,'#8a90a8');P(10,0,2,4,'#8a90a8');for(let j=0;j<3;j++)for(let i=0;i<4;i++)P(2+i*3,7+j*3,2,2,j===1&&i===2?'#ffd23f':'#9aa0c0')}
  else if(k==='rank'){P(6,6,4,9,'#ffd23f');P(6,6,1,9,'#fff09a');P(9,6,1,9,'#c8a020');P(1,9,4,6,'#c0c8d8');P(1,9,1,6,'#ffffff');P(11,11,4,4,'#d09060');P(14,11,1,4,'#9a6a40');P(7,1,2,1,'#ffd23f');P(6,2,4,2,'#ffd23f');P(7,4,2,1,'#ffd23f')}
  else if(k==='pair'){for(const[dx,c]of[[1,'#e8403a'],[8,'#2e86ff']]){P(dx+1,1,5,5,'#f2c18d');P(dx+4,1,2,5,'#d0a070');P(dx+1,0,5,2,'#4a2a18');P(dx,7,7,8,c);P(dx+5,7,2,8,shd(c,-.3));P(dx,7,1,6,shd(c,.3))}}
  else if(k==='team'){P(2,4,12,9,'#2e86ff');P(2,4,12,1,'#7fc0ff');P(11,4,3,9,'#1a5ab0');P(5,1,6,3,'#c8ccd8');P(6,2,4,2,'#1b2350');P(4,7,8,2,'#ffffff');P(7,6,2,4,'#ffffff');P(2,12,12,1,'#103a80')}
  else if(k==='news'){P(1,2,14,12,'#f4f0e0');P(12,2,3,12,'#d8d0b8');P(2,3,12,3,'#1b2350');P(3,4,10,1,'#ffd23f');P(2,7,5,5,'#7fa8d0');P(2,7,5,1,'#b8d4f0');for(let j=0;j<3;j++)P(8,7+j*2,5,1,'#5a5a6a');P(2,13,11,1,'#5a5a6a')}
  else if(k==='trophy'){P(3,1,10,1,'#fff09a');P(3,2,10,4,'#ffd23f');P(4,6,8,2,'#ffd23f');P(10,2,3,6,'#c8a020');P(4,2,1,4,'#fff6c0');P(1,2,2,1,'#c8a020');P(1,2,1,4,'#c8a020');P(13,2,2,1,'#c8a020');P(14,2,1,4,'#c8a020');P(6,8,4,2,'#e8b820');P(7,10,2,2,'#c8a020');P(4,12,8,3,'#6b4423');P(4,12,8,1,'#8a5a32');P(6,13,4,1,'#ffd23f')}
  else if(k==='paint'){P(2,1,11,5,'#e8403a');P(2,1,11,1,'#ff7a6a');P(10,1,3,5,'#a82a20');P(13,3,2,1,'#8a90a8');P(14,3,1,6,'#8a90a8');P(8,8,7,1,'#8a90a8');P(8,8,1,3,'#8a90a8');P(7,11,3,5,'#6b4423');P(7,11,1,5,'#8a5a32')}
  else if(k==='shirt'){P(1,2,4,4,'#e8403a');P(11,2,4,4,'#a82a20');P(4,1,8,14,'#e8403a');P(10,1,2,14,'#a82a20');P(4,1,1,12,'#ff7a6a');P(6,1,4,2,'#f2c18d');P(4,6,8,2,'#ffffff')}
  else if(k==='bed'){P(1,4,3,10,'#6b4423');P(1,4,1,10,'#8a5a32');P(4,8,11,4,'#f4f6ff');P(4,8,11,1,'#ffffff');P(4,11,11,1,'#c8cce0');P(4,6,4,3,'#f4f6ff');P(8,7,7,2,'#2e86ff');P(8,7,7,1,'#7fc0ff');P(14,8,1,6,'#6b4423');P(4,12,11,1,'#5a3418')}
  else if(k==='play'){for(let i=0;i<7;i++){P(3,1+i,1+i*1.4,1,'#05071a');P(3,14-i,1+i*1.4,1,'#05071a')}P(3,8,11,1,'#05071a')}
  else if(k==='car'){P(1,7,14,5,'#2e86ff');P(1,7,14,1,'#7fc0ff');P(1,11,14,1,'#1a5ab0');P(4,4,8,4,'#2e86ff');P(5,5,3,2,'#bfe8ff');P(9,5,2,2,'#bfe8ff');P(14,8,1,2,'#fff6c0');P(1,8,1,2,'#e8403a');P(3,11,3,3,'#1b1b2a');P(10,11,3,3,'#1b1b2a');P(4,12,1,1,'#c8ccd8');P(11,12,1,1,'#c8ccd8')}
  else if(k==='gear'){P(4,1,8,14,'#8f8ac8');P(1,4,14,8,'#8f8ac8');P(2,2,12,12,'#8f8ac8');P(4,1,8,2,'#c0bce8');P(11,4,3,8,'#5a5690');P(6,6,4,4,'#121838');P(6,6,4,1,'#05071a')}
  else if(k==='evo'){P(2,12,3,3,'#5bff7a');P(6,9,3,6,'#5bff7a');P(10,5,3,10,'#5bff7a');P(2,12,1,3,'#b8ffc8');P(6,9,1,6,'#b8ffc8');P(10,5,1,10,'#b8ffc8');P(10,1,5,1,'#ffd23f');P(14,1,1,4,'#ffd23f');P(9,4,4,1,'#ffd23f')}
  else if(k==='heart'){P(2,3,5,5,'#ff5a7a');P(9,3,5,5,'#ff5a7a');P(1,5,14,4,'#ff5a7a');P(3,9,10,2,'#ff5a7a');P(5,11,6,2,'#ff5a7a');P(7,13,2,1,'#ff5a7a');P(3,4,2,2,'#ffc0d0');P(12,6,2,4,'#c02a4a')}
  else if(k==='exit'){P(2,1,8,14,'#6b4423');P(2,1,8,1,'#8a5a32');P(8,8,1,1,'#ffd23f');P(10,7,5,2,'#f4f6ff');P(13,5,1,6,'#f4f6ff')}
  /* contorno */
  const W=16*s+4,H=16*s+4,id=cx.getImageData(0,0,W,H),d=id.data,A=(i,j)=>i>=0&&j>=0&&i<W&&j<H&&d[(j*W+i)*4+3]>0,out=cx.createImageData(W,H),od=out.data;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const q=(j*W+i)*4;if(A(i,j)){od[q]=d[q];od[q+1]=d[q+1];od[q+2]=d[q+2];od[q+3]=255}else if(A(i-1,j)||A(i+1,j)||A(i,j-1)||A(i,j+1)){od[q]=5;od[q+1]=7;od[q+2]=26;od[q+3]=255}}
  cx.putImageData(out,0,0);
}
function uIcon(k,x,y,s=2){const c=uCache('ic'+k+s,16*s+4,16*s+4,()=>uIconRaw(k,s));const sh=uCache('ics'+k+s,16*s+4,16*s+4,()=>{cx.drawImage(c,0,0);cx.globalCompositeOperation='source-in';cx.fillStyle='rgba(0,0,0,.45)';cx.fillRect(0,0,16*s+4,16*s+4);cx.globalCompositeOperation='source-over'});
  cx.drawImage(sh,Math.round(x),Math.round(y)+3);cx.drawImage(c,Math.round(x)-2,Math.round(y)-2)}
/* troféu com volume */
function uTrophy(x,y,s,col,dark){
  if(!dark){cx.globalAlpha=.16;ellH(x+8*s,y+7*s,10*s,8*s,col);cx.globalAlpha=1}
  TROPHY.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch==='.')return;let c;
    if(ch==='Y')c=i>=10?shd(col,-.28):i<=4?shd(col,.3):j<=1?shd(col,.2):col;else if(ch==='W')c='#ffffff';else if(ch==='B')c=i>=10?'#4a2a14':j===13?'#8a5a32':'#6b4423';else c=shd(col,-.62);
    if(dark)c=ch==='X'?'#0a0d22':(i>=10?'#141838':'#1c224a');Rh(x+i*s,y+j*s,s,s,c)}));
  if(!dark){Rh(x+5*s,y+2*s,s,s*3,'rgba(255,255,255,.7)');const px=x+13*s,py=y+s;Rh(px-2,py,5,1,'#ffffff');Rh(px,py-2,1,5,'#ffffff')}
  Rh(x+3*s,y+16*s,10*s,2,'rgba(0,0,0,.35)')}
/* ---------- toque e foco ---------- */
let uiHits=[],uiFocus=null,uiNext=[];
function uiHit(id,x,y,w,h,act){uiNext.push({id,x,y,w,h,act});return uiFocus===id}
function uiBegin(){uiNext=[]}
function uiEnd(){uiHits=uiNext;if(uiFocus==null||!uiHits.some(h=>h.id===uiFocus))uiFocus=uiHits.length?uiHits[0].id:null}
function uiMove(dx,dy){const cur_=uiHits.find(h=>h.id===uiFocus);if(!cur_){if(uiHits[0])uiFocus=uiHits[0].id;return}
  const cxp=cur_.x+cur_.w/2,cyp=cur_.y+cur_.h/2;let best=null,bd=1e9;
  for(const h of uiHits){if(h===cur_)continue;const hx=h.x+h.w/2,hy=h.y+h.h/2,vx=hx-cxp,vy=hy-cyp,along=vx*dx+vy*dy;if(along<=4)continue;const side=Math.abs(vx*dy-vy*dx);const d=along+side*2.2;if(d<bd){bd=d;best=h}}
  if(best){uiFocus=best.id;sfx.ui()}}
function uiInput(){
  if(prs(menu,'up'))uiMove(0,-1);if(prs(menu,'down'))uiMove(0,1);if(prs(menu,'left'))uiMove(-1,0);if(prs(menu,'right'))uiMove(1,0);
  if(prs(menu,'a')){const h=uiHits.find(h=>h.id===uiFocus);if(h&&h.act){sfx.ui();h.act()}return true}
  return false}
let tapQ=null;
function canvasTapAt(clientX,clientY){const r=cv.getBoundingClientRect();if(!r.width)return;tapQ=[(clientX-r.left)/r.width*HW,(clientY-r.top)/r.height*HH,frame]}
function uiTap(){if(!tapQ)return false;const[x,y,f0]=tapQ;tapQ=null;if(frame-f0>3)return false;for(let i=uiHits.length-1;i>=0;i--){const h=uiHits[i];if(x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h){uiFocus=h.id;if(h.act){sfx.ui();h.act()}return true}}return false}
/* ---------- felicidade: casa e carro ---------- */
const DECO=[
  {k:'areia',c:0,n:'AREIA',p:0,h:0,col:['#c8b48a','#bca880']},{k:'azul',c:0,n:'AZUL MAR',p:400,h:2,col:['#3a5a8a','#34527e']},{k:'floresta',c:0,n:'FLORESTA',p:400,h:2,col:['#2e5a42','#2a523c']},{k:'listras',c:0,n:'LISTRAS',p:650,h:3,col:['#e8d8c0','#c8403a']},
  {k:'madeira',c:1,n:'MADEIRA',p:0,h:0},{k:'ceramica',c:1,n:'CERAMICA',p:300,h:1},{k:'carpete',c:1,n:'CARPETE',p:500,h:2},{k:'grama',c:1,n:'GRAMA AZUL',p:900,h:3},
  {k:'roxo',c:2,n:'SOFA ROXO',p:0,h:0,col:'#5a2a6a'},{k:'azulsofa',c:2,n:'SOFA AZUL',p:800,h:2,col:'#2e5a9a'},{k:'couro',c:2,n:'SOFA COURO',p:1600,h:4,col:'#6b3a1e'},{k:'gamer',c:2,n:'SOFA PRETO',p:2400,h:5,col:'#2a2a34'},
  {k:'poster',c:3,n:'POSTER BPT',p:250,h:1},{k:'planta',c:3,n:'PLANTA',p:150,h:1},{k:'aquario',c:3,n:'AQUARIO',p:900,h:3},{k:'tv',c:3,n:'TV GRANDE',p:2500,h:5},{k:'neon',c:3,n:'NEON PADEL',p:1500,h:4},{k:'academia',c:3,n:'ACADEMIA',p:3500,h:6},
];
const DECO_CAT=['PAREDE','PISO','SOFA','EXTRAS'];
const CARLIST=[
  {k:'bike',n:'BICICLETA',p:0,h:0,col:'#e8403a'},{k:'pop',n:'POPULAR 1.0',p:8000,h:4,col:'#e8e8e8'},{k:'hatch',n:'HATCH TURBO',p:22000,h:7,col:'#2e86ff'},{k:'suv',n:'SUV FAMILIA',p:38000,h:10,col:'#4a4a52'},
  {k:'pick',n:'PICAPE 4X4',p:52000,h:12,col:'#c0392b'},{k:'ev',n:'ELETRICO X',p:90000,h:15,col:'#f4f6ff'},{k:'gt',n:'GT SPORT',p:120000,h:20,col:'#ffd23f'}];
function homeEnsure(){if(!car)return;if(!car.home)car.home={wall:'areia',floor:'madeira',sofa:'roxo',own:{areia:1,madeira:1,roxo:1},car:'bike',cars:{bike:1}}}
const decoOf=k=>DECO.find(d=>d.k===k);
function happy(){if(!car)return 0;homeEnsure();const H=car.home;let v=20;for(const k of[H.wall,H.floor,H.sofa]){const d=decoOf(k);if(d)v+=d.h}
  for(const d of DECO)if(d.c===3&&H.own[d.k])v+=d.h;const c=CARLIST.find(c=>c.k===H.car);if(c)v+=c.h;return clamp(v,0,100)}
/* menos cansaço: até 15% nas partidas e até +3 de recuperação na semana de treino */
const happyDrain=()=>1-.15*happy()/100;
const happyTrain=()=>Math.round(3*happy()/100);
/* ---------- quarto ---------- */
function roomKey(H){const tr=(car.trophies||[]).slice(-8).map(t=>t.c).join('');return'room'+H.wall+H.floor+H.sofa+DECO.filter(d=>d.c===3&&H.own[d.k]).map(d=>d.k).join('')+tr}
function roomRaw(H){
  const wd=decoOf(H.wall)||DECO[0],w1=wd.col[0],w2=wd.col[1];
  /* parede */
  Rh(0,0,320,200,w1);if(H.wall==='listras'){for(let x=0;x<320;x+=24)Rh(x,0,6,150,w2)}else if(H.wall==='floresta'){for(let y=6;y<150;y+=12)for(let x=(y/12%2)*8;x<320;x+=16)Rh(x,y,3,3,shd(w1,.18))}else for(let x=0;x<320;x+=16)Rh(x,0,8,150,w2);
  Rh(0,150,320,4,'#7a5a38');Rh(0,154,320,46,shd(w1,-.18));for(let x=0;x<320;x+=20)Rh(x,154,1,46,shd(w1,-.32));Rh(0,196,320,4,'#5a3a1e');
  /* piso */
  const fl=H.floor;
  if(fl==='madeira'){Rh(0,200,320,100,'#9a6a3a');for(let y=200;y<300;y+=10){Rh(0,y,320,1,'#7a4a24');for(let x=((y/10)%2)*30;x<320;x+=60)Rh(x,y,1,10,'#7a4a24')}}
  else if(fl==='ceramica'){Rh(0,200,320,100,'#d8d8dc');for(let y=200;y<300;y+=16)Rh(0,y,320,1,'#a8a8b0');for(let x=0;x<320;x+=24)Rh(x,200,1,100,'#a8a8b0');for(let y=200;y<300;y+=16)for(let x=0;x<320;x+=24)Rh(x+2,y+2,6,1,'rgba(255,255,255,.5)')}
  else if(fl==='carpete'){Rh(0,200,320,100,'#b8a078');for(let y=200;y<300;y+=2)for(let x=(y%4?1:0);x<320;x+=3)Rh(x,y,1,1,'#a89068')}
  else{Rh(0,200,320,100,'#2a64d6');for(let y=200;y<300;y+=2)for(let x=(y%4?1:0);x<320;x+=4)Rh(x,y,1,1,'#2558c2');Rh(0,256,320,2,'#f2f6ff')}
  /* janela à noite com prédios */
  Rh(14,18,94,76,'#5a3a1e');Rh(18,22,86,68,'#1a2050');for(let i=0;i<26;i++)Rh(20+(i*37)%82,26+(i*17)%26,1,1,'#ffffff');ellH(88,34,6,6,'#fff4c0');ellH(90,32,5,5,'#1a2050');
  for(let i=0;i<9;i++){const h=10+(i*13)%24;Rh(18+i*9.6,90-h,9,h,'#2a3060');for(let k=0;k<h-4;k+=5)Rh(20+i*9.6,92-h+k,2,2,(i+k)%3?'#ffd890':'#2a3060')}
  Rh(60,22,2,68,'#5a3a1e');Rh(18,54,86,2,'#5a3a1e');Rh(10,92,102,6,'#7a5a38');
  /* estante de troféus */
  Rh(122,10,186,128,'#4a2c18');Rh(126,14,178,120,'#2a1a10');for(const sy of[52,92,132])Rh(122,sy,186,6,'#7a4a28');
  for(const sy of[14,58,98])for(let i=0;i<6;i++)Rh(126,sy+i,178,1,`rgba(0,0,0,${(.4-i*.06).toFixed(2)})`);
  const tr=(car.trophies||[]).slice(-8);for(let i=0;i<8;i++){const t=tr[i],x=134+(i%4)*42,y=i<4?18:58;uTrophy(x,y,2,t?CATS[t.c].col:'#ffd23f',!t)}
  Rh(134,104,26,22,'#f4f0e0');Rh(136,106,22,18,'#d8d0c0');uT('BPT',147,111,'#1b2350','center');ellH(186,118,9,9,'#ffd23f');ellH(186,118,6,6,'#ffe98a');Rh(182,100,8,9,'#e8403a');ellH(214,118,9,9,'#c0c8d8');Rh(210,100,8,9,'#2e86ff');
  /* extras de parede */
  if(H.own.poster){Rh(14,104,94,42,'#f4f4f4');Rh(18,108,86,34,'#1b2a6a');uT('PADEL',61,113,ACC,'center');uT('BPT 2026',61,126,WHITE,'center')}
  if(H.own.neon){for(let k=6;k>0;k-=2){cx.globalAlpha=.06;ellH(230,146,40+k*4,8+k,'#ff6fd8')}cx.globalAlpha=1;uT('PADEL',230,141,'#ff9ae8','center');uT('PADEL',229,140,'#ffe0f8','center')}
  if(H.own.tv){Rh(16,154,92,44,'#1b1b22');Rh(19,157,86,38,'#2a64d6');Rh(19,157,86,12,'#4a84f0');Rh(52,172,20,14,'#f2c18d');Rh(40,185,48,2,'#f2f6ff');Rh(58,198,8,2,'#3a3f55')}
  /* raquetes penduradas */
  for(let i=0;i<3;i++){const x=246+i*22,y=158,c=['#2e86ff','#ffd23f','#e8403a'][i];lineH(x,y+18,x,y+26,'#2a2a2a',2);ellH(x,y+8,7,9,shd(c,-.3));ellH(x,y+8,5,7,c);ellH(x-2,y+5,2,2,shd(c,.4))}
  /* sofá */
  const sc=(decoOf(H.sofa)||DECO[8]).col;
  uBevel(138,170,160,50,sc,.15);Rh(134,190,12,40,shd(sc,-.25));Rh(290,190,12,40,shd(sc,-.25));uGrad(146,202,144,24,shd(sc,.12),shd(sc,-.25),4);Rh(146,202,144,2,shd(sc,.3));Rh(217,202,2,24,shd(sc,-.4));
  uBevel(154,186,26,18,'#ffd23f',.18);uBevel(258,186,26,18,'#5fb4ff',.18);
  Rh(138,230,164,5,'rgba(0,0,0,.3)');
  if(H.own.planta){Rh(116,196,18,28,'#a85a2a');Rh(116,196,18,4,'#c87a4a');for(let i=0;i<7;i++)ellH(125+Math.cos(i)*9,184-i*3,7,4,i%2?'#3f8a40':'#2c6230');ellH(125,226,12,3,'rgba(0,0,0,.3)')}
  if(H.own.aquario){Rh(10,250,56,30,'#5a3a1e');Rh(10,250,56,3,'#7a5a38');Rh(12,222,52,28,'#8ac8e8');Rh(12,222,52,6,'#b8e4f8');Rh(12,244,52,6,'#d8c890');Rh(24,232,6,3,'#ff8a1c');Rh(42,236,5,3,'#ffd23f');Rh(12,222,52,1,'#ffffff');ellH(38,281,30,3,'rgba(0,0,0,.3)')}
  if(H.own.academia){Rh(254,262,60,4,'#3a3f55');Rh(256,266,4,20,'#3a3f55');Rh(308,266,4,20,'#3a3f55');for(let i=0;i<4;i++){Rh(262+i*12,254,10,6,'#5a6078');Rh(262+i*12,254,10,1,'#9aa0b8')}ellH(284,287,32,3,'rgba(0,0,0,.3)')}
  /* tapete */
  ellH(196,262,92,24,shd('#2e5a9a',-.2));ellH(196,261,86,21,'#3a6ab0');ellH(196,261,72,15,'#2e5a9a');
  /* luz da janela, sombras e cantos */
  cx.globalAlpha=.1;gPoly(cx,[[18,200],[104,200],[150,290],[40,290]],'#fff4c0');cx.globalAlpha=.06;gPoly(cx,[[14,98],[108,98],[114,150],[10,150]],'#c8d8ff');cx.globalAlpha=1;
  for(let i=0;i<10;i++)Rh(0,190+i,320,1,`rgba(0,0,0,${(i*.025).toFixed(3)})`);
  for(let i=0;i<18;i++)Rh(0,i,320,1,`rgba(0,0,0,${(.35-i*.019).toFixed(3)})`);
  for(let i=0;i<14;i++){const a=(.3-i*.02).toFixed(3);Rh(i,0,1,300,`rgba(0,0,0,${a})`);Rh(319-i,0,1,300,`rgba(0,0,0,${a})`)}
}
const roomCanvas=H=>uCache(roomKey(H),320,300,()=>roomRaw(H));
/* o próprio atleta, com o visual do perfil */
function meLook(team){const me=save.me;return{team,shirt:SHIRTS[me.shirt],shirt2:KIT2[me.c2],pat:me.pat,shorts:KIT2[me.c2]===SHIRTS[me.shirt]?'#f4f4f4':KIT2[me.c2],hair:HAIRS[me.hair],skin:SKINS[me.skin],hs:HS[me.hs],acc:me.acc,accC:ACCS[me.accC],shoe:SHOES[me.shoe],rktC:RKTC[me.rkt],lefty:!!me.lefty,
  x:50,y:150,homeX:50,swing:0,stype:'drive',moving:false,anim:0,charging:false,charge:0,hand:'fh',lunge:0,ready:false,split:0,dive:0,mood:0,first:me.name||''}}
function meSprite(team){const key='me'+team+JSON.stringify(save.me);return uCache(key,48,52,()=>{const g=cx;spriteHDTo(g,meLook(team),24,46)})}
/* ---------- carros (vista lateral, frente para a direita) ---------- */
const CARS={
  pop:{body:[[2,30],[2,21],[10,18],[24,17],[34,7],[62,6],[74,16],[94,18],[98,22],[98,30]],win:[[36,9],[60,8],[70,16],[30,16]],wh:[[20,31,8],[80,31,8]]},
  hatch:{body:[[1,30],[1,20],[8,16],[26,15],[38,5],[66,4],[80,14],[96,16],[100,21],[100,30]],win:[[40,7],[64,6],[76,14],[33,14]],wh:[[20,31,8.5],[82,31,8.5]],spoil:1},
  suv:{body:[[1,32],[1,16],[6,11],[16,2],[70,1],[84,10],[98,12],[101,18],[101,32]],win:[[18,4],[66,3],[78,10],[13,11]],wh:[[20,33,10],[82,33,10]],rails:1},
  pick:{body:[[1,31],[1,14],[46,14],[50,2],[74,1],[86,11],[100,13],[103,19],[103,31]],win:[[52,4],[72,3],[82,11],[50,11]],wh:[[20,33,10],[84,33,10]],bed:1},
  ev:{body:[[1,29],[2,19],[12,15],[30,13],[42,4],[72,4],[88,13],[100,16],[102,21],[101,29]],win:[[44,6],[70,6],[84,13],[36,13]],wh:[[22,30,8.5],[84,30,8.5]]},
  gt:{body:[[1,27],[2,19],[10,16],[34,13],[46,6],[66,5],[82,12],[100,15],[104,20],[104,27]],win:[[48,8],[64,7],[76,12],[40,12]],wh:[[22,28,8.5],[86,28,8.5]],spoil:1},
};
function drawCarRaw(k,x,y,s,col){
  if(k==='bike'){const t=Math.max(1,Math.round(1.6*s)),T2=Math.max(1,Math.round(2*s));for(const wx of[18,62]){for(let a=0;a<40;a++){const an=a/40*Math.PI*2;Rh(x+wx*s+Math.cos(an)*9*s,y+24*s+Math.sin(an)*9*s,t,t,'#1b1b2a')}}
    lineH(x+18*s,y+24*s,x+36*s,y+12*s,col,T2);lineH(x+36*s,y+12*s,x+56*s,y+12*s,col,T2);lineH(x+56*s,y+12*s,x+62*s,y+24*s,col,T2);lineH(x+36*s,y+12*s,x+40*s,y+24*s,col,T2);lineH(x+40*s,y+24*s,x+18*s,y+24*s,col,T2);
    lineH(x+56*s,y+12*s,x+54*s,y+4*s,'#c8ccd8',T2);Rh(x+48*s,y+3*s,12*s,2*s,'#1b1b2a');Rh(x+30*s,y+8*s,10*s,3*s,'#1b1b2a');return}
  const C=CARS[k],P=pts=>pts.map(([a,b])=>[x+a*s,y+b*s]);
  ellH(x+52*s,y+(C.wh[0][1]+C.wh[0][2]-1)*s,56*s,4*s,'rgba(0,0,0,.45)');
  const body=P(C.body);let y0=1e9,y1=-1e9;for(const p of body){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
  for(let yy=Math.floor(y0);yy<Math.ceil(y1);yy++){const t=(yy-y0)/(y1-y0),c=t<.12?shd(col,.45):t<.35?shd(col,.12):t<.55?col:t<.8?shd(col,-.2):shd(col,-.42),yc=yy+.5,xs=[];
    for(let i=0;i<body.length;i++){const a=body[i],b2=body[(i+1)%body.length];if((a[1]<=yc&&b2[1]>yc)||(b2[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b2[1]-a[1])*(b2[0]-a[0]))}xs.sort((p,q)=>p-q);
    for(let i=0;i+1<xs.length;i+=2){Rh(Math.round(xs[i]),yy,Math.round(xs[i+1])-Math.round(xs[i]),1,c);Rh(Math.round(xs[i]),yy,1,1,'#05071a');Rh(Math.round(xs[i+1])-1,yy,1,1,'#05071a')}}
  for(let i=0;i<body.length-1;i++)gLine(cx,body[i],body[i+1],'#05071a');
  const ry=y+(C.body[2][1]+3)*s;Rh(x+8*s,ry,84*s,Math.max(1,s*.8),'rgba(255,255,255,.35)');Rh(x+30*s,ry+2*s,40*s,Math.max(1,s*.5),'rgba(255,255,255,.18)');
  const wn=P(C.win);gPoly(cx,wn,'#1b2a44');gPoly(cx,[wn[0],[wn[0][0]+6*s,wn[0][1]],[wn[3][0]+10*s,wn[3][1]],wn[3]],'#5a7aa8');
  const mid=(wn[0][0]+wn[1][0])/2+2*s;Rh(mid,wn[0][1],Math.max(1,s*1.4),wn[3][1]-wn[0][1],'#05071a');
  const dy=y+(C.wh[0][1]-14)*s;Rh(mid,dy-4*s,Math.max(1,s*.6),12*s,'rgba(0,0,0,.35)');Rh(mid+5*s,dy,4*s,Math.max(1,s),'#c8ccd8');
  const fr=body.reduce((m,p)=>p[0]>m[0]?p:m,body[0]);Rh(fr[0]-5*s,y+(C.wh[0][1]-13)*s,4*s,3*s,'#fff6c0');Rh(x+2*s,y+(C.wh[0][1]-12)*s,3*s,3*s,'#e8403a');
  if(C.spoil){Rh(x+s,y+(C.body[1][1]-4)*s,12*s,2*s,shd(col,-.5))}
  if(C.rails)Rh(x+18*s,y+s,50*s,Math.max(1,s),'#c8ccd8');
  if(C.bed){Rh(x+2*s,y+12*s,44*s,2*s,shd(col,-.5));Rh(x+4*s,y+9*s,10*s,4*s,'#3a6ab0')}
  for(const[wx,wy,r]of C.wh){const X=x+wx*s,Y=y+wy*s,rr=r*s;ellH(X,Y,rr+s,rr*.5,'#05071a');ellH(X,Y,rr,rr,'#14141e');ellH(X,Y,rr*.62,rr*.62,'#8a90a0');ellH(X-rr*.12,Y-rr*.15,rr*.5,rr*.45,'#c8ccd8');ellH(X,Y,rr*.2,rr*.2,'#3a3f55');Rh(X-rr*.4,Y-rr*.5,Math.max(1,rr*.2),Math.max(1,s),'rgba(255,255,255,.6)')}
}
function drawCar(k,x,y,s){const c=CARLIST.find(c=>c.k===k)||CARLIST[0];const w=Math.ceil(110*s),h=Math.ceil(46*s);cx.drawImage(uCache('car'+k+s,w,h,()=>drawCarRaw(k,0,2*s,s,c.col)),Math.round(x),Math.round(y))}

/* ---------- carreira: abas ---------- */
let carTab=0,uiRet=null,createRet=null,optRet=null,decoCat=0,trSel=null;
const TABS=[['cal','SEMANA'],['house','CASA'],['trophy','CARREIRA'],['gear','OPCOES']];
function uiBg(){cx.drawImage(uCache('bgc',320,576,()=>gradRaw(320,576,'#141c4a','#080b22',8)),0,0)}
function drawTabBar(){
  const y=502;Rh(0,y,320,74,'#070a1e');Rh(0,y,320,2,'#2b3470');
  TABS.forEach(([ic,lab],i)=>{const x=i*80,on=i===carTab,f=uiHit('tab'+i,x,y,80,74,()=>{carTab=i;uiFocus=null});
    if(on){uGrad(x+4,y+2,72,64,'#1e2860','#070a1e',4);Rh(x+8,y+2,64,3,ACC);Rh(x+8,y+5,64,1,'#8a7020')}
    cx.globalAlpha=on?1:.55;uIcon(ic,x+24,y+12,2);cx.globalAlpha=1;uT(lab,x+40,y+50,on?ACC:MUT,'center');if(f)uFocus(x+3,y+4,74,66)});
}
function careerAct(what){
  if(what==='play'){if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE'}else if(!eligible()){sfx.fault();car.msg='SEM RANKING PARA ESTE'}else if(car.money<weekInfo().cost){sfx.fault();car.msg='SEM DINHEIRO P/ VIAGEM'}else{enterTour();startFly()}}
  else if(what==='train'){if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE'}else{mode='ctrain';uiFocus=null}}
  else if(what==='trainQuick'){if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE'}else if(car.money<400){sfx.fault();car.msg='SEM DINHEIRO'}else{car.money-=400;lvlUps=[];car.msg='TREINO: '+ATN[car.focus];gain(car.focus,1.3+(car.coach?.6:0));nextWeek('train')}}
  else if(what==='rest'){car.msg=car.inj>0?'RECUPERANDO':'DESCANSO: FISICO +35';nextWeek(car.inj>0?'inj':'rest')}
  if(mode==='cseason')return;
}
function drawCareerUI(){hi(()=>{
  depthEnsure();homeEnsure();uiBegin();uiBg();
  if(carTab===0)drawTabWeek();else if(carTab===1)drawTabHome();else if(carTab===2)drawTabCareer();else drawTabOpts();
  drawTabBar();uVignette();uiEnd()})}
function profileBar(){
  uPanel(6,6,308,54);Rh(12,12,40,42,'#0d1333');cx.drawImage(meSprite(1),0,0,48,34,8,12,48,34);Rh(12,46,40,8,'#0d1333');
  uT((save.me.name||'ATLETA').slice(0,9),60,12,WHITE,'left',16);uT(car.age+' ANOS  '+(save.me.side?'ESQUERDA':'DIREITA'),60,32,MUT);
  uT('T'+car.season+'  SEMANA '+(car.week+1)+'/'+SEASON_W,60,44,car.circ==='BR'?GRN:BLU);
  Rh(240,10,70,16,'#05071a');uT(money$(car.money),306,14,GRN,'right');
  uT(car.circ==='BR'?'BPT '+bptPos()+'o':'DUPLA '+myTeamPos()+'o',306,32,ACC,'right');uT('MUNDO #'+myRank(),306,44,MUT,'right');
}
function drawTabWeek(){
  profileBar();
  const o=weekOpts(),Wk=weekInfo(),cat=Wk.cat,el=eligible();
  uPanel(6,64,308,232,'#1a2254',cat.col);
  uT('PROXIMO TORNEIO',14,72,ACC);uT(car.circ==='BR'?'BPT NACIONAL':'GIRA EUROPEIA',306,72,car.circ==='BR'?GRN:BLU,'right');
  cx.drawImage(sceneCanvas(Wk.city),34,84,252,140);Rh(33,83,254,1,'#05071a');Rh(34,84,252,1,'rgba(255,255,255,.35)');
  cx.drawImage(uCache('fade252',252,44,()=>{for(let j=0;j<44;j++){const f=j/44;cx.fillStyle='#0b0f2a';for(let i=0;i<252;i++)if(BAY4[j&3][i&3]/16<f*.92)cx.fillRect(i,j,1,1)}}),34,180);
  uT(Wk.city.slice(0,15),40,200,WHITE,'left',Wk.city.length>12?12:16);
  cx.font='8px "Press Start 2P", monospace';const bw=Math.max(56,cx.measureText(cat.s).width+12);uShadow(38,88,bw,18);Rh(38,88,bw,18,'#05071a');uBevel(39,89,bw-2,16,cat.col,.18);uT(cat.s,38+bw/2,93,'#05071a','center');
  if(o.length>1){const f=uiHit('opt',236,88,48,18,()=>{car.pick=((car.pick||0)+1)%o.length;store()});Rh(236,88,48,18,'rgba(5,7,26,.8)');uT('< '+((car.pick||0)+1)+'/2 >',260,93,ACC,'center');if(f)uFocus(236,88,48,18)}
  uT('CAMPEAO '+cat.pts[0]+(cat.nat?' BPT':' PTS'),14,230,WHITE);uT(money$(Wk.cost)+(Wk.far?' LONGE':' PERTO'),306,230,Wk.far?ACC:MUT,'right');
  const req=Wk.code==='MF'?(el?'CLASSIFICADO!':'SO TOP 8 DO BPT'):cat.nat?'ABERTO A TODOS':Wk.code==='FI'?(el?'CLASSIFICADO!':'SO TOP 8 DUPLAS'):(car.pick||0)===0&&car.wc===car.week?'CONVITE!':cat.req<99?'TOP '+cat.req+' DUPLAS':'ABERTO';
  uT('CHAVE '+cat.size+' DUPLAS  '+req,14,244,el?MUT:RED);
  uBtn(14,258,140,32,car.inj>0?'LESAO':'JOGAR',car.inj>0||!el?'#4a4a6a':ACC,uiHit('play',14,258,140,32,()=>careerAct('play')),'play');
  uBtn(160,258,72,32,'TREINO','#2b3470',uiHit('train',160,258,72,32,()=>careerAct('train')));
  uBtn(238,258,68,32,'FOLGA','#2b3470',uiHit('rest',238,258,68,32,()=>careerAct('rest')));
  uPanel(6,302,308,46,'#1a2254','#3a4488');
  uT('FISICO',14,308,WHITE);uBar(110,308,196,car.cond/100,car.cond<35?RED:car.cond<65?ACC:GRN);
  uT('FELICIDADE',14,322,WHITE);uBar(110,322,196,happy()/100,'#ff7ab0');
  uT('QUIMICA',14,336,WHITE);uBar(110,336,140,car.chem,'#b05cff');uT(PL_(car.partner).n.split(' ')[0].slice(0,6),306,334,MUT,'right');
  const tiles=[['cal','AGENDA',()=>{mode='ccal';cur=Math.min(car.week,SEASON_W-1)}],['rank','RANKING',()=>{mode='crank';rkBpt=car.circ==='BR';rkOff=rkBpt?Math.max(0,bptPos()-8):Math.max(0,myRank()-8)}],['pair','DUPLA',()=>{mode='cpartner';cur=0}],
    ['team','EQUIPE',()=>{mode='cteam';cur=0}],['evo','EVOLUCAO',()=>{mode='cevo';cur=['vel','for','pre','top'].indexOf(car.focus)}],['news','NOTICIAS',()=>{uiRet='career';mode='cnews'}]];
  tiles.forEach(([ic,lab,fn],i)=>{const x=6+(i%3)*105,y=354+Math.floor(i/3)*70,f=uiHit('t'+lab,x,y,98,64,fn);uPanel(x,y,98,64,'#1a2254','#3a4488');uIcon(ic,x+33,y+8,2);uT(lab,x+49,y+48,WHITE,'center');if(f)uFocus(x,y,98,64)});
  carEnsure();const msg=car.msg||(car.news[0]&&car.news[0].t)||'';uT(msg.slice(0,36),160,490,BLU,'center');
}
function drawTabHome(){
  const H=car.home;cx.drawImage(roomCanvas(H),0,0);
  const sp=meSprite(1);ellH(108,286,22,5,'rgba(0,0,0,.32)');cx.drawImage(sp,58,186,96,104);
  uPanel(164,262,150,30,'#1a2254','#ff7ab0');uIcon('heart',168,266,1);uT('FELICIDADE',192,267,WHITE);uBar(192,278,114,happy()/100,'#ff7ab0');
  Rh(0,300,320,202,'#070a1e');Rh(0,300,320,2,'#2b3470');
  const nt=(car.trophies||[]).length,cl=CARLIST.find(c=>c.k===H.car);
  const cards=[['trophy','TROFEUS',nt+' TITULOS',ACC,()=>{mode='ctw';trSel=null;uiFocus=null}],['paint','DECORAR',DECO.filter(d=>H.own[d.k]).length+' ITENS',null,()=>{mode='cdeco';decoCat=0;uiFocus=null}],
    ['car','GARAGEM',cl.n.slice(0,11),BLU,()=>{mode='cgar';uiFocus=null}],['shirt','VISUAL','ROUPAS',null,()=>{createRet='career';mode='create';cpage=0;cur=1}],
    ['bed','DORMIR','+35 FISICO',null,()=>careerAct('rest')],['heart','BONUS','-'+Math.round(15*happy()/100)+'% CANSACO','#ff7ab0',null]];
  cards.forEach(([ic,lab,sub,col,fn],i)=>{const x=8+(i%2)*156,y=308+Math.floor(i/2)*64,f=fn?uiHit('h'+lab,x,y,148,56,fn):false;uPanel(x,y,148,56,'#1a2254',col||'#3a4488');uIcon(ic,x+8,y+11,2);uT(lab,x+46,y+14,WHITE);uT(sub,x+46,y+32,MUT);if(f)uFocus(x,y,148,56)});
}
function drawTabCareer(){
  carEnsure();uT('CARREIRA',160,12,ACC,'center',16);uT('TEMPORADA '+car.season+'  '+car.age+' ANOS',160,34,MUT,'center');
  uPanel(6,50,308,92,'#1a2254',ACC);uT('META DO PATROCINIO',160,58,ACC,'center');const g=car.goal;
  if(g){wrap(g.d,30).slice(0,2).forEach((l,i)=>uT(l,160,76+i*12,WHITE,'center'));uT('PREMIO '+money$(g.rew),160,104,GRN,'center');uT('ATE SEMANA '+(g.until+1)+(g.k==='wins'?'  '+g.prog+'/'+g.n:''),160,120,MUT,'center')}
  else uT('NOVA META EM BREVE',160,90,MUT,'center');
  uPanel(6,150,308,96,'#1a2254','#3a4488');uT('RESUMO',14,158,ACC);
  const ct=car.contract,rows=[['TITULOS NA TEMPORADA',car.seasonTitles],['TITULOS NA CARREIRA',(car.trophies||[]).length],['MELHOR RANKING','#'+(car.best<999?car.best:'-')],['PATROCINIO',(ct?ct.n:sponsor()[1])+' '+money$(salary())]];
  rows.forEach(([l,v],i)=>{uT(l,14,176+i*16,MUT);uT(String(v),306,176+i*16,WHITE,'right')});
  const bt=[['news','NOTICIAS',()=>{uiRet='career';mode='cnews'}],['trophy','TROFEUS',()=>{mode='ctw';trSel=null;uiFocus=null}],['evo','NUMEROS',()=>{uiRet='career';mode='cstats'}],['cal','AGENDA E MAPA',()=>{mode='ccal';cur=Math.min(car.week,SEASON_W-1)}]];
  bt.forEach(([ic,lab,fn],i)=>{const x=6+(i%2)*157,y=254+Math.floor(i/2)*62,f=uiHit('c'+lab,x,y,151,54,fn);uPanel(x,y,151,54,'#1a2254','#3a4488');uIcon(ic,x+8,y+10,2);uT(lab.slice(0,12),x+44,y+22,WHITE);if(f)uFocus(x,y,151,54)});
  uT(car.circ==='BR'?'BPT: TOP 5 PODE IR PARA A GIRA':'GIRA EUROPEIA: FIQUE NO TOP 48',160,386,MUT,'center');
}
function drawTabOpts(){
  uT('OPCOES',160,12,ACC,'center',16);
  const it=[['team','EQUIPE E PATROCINIO','FISIO, TECNICO, RAQUETE',()=>{mode='cteam';cur=0}],['gear','OPCOES DO JOGO','QUADRA, CAMERA, SOM',()=>{optRet='career';mode='options';cur=0}],['exit','SALVAR E SAIR','VOLTA AO MENU',()=>{leaveSlot();enterDemo()}]];
  it.forEach(([ic,lab,sub,fn],i)=>{const y=44+i*66,f=uiHit('o'+i,6,y,308,58,fn);uPanel(6,y,308,58,'#1a2254',i===it.length-1?RED:'#3a4488');uIcon(ic,16,y+12,2);uT(lab,58,y+15,WHITE);uT(sub,58,y+33,MUT);if(f)uFocus(6,y,308,58)});
  uT('DIFICULDADE: '+DIFF_N[car.diff??1],160,320,MUT,'center');uT('(MUDE EM EQUIPE)',160,334,'#55507a','center');
}
function careerUIInput(){
  if(car.needOffer){car.needOffer=false;offerContract();return}
  if(uiTap())return;
  if(uiInput())return;
  if(back()){if(carTab!==0){carTab=0;uiFocus=null}else{leaveSlot();enterDemo()}}
}
/* ---------- parede de troféus ---------- */
const TR_GROUPS=[['BPT NACIONAL',['CH','OP','MS','MF'],GRN],['GIRA EUROPEIA',['BR','SI','GO','P2'],BLU],['ELITE',['P1','MA','FI'],'#ff7ad9']];
function subHeader(ic,title,right){uGrad(0,0,320,38,'#1a2254','#070a1e',4);Rh(0,38,320,2,ACC);Rh(0,40,320,3,'rgba(0,0,0,.4)');
  const f=uiHit('back',0,0,44,38,()=>subBack());uT('<',14,12,f?ACC:WHITE,'left',16);uIcon(ic,40,4,1.6);uT(title,74,12,ACC,'left',16);if(right)uT(right,310,15,WHITE,'right')}
function subBack(){mode='career';carTab=1;uiFocus=null}
function drawTrophyWall(){hi(()=>{uiBegin();
  cx.drawImage(uCache('wood',320,576,()=>{gradRaw(320,576,'#4a2c1a','#22120a',8);for(let x=0;x<320;x+=24){Rh(x,0,1,576,'rgba(0,0,0,.3)');Rh(x+12,0,1,576,'rgba(255,255,255,.04)')}}),0,0);
  const T_=car.trophies||[];subHeader('trophy','TROFEUS',T_.length+'');
  TR_GROUPS.forEach(([title,codes,col],gi)=>{const y=48+gi*104;Rh(8,y,304,15,'#05071a');uT(title,160,y+4,col,'center');
    codes.forEach((c,i)=>{const n=T_.filter(t=>t.c===c).length,x=12+i*76,id='tr'+c,f=uiHit(id,x,y+18,72,78,()=>{trSel=c});
      uTrophy(x+20,y+22,2,CATS[c].col,!n);Rh(x+6,y+60,60,12,'#c8a060');Rh(x+7,y+61,58,10,n?'#e8c888':'#7a6040');uT('x'+n,x+36,y+63,'#3a2214','center');uT(CATS[c].s.slice(0,8),x+36,y+76,n?WHITE:'#8a7a6a','center');
      if(f||trSel===c)uFocus(x+2,y+18,68,72)});
    uBevel(8,y+90,304,7,'#8a5a30',.2);for(let i=0;i<4;i++)Rh(8,y+97+i,304,1,`rgba(0,0,0,${(.45-i*.1).toFixed(2)})`)});
  const sel=trSel||(uiFocus&&uiFocus.startsWith('tr')?uiFocus.slice(2):null);
  uPanel(8,364,304,112,'#1a2254',ACC);
  if(sel&&CATS[sel]){const list=T_.filter(t=>t.c===sel),last=list[list.length-1];uTrophy(20,382,3,CATS[sel].col,!last);
    uT(CATS[sel].n.slice(0,16),78,378,CATS[sel].col,'left',8);uT('CONQUISTAS: '+list.length,78,396,WHITE);
    if(last){uT('ULTIMO: '+last.city,78,412,WHITE);uT('TEMPORADA '+last.s,78,428,MUT);uT('CAMPEAO '+CATS[sel].pts[0]+(CATS[sel].nat?' BPT':' PTS'),78,444,GRN)}else{uT('AINDA NAO CONQUISTADO',78,412,MUT);uT('PREMIO '+money$(CATS[sel].prize),78,428,ACC)}}
  else{uT('ESCOLHA UM TROFEU',160,412,MUT,'center')}
  uPanel(8,484,148,56,'#f4f0e0','#c8b890');uT('JORNAL',82,490,'#1b2350','center');Rh(16,502,132,2,'#1b2350');const lt=T_[T_.length-1];
  if(lt){uT('CAMPEOES EM',82,510,'#c0392b','center');uT(lt.city.slice(0,13),82,524,'#c0392b','center')}else uT('SEM TITULOS',82,516,'#5a5a6a','center');
  uPanel(164,484,148,56,'#1a2254','#3a4488');uT('RECORDES',238,490,ACC,'center');uT('MELHOR #'+(car.best<999?car.best:'-'),238,508,WHITE,'center');uT((save.wins||0)+' VITORIAS',238,522,WHITE,'center');
  const fs=uiHit('share',8,546,304,24,()=>shareCard('season'));uBtn(8,546,304,24,'COMPARTILHAR','#2b3470',fs);
  uVignette();uiEnd()})}
/* ---------- decorar ---------- */
function decoSwatch(d,x,y){
  if(d.c===0){Rh(x,y,80,48,d.col[0]);for(let i=0;i<80;i+=12)Rh(x+i,y,6,48,d.col[1])}
  else if(d.c===1){const H={...car.home,floor:d.k};cx.drawImage(roomCanvas(H),60,212,80,48,x,y,80,48)}
  else if(d.c===2){Rh(x,y,80,48,'#3a3f55');uBevel(x+8,y+12,64,24,d.col,.15);Rh(x+4,y+22,8,20,shd(d.col,-.25));Rh(x+68,y+22,8,20,shd(d.col,-.25));uBevel(x+12,y+30,56,12,shd(d.col,.1),.15)}
  else{Rh(x,y,80,48,'#20264a');const k=d.k;
    if(k==='poster'){Rh(x+12,y+6,56,36,'#f4f4f4');Rh(x+15,y+9,50,30,'#1b2a6a');uT('BPT',x+40,y+20,ACC,'center')}
    else if(k==='planta'){Rh(x+32,y+28,16,16,'#a85a2a');for(let i=0;i<6;i++)ellH(x+40+Math.cos(i)*8,y+20-i*2,6,4,i%2?'#3f8a40':'#2c6230')}
    else if(k==='aquario'){Rh(x+12,y+10,56,28,'#8ac8e8');Rh(x+12,y+32,56,6,'#d8c890');Rh(x+24,y+18,6,3,'#ff8a1c');Rh(x+44,y+22,5,3,'#ffd23f');Rh(x+10,y+38,60,6,'#5a3a1e')}
    else if(k==='tv'){Rh(x+10,y+6,60,36,'#1b1b22');Rh(x+13,y+9,54,30,'#2a64d6');Rh(x+13,y+9,54,8,'#4a84f0');Rh(x+36,y+42,8,4,'#3a3f55')}
    else if(k==='neon'){cx.globalAlpha=.25;ellH(x+40,y+24,34,10,'#ff6fd8');cx.globalAlpha=1;uT('PADEL',x+40,y+20,'#ffe0f8','center')}
    else if(k==='academia'){Rh(x+6,y+30,68,4,'#3a3f55');for(let i=0;i<4;i++){Rh(x+10+i*16,y+20,12,8,'#5a6078');Rh(x+10+i*16,y+20,12,1,'#9aa0b8')}Rh(x+8,y+34,4,10,'#3a3f55');Rh(x+68,y+34,4,10,'#3a3f55')}}
  Rh(x,y,80,1,'rgba(255,255,255,.3)');for(let i=0;i<8;i++)Rh(x,y+47-i,80,1,`rgba(0,0,0,${(.03*(8-i)).toFixed(2)})`)}
function decoAct(d){const H=car.home;
  if(!H.own[d.k]){if(car.money<d.p){sfx.fault();car.msg='SEM DINHEIRO';return}car.money-=d.p;H.own[d.k]=1;car.msg='COMPROU '+d.n;pushNews('NOVO NA CASA: '+d.n);sfx.game()}
  else if(d.c===3){/* extras: comprado já está na casa */}
  if(d.c===0)H.wall=d.k;else if(d.c===1)H.floor=d.k;else if(d.c===2)H.sofa=d.k;store()}
function drawDeco(){hi(()=>{uiBegin();uiBg();homeEnsure();const H=car.home;subHeader('paint','DECORAR',money$(car.money));
  const items=DECO.filter(d=>d.c===decoCat),fid=uiFocus&&uiFocus.startsWith('d_')?uiFocus.slice(2):null,fd=items.find(d=>d.k===fid);
  const prev={...H,own:{...H.own}};if(fd){if(fd.c===0)prev.wall=fd.k;else if(fd.c===1)prev.floor=fd.k;else if(fd.c===2)prev.sofa=fd.k;else prev.own[fd.k]=1}
  Rh(9,47,302,226,'#05071a');cx.drawImage(roomCanvas(prev),0,0,320,300,10,48,300,224);Rh(10,48,300,1,ACC);Rh(10,271,300,1,ACC);uT('PREVIA',18,54,ACC);
  DECO_CAT.forEach((c,i)=>{const x=8+i*77,on=i===decoCat,f=uiHit('dc'+i,x,280,72,22,()=>{decoCat=i;uiFocus=null});Rh(x,280,72,22,'#05071a');uBevel(x+1,281,70,20,on?ACC:'#2b3470',.16);uT(c,x+36,287,on?'#05071a':WHITE,'center');if(f)uFocus(x,280,72,22)});
  items.forEach((d,i)=>{const x=8+(i%3)*104,y=310+Math.floor(i/3)*104,own=!!H.own[d.k],use=d.c===3?own:(H.wall===d.k||H.floor===d.k||H.sofa===d.k),f=uiHit('d_'+d.k,x,y,98,98,()=>decoAct(d));
    uPanel(x,y,98,98,f?'#24306a':'#1a2254',f?ACC:'#3a4488');Rh(x+8,y+8,82,50,'#05071a');decoSwatch(d,x+9,y+9);uT(d.n.slice(0,11),x+49,y+64,WHITE,'center');
    if(use){Rh(x+22,y+78,54,12,'#0a3a1a');uT('EM USO',x+49,y+80,GRN,'center')}else if(own){uT('SEU',x+49,y+80,GRN,'center')}else uT(money$(d.p),x+49,y+80,ACC,'center');if(f)uFocus(x,y,98,98)});
  const d=fd||items[0];uPanel(8,520,304,48,'#1a2254',ACC);uT(d.n,16,528,WHITE);uT('+'+d.h+' FELICIDADE',16,544,'#ff9ac8');
  const own=!!H.own[d.k];uT(own?(d.c===3?'NA SUA CASA':'A USA'):'A COMPRA '+money$(d.p),304,536,own?GRN:ACC,'right');
  uVignette();uiEnd()})}
/* ---------- garagem ---------- */
function garageBg(){return uCache('garage',320,250,()=>{
  gradRaw(320,170,'#6a7080','#4a505e',5);for(let yy=0;yy<170;yy+=12){Rh(0,yy,320,1,'rgba(0,0,0,.25)');for(let xx=(yy/12)%2*16;xx<320;xx+=32)Rh(xx,yy,1,12,'rgba(0,0,0,.22)')}
  uBevel(14,22,96,64,'#9a7a4a',.1);for(let i=0;i<9;i++)for(let j=0;j<5;j++)Rh(20+i*10,28+j*11,2,2,'#5a4020');
  lineH(28,34,28,62,'#c8ccd8',3);Rh(24,32,9,6,'#e8403a');lineH(46,32,52,68,'#8a90a0',2);ellH(60,40,6,4,'#8a90a0');Rh(70,36,14,4,'#ffd23f');Rh(74,40,6,18,'#3a3f55');
  uBevel(204,62,104,6,'#7a5a38',.2);uBevel(212,40,30,22,'#e8403a',.15);Rh(216,44,22,3,'#ffffff');uBevel(250,42,28,20,'#2e3a8a',.15);for(let i=0;i<3;i++)ellH(290,56-i*7,4,4,'#dfff3a');
  Rh(150,0,20,4,'#3a3f55');Rh(154,4,12,4,'#fff6c0');
  cx.save();cx.translate(0,0);
  const g2=document.createElement('canvas');g2.width=320;g2.height=250;const gg=g2.getContext('2d');gg.globalAlpha=.10;gPoly(gg,[[154,8],[166,8],[290,250],[30,250]],'#fff6c0');gg.globalAlpha=.06;gPoly(gg,[[156,8],[164,8],[230,250],[90,250]],'#ffffff');
  const fl=document.createElement('canvas');fl.width=320;fl.height=80;const keep=cx;cx=fl.getContext('2d');gradRaw(320,80,'#5a5e6a','#2e323e',6);cx=keep;cx.drawImage(fl,0,170);cx.restore();
  Rh(0,170,320,2,'#7a7e8a');for(let i=0;i<10;i++)Rh(0,170+i,320,1,`rgba(0,0,0,${(.25-i*.025).toFixed(3)})`);
  for(const lx of[30,290])gPoly(cx,[[lx-2,176],[lx+2,176],[lx+(lx<160?-10:14),250],[lx+(lx<160?-16:8),250]],'#d8c860');
  ellH(110,236,22,4,'rgba(10,10,20,.35)');cx.drawImage(g2,0,0)})}
function carAct(c){const H=car.home;if(!H.cars[c.k]){if(car.money<c.p){sfx.fault();car.msg='SEM DINHEIRO';return}car.money-=c.p;H.cars[c.k]=1;pushNews('CARRO NOVO: '+c.n);sfx.fanfare()}H.car=c.k;car.msg=c.n+' NA GARAGEM';store()}
function drawGarage(){hi(()=>{uiBegin();uiBg();homeEnsure();const H=car.home;subHeader('car','GARAGEM',money$(car.money));
  const fid=uiFocus&&uiFocus.startsWith('g_')?uiFocus.slice(2):H.car,fc=CARLIST.find(c=>c.k===fid)||CARLIST[0];
  cx.drawImage(garageBg(),0,44);
  const s=fc.k==='bike'?2.6:2.35;drawCar(fc.k,fc.k==='bike'?60:40,44+(fc.k==='bike'?120:136),s);
  const own=!!H.cars[fc.k],using=H.car===fc.k;
  uShadow(214,150,94,24);Rh(214,150,94,24,'#05071a');uBevel(215,151,92,22,using?'#2a8a4a':own?'#2b3470':'#8a6a10',.2);uT(using?'NA GARAGEM':own?'SEU':money$(fc.p),261,159,WHITE,'center');
  uPanel(8,300,304,56,'#1a2254',BLU);uT(fc.n,16,308,WHITE,'left',16);uT('+'+fc.h+' FELICIDADE',16,330,'#ff9ac8');uT('MENOS CANSACO APOS JOGAR',16,342,MUT);
  uT('CONCESSIONARIA',14,364,ACC);
  CARLIST.slice(1).forEach((c,i)=>{const x=8+(i%3)*104,y=378+Math.floor(i/3)*82,f=uiHit('g_'+c.k,x,y,98,76,()=>carAct(c));uPanel(x,y,98,76,f?'#24306a':'#1a2254',f?ACC:'#3a4488');
    drawCar(c.k,x+4,y+8,.82);uT(c.n.slice(0,11),x+49,y+46,WHITE,'center');uT(H.cars[c.k]?(H.car===c.k?'EM USO':'SEU'):money$(c.p),x+49,y+60,H.cars[c.k]?GRN:ACC,'center');if(f)uFocus(x,y,98,76)});
  const fb=uiHit('g_bike',8,544,304,26,()=>carAct(CARLIST[0]));uBtn(8,544,304,26,'BICICLETA'+(H.car==='bike'?' (EM USO)':''),'#2b3470',fb);
  uVignette();uiEnd()})}
function subInput(){if(uiTap())return;if(uiInput())return;if(back())subBack()}
