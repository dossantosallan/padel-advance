/* ---------- carreira estratégica: duas opções por semana, parceiro com vida própria,
   contratos de patrocínio, idade e aposentadoria, dificuldade ---------- */
const ALT={BR:'BR',SI:'BR',GO:'BR',P2:'SI',P1:'GO',MA:'P2',FI:null};
const DIFF_N=['FACIL','NORMAL','DIFICIL'],DIFF_ADJ=[-.5,0,.45];
const SPONS2=['RAIZ','VOLTA','IMPULSO','MARE','FAROL'];
const RETIRE_AGE=34,FORCE_RETIRE=40;
let newDiff=1;
function depthEnsure(){
  if(!car)return;
  if(car.pick===undefined)car.pick=0;if(car.pmor===undefined)car.pmor=.7;if(car.age===undefined)car.age=22;if(car.diff===undefined)car.diff=1;
  if(car.contract===undefined)car.contract=null;circEnsure();
  for(const p of car.players)if(p.age===undefined)p.age=19+((p.n.length*7+p.sk*13)|0)%16;
}
function weekOpts(){circEnsure();return optsFor(car.circ,Math.min(car.week,SEASON_W-1))}
function canEnter(o,i){
  if(o.cat.nat)return o.code==='MF'?bptPos()<=8:true;
  const pos=myTeamPos();if(o.code==='FI')return pos<=8;return pos<=o.cat.req||(i===0&&car.wc===car.week)}
