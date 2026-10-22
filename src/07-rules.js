/* ---------- regras ---------- */
let toss=null,chase=null,hitstop=0,shake=0,lastShot={team:0,type:'drive',deep:true};
const hq={fh:.6,bh:.6};
function onEvent(e,v){
  if(e==='floor'&&v>.3)sfx.bounce();
  if(e==='wall')(v==='fence'?sfx.fence:sfx.wall)();
  if(e==='corner')sfx.corner();
  if(e==='out')sfx.out();
  if(e==='cord')sfx.cord();
  if(st!=='play')return;
  const hitT=b.lastTeam,R=1-hitT;
  if(e==='net'){b.netTouched=true;return}
  if(e==='cord'){b.netTouched=true;if(v)b.cord=true;return}
  if(e==='corner')return;
  if(b.serving){
    if(e==='wall'||e==='out')return fault();
    if(e==='floor'){
      const inBox=sideOf(b.y)===R&&b.x>=b.box[0]-1&&b.x<=b.box[1]+1&&(R===1?b.y>=SV1-1:b.y<=SV2+1);
      if(inBox&&b.cord){st='point';ptimer=60;msg='LET';sub='REPETE O SAQUE';after=()=>setupServe(true);return}
      if(!inBox)return fault();
      b.serving=false;b.bounces=1;if(mst&&!demo&&server===P[0]&&faults===0)mst.svIn++;return;
    }
    return;
  }
  if(e==='floor'){
    if(b.bounces===0){
      if(sideOf(b.y)!==R)return point(R,b.netTouched?'NA REDE':'NAO PASSOU');
      b.bounces=1;b.land={x:b.x,y:b.y};
    }else return point(hitT,b.cord?'NA FITA!':(twoP||hitT===0)?'WINNER!':'PONTO DELES');
  }
  if(e==='wall'&&b.bounces===0){
    if(sideOf(b.y)===hitT){b.contra=true;return}   /* contrapared: vidro do próprio lado vale */
    return point(R,'FORA!');
  }
  if(e==='out'){
    if(b.bounces===0)return point(R,'FORA!');
    if(tryChase(hitT,v==='door'?'POR 4!':'POR 3!'))return;
    return point(hitT,v==='door'?'POR 4!':'POR 3!');
  }
}
function ptsLabels(){const[a,c]=pts;if(a>=3&&c>=3){if(a===c)return['40','40'];return a>c?['AD','40']:['40','AD']}return[PL[a],PL[c]]}
function callLine(){const[a,c]=pts;if(a>=3&&c>=3){if(a===c)return golden()?'PONTO DE OURO':'IGUAIS';return'VANT. '+teamName(a>c?0:1)}const l=ptsLabels();return l[0]+' - '+l[1]}
function point(w,why){
  if(kind==='train'&&!demo){trainOutcome(w,why);return}
  st='point';ptimer=105;faults=0;chase=null;
  const l=1-w;pts[w]++;msg=why;
  const humanWon=P.some(p=>p.team===w&&isHuman(p)),big=['WINNER!','POR 3!','POR 4!','NA FITA!'].includes(why);
  if(mst&&!demo&&lastHitter===P[0]){if(w===0&&big)mst.win++;if(w===1&&['FORA!','NA REDE','NAO PASSOU'].includes(why))mst.err++}
  if(!demo&&humanWon&&big&&Math.random()<.6)exclaim={s:EXC[(Math.random()*EXC.length)|0],t:95};
  if(['WINNER!','POR 3!','POR 4!','NA FITA!','PONTO DELES'].includes(why)){cheer=why.startsWith('POR')?100:55;applause(humanWon?30:12,humanWon?.06:.03)}
  if(why.startsWith('POR'))shake=16;
  replayPending=!demo&&(why==='POR 3!'||why==='POR 4!');
  if(replayPending)ptimer=80;
  if(pts[w]>=4&&(golden()||pts[w]-pts[l]>=2)){
    games[w]++;pts=[0,0];serveTeam=1-serveTeam;
    sub='GAME '+teamName(w);
    sfx.game();ptimer=Math.max(ptimer,140);
    const won=(games[w]>=4&&games[w]-games[l]>=2)||games[w]>=5;
    if(won&&bo3&&!demo){sets[w]++;if(sets[w]<2){sub='SET '+teamName(w)+' '+sets[0]+'-'+sets[1];games=[0,0];after=()=>setupServe();return}}
    if(won){
      if(demo)after=()=>{games=[0,0];setupServe()};
      else{after=()=>endMatch(w);sub='GAME, SET!'}
      return;
    }
  }else{sub=callLine();sfx.point(w)}
  after=()=>setupServe();
}
function fault(){
  faults++;sfx.fault();
  if(faults>=2){faults=0;point(1-b.lastTeam,'DUPLA FALTA');return}
  st='point';ptimer=70;msg='FALTA';sub='2o SAQUE';after=()=>setupServe(true);
}
function setupServe(keepFault){
  if(!keepFault)faults=0;
  const even=(pts[0]+pts[1])%2===0;
  server=serveTeam===0?(even?P[0]:P[1]):(even?P[2]:P[3]);
  const leftBox=server.homeX>50;
  b.box=leftBox?[0,50]:[50,100];
  const rT=1-serveTeam;
  const recv=P.find(q=>q.team===rT&&(q.homeX<50)===leftBox);
  P.forEach(p=>{
    if(p===server){p.x=(p.homeX>50?70:30)+(isHuman(p)?0:rnd(-6,6));p.y=serveTeam===0?190:10}
    else if(p.team===serveTeam){p.x=p.homeX;p.y=serveTeam===0?124:76}
    else if(p===recv){p.x=p.homeX>50?78:22;p.y=rT===0?190:10}
    else{p.x=p.homeX;p.y=rT===0?162:38}
    Object.assign(p,{tx:p.x,ty:p.y,vx:0,vy:0,swing:0,cool:0,moving:false,charging:false,charge:0,lunge:0,relPow:0,dive:0,split:0,react:0,readDelay:0,tossing:false,diveTried:false});
    p.stam=Math.min(1,p.stam+.16*(p===P[0]&&kind==='car'&&car?(.4+.6*car.cond/100):1));
  });
  b.vx=b.vy=b.vz=0;b.w=0;b.lastTeam=serveTeam;b.bounces=0;b.serving=false;b.mustBounce=false;b.spin='none';b.out=null;b.outAx=null;b.cord=false;b.contra=false;b.trail=[];
  toss=null;chase=null;marker=null;st='serve';timer=0;
}
/* Saque: o sacador quica a bola no chão e bate na subida, abaixo da cintura */
function startToss(s,pow,ctype){
  toss={pow,ctype,t:0,bounced:false};s.charging=false;s.tossing=true;
  b.x=s.x+3;b.y=s.y+(s.team===0?-2:2);b.z=11;b.vz=0;
}
/* Saque: por baixo, rasante sobre a rede, na diagonal.
   A = liftado (rápido, quica alto e corre para o vidro), B = cortado (mais lento, quica baixo e escorrega para a lateral).
   Setas no momento do golpe: ←/→ escolhem T ou aberto, ↑ saque curto, ↓ saque fundo. Mais força = menos controle e mais risco de rede. */
