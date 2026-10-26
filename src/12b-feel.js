/* ---------- sensação de jogo: tie-break, pressão, efeitos, comemorações e treino jogável ---------- */
/* tie-break em 6-6 nos sets de 6 games: até 7 pontos com 2 de vantagem; quem começa saca 1 ponto, depois 2 para cada lado */
let tb=false,tbFirst=0;
function tbServe(){const n=pts[0]+pts[1];return(((n+1)>>1)%2===0)?tbFirst:1-tbFirst}
/* ponto decisivo: break point, set/match point ou ponto de ouro */
function gamePointFor(t){const a=pts[t],c=pts[1-t];if(tb)return a>=6&&a>c;if(a>=3&&c>=3&&a===c)return golden();return a>=3&&a>c}
function wouldWinMatch(t){const g=games[t]+1,o=games[1-t];if(matchTo)return g>=matchTo;if(setTo)return tb||(g>=setTo&&g-o>=2);return(g>=4&&g-o>=2)||g>=5}
function pressureLabel(){
  if(demo||kind==='train'||st==='point')return null;
  for(const t of[0,1])if(gamePointFor(t)&&wouldWinMatch(t))return'MATCH POINT';
  if(pts[0]>=3&&pts[1]>=3&&pts[0]===pts[1]&&golden()&&!tb)return'PONTO DE OURO';
  if(gamePointFor(1-serveTeam))return tb?'SET POINT':'BREAK POINT';
  return null;
}
let pressure=null;
function updatePressure(){pressure=pressureLabel()}
/* ---------- efeitos de impacto ---------- */
const fx=[];
function fxDust(x,y,v){const C=COURTS[save.opts.court],col=C.beach?'244,226,176':C.turf==='#c8643a'?'220,130,90':'236,228,200',n=C.beach?9:5+Math.round(v*3);
  for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),s=rnd(.15,.6)*(.6+v);fx.push({k:'d',x,y,z:.3,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,vz:rnd(.2,.6)*(.5+v),t:rnd(14,24)|0,T:24,col})}}
function fxGlass(x,y,z,zn){fx.push({k:zn==='fence'?'f':'g',x,y,z,t:16,T:16});if(zn!=='fence')for(let i=0;i<4;i++)fx.push({k:'s',x,y,z:z+rnd(-3,3),vx:rnd(-.5,.5),vy:0,vz:rnd(-.3,.6),t:12,T:12})}
function fxConfetti(){const cols=['#ffd23f','#ef3e36','#2e86ff','#20c070','#ff6fb0','#ffffff'];for(let i=0;i<80;i++){const s=i%2;fx.push({k:'c',sx:s?318:2,sy:rnd(330,470),vx:(s?-1:1)*rnd(1.2,4.2),vy:rnd(-6.5,-3),t:rnd(80,130)|0,T:130,col:cols[i%cols.length],ph:rnd(0,6)})}}
function stepFx(){for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t--;
  if(f.k==='d'||f.k==='s'){f.x+=f.vx;f.y+=f.vy;f.z+=f.vz;f.vz-=.06;if(f.z<0){f.z=0;f.vz=0;f.vx*=.6;f.vy*=.6}}
  else if(f.k==='c'){f.vx*=.985;f.vy=Math.min(1.6,f.vy+.09);f.sx+=f.vx+Math.sin((frame+f.ph*20)*.1)*.4;f.sy+=f.vy}
  if(f.t<=0)fx.splice(i,1)}}
function drawFxHD(){if(!fx.length)return;hi(()=>{for(const f of fx){const a=f.t/f.T;
  if(f.k==='d'){const[x,y]=P2(f.x,f.y,f.z);cx.fillStyle=`rgba(${f.col},${(a*.85).toFixed(2)})`;cx.fillRect(Math.round(x),Math.round(y),a>.5?2:1,a>.5?2:1)}
  else if(f.k==='s'){const[x,y]=P2(f.x,f.y,f.z);cx.fillStyle=`rgba(232,252,255,${a.toFixed(2)})`;cx.fillRect(Math.round(x),Math.round(y),2,1);cx.fillRect(Math.round(x),Math.round(y)-1,1,3)}
  else if(f.k==='g'||f.k==='f'){const[x,y]=P2(f.x,f.y,f.z),r=(1-a)*14+3;cx.strokeStyle=f.k==='g'?`rgba(232,252,255,${(a*.9).toFixed(2)})`:`rgba(170,180,220,${(a*.8).toFixed(2)})`;cx.lineWidth=f.k==='g'?2:1;
    cx.beginPath();cx.ellipse(Math.round(x),Math.round(y),r,r*.7,0,0,Math.PI*2);cx.stroke();if(f.k==='g'&&a>.6){cx.fillStyle='rgba(255,255,255,.8)';cx.fillRect(Math.round(x)-1,Math.round(y)-5,2,10);cx.fillRect(Math.round(x)-5,Math.round(y)-1,10,2)}}
  else if(f.k==='c'){cx.fillStyle=f.col;const w=(frame+f.ph*10)%8<4?4:1;cx.globalAlpha=Math.min(1,a*2);cx.fillRect(Math.round(f.sx),Math.round(f.sy),w,3);cx.globalAlpha=1}}})}
