/* ---------- escola de padel e treino livre ----------
   Uma máquina de bolas no outro lado da quadra lança o tipo de bola de cada lição.
   O jogador e a bola seguem a física normal; só a contagem de pontos é trocada pela avaliação da lição. */
const LESSONS=[
  {t:'FORCA',l:['SEGURE A PARA','CARREGAR A BARRA','E SOLTE NA BOLA'],feed:'mid',n:3,ok:w=>w===0,h:'JOGUE NA QUADRA'},
  {t:'TIMING',l:['BATA COM A BOLA','AO LADO DO CORPO','UM POUCO A FRENTE'],feed:'mid',n:3,ok:w=>w===0&&lastShot.q>.75,h:'MAIS NO TEMPO'},
  {t:'GLOBO',l:['B = LOB','MANDE NO FUNDO','DA QUADRA DELES'],feed:'mid',n:2,ok:w=>w===0&&lastShot.type==='lob'&&b.land&&b.land.y<45,h:'LOB MAIS FUNDO'},
  {t:'BANDEJA',l:['BOLA ALTA NA REDE:','B = BANDEJA','(SEGURA, FUNDA)'],feed:'lobnet',n:3,ok:w=>w===0&&lastShot.type==='bandeja',h:'B COM A BOLA ALTA'},
  {t:'VIBORA',l:['BOLA ALTA:','SEGURE CIMA + A','DIAGONAL ESCOLHE'],feed:'lobnet',n:2,ok:w=>w===0&&lastShot.type==='vibora',h:'CIMA + A NO ALTO'},
  {t:'REMATE POR 3',l:['BOLA ALTA: SO A','BARRA VERMELHA','PEGUE BEM NO ALTO'],feed:'lobnet',n:1,ok:(w,why)=>w===0&&lastShot.type==='smash'&&/POR/.test(why),h:'MAIS FORCA E ALTURA'},
  {t:'CONTRAPARED',l:['BOLA PASSOU E VAI','PRO VIDRO: SEGURE','BAIXO + B'],feed:'deep',n:2,ok:w=>w===0&&lastShot.type==='contra',h:'BAIXO + B ATRAS'},
  {t:'PEIXINHO',l:['BOLA LONGE DEMAIS','NAO CORRA:','APERTE A'],feed:'wide',n:2,ok:w=>w===0&&lastShot.dive,h:'FIQUE E APERTE A'},
  {t:'SAIDA PELA PORTA',l:['BOLA SAIU PELA','LATERAL: CORRA E','APERTE A NO "A!"'],feed:'smash',n:1,ok:w=>w===0&&lastShot.chase,h:'CORRA PRA PORTA'},
];
const FREE_N=['DRIVE','LOB ALTO','FUNDO','ABERTA','MISTO'],FREE_K=['mid','lobnet','deep','wide','mix'];
let train=null,trainCur=null,freeSel=0;
function startTrain(li,ft){
  kind='train';demo=false;twoP=false;mode='game';paused=false;bo3=false;sets=[0,0];replay=null;replayPending=false;
  setupTeams(PAIRS[0],1.5);
  for(const p of[P[1],P[2],P[3]]){p.hidden=true;p.x=-200;p.y=p.team?-200:400;p.vx=p.vy=0;p.charging=false}
  trainCur=li==null?null:LESSONS[li];train={li,ft,hits:0,miss:0,intro:trainCur?260:0};
  pts=[0,0];games=[0,0];partnerMode=['AUTO','AUTO'];toss=null;chase=null;
  b.x=50;b.y=12;b.z=8;b.vx=b.vy=b.vz=0;b.trail=[];
  st='point';ptimer=trainCur?150:80;msg=trainCur?trainCur.t:'TREINO LIVRE';sub=trainCur?'LICAO '+(li+1):FREE_N[ft];after=()=>trainFeed();
  sfx.ui();
}
function trainFeed(){
  let f=trainCur?trainCur.feed:FREE_K[train.ft];
  if(f==='mix')f=['mid','lobnet','deep','wide'][(Math.random()*4)|0];
  const h=P[0],rm=rmOf(h);
  const at=(x,y)=>{h.x=x;h.y=y;h.vx=h.vy=0;h.charging=false;h.swing=0;h.dive=0;h.relPow=0};
  let F;
  if(f==='mid'){at(50,178);F={tx:rnd(30,70),ty:rnd(152,170),T:70,w:.3}}
  else if(f==='lobnet'){at(50,130);F={tx:rnd(38,62),ty:rnd(148,158),T:76,w:.1}}
  else if(f==='deep'){at(50,165);F={tx:rnd(44,56),ty:171,T:54,w:.2}}
  else if(f==='wide'){at(50,166);F={tx:50+19*rm,ty:166,T:58,w:.2}}
  else{at(60,168);F={fx:30,fy:85,z:24,tx:92,ty:136,T:24,kick:true,kickV:3.4}}
  b.x=F.fx??rnd(42,58);b.y=F.fy??12;b.z=F.z??8;
  Object.assign(b,{out:null,outAx:null,spin:'none',corner:0,cord:false,netTouched:false,contra:false,land:null,trail:[]});
  launch(F.tx,F.ty,F.T,F.w||0,0);
  if(F.kick){b.spin='kick';b.kickV=F.kickV}
  b.lastTeam=1;b.bounces=0;b.serving=false;b.mustBounce=false;st='play';
  lastShot={team:1,type:'feed',deep:true,q:0};
  flash={x:b.x,y:b.y,z:b.z,t:5};beep(300,.06,'square',.05,.6);
  afterHit(P[2]);
}
function trainOutcome(w,why){
  if(careerDrill){drillOutcome(w,why);return}
  st='point';chase=null;replayPending=false;sub='';
  if(trainCur){
    const good=trainCur.ok(w,why);
    if(good){train.hits++;msg='BOA! '+train.hits+'/'+trainCur.n;sfx.point(0)}
    else{msg=w===0?'QUASE!':'ERROU';sub=trainCur.h;sfx.fault()}
    if(train.hits>=trainCur.n){
      const li=train.li;msg='LICAO COMPLETA!';sub=trainCur.t;ptimer=120;cheer=60;
      if(!save.school[li]){save.school[li]=1;save.xp+=1;sub='+1 XP'}
      store();sfx.fanfare();after=()=>{mode='school';cur=Math.min(li+1,LESSONS.length)};return;
    }
  }else{
    if(w===0){train.hits++;msg='BOA!'}else{train.miss++;msg=why==='FORA!'?'FORA':why==='NA REDE'?'NA REDE':'ERROU'}
  }
  ptimer=55;after=()=>trainFeed();
}
function drawTrainHUD(){
  R(0,0,CW,31,NAVY);R(0,31,CW,1,'#2b3470');
  if(careerDrill){const D=DRILLS[careerDrill.i];txt('TREINO: '+D.n,6,7,ACC);txt('BOLA '+Math.min(careerDrill.balls+1,8)+'/8',6,19,WHITE);txt('ACERTOS '+careerDrill.hits,CW-6,19,GRN,'right');return}
  if(trainCur){txt(trainCur.t,6,7,ACC);txt(train.hits+'/'+trainCur.n,CW-6,7,WHITE,'right');txt('ESCOLA DE PADEL',6,19,MUT)}
  else{txt('TREINO: '+FREE_N[train.ft],6,7,ACC);txt('ACERTOS '+train.hits,6,19,GRN);txt('ERROS '+train.miss,CW-6,19,RED,'right')}
  if(trainCur&&train.intro>0&&!paused){train.intro--;const L=trainCur.l;cx.fillStyle='rgba(5,7,26,.9)';cx.fillRect(8,36,144,42);R(8,36,144,1,BLU);R(8,77,144,1,BLU);L.forEach((l,i)=>txt(l,80,41+i*12,i===L.length-1?ACC:WHITE,'center'))}
}
function drawMachine(){
  const[mx,my]=proj(50,4,0),X=Math.round(mx),Y=Math.round(my);
  R(X-7,Y-9,14,9,'#3a3f55');R(X-7,Y-9,14,1,'#7a80a8');R(X-2,Y-13,4,5,'#2b2f45');R(X-1,Y-14,2,1,'#dfff3a');
  R(X-5,Y-6,3,2,'#dfff3a');R(X+2,Y-6,3,2,RED);R(X-6,Y,3,1,'#05071a');R(X+3,Y,3,1,'#05071a');
}
function drawSchool(){
  dim(.88);txt('ESCOLA',80,30,ACC,'center',F16);
  LESSONS.forEach((L,i)=>{const y=52+i*15,on=i===cur,done=save.school[i];
    txt((on?'>':' ')+(i+1)+' '+L.t,6,y,on?ACC:WHITE);if(done)txt('OK',154,y,GRN,'right')});
  const y=52+LESSONS.length*15+4,on=cur===LESSONS.length;
  txt((on?'>':' ')+'TREINO LIVRE',6,y,on?ACC:WHITE);txt((on?'< ':'')+FREE_N[freeSel]+(on?' >':''),154,y,on?ACC:MUT,'right');
  const L=LESSONS[cur];
  if(L)L.l.forEach((s,i)=>txt(s,80,212+i*12,BLU,'center'));
  else{txt('A MAQUINA LANCA',80,212,BLU,'center');txt('BOLAS SEM PARAR',80,224,BLU,'center');txt('START: PAUSA/SAIR',80,236,BLU,'center')}
  txt('A COMECA  B VOLTA',80,262,MUT,'center');
}
/* ---------- dicas na primeira vez ---------- */
const TIPS_CTX={charge:['SEGURE A: CARREGA','SOLTE PARA BATER'],serve:['A LIFTADO B CORTADO','SETAS MIRAM O SAQUE'],high:['ALTA: B = BANDEJA','CIMA + A = VIBORA'],
  wall:['BOLA VAI PRO VIDRO','BAIXO+B: CONTRA'],wide:['BOLA LONGE?','APERTE A: PEIXINHO'],chase:['CORRA ATE A PORTA','E APERTE A'],partner:['SELECT: PARCEIRO','REDE/FUNDO/AUTO']};
