/* ---------- telas da carreira ---------- */
function catBadge(code,x,y){const c=CATS[code];cx.font=F8;const w=cx.measureText(c.s).width+6;R(x-w/2,y-2,w,11,'#05071a');R(x-w/2,y-2,w,1,c.col);txt(c.s,x,y,c.col,'center')}
function bar(x,y,w,v,col){R(x,y,w,5,'#05071a');R(x+1,y+1,Math.round((w-2)*clamp(v,0,1)),3,col)}
function drawCareerHub(){
  depthEnsure();
  const W=weekInfo(),{code,cat,city}=W,el=eligible(),pos=myTeamPos(),rk=myRank(),pa=PL_(car.partner),nop=weekOpts().length;
  txt('T'+car.season+' SEM '+(car.week+1)+'/'+CAL.length+' '+car.age+' ANOS',80,34,MUT,'center');
  const sel=cur===0&&nop>1;
  txt((nop>1?(sel?'< ':'  '):'')+city+(nop>1?(sel?' >':'  '):''),80,46,WHITE,'center');catBadge(code,80,60);
  if(nop>1)txt((car.pick||0)+1+'/2',152,60,MUT,'right');
  txt('CAMPEAO '+cat.pts[0]+' PTS',80,74,ACC,'center');
  txt(code==='FI'?(el?'CLASSIFICADO!':'SO TOP 8 DUPLAS'):(car.pick||0)===0&&car.wc===car.week?'CONVITE!':cat.req<99?'TOP '+cat.req+' DUPLAS':'ABERTO',80,86,el?GRN:RED,'center');
  txt(money$(W.cost)+(W.far?' LONGE':' PERTO'),80,98,W.far?ACC:MUT,'center');
  txt('FISICO',8,116,WHITE);bar(64,117,88,car.cond/100,car.cond<35?RED:car.cond<65?ACC:GRN);
  if(car.inj>0)txt('LESAO '+car.inj+' SEM',152,116,RED,'right');
  txt('RANK #'+rk,8,128,WHITE);txt('DUPLA '+pos+'o',152,128,MUT,'right');
  txt(money$(car.money),8,140,GRN);txt(car.myPts+' PTS',152,140,ACC,'right');
  txt(pa.n.split(' ')[0]+' '+'*'.repeat(stars(pa.sk)),8,152,MUT);bar(112,153,40,car.chem,BLU);
  const items=[car.inj>0?'(LESIONADO)':'JOGAR TORNEIO','TREINAR $400','DESCANSAR','RANKING','PARCEIRO','EQUIPE','EVOLUCAO','CARREIRA','SAIR'];
  items.forEach((s,i)=>{const on=i===cur,y=162+i*11;txt((on?'> ':'  ')+s,14,y,on?ACC:(i===0&&(!el||car.inj>0)?'#55507a':WHITE))});
  carEnsure();const nw=car.news[0];
  if(car.msg)txt(car.msg.slice(0,19),80,262,BLU,'center');
  if(nw)txt(nw.t.slice(0,19),80,274,MUT,'center');
}
function drawCTour(){
  const t=car.tour,o=tourOpp(),op=pairObj(o),n=t.cur.length,fin=n===2,b3=CATS[t.code].bo3&&fin;
  txt(t.city,80,36,WHITE,'center');catBadge(t.code,80,50);
  txt(ROUNDN(n),80,64,ACC,'center',F16);
  if(b3)txt('MELHOR DE 3',80,84,RED,'center');
  const hh=h2hOf(o);if(hh.w+hh.l)txt((isRival(o)?'RIVAL! ':'CONFRONTO ')+hh.w+'V '+hh.l+'D',80,94,isRival(o)?RED:MUT,'center');
  txt('ADVERSARIOS',80,106,MUT,'center');
  const ri=indivRank(),rkOf=i=>ri.findIndex(x=>x.i===i)+1;
  op.p.forEach((pp,i)=>{const id=car.teams[o][i];txt(pp[0],80,118+i*12,WHITE,'center');txt('#'+rkOf(id),150,118+i*12,MUT,'right')});
  txt(STY[op.s].n,80,146,MUT,'center');
  const ts=teamSk(o),ms=teamSk(-1);
  txt('ELES',10,162,MUT);bar(52,163,100,ts/3.7,RED);
  txt('VOCES',10,174,MUT);bar(52,175,100,ms/3.7,GRN);
  txt('CHANCE '+Math.round(winP(-1,o)*100)+'%',80,188,WHITE,'center');
  ['JOGAR','SIMULAR','DESISTIR'].forEach((s,i)=>{const on=i===cur;txt((on?'> ':'  ')+s,40,208+i*14,on?ACC:WHITE)});
  txt('FISICO '+car.cond,80,256,car.cond<35?RED:MUT,'center');
}
function drawCDone(){
  const t=car.tour;if(!t){txt('...',80,140,WHITE,'center');return}
  const champ=t.champ===-1,idx=t.R-(t.res[-1]||0);
  if(champ){const bob=Math.round(Math.sin(frame*.08)*2);drawTrophy(80,40+bob,2);txt('CAMPEOES!',80,82,ACC,'center',F16);txt('B COMPARTILHA',80,234,BLU,'center')}
  else{txt(t.injured?'LESAO':'ELIMINADOS',80,60,t.injured?RED:WHITE,'center',F16);txt(ROUNDNA(Math.pow(2,idx)),80,82,MUT,'center')}
  txt(t.city,80,104,WHITE,'center');catBadge(t.code,80,118);
  txt('PONTOS +'+(t.myPts||0),80,138,ACC,'center');
  txt('PREMIO +'+money$(t.prize||0),80,152,GRN,'center');
  txt('VITORIAS '+t.won,80,166,WHITE,'center');
  if(!champ&&t.champ!==undefined)txt('CAMPEOES:',80,186,MUT,'center'),txt(teamKeyName(t.champ),80,198,WHITE,'center');
  if(car.inj>0)txt('LESAO: '+car.inj+' SEMANA(S)',80,216,RED,'center');
  if(Math.floor(frame/28)%2)txt('A CONTINUA',80,250,ACC,'center');
}
function drawCRank(){
  const L=indivRank(),pid=car.partner;
  txt('RANKING',80,34,ACC,'center',F16);
  for(let i=0;i<12;i++){const e=L[rkOff+i];if(!e)break;const y=60+i*15,me=e.i===-1,par=e.i===pid;
    if(me||par)R(4,y-3,152,13,me?'#2b3470':'#1b2350');
    const nm=me?myName():e.n.split(' ')[0][0]+'.'+e.n.split(' ').pop();
    txt(String(rkOff+i+1),20,y,me?ACC:MUT,'right');txt(nm.slice(0,11),26,y,me?ACC:par?BLU:WHITE);txt(String(e.pts),154,y,me?ACC:MUT,'right')}
  txt('DUPLA: '+myTeamPos()+'o DE 48',80,246,WHITE,'center');
  txt('SETAS ROLAM  B VOLTA',80,262,MUT,'center');
}
function drawCPartner(){
  const L=freeSorted(),pa=PL_(car.partner),r=myRank();
  txt('PARCEIRO',80,34,ACC,'center',F16);
  txt('ATUAL: '+pa.n+' '+(pa.age||'')+'a',80,52,WHITE,'center');txt('*'.repeat(stars(pa.sk))+'  QUIMICA '+Math.round(car.chem*100)+'%',80,64,MUT,'center');
  txt('CONFIANCA',8,76,MUT);bar(80,77,72,car.pmor??.7,(car.pmor??.7)<.35?RED:(car.pmor??.7)<.6?ACC:GRN);
  txt('DISPONIVEIS',80,88,MUT,'center');
  L.forEach((id,i)=>{const p=PL_(id),y=104+i*16,on=i===cur,need=reqRankFor(p.sk),ok=r<=need;
    txt((on?'>':' ')+p.n.split(' ')[0][0]+'.'+p.n.split(' ').pop(),6,y,on?ACC:ok?WHITE:'#55507a');
    txt('*'.repeat(stars(p.sk)),118,y,ok?ACC:'#55507a','right');txt(need<999?'#'+need:'OK',154,y,ok?GRN:RED,'right')});
  const p=PL_(L[cur]);if(p)txt(STY[p.st].n,80,236,MUT,'center');
  txt('A CONVIDA  B VOLTA',80,262,MUT,'center');
}
function drawCTeam(){
  const v=car.rkView||0,rk=RKTS[v],own=car.rk.includes(v),sp=sponsor();
  txt('EQUIPE',80,34,ACC,'center',F16);
  txt('SALDO '+money$(car.money),80,56,GRN,'center');
  const ct=car.contract;txt('PATROC.: '+(ct?ct.n:sp[1]),80,68,WHITE,'center');txt('FIXO '+money$(salary())+'/MES',80,80,MUT,'center');
  if(ct&&ct.win)txt('+'+money$(ct.win)+' VIT +'+money$(ct.title)+' TIT',80,92,BLU,'center');
  const rows=[['FISIO $1.500',car.physio===car.week?'FEITO':'+30 FIS'],['TECNICO',car.coach?'SIM':'NAO'],['RAQUETE',rk.n],['DIFICULDADE',DIFF_N[car.diff??1]],['VOLTAR','']];
  rows.forEach(([l,val],i)=>{const y=108+i*17,on=i===cur;txt((on?'>':' ')+l,6,y,on?ACC:WHITE);txt(val,154,y,on?ACC:MUT,'right')});
  txt(cur===3?'SO MUDA OS RIVAIS EM':car.coach?'TREINO +50%  -$1.500/MES':'TECNICO: TREINO +50%',80,196,MUT,'center');if(cur===3)txt('QUADRA, NAO A EVOLUCAO',80,206,MUT,'center');
  const bn=Object.keys(rk.b).map(k=>({pre:'PRECISAO',for:'FORCA',top:'POR CIMA'}[k]+' +1')).join(' ')||'SEM BONUS';
  if(cur===2){txt(bn.slice(0,19),80,212,BLU,'center');txt(car.rkEq===v?'EM USO':own?'A EQUIPA':'A COMPRA '+money$(rk.c),80,224,own?GRN:ACC,'center')}
  if(cur===2)txt('< > TROCA RAQUETE',80,236,MUT,'center');
  txt('B VOLTA',80,262,MUT,'center');
}
function drawCSeason(){
  const r=myRank();
  txt('FIM DA',80,40,MUT,'center');txt('TEMPORADA '+car.season,80,54,ACC,'center',F16);
  if(r<=3){drawTrophy(80,78,2)}
  txt('RANKING FINAL #'+r,80,120,WHITE,'center');
  txt('PONTOS '+car.myPts,80,134,ACC,'center');
  txt('TITULOS '+car.seasonTitles,80,148,ACC,'center');
  txt('SALDO '+money$(car.money),80,162,GRN,'center');
  const top=indivRank()[0];txt('NUMERO 1:',80,184,MUT,'center');txt(top.i===-1?myName():top.n,80,196,WHITE,'center');
  txt('IDADE '+car.age+'  35% DOS PONTOS FICAM',80,210,MUT,'center');
  txt('B COMPARTILHA',80,224,BLU,'center');
  if(car.age>=FORCE_RETIRE){if(Math.floor(frame/28)%2)txt('A APOSENTAR',80,254,ACC,'center')}
  else if(car.age>=RETIRE_AGE){['CONTINUAR','APOSENTAR'].forEach((s,i)=>txt((cur===i?'> ':'  ')+s,40,242+i*12,cur===i?ACC:WHITE))}
  else if(Math.floor(frame/28)%2)txt('A NOVA TEMPORADA',80,254,ACC,'center');
}