function doServe(s,pow,ctype){
  const toTop=s.team===0,[x0,x1]=b.box,human=isHuman(s);
  if(pow==null){const k=isPartner(s)?1.6:sk(s);pow=clamp(rnd(.4,.8)+k*.05-(faults?.2:0),.3,.95)}
  if(!ctype)ctype=Math.random()<.55?'a':'b';
  lastHitter=s;if(mst&&!demo&&s===P[0]&&faults===0)mst.sv++;
  pow*=.75+.25*s.stam;
  const cut=ctype==='b',left=x0<50,mid=(x0+x1)/2;
  let place,depth;
  if(human){const C=s.ctrl.cur;place=C.left?(left?'wide':'t'):C.right?(left?'t':'wide'):'body';depth=C.up?'short':C.down?'deep':'mid'}
  else{const r=Math.random();place=r<.4?'t':r<.75?'wide':'body';const d=Math.random();depth=d<.12?'short':d<.5?'deep':'mid'}
  let tx=place==='t'?(left?x1-6:x0+6):place==='wide'?(left?x0+7:x1-7):mid+rnd(-5,5);
  const dd=depth==='short'?rnd(14,24):depth==='deep'?rnd(60,66):rnd(38,54);
  let ty=toTop?NET-dd:NET+dd;
  const ctrl=human?(1.3-.1*attrOf(s).pre):isPartner(s)?1:Math.max(.5,1.4-.25*sk(s));
  const e=(2+pow*pow*8)*ctrl*(faults?.7:1);tx+=rnd(-e,e);ty+=rnd(-e,e)*.8;
  b.y=s.y+(toTop?-3:3);b.z=Math.max(2,b.z);
  const sp=(cut?3+1.2*pow:3.4+1.6*pow)*(faults?.9:1),T=Math.hypot(tx-b.x,ty-b.y)/sp,sv=cut?(left?-1:1):0;
  tx-=.003*sv*T*T;
  const margin=(human?2:2.4)-1.7*pow+rnd(-.6,.6)+(faults?.9:0);
  launch(tx,ty,T,cut?-.8:.7,0,margin);b.sv=sv;
  b.lastTeam=s.team;b.bounces=0;b.serving=true;b.mustBounce=true;b.netTouched=false;b.cord=false;b.out=null;b.spin='none';b.contra=false;
  s.charging=false;s.tossing=false;s.swing=Math.round(SW*.7);s.stype='serve';st='play';sfx.hit(pow,.8,'serve');
  if(human){s.lbl=(cut?'CORTADO ':'LIFTADO ')+{t:'NO T',wide:'ABERTO',body:'CORPO'}[place];s.lblT=40}
  flash={x:b.x,y:b.y,z:b.z,t:6};rec.length=0;
  afterHit(s);
}