let tipNow=null;
function tipShow(k){if(!save.opts.tips||save.tipsSeen[k]||kind==='train'||demo||tipNow)return;save.tipsSeen[k]=1;store();tipNow={k,t:200}}
function tipsCheck(){
  if(demo||kind==='train'||kind==='2p')return;
  const h=P[0];
  if(st==='serve'){if(server===h)tipShow('serve');else if(timer>20)tipShow('charge')}
  else if(st==='play'&&canHit(h)){
    if(b.z>16&&Math.hypot(b.x-h.x,b.y-h.y)<30)tipShow('high');
    else if(b.bounces>0&&toMyWall(h)&&depthOf(h)>0)tipShow('wall');
    else if(reachInfo(h,1)===2)tipShow('wide');
  }else if(st==='chase'&&chase&&chase.p===h)tipShow('chase');
  if(st==='serve'&&pts[0]+pts[1]===2)tipShow('partner');
  if(tipNow&&--tipNow.t<=0)tipNow=null;
}
function drawTip(){
  if(!tipNow)return;const L=TIPS_CTX[tipNow.k];
  cx.fillStyle='rgba(5,7,26,.88)';cx.fillRect(8,36,144,30);R(8,36,144,1,BLU);R(8,65,144,1,BLU);
  txt(L[0],80,41,WHITE,'center');txt(L[1],80,53,ACC,'center');
}
