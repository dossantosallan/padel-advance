/* ---------- cenas das cidades: pixel art 144x80 ----------
   Cada cena é desenhada uma vez num canvas próprio (cache) e depois só copiada.
   Ferramentas: polígono, elipse, linha, degradê com pontilhado, camadas de relevo e reflexo na água. */
const CSW=144,CSH=80;
const SKY_DAY=['#2f6fd0','#4686dc','#64a0e6','#8cbcf0','#b8d6f6','#dcecfa'];
const SKY_HAZE=['#6f98c8','#86aad2','#a0bcdc','#b8cce2','#ccd8e6'];
const SKY_DUSK=['#2a2c70','#523c86','#94487e','#d0606a','#ee8a5a','#ffbc6c','#ffdc96'];
const SKY_DAWN=['#4f6cb8','#7a88c8','#ae9ec4','#dcb2b4','#f6c8a4','#ffdcb0'];
const SKY_WARM=['#3f7cd0','#5e96d8','#86b0dc','#b4c6d8','#e4d4bc','#f4dcb0'];
function sPoly(pts,c){
  let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){const yc=y+.5,xs=[];
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const xa=Math.round(xs[i]),xb=Math.round(xs[i+1]);if(xb>xa)R(xa,y,xb-xa,1,c)}}
}
function sEll(x0,y0,rx,ry,c,top){for(let y=-Math.ceil(ry);y<=(top?0:Math.ceil(ry));y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));if(w>0)R(x0-w,y0+y,w*2,1,c)}}
function sLine(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(let n=0;n<400;n++){R(x0,y0,1,1,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function sGrad(y0,y1,cols,x0=0,w=CSW){const n=cols.length,h=(y1-y0)/n;
  for(let y=y0;y<y1;y++){const f=(y-y0)/h,i=Math.min(n-1,Math.floor(f)),fr=f-i;R(x0,y,w,1,cols[i]);
    if(i<n-1&&fr>.55){const st=fr>.8?2:4;for(let x=x0+((y%2)?st>>1:0);x<x0+w;x+=st)R(x,y,1,1,cols[i+1])}}}
function sDither(x,y,w,h,c,st=2){for(let j=0;j<h;j++)for(let i=(j%2)*(st>>1);i<w;i+=st)R(x+i,y+j,1,1,c)}
function sCloud(x,y,s){const W='#ffffff',S='#d4e2f2';
  sEll(x,y+1*s,10*s,3*s,S);sEll(x-1*s,y,9*s,3*s,W);sEll(x+4*s,y-2*s,6*s,3.5*s,W);sEll(x-5*s,y-1*s,5*s,2.5*s,W);R(x-10*s,y+3*s,20*s,1,S)}
function sRidge(y,amp,f,ph,col,top){for(let x=0;x<CSW;x++){const h=Math.round(y+Math.sin(x*f+ph)*amp+Math.sin(x*f*2.7+ph*1.9)*amp*.45);R(x,h,1,(top||CSH)-h,col)}}
function sTree(x,y,r,dark){const c=dark?['#24502a','#2f6a34','#3f8240']:['#2c6230','#3f8a40','#62ac52'];
  R(x-1,y-r*.4,2,r*.9,'#5a3a20');sEll(x,y-r*.6,r,r*.75,c[0]);sEll(x-r*.2,y-r*.8,r*.75,r*.55,c[1]);sEll(x-r*.4,y-r*1.05,r*.4,r*.3,c[2])}
function sArauc(x,y,h,far){const tr=far?'#6a6a5e':'#4a3424',c=far?['#5f7f66','#76967a']:['#1f4426','#2f5c34','#46784a'],w=Math.max(3,Math.round(h*.28));
  R(x,y-h,2,h,tr);for(const s of[-1,1]){sLine(x+1,y-h+w*.55,x+1+s*w*.8,y-h+w*.12,tr);sLine(x+1,y-h+w*.95,x+1+s*w*.55,y-h+w*.45,tr)}
  sEll(x+1,y-h+1,w,w*.42,c[0],true);sEll(x+1,y-h,w*.8,w*.3,c[1],true);for(const s of[-1,1]){sEll(x+1+s*w*.85,y-h+w*.12,w*.28,w*.2,c[0]);sEll(x+1+s*w*.55,y-h+w*.45,w*.24,w*.16,c[0])}if(!far)R(x-w*.4,y-h-Math.round(w*.25),w*.6,1,c[2])}
function sPalm(x,y,h){for(let j=0;j<h;j++){const xx=x+Math.round(Math.sin(j*.04)*1.5);R(xx,y-j,3,1,'#b4ab98');R(xx+2,y-j,1,1,'#8a8270')}
  const tx=x+Math.round(Math.sin(h*.04)*1.5)+1,ty=y-h;R(tx-1,ty,4,6,'#4a8a3a');
  for(const a of[-2.9,-2.4,-1.9,-1.2,-.7,-.2,.4]){for(let t=0;t<12;t++){const px=tx+Math.cos(a)*t*1.1,py=ty+Math.sin(a)*t*.7+t*t*.07;R(px,py,2,1,t<6?'#3f8a3a':'#2f6f30');if(t%3===1)R(px,py+1,1,1,'#5aa848')}}}
function sRnd(seed){let s=seed%2147483647||1;return()=>(s=s*16807%2147483647)/2147483647}
function sWin(x,y,cols,rows,cw,ch,gx,gy,lit,dark,seed){const r=sRnd(seed||7);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)R(x+i*gx,y+j*gy,cw,ch,r()<.35?lit:dark)}
function sReflect(c,wy,base,a){
  const t=document.createElement('canvas');t.width=CSW;t.height=wy;const tg=t.getContext('2d');if(tg.drawImage)tg.drawImage(c,0,0);
  R(0,wy,CSW,CSH-wy,base);cx.globalAlpha=a;
  for(let y=0;y<CSH-wy;y++){const sy=wy-1-Math.floor(y*1.2);if(sy<0)break;cx.drawImage(t,0,sy,CSW,1,Math.round(Math.sin(y*1.7)*(y>2?1:0)),wy+y,CSW,1)}
  cx.globalAlpha=1;
  for(let y=wy+2;y<CSH;y+=3)for(let x=(y*7)%13;x<CSW;x+=15+(y%7))R(x,y,2+(y%3),1,'rgba(255,255,255,.28)');
  R(0,wy,CSW,1,'rgba(255,255,255,.35)');
}
const CITY_ART={
  JOINVILLE(c){ /* casa enxaimel, palmeiras imperiais e jardim de hortênsias */
    sGrad(0,48,SKY_DAY);sCloud(30,12,1);sCloud(112,8,.8);
    sRidge(40,3,.06,1,'#9ab4c6');sRidge(46,3,.09,2,'#6c9a76');
    sGrad(52,80,['#5fae4c','#53a244','#47943c','#3d8634']);
    sPalm(16,68,52);sPalm(130,68,48);
    sPoly([[84,38],[114,41],[114,62],[84,65]],'#d4c6aa');
    for(const x of[93,103]){const k=x-84;R(x,38+k*.1,2,27-k*.2,'#4a2c18')}
    sLine(84,51,114,51,'#4a2c18');sLine(85,51,93,41,'#4a2c18');sLine(104,42,113,51,'#4a2c18');
    R(87,44,4,5,'#24304a');R(106,45,4,5,'#24304a');
    sPoly([[62,14],[110,18],[118,41],[86,38]],'#a83a2a');
    for(let k=1;k<8;k++){const f=k/8;sLine(62+24*f,14+24*f,110+8*f,18+23*f,'#862a1e')}
    sPoly([[62,17],[41,38],[83,38]],'#f3ecdc');R(40,38,44,27,'#f3ecdc');R(82,38,2,27,'#d8ccb4');
    const T='#4a2c18';[40,51,62,73,82].forEach(x=>R(x,38,2,27,T));[38,50,63].forEach(y=>R(40,y,44,2,T));
    R(51,28,2,10,T);R(73,28,2,10,T);R(51,28,24,2,T);
    sLine(42,49,50,40,T);sLine(75,40,81,49,T);sLine(53,37,61,30,T);sLine(64,30,72,37,T);
    for(const wx of[44,76]){R(wx,41,6,7,'#2a3a5a');R(wx+1,42,2,2,'#8ab0d0');R(wx-1,48,8,2,'#7a3a20');[0,2,4,6].forEach(i=>R(wx+i-1,47,1,1,i%4?'#ff7ab0':'#ffd23f'))}
    R(59,31,5,5,'#2a3a5a');R(60,32,1,1,'#8ab0d0');
    sEll(61.5,54,5.5,3,'#6b3a1e',true);R(56,54,11,11,'#6b3a1e');R(61,53,1,12,'#4a2410');R(64,59,1,1,'#ffd23f');
    sLine(62,14,38,38,'#e06a50');sLine(62,15,39,38,'#c84a36');sLine(62,14,87,38,'#e06a50');
    sPoly([[84,65],[114,62],[126,66],[96,67]],'#3f8a36');
    sPoly([[56,65],[67,65],[86,80],[38,80]],'#d9c9a3');sDither(56,65,11,15,'#c8b890',4);
    const r=sRnd(11),fc=[['#6a8ae0','#9ab4ff'],['#a87ae0','#c8a8ff'],['#f07ab0','#ffb0d0'],['#ffffff','#ffffff']];
    for(let i=0;i<34;i++){const left=i<17,x=left?2+r()*36:90+r()*52,y=68+r()*11,f=fc[(r()*4)|0];sEll(x,y+1,3,2,'#2f7a30');sEll(x,y,2.4,1.8,f[0]);R(x-1,y-1,1,1,f[1])}},
  LIVRAMENTO(c){ /* Parque Internacional: obelisco, bandeiras do Brasil e do Uruguai */
    sGrad(0,50,SKY_DAY);sCloud(22,10,.9);sCloud(118,14,.7);
    const r=sRnd(5),pc=['#e8d8c0','#d8c8e0','#f0d0a8','#c8d8e8','#e8c8c0'];
    for(let i=0;i<12;i++){const x=i<6?i*9:90+(i-6)*9,h=8+r()*10;R(x,50-h,9,h,pc[i%5]);R(x+7,50-h,2,h,'rgba(0,0,0,.12)');sWin(x+1,52-h,3,Math.floor(h/4),1,2,2,4,'#ffe9a0','#5a6a80',i*13)}
    sGrad(50,80,['#dcd4c4','#d2c8b6','#c6bca8','#bab09a']);
    for(let k=-9;k<=9;k++)sLine(72+k*2,50,72+k*18,80,'#b4aa94');[54,59,66,74].forEach(y=>R(0,y,CSW,1,'#c0b6a0'));
    sTree(6,58,7);sTree(138,58,7);sTree(42,56,5,1);sTree(102,56,5,1);
    sPoly([[79,64],[83,64],[118,76],[106,77]],'#aea48e');
    R(58,60,28,4,'#ece8de');R(58,63,28,1,'#b8b2a6');R(54,64,36,3,'#dcd6ca');R(54,66,36,1,'#a8a296');R(83,60,3,4,'#cfc9bd');
    sPoly([[67,12],[77,12],[79,60],[65,60]],'#f6f4ee');sPoly([[72,12],[77,12],[79,60],[72,60]],'#cdcac2');
    sPoly([[67,12],[72,5],[77,12]],'#f6f4ee');sPoly([[72,5],[77,12],[72,12]],'#cdcac2');R(69,40,6,7,'#9a907c');R(70,41,4,5,'#b8ae98');
    R(30,22,1,40,'#9a9a9a');R(31,22,19,13,'#1f9a3e');sPoly([[40.5,23],[49,28.5],[40.5,34],[32,28.5]],'#ffd23f');sEll(40.5,28.5,3.6,3.6,'#1f3f9a');R(37,28,8,1,'#f4f4f4');
    R(113,22,1,40,'#9a9a9a');for(let i=0;i<9;i++)R(114,22+Math.round(i*13/9),19,2,i%2?'#3a6ed8':'#ffffff');R(114,22,8,7,'#ffffff');sEll(118,25.5,2.2,2.2,'#f5c518')},
  ERECHIM(c){ /* Castelinho: o prédio de madeira mais antigo da cidade, com araucárias */
    sGrad(0,52,SKY_DAY);sCloud(110,10,.9);
    sRidge(46,3,.05,3,'#9ab4c4');for(const x of[8,24,118,134])sArauc(x,54,22,1);
    sGrad(54,80,['#5aa64a','#4e9a42','#428c3a']);
    sPoly([[92,22],[106,25],[106,64],[92,66]],'#7a4420');for(let y=26;y<64;y+=3)sLine(92,y,106,y+1,'#6a3a1a');
    R(50,22,42,44,'#b06a30');for(let y=23;y<66;y+=2)R(50,y,42,1,'#9a5a26');R(50,22,1,44,'#c88a48');
    for(let j=0;j<5;j++)for(let i=0;i<4;i++){if(j===4&&(i===1||i===2))continue;const x=53+i*10,y=26+j*8;R(x,y,6,6,'#f4ead8');R(x+1,y+1,4,4,'#34405a');R(x+1,y+1,1,1,'#8ab0d0')}
    R(65,58,12,8,'#f4ead8');R(66,59,10,7,'#5a2e14');R(70,59,1,7,'#3a1a0a');
    for(let j=0;j<5;j++)R(96,28+j*8,3,4,'#2a2a3a');
    sPoly([[48,23],[71,4],[94,23]],'#5a2a16');sPoly([[71,4],[96,7],[108,26],[94,23]],'#3e1c0e');
    sPoly([[71,9],[54,22],[88,22]],'#b06a30');for(let y=11;y<22;y+=2)R(55,y,32,1,'#9a5a26');
    sEll(71,16,2.5,2.5,'#f4ead8');sEll(71,16,1.5,1.5,'#34405a');
    sLine(71,4,48,23,'#7a3a1e');sLine(71,4,94,23,'#7a3a1e');
    sArauc(26,72,40);sArauc(122,74,46);sArauc(138,70,30)},
  CURITIBA(c){ /* estufa do Jardim Botânico e o jardim francês */
    sGrad(0,50,SKY_DAY);sCloud(24,8,.8);sCloud(124,12,.7);
    sRidge(42,2,.2,1,'#2f5a36');sRidge(46,2,.33,2,'#3a6a40');
    const G='#b4dcee',G2='#86bcd8',F='#f6fafc';
    const bay=(x,y,w,h)=>{R(x,y,w,h,G);sDither(x+w*.6,y,w*.4,h,G2,2);for(let i=x;i<x+w;i+=4)R(i,y,1,h,F);for(let j=y;j<y+h;j+=5)R(x,j,w,1,F)};
    for(const x0 of[26,86]){bay(x0,38,32,18);sEll(x0+16,38,16,6,G,true);sDither(x0+22,32,10,6,G2,2);for(let k=-3;k<=3;k++){for(let j=0;j<6;j++){const w=16*Math.sqrt(1-(j/6)**2);R(x0+16+Math.round(k/3.3*w),38-j,1,1,F)}}R(x0,37,32,1,F)}
    bay(58,30,28,26);sEll(72,30,14,15,G,true);sDither(76,16,10,14,G2,2);
    for(let k=-3;k<=3;k++)for(let j=0;j<15;j++){const w=14*Math.sqrt(1-(j/15)**2);R(72+Math.round(k/3.3*w),30-j,1,1,F)}
    for(const j of[5,10]){const w=Math.round(14*Math.sqrt(1-(j/15)**2));R(72-w,30-j,w*2,1,F)}
    R(70,11,4,5,F);sEll(72,11,3,2,G,true);R(71,6,2,5,F);R(58,29,28,1,F);
    for(let i=0;i<8;i++)sLine(30+i*14,52,36+i*14,40,'rgba(255,255,255,.35)');
    R(22,56,100,3,'#d8d0c0');R(22,58,100,1,'#b0a890');
    sGrad(59,80,['#4fa84a','#46a044','#3c943c']);
    sPoly([[68,59],[76,59],[96,80],[48,80]],'#e4d8bc');
    for(let k=0;k<5;k++){const y=61+k*4,w=8+k*7;for(const s of[-1,1]){const x0=72+s*(10+k*4);for(let i=0;i<w;i++){const x=s<0?x0-i:x0+i;R(x,y,1,2,(i>>1)%2?'#e84a5a':'#ffd23f')}}}
    sEll(72,66,4,1.5,'#9ac8e0')},
  QUARAI(c){ /* Cerro do Jarau no pampa e a ponte internacional sobre o rio Quaraí */
    sGrad(0,48,SKY_WARM);sEll(118,16,5,5,'#fff6d0');sCloud(40,10,.8);
    sPoly([[10,48],[24,32],[36,25],[64,22],[80,27],[100,48]],'#7a6c54');sPoly([[10,48],[24,32],[36,25],[48,24],[38,48]],'#988a6a');
    for(let k=0;k<4;k++)sLine(30+k*14,30+k,46+k*14,30+k,'#6a5c46');for(let i=0;i<26;i++)R(30+i*2.3,23+(i%3),1,1,'#5a6a3a');
    sGrad(46,62,['#c0b468','#b0a85c','#a09c50']);
    const r=sRnd(3);for(let i=0;i<60;i++)R(r()*CSW,48+r()*14,1,2,'#8a8a42');
    for(let i=0;i<7;i++){R(4+i*8,52,1,6,'#6a4a2a')}R(4,53,50,1,'#8a8a8a');
    for(const[x,y]of[[70,52],[82,54],[90,51]]){R(x,y,5,3,'#5a3a24');R(x+4,y-1,2,2,'#5a3a24');R(x,y+3,1,1,'#3a2a1a');R(x+3,y+3,1,1,'#3a2a1a')}
    R(56,55,88,3,'#e0dcd0');R(56,57,88,1,'#a8a498');
    for(let s=0;s<5;s++){const x0=58+s*18;R(x0,58,3,4,'#c8c4b8');for(let i=3;i<18;i++){const t=(i-3)/15,y=Math.round(61-Math.sin(Math.PI*t)*3);R(x0+i,y,1,1,'#d8d4c8');if(i%3===0)R(x0+i,58,1,y-58,'#bab6aa')}}
    sReflect(c,62,'#4a7aa8',.5)},
  CAMAQUA(c){ /* arrozais alagados à beira da Lagoa dos Patos, ao amanhecer */
    sGrad(0,40,SKY_DAWN);sEll(104,38,9,9,'#ffe6b0');sEll(104,38,5,5,'#fff6dc');
    R(0,38,CSW,2,'#6a5a6a');sDither(0,38,CSW,1,'#8a7080',2);
    sGrad(40,48,['#c0a8b8','#a898b0','#9890a8']);for(let y=40;y<48;y++)R(101-(y-40)*.3,y,6+(y-40)*.6,1,y%2?'#ffe0b0':'#f8c8a0');
    let y=48,k=0;while(y<CSH){const water=k%2===1,hgt=water?1+Math.floor(k/4):3+Math.round(k*.9);
      if(water){R(0,y,CSW,hgt,'#d4c4d8');R(96-k,y,12+k*2,hgt,'#ffe0b8')}else{R(0,y,CSW,hgt,'#62ae3e');for(let x=(k*3)%4;x<CSW;x+=2+(k>6?1:0))R(x,y,1,Math.max(1,hgt-1),x%3?'#4a9a30':'#86c85a')}
      y+=hgt;k++}
    for(let i=0;i<6;i++){R(8+i*14,46+i*.5,1,8+i,'#4a3a2a')}
    const hx=116,hy=60;sEll(hx,hy,5,3,'#f4f4f4');sEll(hx-1,hy+1,4,2,'#d8d8e0');R(hx+3,hy-8,2,6,'#f4f4f4');R(hx+4,hy-10,3,2,'#f4f4f4');R(hx+7,hy-10,4,1,'#f0a030');R(hx+5,hy-10,1,1,'#222');R(hx-1,hy+3,1,8,'#3a3a3a');R(hx+1,hy+3,1,8,'#3a3a3a')},
  'PORTO ALEGRE'(c){ /* Usina do Gasômetro e o pôr do sol no Guaíba */
    sGrad(0,52,SKY_DUSK);sEll(28,46,11,11,'#ffd890');sEll(28,46,7,7,'#fff2c0');
    sCloud(80,14,.9);
    R(0,48,60,4,'#5a3a5a');sEll(14,50,10,3,'#4a2e4c',true);sEll(44,50,7,2,'#4a2e4c',true);
    sPoly([[52,34],[124,34],[124,52],[52,52]],'#a8482c');sDither(52,34,72,18,'#8e3a22',4);R(52,32,74,2,'#6e2414');R(52,42,72,1,'#8a3420');
    for(let i=0;i<8;i++){const x=56+i*8;sEll(x+2,37,2,2,'#ffd890',true);R(x,37,4,4,'#ffd890');sEll(x+2,45,2,2,'#e8a868',true);R(x,45,4,5,'#3a1a10')}
    R(120,34,4,18,'#7a2a18');
    sPoly([[98,2],[104,2],[107,34],[95,34]],'#b4583a');sPoly([[101,2],[104,2],[107,34],[101,34]],'#8a3e26');for(let y=5;y<34;y+=4)R(96+(y/34)*-1,y,11,1,'#7a3020');R(97,1,8,2,'#6e2414');
    sReflect(c,52,'#6a3a56',.55);for(let y=53;y<CSH;y+=2)R(28-(y-50)*.6,y,8+(y-50)*1.2,1,'rgba(255,220,140,.55)')},
  SORRISO(c){ /* lavoura de soja até o horizonte, silos e colheitadeira */
    sGrad(0,44,SKY_DAY);sCloud(30,16,1.6);sCloud(92,9,1.2);sCloud(130,20,.7);
    R(0,42,60,2,'#3f7a3a');sEll(14,42,6,3,'#2f6a30',true);sEll(40,42,8,3,'#2f6a30',true);
    sGrad(44,80,['#7ab840','#6eae3a','#62a234','#56962e']);
    for(let k=-22;k<=22;k++)sLine(72+k*1.5,44,72+k*16,80,'#4a8a28');
    for(let k=0;k<3;k++){const x=92+k*14;R(x,18,12,28,'#c8ccd2');R(x,18,2,28,'#e8ecf2');R(x+8,18,4,28,'#9aa0a8');for(let y=20;y<46;y+=3)R(x,y,12,1,'#b0b6be');sPoly([[x-1,18],[x+6,11],[x+13,18]],'#a8aeb6');sPoly([[x+6,11],[x+13,18],[x+6,18]],'#8a9098')}
    R(136,4,5,42,'#b8bcc4');R(139,4,2,42,'#8a9098');R(135,2,7,3,'#9aa0a8');sLine(98,11,136,6,'#7a8088');sLine(112,11,136,7,'#7a8088');R(88,44,56,2,'#6a6e74');
    const hx=22,hy=58;sDither(hx+18,hy-4,18,8,'#d8c8a0',3);
    R(hx,hy,18,8,'#2f8f3a');R(hx,hy,18,2,'#48b050');R(hx+12,hy-6,6,6,'#2f8f3a');R(hx+13,hy-5,4,3,'#bfe0f0');R(hx-8,hy+4,10,4,'#e8c020');R(hx-8,hy+4,10,1,'#fff070');R(hx+16,hy-2,6,1,'#2f8f3a');
    sEll(hx+4,hy+9,3,3,'#222');sEll(hx+14,hy+9,2,2,'#222')},
  'SAO PAULO'(c){ /* MASP na Avenida Paulista */
    sGrad(0,56,SKY_HAZE);
    const r=sRnd(9);let x=0;while(x<CSW){const w=8+r()*8,h=18+r()*30;R(x,56-h,w,h,'#a4b0c0');sWin(x+1,58-h,Math.floor(w/3),Math.floor(h/4),1,2,3,4,'#c8d4e0','#8a96a8',x);x+=w+1}
    x=-4;while(x<CSW){const w=10+r()*10,h=26+r()*26;R(x,56-h,w,h,'#7a8698');R(x+w-3,56-h,3,h,'#5f6a7c');sWin(x+1,58-h,Math.floor((w-3)/3),Math.floor(h/4),2,2,3,4,'#e8d8a0','#4a5468',x+3);x+=w+3}
    R(0,56,CSW,4,'#bcb4aa');sGrad(60,80,['#5c5c62','#545458','#4c4c50']);for(let i=0;i<CSW;i+=14)R(i,69,7,1,'#e8e8e8');R(0,61,CSW,1,'#f0d040');
    R(32,24,80,22,'#40444e');for(let i=32;i<112;i+=4)R(i,24,1,22,'#545864');R(32,33,80,1,'#8a8e98');R(32,40,80,1,'#8a8e98');
    for(let i=0;i<6;i++)sLine(40+i*12,45,48+i*12,25,'rgba(200,220,255,.18)');
    R(26,17,92,7,'#d8241e');R(26,17,92,1,'#f05a50');R(26,23,92,1,'#a01814');
    R(26,46,92,4,'#d8241e');R(26,49,92,1,'#a01814');
    for(const px of[24,114]){R(px,17,7,43,'#d8241e');R(px+5,17,2,43,'#a01814');R(px,17,1,43,'#f05a50')}
    for(let i=0;i<10;i++)R(36+i*8+(i%3),56+(i%2),1,3,['#222','#3a5aa0','#a03a3a'][i%3])},
  FLORIPA(c){ /* ponte Hercílio Luz entre o continente e a ilha */
    sGrad(0,52,SKY_DAY);sCloud(70,8,.8);
    sRidge(46,3,.05,0,'#7e9cb4',53);sPoly([[96,52],[110,36],[124,30],[144,34],[144,52]],'#4a865a');sPoly([[96,52],[110,36],[118,32],[112,52]],'#5a9a68');
    const r=sRnd(4);for(let i=0;i<14;i++)R(112+r()*30,36+r()*12,3,3,['#f0ece0','#e0d8c8','#f8f4ec'][i%3]);
    for(let i=0;i<10;i++)R(r()*30,44+r()*6,3,3,'#e8e4d8');
    R(0,50,CSW,3,'#c4c8d0');R(0,52,CSW,1,'#8a90a0');
    const chain=x=>x<40?50-42*(x/40)**1.6:x>104?50-42*((144-x)/40)**1.6:8+(1-((x-72)/32)**2)*38;
    for(let x=0;x<CSW;x++){const y=Math.round(chain(x));R(x,y,1,1,'#eef2f8');R(x,y+1,1,1,'#aab0bc');if(x%3===0&&y<49)R(x,y+2,1,50-y-2,'#9aa0ac')}
    for(const tx of[40,104]){R(tx-4,6,3,46,'#e4e8ee');R(tx+2,6,3,46,'#e4e8ee');R(tx+4,6,1,46,'#9aa0ac');for(let y=10;y<48;y+=8){sLine(tx-2,y,tx+2,y+8,'#c4c8d2');sLine(tx+2,y,tx-2,y+8,'#c4c8d2')}R(tx-5,4,11,3,'#d4d8e0')}
    sReflect(c,53,'#2f6aa4',.5);R(20,64,6,2,'#f4f4f4');R(22,60,1,4,'#888');sPoly([[23,60],[23,64],[27,64]],'#ffffff')},
  'SANTA MARIA'(c){ /* gare da antiga estação ferroviária */
    sGrad(0,46,SKY_DAY);sCloud(110,8,.9);sTree(6,46,8,1);sTree(138,44,9,1);
    R(10,28,88,20,'#ecdcb4');R(10,28,88,1,'#fff4d4');R(94,28,4,20,'#cdbb92');sPoly([[8,28],[14,22],[94,22],[100,28]],'#9a4a30');
    for(let i=0;i<10;i++){if(i>=3&&i<=5)continue;const x=14+i*8;sEll(x+2,33,2,2,'#f8f0dc',true);R(x,33,5,9,'#f8f0dc');R(x+1,33,3,8,'#4a5a74')}
    R(38,14,30,34,'#f2e4c0');R(64,14,4,34,'#d4c49c');sPoly([[36,14],[53,6],[70,14]],'#e0d0a8');sPoly([[39,13],[53,8],[67,13]],'#f2e4c0');R(36,14,34,2,'#c8b48c');
    sEll(53,22,5,5,'#f8f8f8');sEll(53,22,4,4,'#ffffff');R(53,19,1,4,'#222');R(53,22,3,1,'#222');
    sEll(53,36,4,3,'#f8f0dc',true);R(49,36,9,12,'#f8f0dc');R(50,37,7,11,'#5a3a24');
    R(0,48,CSW,4,'#a49e92');R(0,48,CSW,1,'#c4beb2');sGrad(52,80,['#8a8070','#807666','#766c5c']);sDither(0,52,CSW,28,'#9a907e',3);
    for(const ty of[60,72]){for(let i=0;i<CSW;i+=5)R(i,ty-1,3,4,'#5a3a24');R(0,ty,CSW,1,'#d0d0d8');R(0,ty+2,CSW,1,'#d0d0d8')}
    const lx=86,ly=46;R(lx,ly,36,10,'#2a2a2e');R(lx,ly,36,2,'#4a4a52');R(lx+26,ly-8,12,18,'#2a2a2e');R(lx+27,ly-6,4,4,'#ffd890');R(lx+6,ly-6,4,6,'#2a2a2e');R(lx+5,ly-7,6,2,'#3a3a40');R(lx+14,ly-3,5,3,'#b88a30');
    R(lx,ly+8,38,2,'#b02a20');for(const wx of[lx+5,lx+15,lx+26])sEll(wx,ly+12,3.5,3.5,'#b02a20'),sEll(wx,ly+12,1.5,1.5,'#222');sPoly([[lx-5,ly+14],[lx,ly+6],[lx,ly+14]],'#4a4a52');
    for(let i=0;i<4;i++)sEll(lx+6-i*5,ly-12-i*5,3+i,2+i*.6,i%2?'#e8e8ec':'#d0d0d8')},
  CAMBORIU(c){ /* arranha-céus, roda-gigante, Cristo Luz no morro e a praia */
    sGrad(0,54,SKY_DAY);sCloud(30,8,.7);
    sPoly([[104,54],[118,30],[130,24],[144,28],[144,54]],'#3a7646');sPoly([[104,54],[118,30],[124,27],[116,54]],'#4a8a56');R(128,15,2,9,'#f4f4f4');R(126,17,6,1,'#f4f4f4');R(128,13,2,2,'#ffe080');
    const r=sRnd(21);let x=0;
    while(x<108){const w=6+r()*5,h=26+r()*28,top=54-h,cl=['#a8c4e0','#b8d0e8','#d8dce6','#c4ccd8'][(r()*4)|0];R(x,top,w,h,cl);R(x,top,1,h,'#eef4fa');R(x+w-2,top,2,h,'rgba(40,60,90,.35)');for(let y=top+2;y<54;y+=3)R(x+1,y,w-3,1,'rgba(60,90,130,.35)');x+=w+1}
    const cxw=100,cyw=34;for(let a=0;a<48;a++){const t=a/48*Math.PI*2;R(cxw+Math.cos(t)*15,cyw+Math.sin(t)*15,1,1,'#ffffff');if(a%6===0){sLine(cxw,cyw,cxw+Math.cos(t)*15,cyw+Math.sin(t)*15,'#d8dce4');R(cxw+Math.cos(t)*15-1,cyw+Math.sin(t)*15+1,3,2,['#ff5a5a','#5ab0ff','#ffd23f'][a%3])}}
    sLine(cxw,cyw,cxw-6,54,'#e8e8f0');sLine(cxw,cyw,cxw+6,54,'#e8e8f0');
    sGrad(54,61,['#f4e2b0','#ecd8a0','#e2cc90']);for(let i=0;i<12;i++)R(6+i*12,56+(i%2),3,2,['#ff5a5a','#ffd23f','#5ab0ff'][i%3]);
    sReflect(c,61,'#2f86c8',.3);for(let i=0;i<CSW;i+=1)if((i>>2)%3)R(i,61+((i>>3)%2),1,1,'#ffffff')},
  CHAPECO(c){ /* Arena Condá vista de trás do gol */
    sGrad(0,16,SKY_DAY);sCloud(30,6,.6);
    R(0,8,CSW,3,'#e4e8ec');R(0,11,CSW,2,'#8a9098');
    const r=sRnd(8);sGrad(13,38,['#1a6a30','#1f7a36','#22863a']);for(let i=0;i<260;i++)R(r()*CSW,13+r()*24,1,1,r()<.5?'#ffffff':'#7ad08a');
    for(let y=17;y<38;y+=4)R(0,y,CSW,1,'#145a28');
    sPoly([[0,13],[22,38],[22,44],[0,62]],'#1a6a30');sPoly([[144,13],[122,38],[122,44],[144,62]],'#1a6a30');
    for(let i=0;i<60;i++){const s=r(),y=16+r()*40;R(s<.5?r()*(22*(1-(y-13)/49)):CSW-r()*(22*(1-(y-13)/49)),y,1,1,r()<.5?'#ffffff':'#7ad08a')}
    R(22,38,100,2,'#ececec');
    let y=40,k=0;while(y<CSH){const h=2+Math.round(k*1.3),w0=100+(y-40)*2.2;R(72-w0/2,y,w0,h,k%2?'#3fae4a':'#36a040');y+=h;k++}
    sLine(46,46,98,46,'#ffffff');sLine(46,46,38,58,'#ffffff');sLine(98,46,106,58,'#ffffff');
    R(46,62,3,18,'#ffffff');R(96,62,3,18,'#ffffff');R(46,62,53,3,'#ffffff');sDither(49,65,47,15,'rgba(255,255,255,.55)',3);
    for(const lx of[4,138]){R(lx,0,3,14,'#b8bcc4');R(lx-4,0,11,4,'#fff6c0');R(lx-4,0,11,1,'#ffffff')}},
  'PASSO FUNDO'(c){ /* cuia de chimarrão diante de um galpão crioulo */
    sGrad(0,50,SKY_WARM);sCloud(36,10,.8);
    sRidge(48,2,.07,2,'#8aa070');sGrad(52,80,['#7aae4c','#6ea244','#62963c']);
    R(84,30,52,22,'#8a5a32');for(let y=31;y<52;y+=2)R(84,y,52,1,'#7a4c28');sPoly([[80,31],[110,18],[140,31]],'#6a6a64');sPoly([[110,18],[140,31],[110,31]],'#545450');R(104,40,12,12,'#4a2a14');R(90,36,6,5,'#3a2a1a');
    sTree(16,52,8,1);sTree(70,52,6,1);
    R(30,66,52,4,'#7a4a22');R(30,66,52,1,'#a06a3a');R(34,70,3,10,'#5a3418');R(75,70,3,10,'#5a3418');
    sEll(56,52,15,15,'#7a4a1e');sEll(53,49,11,11,'#9a6230');sEll(50,46,5,5,'#b47a40');sDither(60,40,10,24,'#5a3410',3);
    R(42,38,28,4,'#c8ccd4');R(42,38,28,1,'#f0f2f6');R(42,41,28,1,'#8a9098');
    sEll(56,38,13,2,'#3f8a2a');sEll(54,37,7,1.2,'#62ac42');R(46,37,3,1,'#e8f0d0');
    sLine(60,38,72,16,'#d8dce4');sLine(61,38,73,16,'#9aa0aa');R(70,14,6,3,'#c8ccd4');R(71,14,2,1,'#ffffff');
    R(48,64,16,2,'rgba(0,0,0,.25)')},
  ITAJAI(c){ /* porto: portêineres, navio de contêineres e rio */
    sGrad(0,44,SKY_DAY);sCloud(28,8,.7);
    R(0,40,CSW,4,'#8aa0b0');const r=sRnd(6);for(let i=0;i<16;i++)R(i*9,36+r()*4,7,8-r()*3,'#c8ccd0');
    R(0,48,CSW,5,'#9a9a9a');R(0,48,CSW,1,'#c8c8c8');
    const cc=['#c0392b','#2e86de','#27ae60','#e67e22','#8e44ad','#16a085','#d0d0d0'];
    for(let i=0;i<6;i++)for(let j=0;j<3;j++){const x=108+i*6,y=42-j*4;R(x,y,6,4,cc[(i*3+j)%7]);R(x+5,y,1,4,'rgba(0,0,0,.3)')}
    for(const gx of[30,72]){const O='#e0552a',D='#a83a1a';
      R(gx,16,3,32,O);R(gx+18,16,3,32,O);R(gx+2,16,1,32,D);R(gx+20,16,1,32,D);sLine(gx+2,24,gx+18,40,D);sLine(gx+18,24,gx+2,40,D);
      R(gx-22,14,48,3,O);R(gx-22,16,48,1,D);R(gx+4,9,12,5,'#f0f0f0');R(gx+4,13,12,1,'#b0b0b0');sLine(gx-20,14,gx+10,4,'#7a7a7a');sLine(gx+26,14,gx+10,4,'#7a7a7a');R(gx+9,3,2,6,O);
      R(gx-14,17,4,3,'#555');sLine(gx-12,20,gx-12,40,'#444')}
    sPoly([[4,52],[96,52],[102,56],[96,62],[10,62]],'#1b2a50');R(10,59,88,3,'#a82a20');R(4,52,94,1,'#3a4a78');
    for(let i=0;i<11;i++)for(let j=0;j<2;j++){const x=12+i*7,y=46-j*4;R(x,y,7,4,cc[(i+j*4)%7]);R(x+6,y,1,4,'rgba(0,0,0,.3)')}
    R(84,38,10,14,'#f4f4f4');R(84,38,10,2,'#d0d0d0');for(let j=0;j<3;j++)R(85,41+j*3,8,1,'#34405a');R(88,32,2,6,'#c0392b');
    sReflect(c,62,'#2a5a88',.45)},
  RIO(c){ /* Cristo Redentor no Corcovado, Pão de Açúcar e a baía */
    sGrad(0,56,SKY_DAY);sCloud(70,10,.8);sCloud(130,6,.6);
    sRidge(50,3,.06,1,'#7c9ab4',57);
    sPoly([[0,57],[4,34],[10,22],[16,14],[22,12],[28,16],[36,32],[52,57]],'#2f6a3a');sPoly([[0,57],[4,34],[10,22],[16,14],[20,13],[18,57]],'#3f7e48');R(19,11,4,3,'#7a8a7a');
    R(20,4,2,8,'#f4f4f4');R(15,6,12,2,'#f4f4f4');R(20,2,2,2,'#f4f4f4');R(21,4,1,8,'#c8c8d0');
    sEll(92,57,13,14,'#2f6a3a',true);sEll(90,56,9,10,'#3f7e48',true);
    sPoly([[106,57],[108,40],[112,26],[118,18],[124,17],[129,22],[132,34],[134,57]],'#3a6a40');sPoly([[110,57],[112,30],[118,19],[122,18],[120,40],[118,57]],'#8a9488');sPoly([[112,30],[118,19],[121,18],[117,30],[114,50]],'#a8b0a4');
    sLine(92,43,121,17,'#2a2a2a');R(104,30,3,2,'#e04040');
    const r=sRnd(2);for(let i=0;i<22;i++){const h=2+r()*5;R(30+i*3,57-h,3,h,['#f0ece0','#e4dcc8','#f8f4ec'][i%3])}
    sReflect(c,57,'#2a7ac0',.45);
    for(const[bx,by]of[[40,66],[70,72],[118,64]]){R(bx,by,7,2,'#f4f4f4');R(bx+3,by-6,1,6,'#888');sPoly([[bx+4,by-6],[bx+4,by],[bx+8,by]],'#ffffff')}},
  CARAZINHO(c){ /* igreja matriz na praça e as lavouras do planalto */
    sGrad(0,48,SKY_DAY);sCloud(20,10,.9);sCloud(118,6,.6);
    sRidge(44,2,.05,1,'#9ab47a');R(0,46,CSW,4,'#c8b04a');
    R(48,24,48,24,'#f0ece0');R(92,24,4,24,'#d0ccc0');sPoly([[46,24],[72,10],[98,24]],'#b84a3a');sPoly([[72,10],[98,24],[72,24]],'#963a2c');
    for(const tx of[40,96]){R(tx,8,10,40,'#f4f0e4');R(tx+7,8,3,40,'#d4d0c4');sPoly([[tx-1,8],[tx+5,-2],[tx+11,8]],'#6a7a8a');R(tx+4,-4,2,3,'#d8c070');R(tx+3,14,4,6,'#4a3a2a');sEll(tx+5,14,2,2,'#4a3a2a',true)}
    sEll(72,20,3,3,'#8ab0d0');sEll(72,38,5,4,'#6b4423',true);R(67,38,10,10,'#6b4423');for(const wx of[54,84])R(wx,30,5,9,'#7aa0c4');
    R(0,48,CSW,6,'#d0c8b4');sTree(20,52,8);sTree(124,52,8);sTree(108,50,5,1);
    sGrad(54,80,['#e2c45a','#d8b84e','#ccac42']);const r=sRnd(17);for(let i=0;i<180;i++){const y=55+r()*25;R(r()*CSW,y,1,1+(y-54)/10,r()<.5?'#b8962a':'#f4dc80')}},
  PELOTAS(c){ /* Mercado Público com a torre do relógio e os doces */
    sGrad(0,40,SKY_DAY);sCloud(24,8,.7);sCloud(126,12,.6);
    R(6,30,132,34,'#eed8a6');R(6,30,132,3,'#ffffff');R(6,46,132,2,'#ffffff');R(6,29,132,1,'#c8b088');R(134,30,4,34,'#d4bc8a');
    for(let i=0;i<14;i++){const x=10+i*9;if(i===6||i===7)continue;sEll(x+2.5,36,2.5,2,'#ffffff',true);R(x,36,5,8,'#ffffff');R(x+1,36,3,8,'#5a74a0');sEll(x+2.5,51,2.5,2,'#ffffff',true);R(x,51,5,11,'#ffffff');R(x+1,51,3,11,'#6a4a2a')}
    for(let i=0;i<33;i++)R(7+i*4,26,1,3,'#ffffff');R(6,25,132,1,'#ffffff');
    R(62,22,20,42,'#f4e4bc');sEll(72,50,6,4,'#ffffff',true);R(66,50,12,14,'#6a4a2a');
    const M='#6e8484',M2='#4e6262';sPoly([[64,22],[80,22],[77,8],[67,8]],M);sPoly([[72,22],[80,22],[77,8],[72,8]],M2);for(let y=10;y<22;y+=3)sLine(66+(22-y)*.2,y,78-(22-y)*.2,y,'#9ab0b0');
    sEll(72,8,6,6,M,true);sEll(70,6,3,3,'#9ab0b0',true);R(71,0,2,3,M2);
    sEll(72,15,3.5,3.5,'#ffffff');R(72,13,1,3,'#222');R(72,15,2,1,'#222');
    R(0,64,CSW,16,'#c8b894');sDither(0,64,CSW,16,'#b8a884',4);
    R(44,68,56,8,'#8a5a32');R(44,68,56,2,'#f4f0e8');const dc=[['#5a3018','#7a4a28'],['#ffd23f','#fff090'],['#fff4dc','#ffffff'],['#ff9ecf','#ffc8e4']];
    for(let i=0;i<9;i++){const d=dc[i%4];sEll(48+i*6,67,2.5,2,d[0]);R(47+i*6,66,1,1,d[1])}},
  ROMA(c){ /* Coliseu */
    sGrad(0,56,SKY_WARM);sEll(132,10,5,5,'#fff4d0');
    for(const px of[10,26]){R(px,34,2,22,'#5a4030');sEll(px+1,32,9,4,'#3a6a3a');sEll(px,31,6,2.5,'#4f8a4a')}
    const top=x=>x<104?18+((x-60)/70)**2*10:Math.min(40,22+Math.floor((x-104)/4)*4+((x>>1)%2));
    for(let x=34;x<130;x++){const t=Math.round(top(x));R(x,t,1,56-t,x>104?'#c89a66':'#d8aa74');R(x,t,1,1,x>104?'#a87a4a':'#e8c08a')}
    sPoly([[104,24],[130,40],[130,56],[104,56]],'rgba(120,80,40,.18)');
    for(let row=0;row<4;row++){const y=22+row*9;for(let i=0;i<15;i++){const x=36+i*6;if(y<top(x)+2)continue;if(row<3){sEll(x+2,y+1,2,2,'#6a4028',true);R(x,y+1,4,6,'#6a4028')}else R(x+1,y+2,2,3,'#6a4028')}R(34,y-1,96,1,'#c49460')}
    R(34,56,96,2,'#b48a5a');
    sGrad(58,80,['#c8b48a','#bea880','#b49c74'])},
  PARIS(c){ /* Torre Eiffel */
    sGrad(0,62,SKY_HAZE);sCloud(26,12,.8);sCloud(120,20,.6);
    sTree(8,64,9,1);sTree(26,64,7,1);sTree(118,64,7,1);sTree(136,64,9,1);
    for(let y=6;y<72;y++){const w=Math.round(2+30*((y-6)/66)**2.4),inner=y>56?Math.round(w*.62*Math.sqrt(Math.min(1,(y-56)/14))):0;
      for(let x=-w;x<w;x++){if(Math.abs(x)<inner)continue;const edge=x===-w||x===w-1||Math.abs(x)===inner;R(72+x,y,1,1,edge?'#6a4a32':((x+y)%2?'#8a6a4a':'#a8865e'))}}
    R(56,34,32,2,'#6a4a32');R(48,54,48,3,'#6a4a32');R(70,2,4,5,'#6a4a32');R(71,0,2,2,'#6a4a32');
    sGrad(72,80,['#6aa04a','#5e9442'])},
  BARCELONA(c){ /* Sagrada Família */
    sGrad(0,60,SKY_DAY);sCloud(20,10,.7);
    R(18,8,2,30,'#e0a020');R(4,8,40,2,'#e0a020');sLine(10,10,10,20,'#555');
    const sp=(x,h,w)=>{for(let j=0;j<h;j++){const ww=Math.max(2,Math.round(w-(j/h)*(w-2)));R(x-ww/2,60-j,ww,1,(j%5===2)?'#a88858':'#caa878');if(j%4===1&&ww>3)R(x-1,60-j,1,1,'#6a5030')}R(x-1,60-h-3,3,3,'#e8c040');R(x,60-h-6,1,3,'#e8c040')};
    sp(72,54,12);sp(54,44,9);sp(90,44,9);sp(42,38,8);sp(102,38,8);sp(30,26,7);sp(114,26,7);
    R(24,46,96,14,'#caa878');sDither(24,46,96,14,'#b09060',3);sEll(72,52,8,6,'#6a5030',true);R(64,52,16,8,'#6a5030');
    sGrad(60,80,['#d8c8a0','#ccbc94','#c0b088'])},
  MADRI(c){ /* Puerta de Alcalá */
    sGrad(0,56,SKY_DAY);sCloud(110,10,.8);sTree(8,56,9);sTree(136,56,9);
    R(24,24,96,32,'#e4d8bc');R(24,24,96,2,'#ffffff');R(116,24,4,32,'#c8bc9c');R(22,22,100,2,'#cdbf9e');
    sPoly([[56,22],[72,12],[88,22]],'#e4d8bc');sPoly([[60,21],[72,14],[84,21]],'#cdbf9e');R(70,8,4,6,'#bcae8c');
    for(const[x,arch]of[[30,0],[48,1],[66,1],[84,1],[102,0]]){if(arch){sEll(x+6,38,6,6,'#5a4a3a',true);R(x,38,12,18,'#5a4a3a')}else R(x+2,38,8,18,'#5a4a3a');R(x+12,28,2,28,'#d0c4a6')}
    sGrad(56,80,['#c8bc9e','#bcb090','#b0a484']);sEll(72,70,22,5,'#9ab8d0');sEll(72,69,16,3,'#b8d4e8')},
};
function cityGeneric(city){
  let s=0;for(const ch of city)s=(s*31+ch.charCodeAt(0))%9973;const r=sRnd(s+1);
  sGrad(0,52,SKY_DAY);sCloud(20+r()*40,10,.8);sCloud(100+r()*30,6,.6);
  sRidge(44,3,.05,r()*6,'#9ab0c4',52);
  const sx=40+r()*64;R(sx,6,8,46,'#d0c4a8');R(sx+6,6,2,46,'#b0a488');sPoly([[sx-1,6],[sx+4,-6],[sx+9,6]],'#5a6a7a');R(sx+3,14,2,4,'#3a3a4a');
  for(let row=0;row<2;row++){let x=-4+row*6;while(x<CSW){const w=10+r()*8,h=12+r()*14-(row?6:0),base=row?60:52,top=base-h;
    const col=['#e8d8c0','#d8c0a0','#f0e4d0','#e0c8b8','#d4c8b0'][(r()*5)|0];R(x,top,w,h,col);R(x+w-2,top,2,h,'rgba(0,0,0,.12)');
    sPoly([[x-1,top],[x+w/2,top-5],[x+w+1,top]],r()<.5?'#b85a3a':'#8a4a3a');for(let j=top+3;j<base-2;j+=5)for(let i=x+2;i<x+w-2;i+=4)R(i,j,2,3,'#5a6a8a');x+=w+1}}
}
const SCN={};
function sceneCanvas(city){
  if(SCN[city])return SCN[city];
  const c=document.createElement('canvas');c.width=CSW;c.height=CSH;const g=c.getContext('2d');if(g)g.imageSmoothingEnabled=false;
  const keep=cx;cx=g;
  try{const f=CITY_ART[city];if(f)f(c);else{cityGeneric(city);const t=c;sReflect(t,60,'#4a7ab0',.45)}}finally{cx=keep}
  return SCN[city]=c;
}
function cityScene(city,X,Y){cx.drawImage(sceneCanvas(city),X,Y)}
