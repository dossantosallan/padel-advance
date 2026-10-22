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

/* ---------- cenas das cidades (144x64) ---------- */
function cityScene(city,X,Y){
  const r=(x,y,w,h,c)=>R(X+x,Y+y,w,h,c);
  const sky=(a,b,c)=>{r(0,0,144,22,a);r(0,22,144,16,b);r(0,38,144,26,c||b)};
  const ground=(y,c,d)=>{r(0,y,144,64-y,c);if(d)for(let i=0;i<144;i+=6)r(i+((i/6)%2)*2,y+2,2,1,d)};
  const sun=(x,y,c)=>{r(x-3,y-4,6,8,c);r(x-4,y-3,8,6,c)};
  const cloud=(x,y)=>{r(x,y,14,3,'#ffffff');r(x+3,y-2,7,2,'#ffffff')};
  const water=(y,c,h)=>{r(0,y,144,h||64-y,c);for(let i=0;i<5;i++)r(((frame>>2)+i*31)%140,y+2+i%3*3,4,1,'#ffffff')};
  const tree=(x,y)=>{r(x+2,y+6,2,4,'#6b4423');r(x,y,6,6,'#2e8b3e');r(x+1,y-1,4,1,'#2e8b3e')};
  const bldg=(x,y,w,h,c,win)=>{r(x,y,w,h,c);for(let j=y+2;j<y+h-2;j+=4)for(let i=x+1;i<x+w-1;i+=3)r(i,j,1,2,win||'#ffe9a0')};
  const D={
    JOINVILLE(){ /* casas enxaimel e flores */
      sky('#7fc8ff','#b8e4ff');cloud(96,6);ground(48,'#3f9a40');
      for(const hx of[18,74]){r(hx,26,40,22,'#f4ecd8');for(let i=0;i<5;i++)r(hx+i*9,26,2,22,'#5a3418');r(hx,36,40,2,'#5a3418');
        for(let i=0;i<4;i++){r(hx+2+i*9,28,1,8,'#5a3418')}
        for(let j=0;j<12;j++)r(hx+20-j*2-2,14+j,4+j*4,1,'#c0392b');r(hx+12,40,6,8,'#5a3418')}
      const fc=['#ff6fa8','#ffd23f','#ff4f4f','#c86bff','#ffffff'];for(let i=0;i<30;i++){r(4+i*4.7,52+(i*7)%9,2,2,fc[i%5]);r(5+i*4.7,54+(i*7)%9,1,2,'#1f6b2a')}},
    LIVRAMENTO(){ /* Parque Internacional: obelisco e as duas bandeiras */
      sky('#8fd0ff','#c8ecff');cloud(14,8);ground(50,'#4caf50','#3d8f40');
      r(68,10,8,40,'#e8e8e8');r(70,6,4,4,'#e8e8e8');r(71,4,2,2,'#e8e8e8');r(64,48,16,3,'#c8c8c8');r(76,10,1,40,'#b8b8b8');
      r(30,16,1,34,'#888');r(31,16,16,11,'#1f9a3e');r(35,18,8,7,'#ffd23f');r(37,20,4,3,'#1f4fa8');
      r(112,16,1,34,'#888');for(let i=0;i<5;i++)r(113,16+i*2,16,1,i%2?'#ffffff':'#3a6ed8');r(113,16,6,5,'#ffffff');r(115,17,2,2,'#ffd23f')},
    ERECHIM(){ /* castelinho de madeira com torre */
      sky('#9fd8ff','#d8f0ff');cloud(110,6);ground(50,'#5aa64a');tree(14,38);tree(124,38);
      r(44,26,46,24,'#9a5a2a');for(let j=28;j<50;j+=3)r(44,j,46,1,'#7a4420');
      for(let i=0;i<4;i++)r(50+i*10,32,5,6,'#ffe9a0');r(64,40,7,10,'#4a2410');
      for(let j=0;j<10;j++)r(66-j*2.4,16+j,1+j*4.8,1,'#5a2a14');
      r(88,14,14,36,'#a8682e');r(92,20,5,6,'#ffe9a0');for(let j=0;j<12;j++)r(95-j*.7,2+j,1+j*1.4,1,'#5a2a14')},
    CURITIBA(){ /* estufa do Jardim Botânico */
      sky('#a8c8e8','#d8e8f4');ground(50,'#3e9e4a');
      const g='#bfe8ff',f='#ffffff';
      r(34,30,76,20,g);for(let i=34;i<110;i+=6)r(i,30,1,20,f);r(34,30,76,1,f);
      for(let j=0;j<14;j++){const w=Math.round(Math.sqrt(1-Math.pow(j/14,2))*18);r(72-w,30-j,w*2,1,j%3?g:f)}
      r(71,10,2,6,f);for(let j=0;j<6;j++){const w=Math.round(Math.sqrt(1-Math.pow(j/6,2))*7);r(72-w,24-j,w*2,1,g)}
      for(let i=0;i<12;i++)r(8+i*11,54,6,3,i%2?'#ff6f8a':'#ffd23f');r(0,58,144,2,'#d8c8a0')},
    QUARAI(){ /* Cerro do Jarau, pampa e a ponte internacional */
      sky('#ffc890','#ffe4b8');sun(116,14,'#fff4c0');
      for(let i=0;i<70;i++){const h=Math.max(0,16-Math.abs(i-35)*.25-(Math.abs(i-35)>24?(Math.abs(i-35)-24)*1.2:0));r(10+i,40-h,1,h,'#7a6a48')}r(30,24,40,2,'#7a6a48');
      ground(40,'#9ab050','#7e9640');water(50,'#4a88c8',6);
      r(76,44,68,2,'#d8d0c0');for(let i=0;i<4;i++){r(80+i*16,46,2,10,'#d8d0c0');for(let j=0;j<6;j++)r(82+i*16+j*2,46+Math.round(Math.abs(j-3)*1.2),2,1,'#d8d0c0')}},
    CAMAQUA(){ /* arrozais e Lagoa dos Patos */
      sky('#9fd0ff','#d0ecff');cloud(30,6);cloud(100,10);water(30,'#5aa0d0',10);
      ground(40,'#6abf3a');for(let j=42;j<64;j+=4)for(let i=0;i<144;i+=4)r(i+(j%8?2:0),j,1,3,'#3f8f22');
      r(96,34,6,6,'#ffffff');r(100,30,2,4,'#ffffff');r(102,30,3,1,'#ffb040');r(98,40,1,6,'#333');r(100,40,1,6,'#333')},
    'PORTO ALEGRE'(){ /* chaminé da Usina do Gasômetro e o pôr do sol no Guaíba */
      sky('#ff9a4a','#ffc070','#ffd890');sun(30,30,'#fff0a0');water(40,'#c8703a');for(let i=0;i<6;i++)r(24+((i*7)%14),42+i*3,10,1,'#ffe080');
      r(70,22,52,18,'#a84a2a');for(let i=0;i<8;i++)r(74+i*6,26,3,8,'#ffd890');r(70,22,52,2,'#7a2a14');
      r(100,0,9,22,'#b8562e');for(let j=2;j<22;j+=4)r(100,j,9,1,'#8a3a1e');r(99,0,11,2,'#7a2a14')},
    SORRISO(){ /* soja até o horizonte e silos */
      sky('#6fc0ff','#b0e0ff');cloud(10,6);cloud(60,12);sun(130,10,'#fff6b0');ground(40,'#8ac840');
      for(let j=42;j<64;j+=3)r(0,j,144,1,'#6ea830');
      for(let k=0;k<3;k++){const x=84+k*16;r(x,16,13,26,'#c8ccd4');r(x+3,16,2,26,'#e8ecf4');for(let j=0;j<5;j++)r(x+6-j*1.3,11+j,1+j*2.6,1,'#a8acb4')}
      r(132,10,3,32,'#a8acb4');r(80,22,52,2,'#a8acb4');
      r(20,46,14,6,'#2f9a3a');r(18,44,6,4,'#2f9a3a');r(22,52,4,4,'#222');r(30,52,3,3,'#222')},
    'SAO PAULO'(){ /* MASP e prédios */
      sky('#a8b8c8','#c8d4e0');
      [[2,8,14,40],[18,16,10,32],[30,4,12,44],[116,10,12,38],[130,2,12,46],[104,18,10,30]].forEach(([x,y,w,h])=>bldg(x,y,w,h,'#7a8494'));
      ground(48,'#8a8a8a');r(0,47,144,1,'#5a5a5a');
      r(46,26,54,14,'#8c9098');for(let i=0;i<9;i++)r(48+i*6,30,4,6,'#30343c');
      r(44,22,3,26,'#e02a24');r(99,22,3,26,'#e02a24');r(44,22,58,3,'#e02a24');r(44,38,58,2,'#e02a24')},
    FLORIPA(){ /* ponte Hercílio Luz */
      sky('#78c4ff','#b8e2ff');cloud(18,6);
      for(let i=0;i<40;i++)r(104+i,30-Math.min(12,i*.6),1,20,'#3d8a4a');
      water(42,'#2f7fc0');
      r(0,36,144,2,'#c8c8d0');r(40,6,4,32,'#c8c8d0');r(100,6,4,32,'#c8c8d0');
      for(let i=0;i<=60;i++){const t=(i-30)/30,y=Math.round(6+(1-t*t)*24);r(42+i,y,1,1,'#e8e8f0');if(i%4===0)r(42+i,y,1,36-y,'#9a9aa8')}
      for(let i=0;i<40;i++){r(i,6+Math.round(i*.75),1,1,'#e8e8f0');r(104+i,36-Math.round((40-i)*.75),1,1,'#e8e8f0')}},
    'SANTA MARIA'(){ /* gare da estação e locomotiva */
      sky('#8fcaff','#c8e6ff');cloud(100,6);ground(46,'#7a7a6a');r(0,52,144,2,'#5a4a3a');for(let i=0;i<144;i+=6)r(i,51,3,4,'#6b4423');
      r(14,18,70,28,'#e8d8b0');r(14,18,70,3,'#a85a3a');r(40,8,18,12,'#e8d8b0');r(40,8,18,2,'#a85a3a');r(45,11,8,7,'#ffffff');r(48,13,2,3,'#222');r(49,14,3,1,'#222');
      for(let i=0;i<6;i++)r(18+i*11,26,6,12,'#6b8ab0');
      r(96,34,34,12,'#2a2a2a');r(118,26,12,8,'#2a2a2a');r(100,28,5,6,'#2a2a2a');r(96,42,34,2,'#c0392b');
      for(const wx of[100,110,122])r(wx,46,6,5,'#555');for(let i=0;i<3;i++)r(98-i*3,22-i*4,4+i*2,3,'#d8d8d8')},
    CAMBORIU(){ /* arranha-céus, roda-gigante e praia */
      sky('#6fc4ff','#b4e4ff');
      [[8,4,9,40],[19,10,8,34],[29,0,10,44],[41,8,8,36],[51,2,9,42],[62,12,8,32],[72,6,9,38]].forEach(([x,y,w,h],i)=>bldg(x,y,w,h,i%2?'#d8dce8':'#b8c4d8','#7fb0e0'));
      const cxw=112,cyw=22;for(let a=0;a<32;a++){const t=a/32*Math.PI*2;r(cxw+Math.cos(t)*16,cyw+Math.sin(t)*16,1,1,'#ffffff');if(a%4===0){r(cxw+Math.cos(t+frame*.01)*16-1,cyw+Math.sin(t+frame*.01)*16,3,2,'#ff6f6f')}}
      r(cxw-1,cyw,2,22,'#e8e8e8');r(cxw-6,cyw+20,12,2,'#e8e8e8');
      r(0,44,144,6,'#f0dca0');water(50,'#2f8ad0')},
    CHAPECO(){ /* Arena Condá */
      sky('#8fd0ff','#c8ecff');cloud(16,6);cloud(96,4);ground(52,'#3f9a40');
      r(14,22,116,30,'#1f8a3a');r(14,22,116,3,'#ffffff');for(let j=27;j<50;j+=4)r(16,j,112,1,'#2fae4a');
      for(let i=0;i<20;i++)r(20+i*5.5,30+(i%3)*6,2,2,i%2?'#ffffff':'#2fae4a');
      r(60,40,24,12,'#ffffff');r(62,42,20,10,'#1f6a30');
      for(const lx of[8,132]){r(lx,4,2,48,'#c8c8c8');r(lx-3,2,8,4,'#fff6c0')}},
    'PASSO FUNDO'(){ /* cuia de chimarrão no pampa */
      sky('#9fd4ff','#d4eeff');sun(24,12,'#fff4b0');ground(48,'#5aa64a','#4a9040');
      r(58,24,30,24,'#8a5a2a');r(54,28,38,16,'#8a5a2a');r(60,46,26,4,'#6b4423');r(56,24,34,3,'#c8a060');
      r(60,22,26,3,'#3fa83a');r(64,20,18,3,'#58c84a');r(80,4,3,22,'#d8d8e0');r(78,4,7,2,'#d8d8e0');
      tree(14,36);tree(118,38);tree(130,40)},
    ITAJAI(){ /* porto: guindastes e contêineres */
      sky('#88c8f0','#c0e0f8');cloud(60,5);water(48,'#2a6aa8');
      r(0,40,144,8,'#8a8a8a');
      for(const gx of[20,70]){r(gx,6,3,34,'#ff8a2a');r(gx+16,6,3,34,'#ff8a2a');r(gx-8,6,40,3,'#ff8a2a');r(gx+28,9,2,12,'#444')}
      const cc=['#c0392b','#2e86de','#27ae60','#f39c12','#8e44ad'];for(let i=0;i<8;i++)for(let j=0;j<2;j++)r(96+(i%4)*12,32-j*6-((i>>2)*0),11,5,cc[(i+j)%5]);
      r(10,46,70,6,'#1b2350');r(14,42,10,4,'#ffffff');for(let i=0;i<4;i++)r(30+i*11,42,10,4,cc[i])},
    RIO(){ /* Cristo Redentor e Pão de Açúcar */
      sky('#5fc0ff','#a8e0ff');cloud(70,8);
      for(let i=0;i<60;i++){const h=Math.max(0,36-Math.abs(i-24)*1.1);r(2+i,50-h,1,h,'#2f7a3a')}
      r(25,6,2,9,'#f4f4f4');r(20,8,12,2,'#f4f4f4');r(25,4,2,2,'#f4f4f4');
      for(let i=0;i<34;i++){const h=Math.max(0,24-Math.pow(Math.abs(i-17)/17,1.6)*24);r(96+i,50-h,1,h,'#3a7a3a')}
      for(let i=0;i<20;i++){const h=Math.max(0,12-Math.abs(i-10)*1.1);r(76+i,50-h,1,h,'#3a7a3a')}
      for(let i=0;i<26;i++)r(86+i,38-Math.round(i*.5),1,1,'#555');r(98,32,3,2,'#ff4f4f');
      water(50,'#2a8ad0')},
    CARAZINHO(){ /* igreja matriz e trigais */
      sky('#9fd8ff','#d8f0ff');cloud(18,8);ground(46,'#d8b84a');for(let j=48;j<64;j+=3)for(let i=0;i<144;i+=5)r(i+(j%6?2:0),j,1,2,'#b8982a');
      r(52,20,40,26,'#f0ece0');r(54,30,8,10,'#8ab0d0');r(82,30,8,10,'#8ab0d0');r(68,34,8,12,'#6b4423');
      for(const tx of[50,86]){r(tx,8,8,38,'#f0ece0');for(let j=0;j<7;j++)r(tx+4-j*.6,1+j,1+j*1.2,1,'#8a8aa0');r(tx+3,12,2,4,'#6b4423')}
      for(let j=0;j<8;j++)r(72-j*2.5,12+j,1+j*5,1,'#b84a3a')},
    PELOTAS(){ /* Mercado Público e os doces */
      sky('#a0d4ff','#d0ecff');ground(48,'#c8b890');
      r(20,22,104,26,'#f0d8a8');r(20,22,104,3,'#c87a4a');for(let i=0;i<10;i++)r(24+i*10,28,5,10,'#5a7aa8');r(66,36,12,12,'#6b4423');
      r(64,6,16,16,'#c8ccd4');r(66,8,12,12,'#9aa0aa');r(69,11,6,6,'#ffffff');r(71,12,1,3,'#222');r(71,14,3,1,'#222');for(let j=0;j<5;j++)r(72-j*1.5,1+j,1+j*3,1,'#9aa0aa');
      const dc=['#5a3018','#ff9ecf','#fff0c0','#ffd23f'];for(let i=0;i<9;i++){r(8+i*15,54,7,5,'#ffffff');r(9+i*15,52,5,4,dc[i%4])}},
    ROMA(){sky('#ffcf8a','#ffe8c0');sun(124,12,'#fff4c0');ground(52,'#c8b48a');
      for(let j=0;j<3;j++)r(24-j*0,18+j*11,96,10,j===2?'#c89a6a':'#d8aa78');for(let j=0;j<3;j++)for(let i=0;i<12;i++)r(28+i*8,20+j*11,4,7,'#7a4a2a');r(104,14,18,4,'#d8aa78')},
    PARIS(){sky('#8fb8e8','#c0d8f0');cloud(20,10);ground(54,'#5aa64a');
      for(let j=0;j<48;j++){const w=Math.max(1,Math.round(Math.pow(j/48,2.2)*34));r(72-w/2,6+j,w,1,'#8a6a4a');if(j>30)r(72-w/2+w*.3,6+j,w*.4,1,'#c0d8f0')}r(71,2,2,4,'#8a6a4a');r(60,26,24,2,'#6a4a2a');r(54,40,36,2,'#6a4a2a')},
    BARCELONA(){sky('#7fc8ff','#c0e6ff');ground(54,'#d8c8a0');
      for(const[x,h]of[[44,40],[56,48],[68,52],[80,48],[92,40]]){for(let j=0;j<h;j++){const w=Math.max(2,Math.round(8-j/h*6));r(x+4-w/2,54-j,w,1,'#c8a878')}r(x+3,54-h-3,2,3,'#ffd23f')}
      water(58,'#2f8ad0',6)},
    MADRI(){sky('#88c4ff','#c8e4ff');ground(52,'#c8b890');r(36,20,72,32,'#e0d0b0');r(36,18,72,3,'#b8a888');for(let i=0;i<5;i++)r(42+i*14,30,8,22,i===2?'#7aa0c8':'#5a4a3a');r(66,10,12,10,'#e0d0b0')},
  };
  const f=D[city];
  if(f){f();return}
  /* cidade europeia genérica: telhados, torre de igreja e rio */
  sky('#88bce8','#c4dcf0');cloud(20,8);
  let s=0;for(const ch of city)s=(s*31+ch.charCodeAt(0))%997;
  for(let i=0;i<9;i++){const w=12+(s*(i+3))%6,h=14+(s*(i+7))%16,x=i*16;r(x,48-h,w,h,['#e8d8c0','#d8c0a0','#f0e4d0'][i%3]);for(let j=0;j<w/2;j++)r(x+j,48-h-j*.7,w-j*2,1,'#b85a3a');r(x+3,52-h,3,4,'#5a7aa8')}
  r(64+(s%40)-20,4,8,44,'#c8b898');for(let j=0;j<10;j++)r(68+(s%40)-20-j*.5,j-6+4,1+j,1,'#6a6a7a');
  water(48,'#4a7ab0');
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
  const t=fly.t,top=44,gy=top+84;
  const sk=fly.eu?['#2a4a9a','#4a74c8','#7fa8e8']:['#3a7ad8','#6ca8f0','#a8d4ff'];
  R(0,top,CW,28,sk[0]);R(0,top+28,CW,28,sk[1]);R(0,top+56,CW,gy-top-56,sk[2]);
  for(let i=0;i<7;i++){const x=((i*53-t*(1+(i%3)*.6))%220+220)%220-40,y=top+8+((i*37)%68);R(x,y,22,4,'#ffffff');R(x+5,y-3,12,3,'#ffffff');R(x+2,y+4,18,1,'#d8e8ff')}
  R(0,gy,CW,10,fly.eu?'#2a6aa8':'#3f9a40');for(let i=0;i<12;i++)R(((i*29-t*2)%180+180)%180-10,gy+3+(i%3)*2,6,1,fly.eu?'#ffffff':'#2f7a30');
  /* avião decola, cruza e desce */
  const p=Math.min(1,t/120),x=-44+p*210,alt=Math.sin(p*Math.PI)*48,y=gy-16-alt,tilt=p<.35?-3:p>.7?3:0;
  if(t<126){for(let i=2;i<16;i+=2){const q=p-i*.016;if(q<0)break;R(-44+q*210+2,gy-16-Math.sin(q*Math.PI)*48+7,2,1,'#ffffff')}drawPlane(Math.round(x),Math.round(y),tilt)}
  txt(t<120?'VIAJANDO PARA':'BEM-VINDOS A',80,30,WHITE,'center');
  const sy=gy+16,col=CATS[fly.code].col;
  R(6,sy-2,148,68,'#05071a');R(6,sy-2,148,1,col);R(6,sy+65,148,1,col);
  if(t>=110){cx.save();cx.beginPath();const k=Math.min(1,(t-110)/30);cx.rect(8,sy,144*k,64);cx.clip();cityScene(fly.city,8,sy);cx.restore()}
  else for(let i=0;i<6;i++)R(14+i*22,sy+28+((t>>3)+i)%3,6,6,'#141a3c');
  txt(fly.city,80,sy+72,WHITE,'center',F16);catBadge(fly.code,80,sy+92);
  if(t>20&&Math.floor(frame/24)%2)txt('A CONTINUA',80,264,MUT,'center');
}
