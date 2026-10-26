/* ---------- carreira ----------
   Pontuação no estilo Premier Padel: Major 2000/1200, P1 1000/600, P2 500/300; cada fase anterior vale metade.
   As categorias FIP são uma escala própria do jogo. "req" = posição máxima da sua dupla no ranking para entrar. */
const CATS={
  BR:{n:'FIP BRONZE',s:'BRONZE',size:8,pts:[50,30,15,8],prize:2000,cost:300,col:'#d09060',req:99,range:[41,48],xp:2},
  SI:{n:'FIP SILVER',s:'SILVER',size:16,pts:[100,60,30,15,8],prize:4000,cost:500,col:'#c0c8d8',req:99,range:[25,48],xp:2},
  GO:{n:'FIP GOLD',s:'GOLD',size:16,pts:[250,150,75,38,19],prize:8000,cost:1000,col:'#ffd23f',req:40,range:[17,48],xp:3},
  P2:{n:'P2',s:'P2',size:16,pts:[500,300,150,75,38],prize:16000,cost:2000,col:'#5fd3ff',req:32,range:[9,48],xp:3},
  P1:{n:'P1',s:'P1',size:32,pts:[1000,600,300,150,75,38],prize:32000,cost:3500,col:'#7fffb0',req:24,range:[1,48],xp:4,bo3:true},
  MA:{n:'MAJOR',s:'MAJOR',size:32,pts:[2000,1200,600,300,150,75],prize:60000,cost:5000,col:'#ff7ad9',req:16,range:[1,48],xp:5,bo3:true},
  FI:{n:'FINALS',s:'FINALS',size:8,pts:[1500,900,450,225],prize:50000,cost:0,col:'#ffffff',req:8,range:[1,8],xp:5,bo3:true},
};
const FN=['LUCAS','PEDRO','MATEUS','RAFAEL','BRUNO','DIEGO','HUGO','IVAN','TIAGO','NICO','JORGE','PABLO','MARCO','SERGIO','ADRIAN','ENZO','MIGUEL','ANDRE','VICTOR','RAUL','CARLA','ANA','JULIA','LAURA','MARTA','PAULA','SOFIA','ELENA','LUISA','NORA','DAVI','OTTO','LEO','RUI','TOM','BIA','LIA','EVA'];
const LN=['ALVES','BRITO','CORREA','DUARTE','ESTEVES','FARIAS','GODOY','HORTA','IBANEZ','JARDIM','KLEIN','LOBATO','MACEDO','NOVAIS','OSORIO','PRADO','QUIROGA','RIBAS','SALAZAR','TEIXEIRA','URIBE','VARELA','WEBER','XAVIER','ZANETTI','AMARAL','BENTO','CASTRO','DORNELES','FONTANA','GUERRA','HOLANDA','LEMOS','MOURA','PAIVA','ROCHA','SIQUEIRA','TORRES','VIANA','MEIRA'];
const TEAMCOL=['#9b7bff','#ff8a3d','#3fb8c8','#c9a26b','#ff9ed8','#40e0a0','#6b8cff','#fff36b','#ff4fa0','#a0a0a0','#7fe0ff','#e8f0ff'];
const RKTS=[{n:'BASICA',c:0,b:{}},{n:'CONTROLE',c:6000,b:{pre:1}},{n:'POTENCIA',c:6000,b:{for:1}},{n:'EFEITO',c:9000,b:{top:1}},{n:'PRO TOUR',c:22000,b:{pre:1,for:1,top:1}}];
const SPONS=[[10,'AURORA',12000],[20,'ALTITUDE',7000],[40,'NOVA ONDA',3500],[60,'COSTA SUL',1800],[999,'BAIRRO SPORTS',700]];
const ROUNDN=n=>({2:'FINAL',4:'SEMIFINAL',8:'QUARTAS',16:'OITAVAS',32:'1a RODADA'}[n]||'RODADA');
const ROUNDNA=n=>({2:'NA FINAL',4:'NA SEMI',8:'NAS QUARTAS',16:'NAS OITAVAS',32:'NA 1a RODADA'}[n]||'');
const money$=v=>'$'+Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let car=save.car||null;
function newCareer(){
  const r=rng((Date.now()^0x5f3a)&0xffffff),used=new Set(),players=[],N=166;
  for(let i=0;i<N;i++){
    let n;do{n=FN[(r()*FN.length)|0]+' '+LN[(r()*LN.length)|0]}while(used.has(n)||n.length>13);used.add(n);
    const sk=clamp(3.6-3.3*Math.pow(i/(N-1),.8)+(r()-.5)*.2,.25,3.7);
    players.push({n,age:19+((r()*16)|0),hs:HS[(r()*3)|0],hair:HAIRS[(r()*5)|0],skin:(r()*5)|0,sk:+sk.toFixed(2),st:['equil','parede','rede','globo','canhoto'][(r()*5)|0],pts:Math.round(30+Math.pow(sk,2.6)*140+r()*60)});
  }
  const free=[20,40,60,80,100,120,140,163],rest=players.map((_,i)=>i).filter(i=>!free.includes(i)),teams=[];
  for(let i=0;i<rest.length;i+=2)teams.push([rest[i],rest[i+1]]);
  car=save.car={v:1,season:1,week:0,money:3000,cond:100,inj:0,myPts:0,players,teams,free:free.filter(i=>i!==163),partner:163,chem:0,coach:false,rk:[0],rkEq:0,wc:-1,physio:-1,tour:null,hist:[],titles:0,seasonTitles:0,msg:'BEM-VINDO!',last:null,pick:0,pmor:.7,age:19,diff:newDiff,contract:null,needOffer:true,circ:'BR',bpt:{}};
  carEnsure();pushNews('SUA CARREIRA COMECA!');newGoal();
  store();
}
const PL_=i=>car.players[i];
const teamKeyName=k=>k<0?(save.me.team||myName()+'/'+PL_(car.partner).n.split(' ').pop()):PL_(car.teams[k][0]).n.split(' ').pop()+'/'+PL_(car.teams[k][1]).n.split(' ').pop();
function indivRank(){const a=car.players.map((p,i)=>({i,n:p.n,pts:p.pts}));a.push({i:-1,n:myName(),pts:car.myPts});return a.sort((x,y)=>y.pts-x.pts)}
const myRank=()=>indivRank().findIndex(x=>x.i===-1)+1;
function teamList(){const t=car.teams.map((pr,k)=>({k,pts:PL_(pr[0]).pts+PL_(pr[1]).pts}));t.push({k:-1,pts:car.myPts+PL_(car.partner).pts});return t.sort((x,y)=>y.pts-x.pts)}
const myTeamPos=()=>teamList().findIndex(t=>t.k===-1)+1;
/* nível 0..3.6: atributos, raquete, parceiro, química e físico */
function myLevel(){const a=save.attr,s=a.vel+a.for+a.pre+a.top+attrBonus('vel')+attrBonus('for')+attrBonus('pre')+attrBonus('top');return clamp(.7+(s/4-45)/54*2.9,.3,3.7)}
function teamSk(k){if(k>=0)return(PL_(car.teams[k][0]).sk+PL_(car.teams[k][1]).sk)/2;return(.55*myLevel()+.45*PL_(car.partner).sk+car.chem*.25)*(.75+.25*car.cond/100)}
const winP=(a,c)=>1/(1+Math.exp(-(teamSk(a)-teamSk(c))*1.6));
function pairObj(k){
  const t=car.teams[k],a=PL_(t[0]),c=PL_(t[1]);
  return{n:teamKeyName(k),p:[[a.n,a.hs,a.hair,a.skin],[c.n,c.hs,c.hair,c.skin]],s:a.st,c:TEAMCOL[k%TEAMCOL.length],pat:k%4};
}
function weekInfo(){const o=weekOpts();return o[Math.min(car.pick||0,o.length-1)]}
function eligible(){return canEnter(weekInfo(),car.pick||0)}
function seedOrder(n){let s=[1,2];while(s.length<n){const m=s.length*2+1;s=s.flatMap(x=>[x,m-x])}return s}
function buildDraw(code,withMe,ex){
  const cat=CATS[code],list=(cat.nat?bptList():teamList()).filter(t=>!(ex&&ex.has(t.k)));
  let field=list.slice(cat.range[0]-1,cat.range[1]).filter(t=>t.k!==-1).slice(0,cat.size);
  if(withMe){if(field.length>=cat.size)field=field.slice(0,cat.size-1);field.push(list.find(t=>t.k===-1))}
  field.sort((x,y)=>y.pts-x.pts);
  while(field.length<cat.size)field.push({k:-2,pts:0});
  return seedOrder(cat.size).map(i=>field[i-1].k);
}
function simMatch(a,c){if(a===-2)return c;if(c===-2)return a;return Math.random()<winP(a,c)?a:c}
function playRound(t){const nx=[];for(let i=0;i<t.cur.length;i+=2){const a=t.cur[i],c=t.cur[i+1];let w;if(a===-1||c===-1)w=t.mine;else w=simMatch(a,c);t.res[a===w?c:a]=t.r;nx.push(w)}t.cur=nx;t.r++}
function finishTour(t){
  while(t.cur.length>1){t.mine=null;if(t.cur.includes(-1)){/* nunca: você já saiu */}playRound(t)}
  t.res[t.cur[0]]=t.R;t.champ=t.cur[0];
  const cat=CATS[t.code];
  if(t.champ!==undefined&&t.champ!==-2&&!t.quiet)pushNews(t.city+' '+CATS[t.code].s+': '+(t.champ===-1?'VOCES':teamKeyName(t.champ))+' CAMPEOES');
  for(const k in t.res){const key=+k;if(key===-2)continue;const idx=t.R-t.res[k],p=cat.pts[Math.min(idx,cat.pts.length-1)]||0,wp=cat.nat?Math.round(p*WFAC):p;
    if(cat.nat)bptAdd(key,p);
    if(key===-1){car.myPts+=wp;PL_(car.partner).pts+=wp;t.myPts=p;t.prize=Math.round(cat.prize/Math.pow(2,idx))}
    else{PL_(car.teams[key][0]).pts+=wp;PL_(car.teams[key][1]).pts+=wp}}
}
function simWeekAI(){const{code,city}=weekInfo();const t={code,city,cur:buildDraw(code,false),res:{},r:0,R:Math.log2(CATS[code].size)};finishTour(t);car.last={city:weekInfo().city,code,champ:teamKeyName(t.champ)}}
function enterTour(){
  const W=weekInfo(),{code,cat,city}=W;
  car.money-=W.cost;car.cond=Math.max(0,car.cond-W.tired);car.pickPlayed=car.pick||0;
  const draw=buildDraw(code,true);car.usedKeys=draw.filter(k=>k>=0);
  car.tour={code,city,cur:draw,res:{},r:0,R:Math.log2(cat.size),won:0,alive:true,myPts:0,prize:0};
  store();
}
const tourOpp=()=>{const t=car.tour,i=t.cur.indexOf(-1);return t.cur[i^1]};
const tourIsFinal=()=>car.tour.cur.length===2;
function tourMatchDone(win,sim){
  const t=car.tour,cat=CATS[t.code],oppK=tourOpp();t.lastOpp=oppK;
  h2hNote(oppK,win);if(win)goalOnWin();
  car.cond=clamp(car.cond-(sim?(cat.nat?4:7):(cat.nat?5:9))*happyDrain(),0,100);
  car.chem=Math.min(1,car.chem+.04);
  if(win){t.won++;save.wins++;partnerAfterWin();contractWin()}
  t.mine=win?-1:tourOpp();
  playRound(t);
  let injured=false;
  if(car.cond<35&&Math.random()<(35-car.cond)/60){car.inj=1+(Math.random()<.4?1:0);injured=true}
  if(!win||t.cur.length===1||injured){
    if(win&&t.cur.length>1&&injured){t.res[-1]=t.r;t.cur=t.cur.map(k=>k===-1?-2:k)}
    t.alive=false;finishTour(t);
    partnerAfterTour(t);
    if(t.champ===-1){car.titles++;car.seasonTitles++;save.titles++;gainSpread(cat.xp*.3);trophyAdd(t);contractTitle()}
    else pushNews('VOCES CAIRAM '+ROUNDNA(Math.pow(2,t.R-(t.res[-1]||0)))+' EM '+t.city);
    goalOnTour(t);
    car.money+=t.prize||0;
    car.hist.push({w:car.week,code:t.code,city:t.city,res:t.champ===-1?'CAMPEAO':'ELIM. '+ROUNDNA(Math.pow(2,t.R-(t.res[-1]||0)))});
    t.injured=injured;
  }
  store();
  return injured;
}
function nextWeek(action){
  carEnsure();const r0=myRank();
  depthEnsure();
  if(action!=='played')simWeekAll(-1);else simWeekAll(car.pickPlayed,car.usedKeys);
  const rec=({played:6,train:15,rest:35,inj:25}[action]||10)+(action==='train'?happyTrain():0);
  car.cond=clamp(car.cond+rec,0,100);
  if(car.inj>0&&action!=='played')car.inj--;
  car.tour=null;car.week++;
  if(car.week%4===0){const sal=salary();car.money+=sal;let m='SALARIO +'+money$(sal);if(car.coach){car.money-=1500;m+=' TEC -$1.500'}car.msg=m}
  const r1=myRank();car.best=Math.min(car.best,r1);
  if(r0-r1>=5)pushNews('VOCE SOBE PARA #'+r1+' NO RANKING');else if(r1-r0>=5)pushNews('VOCE CAI PARA #'+r1);
  if(Math.random()<.14)pushNews(PL_(car.partner).n.split(' ')[0]+' '+PARTNER_TALK[(Math.random()*PARTNER_TALK.length)|0]);
  partnerWeekCheck();
  if(car.week>=SEASON_W){decideCircuit();store();mode='cseason';return}
  goalOnWeek();if(car.week===10)car.needOffer=true;
  car.wc=-1;
  const m0=weekOpts()[0];
  if(car.circ==='EU'&&!canEnter(m0,0)&&m0.code!=='FI'&&myTeamPos()<=m0.cat.req+10&&Math.random()<.3){car.wc=car.week;car.msg='CONVITE PARA '+m0.cat.n+'!'}
  defaultPick();
  store();
}
const sponsor=()=>{const r=myRank();return SPONS.find(s=>r<=s[0])};
const salary=()=>car.contract?car.contract.fixed:sponsor()[2];
function newSeason(){
  car.season++;save.season=car.season;car.week=0;car.cond=100;car.inj=0;car.seasonTitles=0;car.hist=[];car.tour=null;
  car.myPts=Math.round(car.myPts*.35);
  for(const p of car.players)p.pts=Math.round(p.pts*.35);
  if(car.nextCirc)car.circ=car.nextCirc;car.nextCirc=null;car.bpt={};
  ageSeason();car.pmor=Math.max(car.pmor,.5);car.needOffer=true;car.pick=0;defaultPick();
  car.msg=car.circ==='EU'?'GIRA EUROPEIA!':'TEMPORADA '+car.season+' COMECOU';pushNews('TEMPORADA '+car.season+' COMECOU');car.goal=null;newGoal();store();
}
const reqRankFor=sk=>sk>=3?15:sk>=2.3?35:sk>=1.5?60:999;
const freeSorted=()=>car.free.slice().sort((a,c)=>PL_(c).sk-PL_(a).sk);
const stars=sk=>Math.max(1,Math.min(5,Math.round(sk/3.6*5)));
