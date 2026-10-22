/* ---------- circuitos: nacional (inspirado no BPT) e gira europeia ----------
   A carreira começa no circuito nacional. Ranking BPT próprio, zerado a cada temporada.
   Fim da temporada: top 5 do BPT tem pequena chance de convite para a gira europeia,
   top 3 mais, campeão do ranking (ou do Master Finals) mais ainda.
   Na gira: só torneios europeus, Majors e Finals. Quem cai para fora do top 48 de duplas volta ao BPT. */
Object.assign(CATS,{
  CH:{n:'BPT CHALLENGER',s:'CHALLENGER',size:8,pts:[150,90,45,20],prize:1500,cost:150,col:'#7ec850',req:99,range:[17,40],xp:2,nat:true},
  OP:{n:'BPT OPEN',s:'OPEN',size:16,pts:[300,180,90,45,20],prize:3000,cost:250,col:'#3fc8c8',req:99,range:[9,40],xp:2,nat:true},
  MS:{n:'BPT MASTER',s:'MASTER',size:16,pts:[600,360,180,90,45],prize:6000,cost:400,col:'#ffb040',req:99,range:[1,40],xp:3,nat:true},
  MF:{n:'BPT MASTER FINALS',s:'M.FINALS',size:8,pts:[900,540,270,135],prize:12000,cost:0,col:'#ffe9a0',req:8,range:[1,8],xp:4,nat:true},
});
const WFAC=.25,EU_SLOTS=48;
/* [cidade, categoria, alternativa (Challenger na mesma semana) ou null] — base: calendário BPT 2026 */
const NATC=[['JOINVILLE','CH',null],['LIVRAMENTO','CH',null],['ERECHIM','MS','PASSO FUNDO'],['CURITIBA','CH',null],['QUARAI','CH',null],
  ['CAMAQUA','OP','PELOTAS'],['PORTO ALEGRE','CH',null],['SORRISO','MS','CHAPECO'],['SAO PAULO','OP','CURITIBA'],['FLORIPA','MS','JOINVILLE'],
  ['SANTA MARIA','OP','LIVRAMENTO'],['CAMBORIU','CH',null],['CHAPECO','OP','ERECHIM'],['CAMAQUA','MS','QUARAI'],['PASSO FUNDO','CH',null],
  ['ITAJAI','OP','CAMBORIU'],['RIO','OP','PORTO ALEGRE'],['CARAZINHO','MS','SANTA MARIA'],['PELOTAS','CH',null],['ITAJAI','MF',null]];
const NAT_FAR=new Set(['SAO PAULO','RIO','SORRISO']);
const EUC=[['MALAGA','GO','GRANADA'],['BRUXELAS','P2','GANTE'],['GENOVA','P2','TURIM'],['MADRI','P1','TOLEDO'],['ROMA','MA','NAPOLES'],
  ['VALENCIA','GO','ALICANTE'],['BORDEUS','P2','TOULOUSE'],['MALMO','GO','COPENHAGUE'],['VENEZA','P2','VERONA'],['MILAO','P1','BERGAMO'],
  ['PARIS','MA','LILLE'],['AMSTERDA','GO','UTRECHT'],['ROTTERDAM','P2','HAIA'],['SEVILHA','P1','CORDOBA'],['MUNIQUE','GO','SALZBURGO'],
  ['ESTOCOLMO','P2','UPPSALA'],['LONDRES','P1','BRISTOL'],['MARBELLA','GO','CADIZ'],['MONACO','P2','NICE'],['BARCELONA','FI',null]];
const SEASON_W=20;
const calOf=c=>c==='BR'?NATC:EUC;
function optsFor(circ,w){
  const e=calOf(circ)[w],o=[{code:e[1],city:e[0]}];
  if(circ==='BR'){if(e[2])o.push({code:'CH',city:e[2]})}
  else{const a=ALT[e[1]];if(a)o.push({code:a,city:e[2]})}
  return o.map(x=>{const cat=CATS[x.code];let mul,tired,far;
    if(circ==='BR'){far=NAT_FAR.has(x.city);mul=far?1.2:.6;tired=far?6:2}else{far=true;mul=1;tired=4}
    return{...x,circ,far,cat,cost:Math.round(cat.cost*mul),tired}});
}
/* ranking BPT: duplas do mundo abaixo do top 48 + você (quando está no nacional) */
function natPool(){return teamList().filter(t=>t.k!==-1).slice(EU_SLOTS).map(t=>t.k)}
const bptOf=k=>(car.bpt&&car.bpt[k])||0;
function bptList(){
  const L=natPool().map(k=>({k,pts:bptOf(k),w:k<0?0:PL_(car.teams[k][0]).pts+PL_(car.teams[k][1]).pts}));
  if(car.circ==='BR')L.push({k:-1,pts:bptOf(-1),w:car.myPts+PL_(car.partner).pts});
  return L.sort((a,c)=>c.pts-a.pts||c.w-a.w);
}
const bptPos=()=>bptList().findIndex(t=>t.k===-1)+1;
function bptAdd(k,p){car.bpt=car.bpt||{};car.bpt[k]=(car.bpt[k]||0)+p}
function circEnsure(){
  if(car.circ===undefined)car.circ='EU';
  if(!car.bpt)car.bpt={};
}
/* decisão de fim de temporada */
function decideCircuit(){
  car.giraMsg=null;car.nextCirc=car.circ;car.bptFinal=0;
  if(car.circ==='BR'){
    const p=bptPos();car.bptFinal=p;
    const mf=(car.trophies||[]).some(t=>t.c==='MF'&&t.s===car.season);
    let ch=p===1?.6:p<=3?.35:p<=5?.15:0;if(mf)ch=Math.min(.8,ch+.15);
    if(ch>0&&Math.random()<ch){car.nextCirc='EU';car.giraMsg='CONVITE: GIRA EUROPEIA!';pushNews('CONVIDADOS PARA A GIRA EUROPEIA!')}
    else car.giraMsg=ch>0?'SEM CONVITE DA GIRA':'SEGUE NO BPT';
  }else{
    if(myTeamPos()>EU_SLOTS){car.nextCirc='BR';car.giraMsg='PERDEU A VAGA: BPT';pushNews('FORA DO TOP '+EU_SLOTS+': DE VOLTA AO BPT')}
    else car.giraMsg='VAGA MANTIDA NA GIRA';
  }
}

