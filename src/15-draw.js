/* ---------- desenho ---------- */
const courtCache={};
function getBg(){const k='bg'+save.opts.court;if(!courtCache[k])courtCache[k]=buildBg(COURTS[save.opts.court]);return courtCache[k]}
function getCourt(){const k=save.opts.court+'_'+save.opts.cam;if(!courtCache[k])courtCache[k]=buildCourt(COURTS[save.opts.court]);return courtCache[k]}
function buildBg(C){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
  g.fillStyle=C.out;g.fillRect(0,0,CW,CH);g.fillStyle=C.out2;
  for(let y=30;y<CH;y+=4)for(let x=2;x<CW;x+=6)g.fillRect(x+((y>>2)%2)*3,y,1,1);
  if(C.roof){g.fillStyle='#0a080e';g.fillRect(0,0,CW,34);for(const y of[10,24]){g.fillStyle='#2a2433';g.fillRect(0,y,CW,2);for(let x=14;x<CW;x+=32){g.fillStyle='#fff2c0';g.fillRect(x,y+2,10,2);g.fillStyle='rgba(255,242,192,.08)';g.fillRect(x-6,y+4,22,10)}}}
  if(C.beach){g.fillStyle='#1f5a78';for(let y=32;y<CH;y+=7)for(let x=(y*3)%11;x<CW;x+=11)g.fillRect(x,y,4,1);g.fillStyle='#f4e2b0';g.fillRect(0,CH-4,CW,4)}
  return c;
}
function buildCourt(C){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)};
  const T=CAM.oy,Bt=CAM.oy+CAM.h,back3d=CAM===CAMS[1];
  const lampW=C.night?[[-8,-4],[108,-4],[-8,100],[108,100],[-8,204],[108,204]]:[];
  const lamps=lampW.map(([x,y])=>proj(x,y,0));
  const light=(x,y)=>{let f=0;for(const[lx,ly]of lamps){const d2=(x-lx)**2+(y-ly)**2;f+=Math.exp(-d2/(2*46*46))}return clamp(f,0,1)};
  const zone=y=>{const yd=Math.min(y,L-y);return yd<40?'glass':(yd>=50&&yd<=70)?'door':C.pano?'glass':'fence'};
  const top=proj(0,0,0),bot=proj(0,L,0);
  if(!back3d){
    R(top[0]-3,T-3,CW-2*(top[0]-3),3,C.glass);
    for(let x=Math.round(top[0]);x<CW-top[0];x+=7)R(x,T-3,2,1,'#d8f7ff');
  }
  R(bot[0]-3,Bt,CW-2*(bot[0]-3),3,C.glass);
  for(let x=Math.round(bot[0]);x<CW-bot[0];x+=7)R(x,Bt,2,1,'#d8f7ff');
  for(let sy=T;sy<Bt;sy++){
    const y=yAt(sy+.5),xl=Math.round(proj(0,y,0)[0]),xr=CW-xl,row=sy-T;
    if(C.night){for(let x=xl;x<xr;x+=2){const f=light(x,sy);g.fillStyle=mix(C.dark,C.turf,f);g.fillRect(x,sy,2,1)}}
    else{g.fillStyle=C.turf;g.fillRect(xl,sy,xr-xl,1)}
    if(row%2===0){g.fillStyle=C.night?'rgba(0,0,0,.12)':C.dot;for(let x=xl+((row>>1)%2)*2;x<xr;x+=4)g.fillRect(x,sy,1,1)}
    if(back3d)continue;
    const z=zone(y);
    for(const wx of[xl-3,xr]){
      if(z==='glass'){R(wx,sy,3,1,C.glass);if(row%8===2||row%8===3)R(wx+1,sy,1,1,'#d8f7ff')}
      else if(z==='fence'){R(wx,sy,3,1,C.fence);if(row%2===0)R(wx+(row%4?0:2),sy,1,1,'#56608c')}
      else R(wx,sy,3,1,C.out);
    }
  }
  if(!back3d)for(const yd of[50,70,130,150]){const[px,py]=proj(0,yd,0);R(px-3,py,3,1,'#9aa3c8');R(CW-px,py,3,1,'#9aa3c8')}
  const lc=C.night?mix(C.line,C.dark,.25):C.line;
  for(const sv of[SV1,SV2]){const[px,py]=proj(0,sv,0);R(px,py,CW-2*px,1,lc)}
  const c1=proj(50,SV1,0)[1],c2=proj(50,SV2,0)[1];R(80,c1,1,Math.round(c2-c1),lc);
  if(back3d){
    /* paredes como planos verticais: vidro translúcido, alambrado escuro com malha */
    const poly=(pts,fill)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill()};
    const ln=(a,b2,col)=>{g.strokeStyle=col;g.lineWidth=1;g.beginPath();g.moveTo(Math.round(a[0])+.5,Math.round(a[1])+.5);g.lineTo(Math.round(b2[0])+.5,Math.round(b2[1])+.5);g.stroke()};
    const strip=(x,y0,y1,z0,z1)=>{const pts=[];for(let y=y0;y<=y1+1e-6;y+=2)pts.push(proj(x,y,z0));for(let y=y1;y>=y0-1e-6;y-=2)pts.push(proj(x,y,z1));return pts};
    const glassF=C.night?'rgba(120,190,230,.14)':'rgba(170,230,255,.22)',fenceF='rgba(28,34,60,.6)',edge='rgba(215,245,255,.75)',mesh='rgba(130,140,185,.45)';
    poly([proj(0,0,0),proj(100,0,0),proj(100,0,30),proj(0,0,30)],glassF);
    poly([proj(0,0,30),proj(100,0,30),proj(100,0,40),proj(0,0,40)],fenceF);
    for(let x=0;x<=100;x+=5)ln(proj(x,0,30),proj(x,0,40),mesh);
    for(let x=10;x<100;x+=25)ln(proj(x,0,2),proj(x+6,0,26),'rgba(255,255,255,.18)');
    ln(proj(0,0,30),proj(100,0,30),edge);ln(proj(0,0,40),proj(100,0,40),mesh);
    const segs=[[0,40,'g'],[40,50,'f'],[70,130,'f'],[150,160,'f'],[160,200,'g']];
    for(const X of[0,100])for(const[y0,y1,t]of segs){
      if(t==='g'){poly(strip(X,y0,y1,0,30),glassF);poly(strip(X,y0,y1,30,40),fenceF);
        for(let y=y0;y<=y1;y+=4)ln(proj(X,y,30),proj(X,y,40),mesh);
        ln(proj(X,y0,30),proj(X,y1,30),edge);ln(proj(X,y0,40),proj(X,y1,40),mesh)}
      else if(C.pano){poly(strip(X,y0,y1,0,30),glassF);ln(proj(X,y0,30),proj(X,y1,30),edge)}
      else{poly(strip(X,y0,y1,0,30),fenceF);for(let y=y0;y<=y1;y+=4)ln(proj(X,y,0),proj(X,y,30),mesh);ln(proj(X,y0,30),proj(X,y1,30),mesh)}
    }
    for(const yd of[50,70,130,150])for(const X of[0,100])ln(proj(X,yd,0),proj(X,yd,30),'#9aa3c8');
  }
  lampW.forEach(([x,y],i)=>{const[bx,by]=lamps[i],[tx,ty]=proj(x,y,CAM.pole);
    g.strokeStyle='#3a3f55';g.lineWidth=1;g.beginPath();g.moveTo(Math.round(bx)+.5,by);g.lineTo(Math.round(tx)+.5,ty);g.stroke();
    g.fillStyle='rgba(255,246,192,.18)';g.fillRect(tx-3,ty-4,7,6);R(tx-1,ty-2,3,2,'#fff6c0')});
  return c;
}
let crowd=[];
function buildCrowd(){
  crowd=[];const cols=['#ff5a52','#2e86ff','#ffd23f','#20c070','#f2f2f2','#b05cff','#ff9f1c','#3fd0ff'],skins=['#f2c18d','#c68642','#8d5524','#ffdbac'];
  const night=!!COURTS[save.opts.court].night;
  const add=(x,y)=>{let c=cols[(Math.random()*cols.length)|0],s=skins[(Math.random()*skins.length)|0];
    if(night){c=mix(c,'#000000',.55);s=mix(s,'#000000',.55)}crowd.push({x,y,c,s,ph:(Math.random()*100)|0,flag:Math.random()<.05,fc:cols[(Math.random()*cols.length)|0]})};
  if(CAM===CAMS[1]){const tp=Math.round(proj(0,0,40)[1]);for(let sy=36;sy<=tp-3;sy+=5)for(let x=3+((sy/5)&1);x<156;x+=3)add(x,sy)}
  for(let sy=CAM.oy+3;sy<CAM.oy+CAM.h-2;sy+=5){
    const xl=Math.round(proj(0,yAt(sy),0)[0])-3,off=(Math.floor((sy-CAM.oy)/5)%2)*1;
    for(let x=2+off;x<=xl-5;x+=3)for(const side of[0,1]){
      let c=cols[(Math.random()*cols.length)|0],s=skins[(Math.random()*skins.length)|0];
      if(night){c=mix(c,'#000000',.55);s=mix(s,'#000000',.55)}
      crowd.push({x:side?CW-x-2:x,y:sy,c,s,ph:(Math.random()*100)|0,flag:Math.random()<.05,fc:cols[(Math.random()*cols.length)|0]});
    }
  }
}
function drawCrowd(){
  for(const c of crowd){
    let dy=0;
    if(cheer>0)dy=((frame+c.ph)>>2)%2?-1:0;else if((frame+c.ph*7)%300<5)dy=-1;
    cx.fillStyle=c.c;cx.fillRect(c.x,c.y+dy,2,2);cx.fillStyle=c.s;cx.fillRect(c.x,c.y-2+dy,2,2);
    if(cheer>0&&((frame+c.ph)>>3)%3===0){cx.fillStyle=c.s;cx.fillRect(c.x+((c.ph%2)?2:-1),c.y-3+dy,1,2)}
    if(c.flag||(bo3&&c.ph%11===0)){const wv=((frame+c.ph)>>3)%2;cx.fillStyle='#c8c8d8';cx.fillRect(c.x+1,c.y-6+dy,1,5);cx.fillStyle=c.fc;cx.fillRect(c.x+2,c.y-6+dy+wv,3,2)}
  }
}
const R=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)};
function txt(s,x,y,c,align='left',font=F8){cx.font=font;cx.textAlign=align;cx.textBaseline='top';cx.fillStyle='#05071a';cx.fillText(s,x+1,y+1);cx.fillStyle=c;cx.fillText(s,x,y)}
function pline(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;cx.fillStyle=c;
  for(let i=0;i<30;i++){cx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function along(path,t){const n=path.length-1,f=clamp(t*n,0,n-1e-6),i=Math.floor(f),u=f-i;return[lerp(path[i][0],path[i+1][0],u),lerp(path[i][1],path[i+1][1],u)]}
function pose(p,X,B){
  const m=rmOf(p),s=m*(p.hand==='bh'?-1:1),over=OVER.includes(p.stype);
  if(p.mood&&st==='point'&&p.swing===0&&!demo){
    if(p.mood>0)return{r:[X+m*2,B-21],free:[X-m*3,B-20],jump:(frame>>3)%2?2:0,tw:0};   /* comemora: braços para cima */
    return{r:[X+m*3,B-4],free:[X-1,B-14],jump:0,tw:0};                                  /* frustração: mão na cabeça */
  }
  if(p.swing>0){
    const t=1-p.swing/SW;
    if(over){
      const r=along([[X+m*2,B-19],[X+m*4,B-22],[X+m*1,B-18],[X-m*3,B-8]],t);
      return{r,free:[X-m*3,B-11+Math.round(t*3)],jump:p.stype==='smash'?Math.round(Math.sin(clamp(t*1.3,0,1)*Math.PI)*3):0,tw:t>.5?-m:0};
    }
    if(p.stype==='lob'||p.stype==='serve'||p.stype==='contra'){
      const r=along([[X+s*6,B-5],[X+s*4,B-6],[X+s*0,B-14],[X-s*2,B-17]],t);
      return{r,free:[X-s*4,B-8],jump:0,tw:t>.5?-s:0};
    }
    const r=along([[X+s*8,B-9],[X+s*4,B-10],[X-s*2,B-11],[X-s*5,B-15]],t);
    return{r,free:[X-s*4,B-9+(t>.5?-1:0)],jump:0,tw:t<.3?s:t>.6?-s:0};
  }
  if(p.charging||p.tossing){
    const c=p.tossing?1:p.charge;
    if(b.z>15&&st==='play')return{r:[X+m*2,B-18-Math.round(c*2)],free:[X-m*2,B-19],jump:0,tw:m};
    if(st==='serve')return{r:[X+s*(5+c*2),B-5],free:[X-s*1,p.tossing?B-9:B-14-Math.round(c*3)],jump:0,tw:0};
    return{r:[X+s*(5+Math.round(c*3)),B-9+Math.round(c)],free:[X-s*3,B-10],jump:0,tw:s};
  }
  if(p.ready)return{r:[X+m,B-9],free:[X-m*2,B-9],jump:0,tw:0};
  return{r:[X+m*4,B-10],free:[X-m*4,B-8],jump:0,tw:0};
}
function drawSprite(p,X,Y,overlay){
  const skin=p.skin||'#f2c18d',shoe=p.shoe||'#e8e8e8';
  if(p.dive>0){
    const d=p.diveDir||1,hr=(a,c2,y,h,col)=>R(Math.min(a,c2),y,Math.abs(c2-a)+1,h,col);
    R(X-8,Y,17,1,'rgba(4,10,40,.45)');
    hr(X-8*d,X-5*d,Y-2,1,skin);hr(X-10*d,X-9*d,Y-2,1,shoe);
    hr(X-4*d,X-3*d,Y-3,2,p.shorts);hr(X-2*d,X+2*d,Y-4,3,p.shirt);
    hr(X+3*d,X+5*d,Y-5,3,skin);if(p.hs!=='bald')hr(X+3*d,X+5*d,Y-5,1,p.hair);
    hr(X+2*d,X+6*d,Y-6,1,skin);hr(X+7*d,X+9*d,Y-8,3,'#1c1c2a');hr(X+8*d,X+8*d,Y-7,1,'#5fd3ff');
    return Y-8;
  }
  const run=p.moving&&p.swing===0,f=Math.floor(p.anim/4)%4;
  const crouch=(p.ready||p.charging)&&!run?1:0,lunge=p.lunge>0;
  const bob=run&&(f===1||f===3)?1:0;
  let B=Y+crouch-bob-((p.split>2&&p.split<7)?2:0);
  const ps=pose(p,X,B);B-=ps.jump;
  R(X-3,Y,7,1,'rgba(4,10,40,.45)');
  let lx=X-2,rx2=X+1,ll=0,rl=0;
  if(run){if(f===0){lx=X-3;ll=1}else if(f===2){rx2=X+2;rl=1}else{lx=X-1;rx2=X}}
  if(crouch||lunge){lx=X-3;rx2=X+2}
  if(lunge){if(b.x>p.x)rx2=X+3;else lx=X-4}
  const hip=B-4;
  for(const[x,lift]of[[lx,ll],[rx2,rl]]){const foot=Y-1-ps.jump-lift;R(x,hip,1,Math.max(1,foot-hip),skin);R(x-(x<X?1:0),foot,2,1,shoe)}
  const tw=ps.tw;
  R(X-3,B-6,6,2,p.shorts);
  R(X-3+tw,B-10,6,4,p.shirt);
  if(p.pat===1){for(const dx of[-2,0,2])R(X+dx+tw,B-10,1,4,p.shirt2)}
  else if(p.pat===2){for(let i=0;i<4;i++)R(X-3+tw+i+1,B-10+i,2,1,p.shirt2)}
  else if(p.pat===3)R(X-3+tw,B-10,6,1,p.shirt2);
  R(X-3+tw,B-7,6,1,'rgba(0,0,0,.18)');
  const hx=X-2+(tw?Math.sign(tw):0)*(p.swing>0?1:0);
  R(hx,B-14,4,4,skin);
  const hs=p.hs||'short';
  if(p.team===0){
    if(hs!=='bald')R(hx,B-14,4,3,p.hair);
    if(hs==='long')R(hx,B-11,4,2,p.hair);
    if(hs==='tail'){R(hx+1,B-11,2,1,p.hair);R(hx+1+(run&&f%2?1:0),B-10,1,2,p.hair)}
  }else{
    if(hs!=='bald')R(hx,B-14,4,1,p.hair);
    if(hs==='long'){R(hx-1,B-14,1,4,p.hair);R(hx+4,B-14,1,4,p.hair)}
    if(hs==='tail'){R(hx+4,B-13,1,1,p.hair);R(hx+5,B-12+(run&&f%2?1:0),1,2,p.hair)}
    R(hx+1,B-12,1,1,'#222');R(hx+3,B-12,1,1,'#222');
  }
  if(p.band)R(hx,B-13,4,1,p.band);
  if(p.acc===1)R(hx,B-13,4,1,p.accC);
  else if(p.acc===2){R(hx,B-14,4,1,p.accC);if(p.team===1)R(hx-1,B-13,6,1,p.accC)}
  const[rX,rY]=ps.r,shR=rX>=X?X+3+tw:X-4+tw,shF=shR>X?X-4+tw:X+3+tw;
  pline(shF,B-10,ps.free[0],ps.free[1],skin);
  const hxr=rX+(rX>X?-1:1),hyr=rY+2;
  pline(shR,B-10,hxr,hyr,skin);
  R(rX-1,rY-2,3,4,p.rktC||'#1c1c2a');R(rX,rY-1,1,2,'#5fd3ff');R(hxr,hyr,1,1,'#c9c9c9');
  if(p.acc===3)R(hxr,hyr-1,1,1,p.accC);
  if(!overlay)return B;
  if(p.swing>0&&p.swing>SW*.45){const t=1-p.swing/SW;cx.fillStyle='rgba(255,255,255,.35)';const tr=along(OVER.includes(p.stype)?[[X,B-21],[X,B-18],[X,B-10]]:[[X+12,B-9],[X+4,B-10],[X-4,B-12]],Math.max(0,t-.15));cx.fillRect(Math.round(tr[0]),Math.round(tr[1]),2,1)}
  return B;
}
function drawPlayer(p){
  const[sx,sy]=proj(p.x,p.y,0),X=Math.round(sx),Y=Math.round(sy);
  const B=drawSprite(p,X,Y,true);
  if(isHuman(p)){
    const mc=p===P[0]?ACC:BLU;
    if(p.charging&&save.opts.timing!==false&&st==='play'&&canHit(p)){const ri=reachInfo(p,1),a=attrOf(p),dxx=Math.abs(b.x-p.x),dyy=depthOf(p),qq=clamp((1-clamp(Math.abs(dxx-5)/(8+.5*a.pre),0,1))*.4+(1-clamp(Math.abs(dyy+1)/8,0,1))*.6,0,1);R(X-5,Y+4,11,2,'#05071a');R(X-4,Y+4,9,1,ri!==1?'#3a3f6a':qq>.8?GRN:qq>.55?ACC:RED)}
    if(p.charging){const pw=(.25+.75*p.charge)*(.75+.25*p.stam),w=Math.round(12*pw);R(X-7,B-21,14,4,'#05071a');R(X-6,B-20,w,2,pw<.55?GRN:pw<.85?ACC:RED)}
    else if(st==='serve'&&server===p&&!toss){if(Math.floor(frame/16)%2)txt('SAQUE',clamp(X,24,136),B-27,mc,'center')}
    else if(st==='chase'&&chase&&chase.p===p){if(chase.ready?Math.floor(frame/5)%2:Math.floor(frame/14)%2)txt(chase.ready?'A!':'CORRE',clamp(X,24,136),B-27,chase.ready?RED:mc,'center')}
    else{const bb=Math.floor(frame/10)%2;R(X-1,B-19+bb,3,1,mc);R(X,B-18+bb,1,1,mc)}
    if(p.stam<.95){R(X-5,Y+2,10,1,'#05071a');R(X-5,Y+2,Math.round(10*p.stam),1,p.stam<.35?RED:p.stam<.65?ACC:GRN)}
  }
  if(!demo&&st==='serve'&&timer<110&&games[0]+games[1]===0&&pts[0]+pts[1]===0&&p.first)txt(p.first,clamp(X,24,136),Y+3,p.team===0?WHITE:MUT,'center');
  if(p.lblT>0&&!demo&&!(st==='serve'&&server===p&&isHuman(p)&&!p.lbl)){const lx=clamp(X,34,126);txt(p.lbl,lx,B-31,p.team===0?ACC:WHITE,'center')}
}
function drawNet(){
  const[nx,ny0]=proj(0,NET,0),ny=Math.round(ny0),h=Math.round(NETH*zs(NET)),top=ny-h,x0=Math.round(nx)-2,w=CW-2*x0;
  cx.fillStyle='rgba(8,12,34,.5)';cx.fillRect(x0,top,w,h);
  for(let x=0;x<w;x+=2)R(x0+x,top,1,h,'rgba(200,215,255,.2)');
  for(let y=2;y<h;y+=2)R(x0,top+y,w,1,'rgba(200,215,255,.2)');
  R(x0,top,w,1,WHITE);R(x0-2,top-1,2,h+1,'#c7cbe0');R(x0+w,top-1,2,h+1,'#c7cbe0');
}
function drawBall(){
  const[sx,sy]=proj(b.x,b.y,b.z),X=Math.round(sx)-1,Y=Math.round(sy)-2;
  if(Y<33){const bob=Math.floor(frame/6)%2;R(clamp(X,2,156),34+bob,3,1,ACC);R(clamp(X,2,156)+1,33+bob,1,1,ACC);return}
  if(st==='play'&&b.trail&&b.trail.length>2&&!b.serving){
    const w=b.w||0,col=w>.25?'255,122,61':w<-.25?'95,211,255':'255,255,255',al=Math.abs(w)>.25?.75:.3;
    for(let i=1;i<b.trail.length;i++){const t=b.trail[i],[tx,ty]=proj(t.x,t.y,t.z);cx.fillStyle=`rgba(${col},${al*(1-i/b.trail.length)})`;cx.fillRect(Math.round(tx)-(i<3?1:0),Math.round(ty)-2+(i<3?0:1),i<3?2:1,i<3?2:1)}
  }
  R(X,Y,3,3,'#dfff3a');R(X,Y,1,1,'#ffffff');R(X+2,Y+2,1,1,'#93ab12');
  /* anel: bola na altura do golpe por cima e ao alcance */
  const h=P[0];if(st==='play'&&isHuman(h)&&canHit(h)&&b.z>16&&reachInfo(h,1.3)===1&&Math.floor(frame/5)%2){cx.strokeStyle=ACC;cx.lineWidth=1;cx.strokeRect(X-2.5,Y-2.5,8,8)}
}
function drawWorld(){
  for(const d of parts){const[px,py]=proj(d.x,d.y,(14-d.t)*.25);cx.fillStyle=`rgba(210,225,255,${d.t/28})`;cx.fillRect(Math.round(px),Math.round(py),1,1)}
  if(marker&&st==='play'&&b.bounces===0&&Math.floor(frame/6)%2){const[mx,my]=proj(marker.x,marker.y,0),X=Math.round(mx),Y=Math.round(my);R(X-2,Y-1,1,1,ACC);R(X+2,Y-1,1,1,ACC);R(X-1,Y,3,1,ACC);R(X-2,Y+1,1,1,ACC);R(X+2,Y+1,1,1,ACC);R(X,Y-1,1,3,ACC)}
  if(!b.out||b.z>-5){const[sx,sy]=proj(b.x,b.y,0);if(b.x>=-2&&b.x<=102&&b.y>=-2&&b.y<=202){const sw=b.z<3?5:b.z<10?4:3;cx.fillStyle=`rgba(0,0,20,${clamp(.7-b.z*.014,.25,.7).toFixed(2)})`;cx.fillRect(Math.round(sx-sw/2),Math.round(sy),sw,1)}}
  for(const h of P)if(isHuman(h)&&h.charging&&st==='play'&&h===P[0]){const C=h.ctrl.cur,lv=aimLevel(h.aim||0),ty=h.team===0?(C.down?18:C.up?78:40):(C.down?182:C.up?122:160),[ax,ay]=proj(AIM_X[lv],ty,0);if(Math.floor(frame/6)%2){const X=Math.round(ax),Y=Math.round(ay);R(X-2,Y,5,1,ACC);R(X,Y-1,1,3,ACC)}}
  const items=P.filter(p=>!p.hidden).map(p=>({y:p.y,f:()=>drawPlayer(p)}));
  if(kind==='train'&&!demo)items.push({y:4,f:drawMachine});
  items.push({y:NET,f:drawNet},{y:b.y+.01,f:drawBall});
  items.sort((a,c)=>a.y-c.y).forEach(i=>i.f());
  if(flash){const[fx,fy]=proj(flash.x,flash.y,flash.z),X=Math.round(fx),Y=Math.round(fy)-1,r=flash.t>3?2:1;R(X-r,Y,2*r+1,1,'#ffffff');R(X,Y-r,1,2*r+1,'#ffffff')}
}
function drawHUD(){
  if(kind==='train'){drawTrainHUD();return}
  R(0,0,CW,31,NAVY);R(0,31,CW,1,'#2b3470');
  const lab=ptsLabels();
  const row=(y,t)=>{
    txt(teamName(t).slice(0,bo3?8:9),4,y,t===0?P[0].shirt:P[2].shirt);if(bo3)txt(String(sets[t]),70,y,MUT);
    if(serveTeam===t)R(80,y+2,3,3,'#dfff3a');
    R(87,y-2,13,11,'#1b2350');txt(String(games[t]),90,y,WHITE);
    txt(lab[t],106,y,ACC);
  };
  row(7,0);row(19,1);
  txt('P:'+partnerMode[0][0],CW-4,7,P[1].lblT>0?ACC:MUT,'right');
  if(kind==='2p')txt('P:'+partnerMode[1][0],CW-4,19,P[2].lblT>0?ACC:MUT,'right');
}
function banner(a,c,ac=ACC){
  const y=130;cx.fillStyle='rgba(13,19,51,.92)';cx.fillRect(10,y,140,36);
  R(10,y,140,1,ac);R(10,y+35,140,1,ac);
  txt(a,80,y+8,ac,'center');if(c)txt(c,80,y+21,WHITE,'center');
}
function dim(a=.72){cx.fillStyle=`rgba(8,10,30,${a})`;cx.fillRect(0,0,CW,CH)}
function menuList(items,y0,gap,sel){items.forEach((s,i)=>{const on=i===sel;txt(s,80,y0+i*gap,on?ACC:WHITE,'center');if(on&&Math.floor(frame/16)%2){txt('>',16,y0+i*gap,ACC);txt('<',144,y0+i*gap,ACC)}})}
const TROPHY=["..XXXXXXXXXXXX..","XXXYYYYYYYYYYXXX","X.XYWYYYYYYYYX.X","X.XYWYYYYYYYYX.X","X.XYWYYYYYYYYX.X",".XXYYYYYYYYYYXX.","...XYYYYYYYYX...","....XYYYYYYX....",".....XYYYYX.....","......XYYX......","......XYYX......",".....XYYYYX.....","....XXXXXXXX....","....XBBBBBBX....","....XBWBBBBX....","....XXXXXXXX...."];
const TCOL={X:'#7a4a00',Y:'#ffd23f',W:'#fff6c0',B:'#6b3e1f'};
function drawTrophy(cxp,cyp,sc){TROPHY.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.')R(cxp-8*sc+i*sc,cyp+j*sc,sc,sc,TCOL[ch])}))}
const preview={team:0,homeX:50,x:0,y:0,swing:0,stype:'drive',moving:true,anim:0,charging:false,charge:0,hand:'fh',lunge:0,ready:false,lefty:false,shorts:'#f4f4f4',band:null};
function render(){
  if(shake>0&&mode==='game'&&!paused){R(0,0,CW,CH,NAVY);cx.save();cx.translate(Math.round(rnd(-2,2)),Math.round(rnd(-2,2)));renderInner();cx.restore()}else renderInner();
}
function renderInner(){
  if(mode==='boot'){drawBoot();return}
  if(mode==='intro'){drawIntro();return}
  cx.drawImage(getBg(),0,0);
  drawCrowd();
  cx.drawImage(getCourt(),0,0);
  if(mode==='setup'){drawWorld();drawSetup();return}
  if(mode==='title'){
    drawWorld();dim(.62);
    cx.font=F16;cx.textAlign='center';cx.textBaseline='top';
    cx.fillStyle='#ef3e36';cx.fillText('PADEL',82,44);cx.fillStyle=WHITE;cx.fillText('PADEL',80,42);
    txt('ADVANCE',80,64,ACC,'center');
    menuList(TITLE_ITEMS(),88,15,cur);
    txt(save.me.name?save.me.name:'CRIE SEU ATLETA',80,196,save.me.name?WHITE:ACC,'center');
    if(car)txt('TEMP '+car.season+' SEM '+(car.week+1)+' #'+myRank(),80,212,MUT,'center');
    if(Math.floor(frame/28)%2)txt('A ESCOLHE',80,250,ACC,'center');
    return;
  }
  if(mode==='bracket'){
    dim(.8);const t=save.tour,r=t.round,ids=t.rounds[r],me=ids.indexOf(-1),o=ids[me^1];
    txt('TEMPORADA '+t.season,80,40,MUT,'center');
    txt(RN[r],80,54,ACC,'center',F16);
    const n=ids.length/2,gap=n>4?13:n>2?20:28,y0=n>4?82:n>2?96:120;
    for(let i=0;i<n;i++){const a=ids[2*i],c=ids[2*i+1],mine=a===-1||c===-1,col=mine?ACC:MUT,y=y0+i*gap;
      txt(nameOf(a),72,y,mine&&a===-1?ACC:col,'right');txt('x',80,y,col,'center');txt(nameOf(c),88,y,mine&&c===-1?ACC:col)}
    txt('ADVERSARIOS',80,188,MUT,'center');txt(PAIRS[o].p[0][0],80,200,WHITE,'center');txt(PAIRS[o].p[1][0],80,212,WHITE,'center');txt(STY[PAIRS[o].s].n,80,224,MUT,'center');
    const lv=Math.round(lvlOf(o,t.season));for(let i=0;i<4;i++)R(62+i*10,238,7,4,i<=lv?RED:'#2b3470');
    if(Math.floor(frame/28)%2)txt('A JOGAR',80,252,ACC,'center');txt('B MENU',80,266,MUT,'center');
    return;
  }
  if(mode==='friendly'){
    dim(.8);const pr=PAIRS[friendly.pair];
    txt('AMISTOSO',80,50,ACC,'center',F16);
    const a=friendly.ath??-1,an=a>=0&&save.slots[a]?save.slots[a].prof.me.name:'PADRAO';
    const rows=[['DUPLA',pr.n,76],['NIVEL',['FACIL','MEDIO','DIFICIL'][friendly.lvl],140],['SEU ATLETA',an,180]];
    rows.forEach(([l,v,y],i)=>{const on=cur===i;txt(l,80,y,on?ACC:MUT,'center');txt((on?'< ':'')+v+(on?' >':''),80,y+14,WHITE,'center')});
    txt(pr.p[0][0],80,104,WHITE,'center');txt(pr.p[1][0],80,116,WHITE,'center');txt(STY[pr.s].n,80,128,MUT,'center');
    if(friendly.lvl===0)txt('COM MARCA DE QUIQUE',80,212,MUT,'center');
    if(Math.floor(frame/28)%2)txt('A JOGAR',80,240,ACC,'center');txt('B VOLTAR',80,256,MUT,'center');
    return;
  }
  if(mode==='twop'){
    dim(.82);txt('2 JOGADORES',80,46,ACC,'center');
    const L1=['J1','WASD  MOVE','F=A  G=B  Q=PARC'],L2=['J2  AZUL','SETAS  MOVE','L=A  K=B  P=PARC'];
    L1.forEach((s,i)=>txt(s,80,74+i*13,i?WHITE:SHIRTS[save.me.shirt],'center'));
    L2.forEach((s,i)=>txt(s,80,132+i*13,i?WHITE:BLU,'center'));
    txt('SO NO TECLADO',80,190,MUT,'center');txt('ENTER PAUSA',80,204,MUT,'center');
    if(Math.floor(frame/28)%2)txt('A COMECAR',80,240,ACC,'center');txt('B VOLTAR',80,256,MUT,'center');
    return;
  }
  if(mode==='player'){
    dim(.82);txt('EVOLUCAO',80,40,ACC,'center',F16);
    txt('XP: '+save.xp,80,66,save.xp?ACC:MUT,'center');
    ATTR.forEach(([k,l],i)=>{const y=90+i*24,on=cur===i,v=save.attr[k];txt(l,8,y,on?ACC:WHITE);for(let j=0;j<8;j++)R(100+j*7,y,5,7,j<v?(on?ACC:GRN):'#2b3470');
      txt(v<8?'CUSTO '+v+' XP':'MAXIMO',100,y+10,on?(save.xp>=v&&v<8?GRN:MUT):'#4a4a7a')});
    txt(ATTR[cur][2],80,190,MUT,'center');
    txt('TITULOS '+save.titles+'  VIT '+save.wins,80,212,MUT,'center');
    txt('A EVOLUI',80,240,save.xp?ACC:MUT,'center');txt('B VOLTA',80,256,MUT,'center');
    return;
  }
  if(mode==='career'){dim(.86);drawCareerHub();return}
  if(mode==='school'){drawSchool();return}
  if(mode==='chal'){dim(.88);drawChal();return}
  if(mode==='backup'){dim(.9);drawBackup();return}
  if(mode==='cmenu'){dim(.88);drawCMenu();return}
  if(mode==='csponsor'){dim(.92);drawCSponsor();return}
  if(mode==='cretire'){dim(.92);drawCRetire();return}
  if(mode==='cslots'){dim(.9);drawSlots();return}
  if(mode==='cattr'){dim(.9);drawCAttr();return}
  if(mode==='cevo'){dim(.9);drawCEvo();return}
  if(mode==='cmore'){dim(.9);drawCMore();return}
  if(mode==='cnews'){dim(.92);drawCNews();return}
  if(mode==='ctroph'){dim(.92);drawCTroph();return}
  if(mode==='cstats'){dim(.92);drawCStats();return}
  if(mode==='ctour'){dim(.86);drawCTour();return}
  if(mode==='cdone'){dim(.86);drawCDone();return}
  if(mode==='crank'){dim(.9);drawCRank();return}
  if(mode==='ccal'){dim(.92);drawCCal();return}
  if(mode==='cint'){dim(.92);drawCInt();return}
  if(mode==='cfly'){R(0,0,CW,CH,NAVY);drawFly();return}
  if(mode==='cpartner'){dim(.9);drawCPartner();return}
  if(mode==='cteam'){dim(.9);drawCTeam();return}
  if(mode==='cseason'){dim(.9);drawCSeason();return}
  if(mode==='options'){
    dim(.82);txt('OPCOES',80,40,ACC,'center',F16);const o=save.opts;
    const rows=[['QUADRA',COURTS[o.court].n],['CAMERA',CAMS[o.cam].n],['40-40',o.golden?'OURO':'VANTAGEM'],['QUIQUE',o.marker?'MARCA':'NAO'],['BOTOES',BTNS[o.btn][0]],['SOM',o.sound?'SIM':'NAO'],['TELA',o.full?'CHEIA':'GBA'],['MUSICA',o.music?'SIM':'NAO'],['DICAS',o.tips?'SIM':'NAO'],['BACKUP','>'],['TEMPO GOLPE',o.timing!==false?'SIM':'NAO']];
    rows.forEach(([l,v],i)=>{const y=58+i*15,on=cur===i;txt(l,10,y,on?ACC:WHITE);txt(v,150,y,on?ACC:MUT,'right');
      if(on&&Math.floor(frame/16)%2)txt('<',150-v.length*8-12,y,ACC)});
    txt('CAMISA E VISUAL',80,232,MUT,'center');txt('EM PERSONAGEM',80,242,MUT,'center');
    txt('B VOLTAR',80,264,MUT,'center');
    return;
  }
  if(mode==='create'){
    dim(.84);const me=save.me;
    txt(cpage===0?'ATLETA':'DUPLA',80,34,ACC,'center',F16);txt(cpage===0?'1/2':'2/2',150,38,MUT,'right');
    const rows=cpage===0?[['NOME',me.name||'---'],['LADO',SIDE_N[me.side]],['MAO',HAND_N[me.lefty]],['ESTILO',STYLE_N[me.style]],['CABELO',HS_N[me.hs]],['COR CAB.',null,HAIRS[me.hair]],['PELE',null,SKINS[me.skin]],['ACESSOR.',ACC_N[me.acc]],['COR ACES.',null,ACCS[me.accC]],['TENIS',null,SHOES[me.shoe]],['RAQUETE',null,RKTC[me.rkt]],['DUPLA >','']]
      :[['NOME',me.team||'---'],['COR 1',null,SHIRTS[me.shirt]],['COR 2',null,KIT2[me.c2]],['ESTAMPA',PAT_N[me.pat]],['PRONTO','']];
    const gap=cpage===0?12:16,y0=cpage===0?56:70;
    rows.forEach(([l,v,sw],i)=>{const y=y0+i*gap,on=cur===i;txt(l,8,y,on?ACC:WHITE);
      if(sw){R(126,y-1,24,9,'#05071a');R(127,y,22,7,sw)}else if(v)txt(v,152,y,on?ACC:MUT,'right');
      const editable=cpage===0?(i>0&&i<11):(i>0&&i<4);
      if(on&&editable&&Math.floor(frame/16)%2)txt('<',sw?112:152-v.length*8-12,y,ACC)});
    const pv=(team,X,Y,w)=>{Object.assign(preview,{team,shirt:SHIRTS[me.shirt],shirt2:KIT2[me.c2],pat:me.pat,shorts:KIT2[me.c2]===SHIRTS[me.shirt]?'#f4f4f4':KIT2[me.c2],hair:HAIRS[me.hair],skin:SKINS[me.skin],hs:HS[me.hs],acc:me.acc,accC:ACCS[me.accC],shoe:SHOES[me.shoe],rktC:RKTC[me.rkt],lefty:!!me.lefty,moving:true,anim:frame>>1});
      const off=document.createElement('canvas');off.width=24;off.height=26;const s_=cx;cx=off.getContext('2d');drawSprite(preview,12,22,false);cx=s_;cx.drawImage(off,X-w/2,Y,w,w*26/24)};
    if(cpage===0){pv(1,56,204,40);pv(0,104,204,40)}
    else{pv(1,52,158,56);pv(1,108,158,56);txt(me.team||(me.name||'VOCE'),80,224,WHITE,'center');txt('VOCE E PARCEIRO',80,236,MUT,'center')}
    const ed=cpage===0?(cur>0&&cur<11):(cur>0&&cur<4);
    txt(ed?'< > MUDA':cur===0?'A EDITA NOME':cpage===0?'A PROXIMO':'A CONFIRMA',80,256,ACC,'center');txt('B VOLTA',80,270,MUT,'center');
    return;
  }
  if(mode==='name'){
    dim(.86);txt(nameTarget==='team'?'NOME DUPLA':'SEU NOME',80,40,ACC,'center',F16);
    R(24,70,112,16,'#05071a');txt(nameBuf+(Math.floor(frame/16)%2&&nameBuf.length<nameMax()?'_':''),30,74,WHITE);
    for(let i=0;i<28;i++){const c=i%7,r=(i/7)|0,x=17+c*18,y=104+r*20,on=i===nameCur,ch=NAMEGRID[i];
      if(on)R(x-3,y-4,16,16,'#2b3470');txt(ch===' '?'_':ch==='<'?'<-':ch,x+(ch==='<'?-3:0),y,on?ACC:WHITE)}
    const on=nameCur===28;if(on)R(56,186,48,16,'#2b3470');txt('OK',80,190,on?ACC:WHITE,'center');
    txt('ATE '+nameMax()+' LETRAS',80,222,MUT,'center');txt('TECLADO OU A',80,240,MUT,'center');txt('START CONFIRMA',80,254,MUT,'center');
    return;
  }
  drawWorld();
  if(mode==='game'||mode==='result'||mode==='champion')drawHUD();
  if(mode==='result'){
    dim(.78);const win=twoP?true:resultW===0;
    txt(twoP?'FIM DE JOGO':win?'VITORIA!':'DERROTA',80,70,win?ACC:RED,'center',F16);
    if(kind==='car'&&oppPair)txt('x '+oppPair.n,80,88,MUT,'center');
    txt(bo3?sets[0]+' - '+sets[1]:games[0]+' - '+games[1],80,100,WHITE,'center',F16);if(bo3)txt('SETS',80,120,MUT,'center');
    if(mst&&kind!=='2p'&&kind!=='train'&&mst.sv+mst.win+mst.err>0){txt('WINNERS '+mst.win+'  ERROS '+mst.err,80,198,MUT,'center');if(mst.sv)txt('1o SAQUE '+Math.round(mst.svIn/mst.sv*100)+'%',80,210,MUT,'center')}
    resLines.forEach((s,i)=>txt(s,80,144+i*14,i===resLines.length-1&&s.startsWith('+')?GRN:WHITE,'center'));
    if(Math.floor(frame/28)%2)txt('A CONTINUA',80,240,ACC,'center');
    return;
  }
  if(mode==='champion'){
    dim(.82);
    const bob=Math.round(Math.sin(frame*.08)*2);drawTrophy(80,70+bob,3);
    for(let i=0;i<6;i++){const a=frame*.05+i*1.05,r=44+Math.sin(frame*.1+i)*4;if((frame+i*5)%20<12)R(80+Math.cos(a)*r,94+Math.sin(a)*r*.8,1,1,i%2?ACC:WHITE)}
    txt('CAMPEOES!',80,140,ACC,'center',F16);
    txt('TEMPORADA '+(save.season-1),80,166,WHITE,'center');txt('TITULOS: '+save.titles,80,180,MUT,'center');txt('+5 PONTOS',80,196,GRN,'center');
    if(Math.floor(frame/28)%2)txt('A CONTINUA',80,240,ACC,'center');
    return;
  }
  if(st==='replay'){
    R(0,32,CW,14,'#000');R(0,CH-8,CW,8,'#000');
    if(Math.floor(frame/20)%2)R(6,36,4,4,RED);txt('REPLAY',14,35,WHITE);
    txt('A PULA',CW-6,35,MUT,'right');
  }
  if(paused){
    const y=98;cx.fillStyle='rgba(13,19,51,.95)';cx.fillRect(14,y,132,118);R(14,y,132,1,ACC);R(14,y+117,132,1,ACC);
    txt('PAUSA',80,y+8,ACC,'center');
    ['CONTINUAR','CAM: '+CAMS[save.opts.cam].n,'SOM: '+(save.opts.sound?'SIM':'NAO'),'TELA: '+(save.opts.full?'CHEIA':'GBA'),'SAIR'].forEach((s,i)=>txt((i===pauseCur?'> ':'  ')+s,20,y+28+i*16,i===pauseCur?ACC:WHITE));
  }else if(st==='point'&&msg==='TROCA DE LADO')drawChangeEnds();
  else if(st==='point')banner(msg,sub,msg==='WINNER!'||msg.startsWith('POR')||msg==='NA FITA!'||msg.startsWith('GAME')?ACC:msg==='PONTO DELES'?RED:ACC);
  else if(st==='serve'&&timer<50&&pts[0]+pts[1]===0&&!faults)banner(bo3&&games[0]+games[1]===0&&sets[0]+sets[1]===0?'GRANDE FINAL':'SAQUE '+teamName(serveTeam),bo3&&games[0]+games[1]===0&&sets[0]+sets[1]===0?'MELHOR DE 3':'GAMES '+games[0]+'-'+games[1]);
  if(exclaim&&st==='point'&&!paused&&msg!=='TROCA DE LADO'){const a=exclaim;cx.font=F16;txt(a.s,80,104,a.t%8<4?ACC:WHITE,'center',F16)}
  if(mode==='game'&&!paused)drawTip();
}
