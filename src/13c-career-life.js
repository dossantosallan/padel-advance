/* ---------- vida da carreira: notícias, rivais, troféus, estatísticas e metas ---------- */
const CAT_ORD=['CH','OP','MS','MF','BR','SI','GO','P2','P1','MA','FI'];
const PARTNER_TALK=['QUER JOGAR MAIS NA REDE','ELOGIOU SUA BANDEJA','PEDIU MAIS TREINO','ESTA CONFIANTE','SONHA COM UM MAJOR','GOSTOU DA SEMANA'];
function carEnsure(){if(!car)return;car.news=car.news||[];car.h2h=car.h2h||{};car.trophies=car.trophies||[];car.best=car.best||999;if(car.goal===undefined)car.goal=null}
function pushNews(s){carEnsure();car.news.unshift({w:car.week+1,s:car.season,t:s});if(car.news.length>24)car.news.pop()}
const h2hOf=k=>(car&&car.h2h&&car.h2h[k])||{w:0,l:0};
const isRival=k=>{const h=h2hOf(k);return h.w+h.l>=3||h.l>=2};
function h2hNote(k,win){
  if(k<0)return;carEnsure();const h=car.h2h[k]||(car.h2h[k]={w:0,l:0}),owed=h.l>=2&&h.l>h.w;
  if(win)h.w++;else h.l++;
  if(win&&owed){gain(car.focus,.25);pushNews('VINGANCA CONTRA '+teamKeyName(k)+'!')}
  else if(!win&&h.l===2)pushNews(teamKeyName(k)+' VIRA SEU RIVAL');
}
function newGoal(){
  const pos=myTeamPos(),r=Math.random();let g;
  const br=car.circ==='BR',bp=br?bptPos():0;
  const tier=br?(bp>12?'CH':bp>5?'OP':'MS'):pos>40?'BR':pos>32?'SI':pos>24?'GO':pos>16?'P2':pos>8?'P1':'MA';
  if(r<.4){const st=['BR','SI','CH','OP'].includes(tier)?2:3;g={k:'reach',c:tier,st,d:(st===2?'SEMI':'QUARTAS')+' NUM '+CATS[tier].s+' OU MAIOR'}}
  else if(r<.7){const n=3+((Math.random()*3)|0);g={k:'wins',n,prog:0,d:'VENCER '+n+' PARTIDAS'}}
  else if(r<.85&&!br){const n=Math.max(1,myRank()-8);g={k:'rank',n,d:'CHEGAR AO TOP '+n}}
  else if(r<.85){const n=Math.max(1,bp-4);g={k:'bpt',n,d:'TOP '+n+' NO BPT'}}
  else g={k:'title',d:'GANHAR UM TITULO'};
  g.until=car.week+4;g.rew=Math.max(600,Math.round((600+Math.max(0,60-pos)*90)/100)*100);car.goal=g;
  pushNews('PATROCINADOR: '+g.d);
}
function goalDone(){const g=car.goal;car.money+=g.rew;pushNews('META CUMPRIDA! +'+money$(g.rew));car.msg='META CUMPRIDA!';car.goal=null;sfx.game()}
function goalOnTour(t){
  const g=car.goal;if(!g)return;const idx=t.R-(t.res[-1]||0);
  if(g.k==='reach'&&CAT_ORD.indexOf(t.code)>=CAT_ORD.indexOf(g.c)&&idx<=g.st)goalDone();
  else if(g.k==='title'&&t.champ===-1)goalDone();
}
function goalOnWin(){const g=car.goal;if(g&&g.k==='wins'&&++g.prog>=g.n)goalDone()}
function goalOnWeek(){
  const g=car.goal;
  if(g&&g.k==='rank'&&myRank()<=g.n)goalDone();
  else if(g&&g.k==='bpt'&&car.circ==='BR'&&bptPos()<=g.n)goalDone();
  else if(g&&car.week>=g.until){pushNews('META NAO CUMPRIDA');car.goal=null}
  if(!car.goal&&car.week%4===0)newGoal();
}
function trophyAdd(t){carEnsure();car.trophies.push({c:t.code,city:t.city,s:car.season})}
/* estatísticas da partida e da carreira */
let mst=null,lastHitter=null,exclaim=null;
function mstReset(){mst={win:0,err:0,sv:0,svIn:0,shots:{}}}
function statsSave(win){
  if(!mst||demo||kind==='train'||kind==='2p')return;
  const S=save.stats||(save.stats={m:0,w:0,win:0,err:0,sv:0,svIn:0,shots:{}});
  S.m++;if(win)S.w++;S.win+=mst.win;S.err+=mst.err;S.sv+=mst.sv;S.svIn+=mst.svIn;
  for(const k in mst.shots)S.shots[k]=(S.shots[k]||0)+mst.shots[k];
}
const SHOT_N={drive:'DRIVE',lob:'GLOBO',volley:'VOLEIO',smash:'REMATE',bandeja:'BANDEJA',vibora:'VIBORA',drop:'DEJADA',contra:'CONTRAPARED'};
function favShot(sh){let k=null,v=0;for(const x in sh)if(sh[x]>v){v=sh[x];k=x}return k?SHOT_N[k]||k:'-'}
const EXC=['QUE PONTO!','ESPETACULAR!','INCRIVEL!','QUE GOLPE!','DE MESTRE!'];
function wrap(s,n){const out=[];let line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>n){if(line)out.push(line);line=w}else line=(line+' '+w).trim()}if(line)out.push(line);return out}
/* telas */
function drawTrophyC(cxp,cyp,sc,col){TROPHY.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.')R(cxp-8*sc+i*sc,cyp+j*sc,sc,sc,ch==='Y'?col:ch==='W'?'#ffffff':TCOL[ch])}))}
function drawCMore(){
  carEnsure();txt('CARREIRA',80,32,ACC,'center',F16);
  R(8,56,144,62,'#05071a');R(8,56,144,1,ACC);
  txt('META DO PATROCINIO',80,62,ACC,'center');
  const g=car.goal;
  if(g){wrap(g.d,18).forEach((l,i)=>txt(l,80,76+i*11,WHITE,'center'));txt('PREMIO '+money$(g.rew),80,100,GRN,'center');txt('ATE SEMANA '+(g.until+1)+(g.k==='wins'?'  '+g.prog+'/'+g.n:''),80,110,MUT,'center')}
  else txt('NOVA META EM BREVE',80,84,MUT,'center');
  ['NOTICIAS','TROFEUS','ESTATISTICAS','VOLTAR'].forEach((s,i)=>{const on=i===cur;txt((on?'> ':'  ')+s,30,140+i*18,on?ACC:WHITE)});
  txt('B VOLTA',80,262,MUT,'center');
}
function drawCNews(){
  carEnsure();txt('NOTICIAS',80,32,ACC,'center',F16);
  let y=58;
  for(const n of car.news){const L=wrap(n.t,18);if(y+L.length*11>246)break;txt('S'+n.w,6,y,MUT);L.forEach((l,i)=>txt(l,30,y+i*11,i?'#c8c4ee':WHITE));y+=L.length*11+5}
  if(!car.news.length)txt('NADA AINDA',80,120,MUT,'center');
  txt('B VOLTA',80,262,MUT,'center');
}
function drawCTroph(){
  carEnsure();txt('TROFEUS',80,32,ACC,'center',F16);
  CAT_ORD.forEach((c,i)=>{const n=car.trophies.filter(t=>t.c===c).length,x=i%4,y=i>>2,X=24+x*38,Y=54+y*44;
    drawTrophyC(X,Y,1,n?CATS[c].col:'#2b3470');txt(CATS[c].s.slice(0,5),X,Y+18,n?CATS[c].col:'#55507a','center');txt('x'+n,X,Y+28,n?WHITE:'#55507a','center')});
  txt('TITULOS '+car.trophies.length,80,190,WHITE,'center');
  txt('MELHOR RANKING #'+(car.best<999?car.best:'-'),80,203,MUT,'center');
  const last=car.trophies[car.trophies.length-1];
  if(last)txt('ULTIMO: '+last.city,80,216,ACC,'center');
  txt('TEMPORADA '+car.season,80,228,MUT,'center');
  txt('A COMPARTILHA  B VOLTA',80,262,MUT,'center');
}
function drawCStats(){
  txt('NUMEROS',80,32,ACC,'center',F16);
  const S=save.stats||{m:0,w:0,win:0,err:0,sv:0,svIn:0,shots:{}},pc=(a,c)=>c?Math.round(a/c*100)+'%':'-',pm=v=>S.m?(v/S.m).toFixed(1):'-';
  const rows=[['PARTIDAS',S.m],['VITORIAS',pc(S.w,S.m)],['WINNERS/JOGO',pm(S.win)],['ERROS/JOGO',pm(S.err)],['1o SAQUE',pc(S.svIn,S.sv)],['GOLPE PREFERIDO',''],['',favShot(S.shots)],['TITULOS',save.titles]];
  rows.forEach(([l,v],i)=>{const y=60+i*20;txt(l,8,y,WHITE);txt(String(v),152,y,i===6?ACC:MUT,'right')});
  txt('CONTA JOGOS DE VERDADE',80,232,MUT,'center');txt('(NAO OS SIMULADOS)',80,244,MUT,'center');
  txt('B VOLTA',80,262,MUT,'center');
}
