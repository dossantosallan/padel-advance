/* ---------- luz e arena ----------
   Refletores nos 4 cantos: poças de luz no piso, cantos mais escuros, reflexo nos vidros,
   uma sombra suave por refletor em cada jogador e brilho na bola.
   Sem torcida (padrão): arena escura com torres de luz, câmera mais próxima e bonecos maiores.
   Opções → TORCIDA liga a torcida de volta com a câmera original. */
const LAMPS=[[-14,-10],[114,-10],[-14,210],[114,210]];
const CAM_BASE=CAMS.map(c=>({wn:c.wn,oy:c.oy,h:c.h}));
const crowdOn=()=>!!save.opts.crowd;
function applyLook(){
  const z=crowdOn()?[1,1]:[1.1,1.12];
  CAMS.forEach((c,i)=>{const b0=CAM_BASE[i];c.wn=b0.wn*z[i];c.oy=b0.oy;c.h=b0.h+(crowdOn()||i?0:4)});
  for(const k in courtCache)delete courtCache[k];
}
applyLook();
const spriteK=()=>crowdOn()?2.5:2.9;
const _drawCrowd=drawCrowd;
drawCrowd=function(){if(crowdOn())_drawCrowd()};
const _buildBgHD=buildBgHD;
buildBgHD=function(C){
  if(crowdOn())return _buildBgHD(C);
  const[c,g]=hdMk(HW,HH),aer=CAM===CAMS[0],night=!!C.night;
  g.fillStyle=night?'#05070e':C.beach?'#0f3a52':C.roof?'#0c0a12':'#0b0f21';g.fillRect(0,0,HW,HH);
  /* luz que escapa da quadra para o piso da arena */
  const rg=g.createRadialGradient(HW/2,HH*.55,40,HW/2,HH*.55,HH*.75);
  rg.addColorStop(0,night?'rgba(70,90,150,.32)':'rgba(90,110,170,.32)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,HW,HH);
  for(let y=0;y<HH;y+=2)for(let x=0;x<HW;x+=2){const r=hdHash(x,y);if(r<.08){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(x,y,2,2)}else if(r>.93){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y,2,2)}}
  if(C.beach){for(let y=60;y<HH;y+=13)for(let x=(y*3)%23;x<HW;x+=23){gR(g,x,y,8,1,'#2a6a8a');gR(g,x+2,y-1,4,1,'#3a7a9a')}}
  const T=CAM.oy*2,Bt=(CAM.oy+CAM.h)*2;
  if(aer){const tx=P2(0,0,0)[0],bx=P2(0,L,0)[0];hdLed(g,T-14,tx-14,HW-tx+14,8,0);hdLed(g,Bt+8,bx-18,HW-bx+18,9,3)}
  else{const bx=P2(0,L,0)[0];hdLed(g,Bt+6,Math.max(4,bx-10),HW-Math.max(4,bx-10),10,1)}
  /* torres de luz nos cantos */
  if(!C.roof&&!C.night)for(const[x,y]of LAMPS){const[bx,by]=P2(x,y,0),[tx,ty]=P2(x,y,aer?14:46);
    g.strokeStyle='#2a3048';g.lineWidth=3;g.beginPath();g.moveTo(bx,by);g.lineTo(tx,ty);g.stroke();
    const gl=g.createRadialGradient(tx,ty,0,tx,ty,28);gl.addColorStop(0,`rgba(255,250,220,${night?.7:.5})`);gl.addColorStop(1,'rgba(255,250,220,0)');g.fillStyle=gl;g.fillRect(tx-28,ty-28,56,56);
    g.fillStyle='#fffbe8';g.fillRect(tx-5,ty-3,10,5);g.fillStyle='#ffffff';g.fillRect(tx-4,ty-2,8,1)}
  if(C.roof){gR(g,0,0,HW,70,'#0a080e');for(const y of[20,46]){gR(g,0,y,HW,4,'#2a2433');for(let x=24;x<HW;x+=64){gR(g,x,y+4,22,4,'#fff2c0');gR(g,x-12,y+8,46,22,'rgba(255,242,192,.07)')}}}
  return c;
};
const _buildCourtHD=buildCourtHD;
buildCourtHD=function(C){
  const c=_buildCourtHD(C),g=c.getContext('2d'),night=!!C.night,[mask]=hdMk(HW,HH);mask.getContext('2d').drawImage(c,0,0);
  /* poças de luz (soft-light preserva a textura do piso) */
  g.save();g.globalCompositeOperation='soft-light';
  for(const[x,y]of C.roof?[[25,50],[75,50],[25,150],[75,150]]:LAMPS){const[lx,ly]=P2(clamp(x,8,92),clamp(y,10,190),0),r=night?160:190;
    const gr=g.createRadialGradient(lx,ly,0,lx,ly,r);gr.addColorStop(0,`rgba(255,248,225,${night?.55:.5})`);gr.addColorStop(1,'rgba(255,248,225,0)');g.fillStyle=gr;g.fillRect(0,0,HW,HH)}
  g.restore();
  /* oclusão: escurece junto às paredes e no fundo distante */
  g.save();g.globalCompositeOperation='multiply';
  const v=g.createLinearGradient(0,0,HW,0);v.addColorStop(0,'rgb(60,70,110)');v.addColorStop(.12,'#fff');v.addColorStop(.88,'#fff');v.addColorStop(1,'rgb(60,70,110)');
  g.globalAlpha=.25;g.fillStyle=v;g.fillRect(0,0,HW,HH);
  const d=g.createLinearGradient(0,CAM.oy*2,0,(CAM.oy+CAM.h)*2);d.addColorStop(0,'rgb(140,150,185)');d.addColorStop(.25,'#fff');d.addColorStop(1,'rgb(235,238,255)');
  g.globalAlpha=.45;g.fillStyle=d;g.fillRect(0,0,HW,HH);g.restore();
  /* reflexo diagonal nos vidros laterais */
  g.save();g.globalCompositeOperation='screen';g.fillStyle='rgba(200,240,255,.22)';
  for(const yy of[6,24,176,194])for(const X of[0,100]){const[a,b2]=P2(X,yy,0),[a2,b3]=P2(X,yy+8,0);g.beginPath();g.moveTo(a-4,b2);g.lineTo(a+4,b2);g.lineTo(a2+4,b3);g.lineTo(a2-4,b3);g.fill()}
  g.restore();
  /* mantém o recorte original: nada de luz fora da quadra */
  g.save();g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);g.restore();
  return c;
};
/* sombras: uma por refletor, apontando para longe da luz */
const _drawPlayerHD=drawPlayerHD;
drawPlayerHD=function(p,X,Y){
  if(p.dive<=0&&!COURTS[save.opts.court].roof)hi(()=>{const x2=X*2,y2=Y*2;cx.fillStyle='rgba(4,8,30,.13)';
    for(const[lx,ly]of LAMPS){const[sx,sy]=P2(lx,ly,0),dx=x2-sx,dy=y2-sy,dd=Math.hypot(dx,dy)||1,len=clamp(10+1800/dd,10,22);
      cx.save();cx.translate(x2,y2);cx.rotate(Math.atan2(dy,dx));cx.beginPath();cx.ellipse(len*.5,0,len*.6,4.2,0,0,Math.PI*2);cx.fill();cx.restore()}});
  return _drawPlayerHD(p,X,Y);
};
/* bola: halo leve e fio pontilhado até a sombra quando está alta */
const _drawBallHD=drawBallHD;
drawBallHD=function(){
  const[sx,sy]=proj(b.x,b.y,b.z);
  if(sy>=33)hi(()=>{const X=sx*2,Y=sy*2-2,gl=cx.createRadialGradient(X,Y,0,X,Y,10);gl.addColorStop(0,'rgba(230,255,80,.45)');gl.addColorStop(1,'rgba(230,255,80,0)');cx.fillStyle=gl;cx.fillRect(X-10,Y-10,20,20);
    if(b.z>8&&b.z<60&&!b.out){const[gx,gy]=P2(b.x,b.y,0);cx.fillStyle='rgba(255,255,255,.28)';for(let y=gy-2;y>Y+4;y-=4)cx.fillRect(Math.round(gx),Math.round(y),1,2)}});
  _drawBallHD();
};
/* vinheta nas bordas da tela */
const _drawWorld=drawWorld;
drawWorld=function(){_drawWorld();hi(()=>{const v=cx.createRadialGradient(HW/2,HH/2,HH*.3,HW/2,HH/2,HH*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,12,.4)');cx.fillStyle=v;cx.fillRect(0,0,HW,HH)})};