const FLY_T=230;let fly=null;
function startFly(){const t=car.tour;fly={t:0,city:t.city,code:t.code,eu:car.circ==='EU'};mode='cfly';sfx.ui()}
function stepFly(){
  fly.t++;
  if(fly.t===4)beep(220,.25,'triangle',.04,1.6);
  if(fly.t===120){sfx.game()}
  if((fly.t>20&&(prs(menu,'a')||prs(menu,'start')||prs(menu,'b')))||fly.t>=FLY_T){fly=null;mode='ctour';cur=0;sfx.ui()}
}
function drawPlane(x,y,tilt){
  const k=2,r=(a,b,w,h,c)=>R(x+a*k,y+(b+Math.round(tilt*a/18))*k,w*k,h*k,c);
  r(0,2,18,4,'#f4f6ff');r(18,3,3,2,'#f4f6ff');r(0,0,4,2,'#f4f6ff');r(1,-2,3,2,'#ef3e36');
  for(let i=0;i<5;i++)r(6+i*2,3,1,1,'#2e86ff');r(18,3,2,1,'#2e86ff');r(7,5,8,2,'#c8ccd8');r(9,7,4,1,'#a8acb8');r(0,5,18,1,'#c8ccd8');
}
function drawFly(){
  const t=fly.t,top=42,gy=top+52;
  const sk=fly.eu?['#2a4a9a','#4a74c8','#7fa8e8']:['#3a7ad8','#6ca8f0','#a8d4ff'];
  R(0,top,CW,18,sk[0]);R(0,top+18,CW,18,sk[1]);R(0,top+36,CW,gy-top-36,sk[2]);
  for(let i=0;i<7;i++){const x=((i*53-t*(1+(i%3)*.6))%220+220)%220-40,y=top+6+((i*37)%40);R(x,y,22,4,'#ffffff');R(x+5,y-3,12,3,'#ffffff');R(x+2,y+4,18,1,'#d8e8ff')}
  R(0,gy,CW,10,fly.eu?'#2a6aa8':'#3f9a40');for(let i=0;i<12;i++)R(((i*29-t*2)%180+180)%180-10,gy+3+(i%3)*2,6,1,fly.eu?'#ffffff':'#2f7a30');
  /* avião decola, cruza e desce */
  const p=Math.min(1,t/120),x=-44+p*210,alt=Math.sin(p*Math.PI)*30,y=gy-16-alt,tilt=p<.35?-3:p>.7?3:0;
  if(t<126){for(let i=2;i<16;i+=2){const q=p-i*.016;if(q<0)break;R(-44+q*210+2,gy-16-Math.sin(q*Math.PI)*30+7,2,1,'#ffffff')}drawPlane(Math.round(x),Math.round(y),tilt)}
  txt(t<120?'VIAJANDO PARA':'BEM-VINDOS A',80,30,WHITE,'center');
  const sy=gy+16,col=CATS[fly.code].col;
  R(6,sy-2,148,CSH+4,'#05071a');R(6,sy-2,148,1,col);R(6,sy+CSH+1,148,1,col);
  if(t>=110){cx.save();cx.beginPath();const k=Math.min(1,(t-110)/30);cx.rect(8,sy,144*k,CSH);cx.clip();cityScene(fly.city,8,sy);cx.restore()}
  else for(let i=0;i<6;i++)R(14+i*22,sy+36+((t>>3)+i)%3,6,6,'#141a3c');
  txt(fly.city,80,sy+88,WHITE,'center',F16);catBadge(fly.code,80,sy+110);
  if(t>20&&Math.floor(frame/24)%2)txt('A CONTINUA',80,264,MUT,'center');
}
