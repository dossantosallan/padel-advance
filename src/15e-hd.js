/* ---------- 16 bits ----------
   Tudo aqui desenha em pixels físicos (320x576). Os caches de quadra/arena/torcida são canvases 320x576;
   bonecos, bola, rede e placar são desenhados a cada quadro dentro de hi(). */
const HW=CW*2,HH=CH*2;
const hdMk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(g)g.imageSmoothingEnabled=false;return[c,g]};
const P2=(x,y,z)=>{const p=proj(x,y,z);return[p[0]*2,p[1]*2]};
const yAt2=sy=>yAt(sy/2);
const SHC={};
function shd(c,k){if(!c||c[0]!=='#')return c;const key=c+k;let v=SHC[key];if(!v){const a=hex(c),t=k>0?255:0,f=Math.abs(k);v='#'+a.map(q=>Math.round(q+(t-q)*f).toString(16).padStart(2,'0')).join('');SHC[key]=v}return v}
const hdHash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
/* desenho em contexto qualquer */
function gR(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function gPoly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}g.fillStyle=c;
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){const yc=y+.5,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b2=pts[(i+1)%pts.length];if((a[1]<=yc&&b2[1]>yc)||(b2[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b2[1]-a[1])*(b2[0]-a[0]))}
    xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const xa=Math.round(xs[i]),xb=Math.round(xs[i+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function gLine(g,a,b2,c){let x0=Math.round(a[0]),y0=Math.round(a[1]);const x1=Math.round(b2[0]),y1=Math.round(b2[1]),dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;g.fillStyle=c;
  for(let n=0;n<2000;n++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function gEll(g,x0,y0,rx,ry,c){g.fillStyle=c;for(let y=-Math.ceil(ry);y<=Math.ceil(ry);y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));if(w>0)g.fillRect(Math.round(x0-w),Math.round(y0+y),w*2,1)}}

/* ---------- arena ---------- */
const ADS=[['#d8241e','#ffffff','PADEL'],['#1b2a6a','#ffd23f','ADVANCE'],['#108a50','#ffffff','AURORA'],['#f2f2f2','#1b2350','NOVA ONDA'],['#ff8a1c','#1b1b1b','RAIZ'],['#2e86ff','#ffffff','FAROL'],['#1b1b2a','#7fd0ff','VOLTA'],['#ffd23f','#1b1b2a','ALTITUDE']];
function hdLed(g,y,x0,x1,h,seed){gR(g,x0-2,y-2,x1-x0+4,h+4,'#05060c');let i=seed||0;
  for(let x=x0;x<x1;x+=52,i++){const a=ADS[i%ADS.length],w=Math.min(52,x1-x);gR(g,x,y,w,h,a[0]);gR(g,x,y,w,1,shd(a[0],.35));gR(g,x,y+h-1,w,1,shd(a[0],-.3));gR(g,x+w-1,y,1,h,'rgba(0,0,0,.4)');
    if(w>22){g.font='bold 7px monospace';g.fillStyle=a[1];g.textAlign='center';g.textBaseline='middle';g.fillText(a[2],x+w/2,y+h/2+.5)}
    for(let k=x;k<x+w;k+=2)gR(g,k,y+h-2,1,1,'rgba(0,0,0,.18)')}}
function buildBgHD(C){
  const[c,g]=hdMk(HW,HH),T=CAM.oy*2,Bt=(CAM.oy+CAM.h)*2,aer=CAM===CAMS[0];
  const o1=C.out,o2=C.out2,o3=shd(C.out2,.06);
  for(let y=0;y<HH;y++)for(let x=0;x<HW;x+=2){const r=hdHash(x,y);gR(g,x,y,2,1,r<.15?o1:r>.9?o3:o2)}
  if(C.roof){gR(g,0,0,HW,70,'#0a080e');for(const y of[20,46]){gR(g,0,y,HW,4,'#2a2433');gR(g,0,y,HW,1,'#3a3444');for(let x=24;x<HW;x+=64){gR(g,x,y+4,22,4,'#fff2c0');gR(g,x,y+4,22,1,'#ffffff');gR(g,x-12,y+8,46,22,'rgba(255,242,192,.07)')}}}
  if(C.beach){for(let y=60;y<HH;y+=13)for(let x=(y*3)%23;x<HW;x+=23){gR(g,x,y,8,1,'#2a6a8a');gR(g,x+2,y-1,4,1,'#3a7a9a')}gR(g,0,HH-8,HW,8,'#f4e2b0');gR(g,0,HH-8,HW,1,'#ffffff')}
  /* degraus das arquibancadas laterais */
  for(let sy=T;sy<Bt;sy++){const xl=Math.round(P2(0,yAt2(sy+.5),0)[0])-12;if(xl<6)continue;const k=(sy-T)%11;
    const col=k>=8?'#2a3058':k===7?'#3a4278':null;if(col){gR(g,0,sy,xl,1,col);gR(g,HW-xl,sy,xl,1,col)}
    gR(g,xl,sy,2,1,'rgba(255,255,255,.1)');gR(g,HW-xl-2,sy,2,1,'rgba(255,255,255,.1)')}
  if(!aer){const tp=Math.round(P2(0,0,40)[1]);for(let sy=70;sy<tp;sy++){const k=(sy-70)%10;if(k>=7)gR(g,0,sy,HW,1,k===7?'#3a4278':'#2a3058')}}
  /* painéis de LED */
  if(aer){const tx=P2(0,0,0)[0],bx=P2(0,L,0)[0];hdLed(g,T-12,tx-14,HW-tx+14,7,0);hdLed(g,Bt+8,bx-18,HW-bx+18,9,3)}
  else{const bx=P2(0,L,0)[0];hdLed(g,Bt+6,Math.max(4,bx-10),HW-Math.max(4,bx-10),10,1)}
  /* bancos das duplas e cadeira do árbitro */
  if(aer){const[nxl,ny0]=P2(0,NET,0),ny=Math.round(ny0),xl=Math.round(nxl);
    for(const[dy,col]of[[-34,'#2e86ff'],[12,'#ef3e36']]){gR(g,xl-26,ny+dy,7,22,'#6b4423');gR(g,xl-26,ny+dy,2,22,'#9a6a3a');gR(g,xl-20,ny+dy,1,22,'#4a2a14');
      gR(g,xl-28,ny+dy+3,5,5,col);gR(g,xl-28,ny+dy+3,5,1,shd(col,.4));gR(g,xl-28,ny+dy+12,5,7,'#f4f4f4');gR(g,xl-28,ny+dy+12,1,7,'#d0d0d8');
      gR(g,xl-17,ny+dy+2,2,5,'#7fd0ff');gR(g,xl-17,ny+dy+2,2,1,'#ffffff');gR(g,xl-17,ny+dy+14,2,5,'#ffd23f')}
    const ux=HW-xl+12;gR(g,ux+2,ny+6,2,14,'#3a3f55');gR(g,ux+12,ny+6,2,14,'#3a3f55');gR(g,ux,ny,16,8,'#4a5068');gR(g,ux,ny,16,1,'#8a90a8');gR(g,ux+1,ny-10,14,10,'#2a3a6a');
    gR(g,ux+3,ny-12,10,9,'#1b2350');gR(g,ux+5,ny-20,7,8,'#e0b088');gR(g,ux+5,ny-21,7,3,'#3b2416');gR(g,ux+11,ny-18,1,5,'#c08060');gR(g,ux+1,ny-10,3,6,'#e0b088');gR(g,ux+13,ny-8,4,2,'#ffffff')}
  for(let i=0;i<14;i++){g.fillStyle=`rgba(0,0,0,${(.06*(14-i)/14).toFixed(3)})`;g.fillRect(0,i*3,HW,3);g.fillRect(0,HH-(i+1)*3,HW,3)}
  return c;
}
/* ---------- quadra ---------- */
function buildCourtHD(C){
  const[c,g]=hdMk(HW,HH),T=CAM.oy*2,Bt=(CAM.oy+CAM.h)*2,back3d=CAM===CAMS[1];
  const lampW=C.night?[[-8,-4],[108,-4],[-8,100],[108,100],[-8,204],[108,204]]:[];
  const lamps=lampW.map(([x,y])=>proj(x,y,0));
  const light=(x,y)=>{let f=0;for(const[lx,ly]of lamps){const d2=(x-lx)**2+(y-ly)**2;f+=Math.exp(-d2/(2*46*46))}return clamp(f,0,1)};
  const zone=y=>{const yd=Math.min(y,L-y);return yd<40?'glass':(yd>=50&&yd<=70)?'door':C.pano?'glass':'fence'};
  const sun=!C.night&&!C.roof,turf=C.turf,beach=!!C.beach;
  const TL=[];for(let i=0;i<=12;i++)TL.push(shd(turf,i/100));const TD=[];for(let i=0;i<=20;i++)TD.push(shd(turf,-i/100));
  const tcol=k=>k>=0?TL[Math.min(12,Math.round(k*100))]:TD[Math.min(20,Math.round(-k*100))];
  const NL=[];for(let i=0;i<=16;i++)NL.push(mix(C.dark||C.turf,C.turf,i/16).replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,a,b2,cc)=>'#'+[a,b2,cc].map(v=>(+v).toString(16).padStart(2,'0')).join('')));
  for(let sy=T;sy<Bt;sy++){
    const y=yAt2(sy+.5),xl=Math.round(P2(0,y,0)[0]),xr=HW-xl,yd=Math.min(y,L-y);
    for(let x=xl;x<xr;x++){
      const dx=Math.min(x-xl,xr-x-1),ao=(dx<12?(12-dx)*.016:0)+(yd<5?(5-yd)*.035:0);
      let col;
      if(C.night){col=NL[Math.round(light(x/2,sy/2)*16)];if(dx<10)col=shd(col,-(10-dx)*.012)}
      else{const cen=(C.roof?.04:.08)*(1-((x-160)/140)**2)*(1-Math.abs(y-100)/160);col=tcol(cen-ao)}
      const r=hdHash(x,sy);
      if(beach){if(r<.25)col=shd(col,-.06);else if(r>.85)col=shd(col,.07)}
      else if(r<.16)col=shd(col,-.07);else if(r>.988)col=shd(col,.06);else if(r>.6&&r<.604)col=mix(col[0]==='#'?col:'#888888','#f4ead0',.22);
      g.fillStyle=col;g.fillRect(x,sy,1,1);
    }
    const z=zone(y);
    if(sun){if(z==='glass'){gR(g,xl,sy,12,1,'rgba(0,10,40,.11)');gR(g,xl+12,sy,5,1,'rgba(0,10,40,.05)')}
      else if(z==='fence'){g.fillStyle='rgba(0,10,40,.08)';for(let i=0;i<10;i++)if((i+sy)%3)g.fillRect(xl+i,sy,1,1)}
      if(yd<10&&y<NET)gR(g,xl,sy,xr-xl,1,`rgba(0,10,40,${(.1*(10-yd)/10).toFixed(3)})`)}
    if(back3d)continue;
    for(const[wx,s0]of[[xl-7,1],[xr,-1]]){const o=s0>0?0:6,inn=s0>0?6:0;
      if(z==='glass'){gR(g,wx,sy,7,1,C.glass);gR(g,wx+o,sy,1,1,shd(C.glass,-.55));gR(g,wx+inn,sy,1,1,'#e8fbff');gR(g,wx+(s0>0?1:5),sy,1,1,shd(C.glass,-.18));if((sy+(s0>0?0:9))%26<3)gR(g,wx+2,sy,3,1,'#f4feff')}
      else if(z==='fence'){gR(g,wx,sy,7,1,C.fence);const k=sy%6;gR(g,wx+k,sy,1,1,shd(C.fence,.35));gR(g,wx+6-k,sy,1,1,shd(C.fence,.35));gR(g,wx+o,sy,1,1,'#10142a')}
      else{gR(g,wx,sy,7,1,C.out);gR(g,wx+o,sy,1,1,'#10142a')}}
  }
  if(!back3d){
    for(const yd of[20,40,50,70,85,115,130,150,160,180]){const[px,py]=P2(0,yd,0);for(const X of[Math.round(px)-9,HW-Math.round(px)-1]){gR(g,X,py-2,10,4,'#2a3048');gR(g,X,py-2,10,1,'#b4bed8');gR(g,X,py+1,10,1,'#141830')}}
    for(const[yy,dir]of[[0,-1],[L,1]]){const[px,py]=P2(0,yy,0),Y=Math.round(py)+(dir<0?-7:0),x0=Math.round(px)-9,w=HW-2*x0;
      gR(g,x0,Y,w,7,C.glass);gR(g,x0,dir<0?Y:Y+6,w,1,shd(C.glass,-.55));gR(g,x0,dir<0?Y+6:Y,w,1,'#e8fbff');for(let x=x0+10;x<x0+w;x+=34)gR(g,x,Y+2,6,1,'#f4feff');
      for(let xu=0;xu<=100;xu+=20){const X=Math.round(P2(xu,yy,0)[0]);gR(g,X-2,Y-1,4,9,'#2a3048');gR(g,X-2,Y-1,1,9,'#b4bed8')}}
  }else{
    const bot=P2(0,L,0);gR(g,bot[0]-6,Bt,HW-2*(bot[0]-6),6,C.glass);gR(g,bot[0]-6,Bt,HW-2*(bot[0]-6),1,'#e8fbff');gR(g,bot[0]-6,Bt+5,HW-2*(bot[0]-6),1,shd(C.glass,-.5));
    for(let x=Math.round(bot[0]);x<HW-bot[0];x+=24)gR(g,x,Bt+2,6,1,'#f4feff');
  }
  /* linhas */
  const lc=C.night?mix(C.line,C.dark,.25):C.line;
  for(const sv of[SV1,SV2]){const[px,py]=P2(0,sv,0);gR(g,px,py+1,HW-2*px,1,'rgba(0,0,0,.2)');gR(g,px,py-1,HW-2*px,2,lc)}
  {const c1=P2(50,SV1,0)[1],c2=P2(50,SV2,0)[1];gR(g,161,c1,1,c2-c1,'rgba(0,0,0,.2)');gR(g,159,c1,2,c2-c1,lc)}
  if(back3d){
    const glassF=C.night?'rgba(120,190,230,.16)':'rgba(170,230,255,.24)',fenceF='rgba(28,34,60,.62)',edge='rgba(225,248,255,.85)',mesh='rgba(130,140,185,.45)';
    const strip=(x,y0,y1,z0,z1)=>{const pts=[];for(let y=y0;y<=y1+1e-6;y+=2)pts.push(P2(x,y,z0));for(let y=y1;y>=y0-1e-6;y-=2)pts.push(P2(x,y,z1));return pts};
    gPoly(g,[P2(0,0,0),P2(100,0,0),P2(100,0,30),P2(0,0,30)],glassF);
    gPoly(g,[P2(0,0,30),P2(100,0,30),P2(100,0,40),P2(0,0,40)],fenceF);
    for(let x=0;x<=100;x+=2.5)gLine(g,P2(x,0,30),P2(x,0,40),mesh);
    for(let x=10;x<100;x+=25)gLine(g,P2(x,0,2),P2(x+6,0,26),'rgba(255,255,255,.2)');
    gLine(g,P2(0,0,30),P2(100,0,30),edge);gLine(g,P2(0,0,40),P2(100,0,40),mesh);
    for(let x=0;x<=100;x+=20)gLine(g,P2(x,0,0),P2(x,0,40),'rgba(42,48,72,.9)');
    const segs=[[0,40,'g'],[40,50,'f'],[70,130,'f'],[150,160,'f'],[160,200,'g']];
    for(const X of[0,100])for(const[y0,y1,t]of segs){
      if(t==='g'){gPoly(g,strip(X,y0,y1,0,30),glassF);gPoly(g,strip(X,y0,y1,30,40),fenceF);
        for(let y=y0;y<=y1;y+=2)gLine(g,P2(X,y,30),P2(X,y,40),mesh);
        for(let y=y0+6;y<y1;y+=14)gLine(g,P2(X,y,3),P2(X,y+5,26),'rgba(255,255,255,.16)');
        gLine(g,P2(X,y0,30),P2(X,y1,30),edge);gLine(g,P2(X,y0,40),P2(X,y1,40),mesh)}
      else if(C.pano){gPoly(g,strip(X,y0,y1,0,30),glassF);gLine(g,P2(X,y0,30),P2(X,y1,30),edge)}
      else{gPoly(g,strip(X,y0,y1,0,30),fenceF);for(let y=y0;y<=y1;y+=2)gLine(g,P2(X,y,0),P2(X,y,30),mesh);gLine(g,P2(X,y0,30),P2(X,y1,30),mesh)}
    }
    for(const yd of[20,40,50,70,130,150,160,180])for(const X of[0,100]){gLine(g,P2(X,yd,0),P2(X,yd,yd%20===0&&(yd<50||yd>150)?40:30),'#9aa3c8')}
  }
  lampW.forEach(([x,y],i)=>{const[bx,by]=P2(x,y,0),[tx,ty]=P2(x,y,CAM.pole);
    gLine(g,[bx,by],[tx,ty],'#3a3f55');gLine(g,[bx+1,by],[tx+1,ty],'#5a6078');
    gR(g,tx-8,ty-8,16,12,'rgba(255,246,192,.14)');gR(g,tx-4,ty-4,8,5,'#fff6c0');gR(g,tx-4,ty-4,8,1,'#ffffff');gR(g,tx-5,ty-5,10,1,'#3a3f55')});
  return c;
}
/* ---------- torcida: três camadas prontas (parada, pulando A, pulando B) ---------- */
const FAN_SH=['#e84a4a','#2e86ff','#ffd23f','#20c070','#f4f4f4','#b05cff','#ff9f1c','#3fd0ff','#ff6fb0','#1b1b2a'],FAN_SK=['#f2c18d','#d9a066','#a0673a','#ffdbac','#6b4423'],FAN_HR=['#2a1a10','#1b1b1b','#c8902a','#7a3a14','#d8d8d8','#4a2a18'];
let crowdHD=null;
function hdFan(g,x,y,s,up,night){
  let sh=FAN_SH[(s*7)%FAN_SH.length],sk=FAN_SK[(s*3)%FAN_SK.length],hr=FAN_HR[(s*5)%FAN_HR.length];
  if(night){sh=shd(sh,-.5);sk=shd(sk,-.5);hr=shd(hr,-.4)}
  const dy=up?-2:0;
  gR(g,x,y+4+dy,6,5,shd(sh,-.18));gR(g,x,y+4+dy,5,4,sh);gR(g,x+1,y+4+dy,1,3,shd(sh,.3));
  gR(g,x+1,y+dy,4,4,sk);gR(g,x+1,y+dy,4,2,hr);gR(g,x+4,y+1+dy,1,3,shd(sk,-.2));
  if(up){gR(g,x-1,y-3,1,6,sk);gR(g,x+6,y-3,1,6,sk)}
}
function buildCrowdHD(){
  const C=COURTS[save.opts.court],night=!!C.night,T=CAM.oy*2,Bt=(CAM.oy+CAM.h)*2,aer=CAM===CAMS[0];
  const spots=[];
  for(let sy=T+6;sy<Bt-4;sy+=11){const y=yAt2(sy),xl=Math.round(P2(0,y,0)[0])-12,ny=P2(0,NET,0)[1];
    if(aer&&Math.abs(sy-ny)<40)continue;
    for(const side of[0,1]){const x0=side?HW-xl:2,x1=side?HW-2:xl;for(let x=x0+((sy/11)%2?3:0);x<x1-6;x+=8){if(hdHash(x,sy)<.1)continue;spots.push([x,sy])}}}
  if(!aer){const tp=Math.round(P2(0,0,40)[1]);for(let sy=70;sy<=tp-12;sy+=10)for(let x=3+((sy/10)%2?4:0);x<HW-6;x+=8){if(hdHash(x,sy)<.08)continue;spots.push([x,sy])}}
  const layer=k=>{const[c,g]=hdMk(HW,HH);spots.forEach(([x,y],i)=>{const s=(x*13+y*7)%97,up=k===0?false:((i+k)%2===0);hdFan(g,x,y,s,up,night);
    if(s%19===0){const fc=FAN_SH[(s*3)%FAN_SH.length],wv=k===2?1:0;gR(g,x+3,y-9,1,9,'#c8c8d8');gR(g,x+4,y-9+wv,6,4,fc);gR(g,x+4,y-9+wv,6,1,shd(fc,.3))}});return c};
  crowdHD=[layer(0),layer(1),layer(2)];
}
function drawCrowdHD(){
  if(!crowdHD)buildCrowdHD();
  const k=cheer>0?1+((frame>>2)%2):0;cx.drawImage(crowdHD[k],0,0,CW,CH);
}
/* ---------- bonecos 16 bits ---------- */
let silH=null;
const Rh=(x,y,w,h,c)=>{cx.fillStyle=silH||c;cx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function ellH(x0,y0,rx,ry,c){for(let y=-Math.ceil(ry);y<=Math.ceil(ry);y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));if(w>0)Rh(x0-w,y0+y,w*2,1,c)}}
function lineH(x0,y0,x1,y1,c,t){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++){const f=i/n;Rh(x0+(x1-x0)*f-(t>>1),y0+(y1-y0)*f-(t>>1),t,t,c)}}
const DIG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111'];
function digitH(d,x,y,c){const s=DIG[d];for(let i=0;i<15;i++)if(s[i]==='1')Rh(x+i%3,y+(i/3|0),1,1,c)}
/* X,Y em pixels físicos (pés). Devolve o topo da cabeça em pixels físicos. */
function drawSpriteHD(p,X,Y){
  /* K = pixels físicos por unidade lógica do boneco (o desenho é maior que a escala da quadra, só no visual) */
  const K=2.5,k=K/2,u=n=>Math.max(1,Math.round(n*k));
  const skin=p.skin||'#f2c18d',shoe=p.shoe||'#e8e8e8',front=p.team===1,skD=shd(skin,-.22),skL=shd(skin,.15);
  const sh=p.shirt,shD=shd(sh,-.3),shL=shd(sh,.28),pt=p.shorts||'#1b1b2a',ptD=shd(pt,-.28),hr=p.hair||'#3b2416',hrL=shd(hr,.25);
  const Xl=X/2,Yl=Y/2,px=v=>Math.round(X+(v-Xl)*K),py=v=>Math.round(Y+(v-Yl)*K);
  if(p.dive>0){
    const d=p.diveDir||1,H=(a,c2,y,h,col)=>Rh(Math.min(a,c2),y,Math.abs(c2-a)+1,h,col);
    H(X-u(18)*d,X-u(11)*d,Y-u(4),u(2),skin);H(X-u(21)*d,X-u(18)*d,Y-u(5),u(3),shoe);H(X-u(10)*d,X-u(6)*d,Y-u(6),u(4),pt);H(X-u(5)*d,X+u(5)*d,Y-u(8),u(6),sh);H(X-u(5)*d,X+u(5)*d,Y-u(3),1,shD);
    H(X+u(6)*d,X+u(11)*d,Y-u(10),u(5),skin);if(p.hs!=='bald')H(X+u(6)*d,X+u(11)*d,Y-u(10),u(2),hr);H(X+u(4)*d,X+u(13)*d,Y-u(12),u(2),skin);
    ellH(X+u(17)*d,Y-u(15),3.5*k,4*k,p.rktC||'#1c1c2a');ellH(X+u(17)*d,Y-u(15),2*k,2.6*k,shd(p.rktC||'#1c1c2a',.35));return Y-u(16);
  }
  const run=p.moving&&p.swing===0,f=Math.floor(p.anim/4)%4;
  const crouch=(p.ready||p.charging)&&!run?1:0,lunge=p.lunge>0,bob=run&&(f===1||f===3)?1:0;
  let Bl=Yl+crouch-bob-((p.split>2&&p.split<7)?2:0);
  const ps=pose(p,Xl,Bl);Bl-=ps.jump;
  let lx=Xl-2,rx2=Xl+1,ll=0,rl=0;
  if(run){if(f===0){lx=Xl-3;ll=1}else if(f===2){rx2=Xl+2;rl=1}else{lx=Xl-1;rx2=Xl}}
  if(crouch||lunge){lx=Xl-3;rx2=Xl+2}
  if(lunge){if(b.x>p.x)rx2=Xl+3;else lx=Xl-4}
  /* passo lateral: pernas abrem e fecham, sem trote */
  if(run&&p.swing===0&&Math.abs(p.vx||0)>Math.abs(p.vy||0)*1.6&&st==='play'){ll=rl=0;if(f%2){lx=Xl-3;rx2=Xl+2}else{lx=Xl-1;rx2=Xl}}
  const hipP=py(Bl-4),LW=u(3);
  for(const[x,lift]of[[lx,ll],[rx2,rl]]){const foot=py(Yl-1-ps.jump-lift),x0=px(x)-1,out=x<Xl?-1:1;
    Rh(x0,hipP,LW,Math.max(2,foot-hipP),skin);Rh(x0+LW-1,hipP,1,Math.max(2,foot-hipP),skD);
    Rh(x0,foot-u(4),LW,u(2),'#ffffff');Rh(x0,foot-u(2),LW,1,'#d8dce8');
    const sx=out<0?x0-u(2):x0;Rh(sx,foot-1,u(5),u(2),shoe);Rh(sx,foot-1,u(5),1,shd(shoe,.3));Rh(sx,foot+u(2)-1,u(5),1,'#7a8090')}
  const tw=ps.tw,tx=px(Xl-3+tw),ty=py(Bl-10),TW=u(12),TH=u(9);
  const sx0=px(Xl-3),sy0=py(Bl-6),SH_=u(5);
  Rh(sx0,sy0,TW,SH_,pt);Rh(sx0+TW-u(3),sy0,u(3),SH_,ptD);Rh(sx0,sy0,TW,1,shd(pt,.18));if(!front)Rh(px(Xl)-1,sy0+u(2),1,u(3),ptD);
  Rh(tx,ty,TW,TH,sh);
  if(p.pat===1){for(const dx of[2,6,10])Rh(tx+u(dx),ty,u(2),TH,p.shirt2)}
  else if(p.pat===2){for(let i=0;i<TH-1;i++)Rh(tx+i+u(2),ty+i,u(3),1,p.shirt2)}
  else if(p.pat===3)Rh(tx,ty,TW,u(3),p.shirt2);
  Rh(tx+TW-u(3),ty,u(3),TH,'rgba(0,0,0,.24)');Rh(tx,ty,1,TH-u(2),'rgba(255,255,255,.25)');Rh(tx,ty+TH-1,TW,1,'rgba(0,0,0,.22)');
  if(front){Rh(tx+u(4),ty,u(4),1,shL);Rh(tx+u(5),ty,u(2),u(2),skin)}
  else{Rh(tx+u(3),ty,u(6),1,shD);if(!silH&&p.pat!==1){const n=((p.first||p.name||'7').length*3)%10;digitH(n,tx+Math.round(TW/2)-1,ty+u(2),p.shirt2&&p.shirt2!==sh?p.shirt2:'#ffffff')}}
  /* mangas */
  Rh(tx-1,ty+1,u(2),u(3),sh);Rh(tx+TW-u(2)+1,ty+1,u(2),u(3),shD);
  const hx=Xl-2+(tw?Math.sign(tw):0)*(p.swing>0?1:0),hxP=px(hx),hyP=py(Bl-14),HR=4.2*k;
  const[rX,rY]=ps.r,shR=rX>=Xl?Xl+3+tw:Xl-4+tw,shF=shR>Xl?Xl-4+tw:Xl+3+tw;
  lineH(px(shF)+1,py(Bl-10)+2,px(ps.free[0])+1,py(ps.free[1])+1,skin,u(2));Rh(px(ps.free[0]),py(ps.free[1]),u(2),u(2),skD);
  const hxr=rX+(rX>Xl?-1:1),hyr=rY+2;
  lineH(px(shR)+1,py(Bl-10)+2,px(hxr)+1,py(hyr)+1,skin,u(2));lineH(px(shR)+1,py(Bl-10)+3,px(hxr)+1,py(hyr)+2,skD,1);
  Rh(px(hxr),py(hyr),u(2),u(2),skin);
  if(p.acc===3)Rh(px(hxr),py(hyr)-1,u(2),u(2),p.accC);
  /* raquete de padel */
  const rk=p.rktC||'#1c1c2a',rcx=px(rX)+1,rcy=py(rY)-1;
  lineH(px(hxr)+1,py(hyr)+1,rcx,rcy+u(3),'#2a2a2a',u(2));
  ellH(rcx,rcy,3.6*k,4.6*k,shd(rk,-.35));ellH(rcx,rcy,2.8*k,3.8*k,rk);
  if(!silH){Rh(rcx-u(2),rcy-u(3),1,u(2),shd(rk,.45));for(const[a,c2]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,0],[0,-2],[0,2]])Rh(rcx+a*k*1.4,rcy+c2*k*1.2,1,1,shd(rk,-.45))}
  /* cabeça */
  const cxh=hxP+u(4),cyh=hyP+u(4);
  ellH(cxh,cyh,HR,HR*1.05,skin);Rh(cxh+u(2),cyh-u(2),u(2),u(6),skD);if(front)Rh(cxh-u(3),cyh-u(2),1,u(3),skL);
  const hs=p.hs||'short',HW_=Math.round(HR*2)+1,hl=cxh-Math.round(HR);
  if(!front){
    if(hs!=='bald'){ellH(cxh,cyh-u(1),HR*1.05,HR*.85,hr);Rh(hl,cyh-u(1),HW_,u(3),hr);Rh(cxh-u(2),cyh-u(3),u(3),1,hrL)}
    else Rh(cxh-u(2),cyh-u(3),u(3),1,skL);
    Rh(hl-1,cyh,1,u(2),skin);Rh(hl+HW_,cyh,1,u(2),skD);
    if(hs==='long')Rh(hl,cyh+u(2),HW_,u(4),hr);
    if(hs==='tail'){Rh(cxh-1,cyh+u(3),u(3),u(2),hr);Rh(cxh-1+(run&&f%2?1:0),cyh+u(5),u(2),u(4),hr)}
  }else{
    if(hs!=='bald'){ellH(cxh,cyh-u(3),HR*1.05,HR*.55,hr);Rh(hl,cyh-u(4),HW_,u(2),hr);Rh(cxh-u(2),cyh-u(4),u(3),1,hrL)}
    if(hs==='long'){Rh(hl-1,cyh-u(3),u(2),u(8),hr);Rh(hl+HW_-1,cyh-u(3),u(2),u(8),hr)}
    if(hs==='tail'){Rh(hl+HW_-1,cyh-u(2),u(2),u(2),hr);Rh(hl+HW_,cyh+(run&&f%2?1:0),u(2),u(4),hr)}
    if(!silH){const ey=cyh;Rh(cxh-u(2),ey,u(2),u(2),'#1b1b2a');Rh(cxh+1,ey,u(2),u(2),'#1b1b2a');Rh(cxh-u(2),ey,1,1,'#ffffff');Rh(cxh+1,ey,1,1,'#ffffff');Rh(cxh-1,ey+u(3),u(3),1,shd(skin,-.35))}
  }
  if(p.band)Rh(hl,cyh-u(2),HW_,u(2),p.band);
  if(p.acc===1)Rh(hl,cyh-u(2),HW_,u(2),p.accC);
  else if(p.acc===2){Rh(hl-1,cyh-u(5),HW_+2,u(4),p.accC);Rh(hl,cyh-u(5),u(4),1,shd(p.accC,.35));if(front)Rh(hl-u(2),cyh-u(2),HW_+u(4),u(2),shd(p.accC,-.2))}
  return cyh-Math.round(HR)-u(1);
}
function drawPlayerHD(p,X,Y){
  hi(()=>{const x2=X*2,y2=Y*2;
    if(p.dive<=0){ellH(x2-5,y2,10,3,'rgba(4,10,40,.3)');ellH(x2-4,y2,6,2,'rgba(4,10,40,.22)')}else ellH(x2,y2,16,3,'rgba(4,10,40,.3)');
    silH='#1a1020';for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1]]){cx.translate(ox,oy);drawSpriteHD(p,x2,y2);cx.translate(-ox,-oy)}silH=null;
    p._top=drawSpriteHD(p,x2,y2)});
  return p._top/2;
}
/* ---------- rede, bola, placar ---------- */
function drawNetHD(){hi(()=>{
  const[nx,ny0]=P2(0,NET,0),ny=Math.round(ny0),h=Math.round(NETH*zs(NET)*2),top=ny-h,x0=Math.round(nx)-3,w=HW-2*x0;
  if(CAM===CAMS[0])Rh(x0+4,ny+1,w-8,4,'rgba(0,0,20,.18)');
  Rh(x0,top+2,w,h-2,'rgba(8,12,34,.5)');
  for(let x=0;x<w;x+=3)Rh(x0+x,top+2,1,h-2,'rgba(220,230,255,.28)');for(let y=4;y<h;y+=3)Rh(x0,top+y,w,1,'rgba(220,230,255,.28)');
  Rh(x0,top+h-1,w,1,'rgba(220,230,255,.4)');
  Rh(x0,top,w,3,'#f6f8ff');Rh(x0,top+2,w,1,'#b8c0d8');Rh(159,top,3,h,'rgba(246,248,255,.8)');
  for(const ppx of[x0-5,x0+w]){Rh(ppx,top-4,5,h+5,'#c7cbe0');Rh(ppx,top-4,2,h+5,'#ffffff');Rh(ppx+4,top-4,1,h+5,'#6a7088');Rh(ppx-2,ny,9,2,'#3a3f55')}
})}
function drawBallHD(){
  const[sx,sy]=proj(b.x,b.y,b.z);
  if(sy<33){const bob=Math.floor(frame/6)%2,X=Math.round(clamp(sx,3,157));R(X-1,34+bob,3,1,ACC);R(X,33+bob,1,1,ACC);return}
  hi(()=>{
    if(st==='play'&&b.trail&&b.trail.length>2&&!b.serving){
      const w=b.w||0,col=w>.25?'255,122,61':w<-.25?'95,211,255':'255,255,255',al=Math.abs(w)>.25?.7:.35;
      for(let i=1;i<b.trail.length;i++){const t=b.trail[i],[tx,ty]=P2(t.x,t.y,t.z),r=Math.max(.8,2.4-i*.25);cx.fillStyle=`rgba(${col},${(al*(1-i/b.trail.length)).toFixed(2)})`;
        cx.fillRect(Math.round(tx-r),Math.round(ty-r-2),Math.ceil(r*2),Math.ceil(r*2))}}
    const X=sx*2,Y=sy*2-2;
    ellH(X,Y,3.6,3.6,'#1a1020');ellH(X,Y,2.7,2.7,'#dfff3a');Rh(X-2,Y-2,2,1,'#ffffff');Rh(X-2,Y-1,1,1,'#f4ff9a');Rh(X+1,Y+1,2,1,'#93ab12');Rh(X+2,Y,1,1,'#93ab12');
  });
  const h=P[0];if(st==='play'&&isHuman(h)&&canHit(h)&&b.z>16&&reachInfo(h,1.3)===1&&Math.floor(frame/5)%2){cx.strokeStyle=ACC;cx.lineWidth=1;cx.strokeRect(Math.round(sx)-4.5,Math.round(sy)-6.5,9,9)}
}
function drawBallShadowHD(){
  if(b.out&&b.z<=-5)return;if(!(b.x>=-2&&b.x<=102&&b.y>=-2&&b.y<=202))return;
  const[sx,sy]=P2(b.x,b.y,0),rw=b.z<3?4.5:b.z<10?3.6:2.8,al=clamp(.5-b.z*.01,.18,.5);
  hi(()=>{ellH(sx,sy,rw,1.6,`rgba(0,0,20,${al.toFixed(2)})`)});
}
const HUD_FONT='8px "Press Start 2P", monospace';
function htxt(s,x,y,c,al){cx.font=HUD_FONT;cx.textAlign=al||'left';cx.textBaseline='top';cx.fillStyle='#05071a';cx.fillText(s,x+1,y+1);cx.fillStyle=c;cx.fillText(s,x,y)}
function drawHUDHD(){
  if(kind==='train'){drawTrainHUD();return}
  hi(()=>{
    Rh(0,0,HW,64,'#070a1e');for(let y=0;y<64;y+=2)Rh(0,y,HW,1,'rgba(255,255,255,.015)');Rh(0,62,HW,1,'#7a6418');Rh(0,63,HW,1,ACC);
    const lab=ptsLabels(),tag=kind==='car'&&car&&car.tour?car.tour:null;
    const right=tag?250:HW-46;
    const row=(y,t)=>{
      const col=t===0?P[0].shirt:P[2].shirt,srv=serveTeam===t;
      Rh(6,y,6,24,col);Rh(6,y,6,2,shd(col,.4));Rh(12,y,right-12,24,srv?'#1a2250':'#121838');Rh(12,y,right-12,1,'rgba(255,255,255,.08)');
      htxt(teamName(t).slice(0,13),18,y+8,WHITE);
      const xG=right-74;
      if(srv){ellH(xG-14,y+12,3.6,3.6,'#1a1020');ellH(xG-14,y+12,2.7,2.7,'#dfff3a');Rh(xG-16,y+10,2,1,'#ffffff')}
      if(bo3){Rh(xG,y+3,20,18,'#05071a');htxt(String(sets[t]),xG+10,y+8,MUT,'center')}
      Rh(xG+24,y+3,20,18,'#2b3470');htxt(String(games[t]),xG+34,y+8,WHITE,'center');
      Rh(xG+48,y+2,24,20,ACC);Rh(xG+48,y+2,24,1,'#fff2a0');cx.font=HUD_FONT;cx.textAlign='center';cx.fillStyle='#05071a';cx.fillText(lab[t],xG+60,y+8);
    };
    row(5,0);row(33,1);
    if(pressure&&(st==='serve'||st==='play')&&(frame>>4)%2){cx.font=HUD_FONT;const w=cx.measureText(pressure).width+16;Rh(160-w/2,68,w,16,'#05071a');Rh(160-w/2+1,69,w-2,14,'#c0302a');Rh(160-w/2+1,69,w-2,1,'#ff7a6a');htxt(pressure,160,72,WHITE,'center')}
    if(tag){Rh(254,5,60,52,'#121838');Rh(254,5,60,1,CATS[tag.code].col);
      htxt(CATS[tag.code].s.slice(0,7),284,10,CATS[tag.code].col,'center');htxt(({2:'FINAL',4:'SEMI',8:'QUART',16:'OIT',32:'1aR'})[tag.cur.length]||'',284,24,WHITE,'center');
      htxt('P:'+partnerMode[0][0],284,40,P[1].lblT>0?ACC:MUT,'center')}
    else{Rh(HW-42,5,36,52,'#121838');htxt('P:'+partnerMode[0][0],HW-24,14,P[1].lblT>0?ACC:MUT,'center');if(kind==='2p')htxt('P:'+partnerMode[1][0],HW-24,40,P[2].lblT>0?ACC:MUT,'center')}
  });
}
function spriteHDTo(g,p,X,Y){const keep=cx;cx=g;try{silH='#1a1020';for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1]]){cx.translate(ox,oy);drawSpriteHD(p,X,Y);cx.translate(-ox,-oy)}silH=null;drawSpriteHD(p,X,Y)}finally{silH=null;cx=keep}}