function defaultPick(){const o=weekOpts();car.pick=canEnter(o[0],0)||!o[1]?0:1}
/* simula os torneios da semana que você não jogou; uma dupla não joga dois torneios na mesma semana */
function simWeekAll(playedIdx,used){
  circEnsure();const ex=new Set(used||[]);
  for(const circ of['EU','BR']){
    if(circ==='BR'&&natPool().length<8)continue;
    optsFor(circ,Math.min(car.week,SEASON_W-1)).forEach((x,i)=>{
      if(circ===car.circ&&i===playedIdx)return;
      const cur=buildDraw(x.code,false,ex);cur.forEach(k=>ex.add(k));
      if(cur.filter(k=>k!==-2).length<2)return;
      const t={code:x.code,city:x.city,cur,res:{},r:0,R:Math.log2(x.cat.size),quiet:circ!==car.circ&&!['MA','FI'].includes(x.code)};finishTour(t);
    });
  }
}
/* parceiro: confiança sobe com vitórias e títulos, cai com derrotas cedo; pode sair */
function partnerAfterTour(t){
  const lostFirst=t.champ!==-1&&(t.res[-1]||0)===0;
  car.pmor=clamp(car.pmor+(t.champ===-1?.2:lostFirst?-.15:.02*t.won),0,1);
}
function partnerAfterWin(){car.pmor=Math.min(1,car.pmor+.03);if(car.chem>.6){const p=PL_(car.partner);p.sk=+Math.min(3.7,p.sk+.01).toFixed(2)}}
function replacePartner(why){
  const old=car.partner,oldN=PL_(old).n.split(' ')[0];
  car.free.push(old);
  const L=freeSorted().filter(i=>i!==old&&reqRankFor(PL_(i).sk)>=myRank());
  const nid=L.length?L[L.length-1]:freeSorted().filter(i=>i!==old).pop();
  car.free=car.free.filter(i=>i!==nid);car.partner=nid;car.chem=0;car.pmor=.6;
  pushNews(oldN+' '+why);pushNews('NOVO PARCEIRO: '+PL_(nid).n);car.msg=oldN+' SAIU DA DUPLA';
}
function partnerWeekCheck(){
  const p=PL_(car.partner);
  if(car.pmor<.2&&Math.random()<.4)replacePartner('DEIXOU A DUPLA');
  else if(p.sk>myLevel()+.7&&car.pmor<.5&&Math.random()<.15)replacePartner('ACEITOU PROPOSTA E SAIU');
  else if(car.pmor<.35&&Math.random()<.3)pushNews(p.n.split(' ')[0]+' ANDA INSATISFEITO');
}
/* contratos de patrocínio: fixo maior ou fixo menor com bônus por vitória e título */
function offerContract(){
  const sp=sponsor(),S=sp[2],alt=SPONS2[(car.season+car.week)%SPONS2.length];
  car.offer=[{n:sp[1],fixed:S,win:0,title:0},{n:alt,fixed:Math.round(S*.5/50)*50,win:Math.round(S*.08/10)*10,title:Math.round(S*.7/50)*50}];
  mode='csponsor';cur=0;
}
function signContract(i){car.contract=car.offer[i];car.offer=null;pushNews('CONTRATO COM '+car.contract.n);car.msg='CONTRATO ASSINADO';store()}
function contractWin(){if(car.contract&&car.contract.win)car.money+=car.contract.win}
function contractTitle(){if(car.contract&&car.contract.title){car.money+=car.contract.title;pushNews('BONUS TITULO +'+money$(car.contract.title))}}
/* idade: o físico cai com os anos, a experiência melhora precisão e jogo por cima */
function ageSeason(){
  car.age++;const a=car.age,A=save.attr,before={...A};
  if(a>=28){A.pre=Math.min(99,A.pre+1);A.top=Math.min(99,A.top+1)}
  const dv=a>=34?3:a>=31?2:a>=27?1:0,df=a>=34?2:a>=31?1:0;
  A.vel=Math.max(40,A.vel-dv);A.for=Math.max(40,A.for-df);
  if(dv)pushNews('IDADE '+a+': VELOCIDADE '+before.vel+'>'+A.vel);
  for(let i=0;i<car.players.length;i++){
    const p=car.players[i];p.age++;
    const d=p.age<24?rnd(.03,.2):p.age<=30?rnd(-.05,.1):p.age<=34?rnd(-.18,.03):rnd(-.35,-.08);
    p.sk=+clamp(p.sk+d,.25,3.7).toFixed(2);
    if(p.age>=37){
      const old=p.n;let n;do{n=FN[(Math.random()*FN.length)|0]+' '+LN[(Math.random()*LN.length)|0]}while(car.players.some(q=>q.n===n)||n.length>13);
      Object.assign(p,{n,age:18,sk:+rnd(.4,1.4).toFixed(2),pts:Math.round(rnd(20,80)),hs:HS[(Math.random()*3)|0]});
      pushNews(old+' SE APOSENTOU');
      if(i===car.partner)replacePartner('SE APOSENTOU');
    }
  }
}
function retire(){
  car.retired=true;save.hof=save.hof||[];
  save.hof.push({n:myName(),seasons:car.season,titles:(car.trophies||[]).length,best:car.best,age:car.age});
  pushNews(myName()+' SE APOSENTA');store();mode='cretire';
}
/* telas */
function drawCSponsor(){
  txt('PATROCINIO',80,30,ACC,'center',F16);
  txt('ESCOLHA UM CONTRATO',80,52,WHITE,'center');
  (car.offer||[]).forEach((o,i)=>{const y=72+i*72,on=i===cur;
    R(8,y-4,144,62,on?'#2b3470':'#141a3c');if(on)R(8,y-4,3,62,ACC);
    txt(o.n,18,y+2,on?ACC:WHITE);txt('FIXO '+money$(o.fixed)+'/MES',18,y+16,GRN);
    if(o.win)txt('+'+money$(o.win)+' POR VITORIA',18,y+28,BLU),txt('+'+money$(o.title)+' POR TITULO',18,y+40,BLU);else txt('SEM BONUS',18,y+28,MUT)});
  txt('VALE ATE A PROXIMA',80,230,MUT,'center');txt('RENOVACAO',80,242,MUT,'center');
  txt('A ASSINA',80,262,ACC,'center');
}
function drawCRetire(){
  txt('FIM DE CARREIRA',80,32,ACC,'center');
  drawTrophyC(80,48,2,(car.trophies||[]).length?ACC:'#55507a');
  txt(myName(),80,92,WHITE,'center',F16);
  const rows=[['TEMPORADAS',car.season],['IDADE',car.age],['TITULOS',(car.trophies||[]).length],['MELHOR RANK',(car.best<999?'#'+car.best:'-')],['DINHEIRO',money$(car.money)]];
  rows.forEach(([l,v],i)=>{const y=120+i*16;txt(l,14,y,MUT);txt(String(v),146,y,WHITE,'right')});
  const majors=(car.trophies||[]).filter(t=>t.c==='MA').length;if(majors)txt(majors+' MAJOR(S)!',80,206,CATS.MA.col,'center');
  txt('B COMPARTILHA',80,240,BLU,'center');txt('A VOLTA AO MENU',80,256,ACC,'center');
}