/* ---------- comemoração: a dupla se junta e bate as mãos ---------- */
function stepCelebrate(){
  if(st!=='point')return;
  for(const t of[0,1]){const m=P.filter(p=>p.team===t&&!p.hidden&&p.hf);if(m.length!==2)continue;
    const[a,c]=m,mx=(a.x+c.x)/2,my=(a.y+c.y)/2,d=Math.hypot(a.x-c.x,a.y-c.y);
    if(d>11){for(const p of m){const tx=mx+(p.x<mx?-4.5:4.5),ty=my,dx=tx-p.x,dy=ty-p.y,dd=Math.hypot(dx,dy)||1,s=Math.min(.9,dd*.2);p.x+=dx/dd*s;p.y+=dy/dd*s;p.moving=dd>.8;if(p.moving)p.anim++}}
    else for(const p of m){p.moving=false;p.hfUp=true;p.hfDir=p.x<mx?1:-1}}
}
/* ---------- treino jogável na carreira ---------- */
const DRILLS=[{li:0,a:'for',n:'PANCADA',d:'DRIVES FORTES DENTRO'},{li:1,a:'pre',n:'PRECISAO',d:'GOLPES NO TEMPO CERTO'},{li:3,a:'top',n:'JOGO AEREO',d:'BANDEJAS SEGURAS'},{li:7,a:'vel',n:'VELOCIDADE',d:'PEIXINHOS NA BOLA LONGE'}];
let careerDrill=null,drillResult=null;
function startCareerDrill(i){
  const D=DRILLS[i];if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE';return}
  if(car.money<400){sfx.fault();car.msg='SEM DINHEIRO';return}
  car.money-=400;car.focus=D.a;careerDrill={i,balls:0,hits:0,max:8};startTrain(D.li);train.intro=0;msg=D.n;sub='8 BOLAS';
}
function drillOutcome(w,why){
  const D=DRILLS[careerDrill.i],L=LESSONS[D.li],good=L.ok(w,why);
  careerDrill.balls++;if(good)careerDrill.hits++;
  st='point';chase=null;replayPending=false;msg=good?'BOA!':w===0?'QUASE':'ERROU';sub=careerDrill.hits+' DE '+careerDrill.balls;
  if(good)sfx.point(0);else sfx.fault();
  if(careerDrill.balls>=careerDrill.max){ptimer=70;after=()=>finishCareerDrill();return}
  ptimer=50;after=()=>trainFeed();
}
function finishCareerDrill(){
  const D=DRILLS[careerDrill.i],sc=careerDrill.hits/careerDrill.max;lvlUps=[];
  const amt=(.5+1.3*sc)*1.3+(car.coach?.6:0);gain(D.a,amt);
  drillResult={n:D.n,a:D.a,hits:careerDrill.hits,max:careerDrill.max,ups:lvlUps.length,stars:sc>=.85?3:sc>=.6?2:sc>=.35?1:0};
  careerDrill=null;kind='car';mode='cdrill';cur=0;sfx.fanfare();
}
function abortCareerDrill(){careerDrill=null;car.money+=400;kind='car';mode='career';paused=false;car.msg='TREINO CANCELADO'}
function drawDrillMenu(){hi(()=>{uiBegin();uiBg();
  const f0=uiHit('back',0,0,44,38,()=>{mode='career'});uGrad(0,0,320,38,'#1a2254','#070a1e',4);Rh(0,38,320,2,ACC);uT('<',14,12,f0?ACC:WHITE,'left',16);uIcon('evo',40,4,1.6);uT('TREINO',74,12,ACC,'left',16);uT(money$(car.money),310,15,GRN,'right');
  uT('ESCOLHA O TREINO DA SEMANA',160,52,MUT,'center');
  DRILLS.forEach((D,i)=>{const y=70+i*74,f=uiHit('dr'+i,8,y,304,66,()=>startCareerDrill(i));uPanel(8,y,304,66,'#1a2254',f?ACC:'#3a4488');
    uT(D.n,18,y+10,WHITE,'left',16);uT(D.d,18,y+32,MUT);uT('MELHORA '+({vel:'VELOCIDADE',for:'FORCA',pre:'PRECISAO',top:'JOGO POR CIMA'})[D.a],18,y+46,BLU);uT('$400',304,y+12,ACC,'right');uT('8 BOLAS',304,y+46,MUT,'right');if(f)uFocus(8,y,304,66)});
  const yq=372,fq=uiHit('quick',8,yq,304,52,()=>{mode='career';careerAct('trainQuick')});uPanel(8,yq,304,52,'#1a2254',fq?ACC:'#3a4488');uT('TREINO RAPIDO',18,yq+10,WHITE);uT('SIMULADO, SEM JOGAR  $400',18,yq+28,MUT);if(fq)uFocus(8,yq,304,52);
  uT('JOGANDO BEM, VOCE EVOLUI MAIS',160,442,GRN,'center');uT('ACERTOU TUDO: QUASE O DOBRO',160,456,MUT,'center');
  uVignette();uiEnd()})}
function drawDrillDone(){hi(()=>{uiBegin();uiBg();const R_=drillResult;
  uT('TREINO CONCLUIDO',160,40,ACC,'center',16);uT(R_.n,160,66,WHITE,'center');
  for(let i=0;i<3;i++){const on=i<R_.stars,x=100+i*44;uTrophy(x,100,2,on?'#ffd23f':'#ffd23f',!on)}
  uT('ACERTOS '+R_.hits+' DE '+R_.max,160,150,WHITE,'center',16);
  uT(R_.ups?('+'+R_.ups+' EM '+({vel:'VELOCIDADE',for:'FORCA',pre:'PRECISAO',top:'JOGO POR CIMA'})[R_.a]):'EVOLUCAO EM ANDAMENTO',160,180,R_.ups?GRN:MUT,'center');
  const f=uiHit('ok',60,230,200,40,()=>{mode='career';car.msg='TREINO: '+R_.hits+'/'+R_.max;nextWeek('train');if(mode!=='cseason'){mode='career'}});uBtn(60,230,200,40,'CONTINUAR',ACC,f);
  uVignette();uiEnd()})}
function drillInput(){if(uiTap())return;if(uiInput())return;if(back()&&mode==='ctrain')mode='career'}
