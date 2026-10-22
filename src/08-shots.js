/* ---------- golpes ----------
   Força = tempo segurando A/B (0.25 a 1), limitada pelo fôlego.
   Qualidade = timing do contato: bola ao lado do corpo (~5) e um pouco à frente (~ -1).
   Zona de golpe: elipse maior do lado do forehand; fora dela, só de peixinho. */
const canHit=p=>st==='play'&&b.lastTeam!==p.team&&sideOf(b.y)===p.team&&b.bounces<=1&&!(b.mustBounce&&b.bounces===0);
const reach=(p,r)=>{const dx=b.x-p.x,dy=b.y-p.y,zm=isHuman(p)?22+.8*attrOf(p).top:24;return dx*dx+dy*dy<=r*r&&b.z<=zm};
const depthOf=p=>p.team===0?b.y-p.y:p.y-b.y;
const rmOf=p=>(p.team===0?1:-1)*(p.lefty?-1:1);
const handFor=p=>((b.x-p.x)*rmOf(p))>=-1?'fh':'bh';
const OVER=['smash','bandeja','vibora','rulo'];
/* mira: quanto mais tempo a seta fica pressionada durante a carga, mais aberta a bola */
const AIM_X={'-2':10,'-1':28,'0':50,'1':72,'2':90};
const aimLevel=a=>a>0?Math.min(2,Math.ceil(a-1e-6)):a<0?-Math.min(2,Math.ceil(-a-1e-6)):0;
function reachInfo(p,sc){
  if(p.dive>0)return 0;
  const zm=isHuman(p)?22+.8*attrOf(p).top:24;if(b.z>zm)return 0;
  const lat=(b.x-p.x)*rmOf(p),dep=depthOf(p),d=Math.hypot(lat/((lat>=0?14:11)*sc),dep/(12*sc));
  return d<=1?1:(d<=1.5&&b.z<10)?2:0;
}
const toMyWall=p=>p.team===0?b.vy>0:b.vy<0;
function afterHit(p){
  /* split step e leitura da bola pela dupla que vai receber */
  for(const q of P){
    if(q.team===p.team)continue;
    q.diveTried=false;
    if(Math.hypot(q.vx||0,q.vy||0)<.35&&q.dive<=0){q.split=8;q.react=24}
    if(!isHuman(q)){
      const s=isPartner(q)?2.4:sk(q),m=(3.6-s)*(1.2+2.5*Math.abs(b.w||0));
      q.readDelay=Math.round(16-3.5*s);q.readErr={x:rnd(-1,1)*m,y:rnd(-1,1)*m*.7};
    }
  }
  planTeam(0);planTeam(1);
}
function contraLaunch(p,e){
  const toTop=p.team===0,dir=toTop?1:-1,txT=rnd(25,75),tyT=toTop?rnd(25,60):L-rnd(25,60);
  let best=null;
  for(let a=1.2;a<=3.21;a+=.2)for(let c=1.2;c<=3.61;c+=.2){
    const s={x:b.x,y:b.y,z:b.z,vx:(txT-b.x)/110,vy:dir*a,vz:c,w:.2,spin:'none',out:null};let ok=null,wall=false;
    for(let t=0;t<300&&!ok;t++){let ev2=null;physics(s,e2=>{if(!ev2)ev2=e2});
      if(ev2==='wall'){if(wall)break;wall=true}
      else if(ev2==='out'||ev2==='net'||ev2==='corner')break;
      else if(ev2==='floor'){if(wall&&sideOf(s.y)!==p.team)ok={x:s.x,y:s.y};break}
    }
    if(ok){const d=Math.hypot(ok.x-txT,ok.y-tyT);if(!best||d<best.d)best={d,a,c}}
  }
  if(!best){launch(rnd(30,70),toTop?40:L-40,60,.1,e);return}
  b.vx=(txT-b.x)/110;b.vy=dir*best.a;b.vz=best.c;b.w=.2;
  const f=1+rnd(-1,1)*e*.006;b.vy*=f;b.vz+=rnd(-1,1)*e*.005;b.vx+=rnd(-1,1)*e*.006;
}
function doHit(p,type,tx,deep,pow,q,dy,short){
  const toTop=p.team===0,yy=a=>toTop?a:L-a,rm=rmOf(p),hs=p.hand==='bh'?-1:1;
  pow*=.75+.25*p.stam;
  if(b.bounces===0&&type==='drive')type='volley';
  if(type==='drive'||type==='lob'||type==='drop'||type==='chiquita')tx+=(dy+1)*2.4*rm*hs;
  let ty,sp,w=0,kick=false,mn;
  if(type==='lob'){ty=yy(deep?lerp(16,4,pow):lerp(30,6,pow));sp=1.3+.4*pow;w=.15}
  else if(type==='chiquita'){ty=yy(lerp(84,74,pow));sp=1.1+.4*pow;w=-.5;mn=1}
  else if(type==='bajada'){ty=yy(lerp(40,14,pow));sp=2.7+1.3*pow;w=.45;mn=1.5}
  else if(type==='rulo'){ty=yy(rnd(34,46));sp=2.9+1.2*pow;kick=true;w=.9}
  else if(type==='smash'){const side=tx<20||tx>80;ty=yy(side?rnd(56,64):rnd(46,60));sp=2.6+1.2*pow;kick=true;w=.3}
  else if(type==='bandeja'){ty=yy(lerp(26,10,pow));sp=1.7+.6*pow;w=-.7}
  else if(type==='vibora'){tx=tx<50?rnd(6,14):rnd(86,94);ty=yy(lerp(36,16,pow));sp=2.2+.8*pow;w=-.9}
  else if(type==='drop'){ty=yy(lerp(88,70,pow));sp=1+.6*pow;w=-1}
  else if(type==='volley'){ty=yy(short?rnd(76,84):deep?lerp(30,12,pow):lerp(64,30,pow));sp=1.6+.8*pow;w=-.25}
  else if(type==='contra'){ty=0;sp=1}
  else{ty=yy(deep?lerp(20,6,pow):lerp(46,16,pow));sp=(1.9+1.2*pow)*(p.hand==='bh'?.94:1)*1.05;w=p.hand==='bh'?.3:.5}
  sp*=.85+.15*q;
  let e=(1-q)*12+pow*pow*5,kickMul=1,bad=null;
  if(type==='volley')e*=.7;
  if(isHuman(p)){
    const a=attrOf(p);sp*=.9+.04*a.for;e*=1.3-.1*a.pre;if(OVER.includes(type))e*=1.25-.1*a.top;kickMul=(.9+.05*a.for)*(.94+.03*a.top);
  }else{
    const S=STY[p.style]||STY.equil,partner=isPartner(p);
    e+=partner?3:Math.max(2.5,13-3*sk(p))*.5;
    const inSp=Math.hypot(b.vx,b.vy);
    const ue=((partner?.12:Math.max(.06,.22-.04*sk(p)))*S.ue+Math.max(0,inSp-1.8)*.12+({smash:.08,vibora:.05,bandeja:-.04,volley:-.03}[type]||0))*.95;
    if(type!=='contra'&&Math.random()<ue){const r=Math.random();bad=r<.38?'net':r<.72?'long':'wide'}
  }
  const kz=b.z;
  if(type==='contra')contraLaunch(p,e);
  else launch(tx,ty,Math.max(14,Math.hypot(tx-b.x,ty-b.y)/sp),w,e,mn);
  /* erro não forçado: execução ruim vira bola na rede, longa ou aberta, pela própria física */
  if(bad==='net'){b.vz*=rnd(.3,.5)}
  else if(bad==='long'){const f=rnd(1.25,1.42);b.vx*=f;b.vy*=f}
  else if(bad==='wide'){const a=rnd(.16,.26)*(Math.random()<.5?-1:1),c=Math.cos(a),s2=Math.sin(a),vx=b.vx*c-b.vy*s2;b.vy=b.vx*s2+b.vy*c;b.vx=vx}
  b.lastTeam=p.team;b.bounces=0;b.mustBounce=false;b.serving=false;b.netTouched=false;b.cord=false;b.out=null;b.contra=false;
  b.spin=kick?'kick':'none';b.kickV=(kz>=19?1:.65)*(1.5+2*pow)*(.8+.2*q)*kickMul*(type==='rulo'?.75:1);
  /* troca: o parceiro cobriu o lob do seu lado, vocês trocam de lado */
  if(isPartner(p)){const hu=P.find(q2=>q2.team===p.team&&isHuman(q2));if(hu&&(hu.homeX>50?p.x>54:p.x<46)){const t=hu.homeX;hu.homeX=p.homeX;p.homeX=t;p.lbl='TROCA!';p.lblT=45}}
  p.charging=false;p.charge=0;p.swing=Math.round(SW*(type==='volley'?.5:.7));p.stype=type;p.lunge=Math.abs(b.x-p.x)>9?14:0;
  p.stam=Math.max(0,p.stam-(.012+pow*.012));
  flash={x:b.x,y:b.y,z:b.z,t:6};
  const LB={smash:'REMATE',bandeja:'BANDEJA',vibora:'VIBORA',drop:'DEJADA',lob:'GLOBO',volley:'VOLEIO',contra:'CONTRAPARED',chiquita:'CHIQUITA',bajada:'BAJADA',rulo:'RULO'};
  if(isHuman(p)){p.lbl=type==='contra'?'CONTRAPARED':q>.82?(LB[type]?LB[type]+'!':'PERFEITO'):dy<-4?'CEDO':dy>2.5?'TARDE':(LB[type]||'');p.lblT=p.lbl?42:0}
  else if(LB[type]&&type!=='lob'&&type!=='volley'){p.lbl=LB[type];p.lblT=42}
  if(type==='smash'||type==='vibora'||type==='rulo'||type==='bajada')sfx.smash();else if(type==='lob'||type==='contra')sfx.lob();else sfx.hit(pow,q,type);
  if(type==='smash'||type==='rulo')hitstop=4;else if(isHuman(p)&&q>.82)hitstop=3;
  lastShot={team:p.team,type,deep:Math.abs(p.y-NET)>70,q};b.land=null;lastHitter=p;
  if(p===P[0]&&mst&&!demo)mst.shots[type]=(mst.shots[type]||0)+1;
  afterHit(p);
}
function humanHit(h,pow,contra){
  const a=attrOf(h),C=h.ctrl.cur,dx=Math.abs(b.x-h.x),dy=depthOf(h);
  const q=clamp((1-clamp(Math.abs(dx-5)/(8+.5*a.pre),0,1))*.4+(1-clamp(Math.abs(dy+1)/8,0,1))*.6,0,1);
  h.hand=handFor(h);hq[h.hand]=hq[h.hand]*.8+q*.2;
  let type;
  const deepPos=Math.abs(h.y-NET)>55;
  if(contra)type='contra';
  else if(b.offWall&&b.z>9&&deepPos&&h.ctype==='a'&&!C.up)type='bajada';
  else if(b.z>16)type=h.ctype==='b'?'bandeja':C.up?'vibora':C.down?'rulo':'smash';
  else if(h.ctype==='b')type=C.up?'chiquita':'lob';
  else type=C.up?'drop':'drive';
  const lv=aimLevel(h.aim||0),tx=AIM_X[lv]+(lv===0?rnd(-8,8):rnd(-3,3));
  doHit(h,type,tx,C.down,pow,contra?Math.max(q,.5):q,contra?0:dy,C.up);
}
/* Peixinho: bola fora do alcance normal; devolve mal e fica no chão */
function diveHit(p,type){
  p.dive=40;p.diveDir=Math.sign(b.x-p.x)||1;p.vx=p.diveDir*1.1;p.vy=0;p.charging=false;
  p.hand=handFor(p);
  doHit(p,type,rnd(30,70),false,.35,.25,0);
  lastShot.dive=true;p.swing=0;p.lbl='PEIXINHO!';p.lblT=40;p.stam=Math.max(0,p.stam-.04);sfx.wall();
}
function aiHit(p){
  const S=STY[p.style]||STY.equil;
  const opp=P.filter(q=>q.team!==p.team);
  const oppNet=opp.every(q=>Math.abs(q.y-NET)<40);
  let type='drive';
  const r=Math.random();
  if(b.offWall&&b.z>9&&Math.abs(p.y-NET)>55&&Math.random()<.5)type='bajada';
  else if(b.z>17&&Math.abs(p.y-NET)<48){type=(b.z>19&&r<S.smash)?'smash':Math.random()<S.vib?'vibora':'bandeja';if(type==='smash'&&Math.random()<.25)type='rulo'}
  else if(b.z>19&&r<.3)type='bandeja';
  else if(oppNet&&Math.abs(p.y-NET)>55&&Math.random()<.15)type='chiquita';
  else if((oppNet&&Math.random()<S.lobNet)||Math.random()<S.lob)type='lob';
  else if(Math.random()<S.drop&&Math.abs(p.y-NET)<50)type='drop';
  /* alvo: espaço vazio, o backhand do jogador humano, o mais cansado ou o meio da dupla */
  let best=50,bs=-1;
  for(const c of[12,30,50,70,88]){const s=Math.min(...opp.map(q=>Math.abs(q.x-c)))+Math.random()*10;if(s>bs){bs=s;best=c}}
  const r2=Math.random(),hu=opp.find(isHuman);
  if(hu&&r2<.22+clamp((hq.fh-hq.bh)*1.2,0,.3))best=clamp(hu.x-rmOf(hu)*12,8,92);
  else if(r2<.5&&Math.abs(opp[0].stam-opp[1].stam)>.18){const t=opp[0].stam<opp[1].stam?opp[0]:opp[1];best=clamp(t.x+rnd(-6,6),8,92)}
  else if(r2<.68)best=clamp((opp[0].x+opp[1].x)/2,15,85);
  if(S.lefty&&Math.random()<.4)best=Math.random()<.5?12:88;
  if(type==='smash'&&Math.random()<.4)best=Math.random()<.5?10:90;
  const s=isPartner(p)?1.6:sk(p);
  const q=rnd(.35+.1*Math.min(s,3),1),pow=clamp(rnd(.35,.8)+s*.04+S.pow+(type==='smash'?.15:0),.25,1);
  p.hand=handFor(p);
  doHit(p,type,best,Math.random()<.3,pow,q,(1-q)*rnd(-6,4));
}
