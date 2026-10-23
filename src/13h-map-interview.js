/* ---------- mapa da temporada ----------
   Brasil (Sul, Sudeste e Centro-Oeste) no BPT, Europa na gira. Contornos simplificados em lon/lat,
   desenhados uma vez num canvas e depois só copiados. Por cima: cidades, rota já jogada e próxima parada. */
const GEO={
  'JOINVILLE':[-48.85,-26.3],'LIVRAMENTO':[-55.53,-30.89],'ERECHIM':[-52.27,-27.63],'CURITIBA':[-49.27,-25.43],'QUARAI':[-56.45,-30.39],
  'CAMAQUA':[-51.81,-30.85],'PORTO ALEGRE':[-51.23,-30.03],'SORRISO':[-55.71,-12.55],'SAO PAULO':[-46.63,-23.55],'FLORIPA':[-48.55,-27.6],
  'SANTA MARIA':[-53.81,-29.68],'CAMBORIU':[-48.63,-26.99],'CHAPECO':[-52.62,-27.1],'PASSO FUNDO':[-52.41,-28.26],'ITAJAI':[-48.66,-26.91],
  'RIO':[-43.17,-22.91],'CARAZINHO':[-52.79,-28.28],'PELOTAS':[-52.34,-31.77],
  'MALAGA':[-4.42,36.72],'BRUXELAS':[4.35,50.85],'GENOVA':[8.93,44.41],'MADRI':[-3.7,40.42],'ROMA':[12.5,41.9],'VALENCIA':[-.38,39.47],
  'BORDEUS':[-.58,44.84],'MALMO':[13,55.6],'VENEZA':[12.33,45.44],'MILAO':[9.19,45.46],'PARIS':[2.35,48.86],'AMSTERDA':[4.9,52.37],
  'ROTTERDAM':[4.48,51.92],'SEVILHA':[-5.98,37.39],'MUNIQUE':[11.58,48.14],'ESTOCOLMO':[18.07,59.33],'LONDRES':[-.13,51.51],'MARBELLA':[-4.88,36.51],
  'MONACO':[7.42,43.74],'BARCELONA':[2.17,41.39],'GRANADA':[-3.6,37.18],'GANTE':[3.72,51.05],'TURIM':[7.69,45.07],'TOLEDO':[-4.02,39.86],
  'NAPOLES':[14.27,40.85],'ALICANTE':[-.48,38.35],'TOULOUSE':[1.44,43.6],'COPENHAGUE':[12.57,55.68],'VERONA':[10.99,45.44],'BERGAMO':[9.67,45.7],
  'LILLE':[3.06,50.63],'UTRECHT':[5.12,52.09],'HAIA':[4.3,52.08],'CORDOBA':[-4.78,37.88],'SALZBURGO':[13.04,47.81],'UPPSALA':[17.64,59.86],
  'BRISTOL':[-2.59,51.45],'CADIZ':[-6.29,36.53],'NICE':[7.26,43.7]};
const MAPS={
  BR:{lon:[-60,-38],lat:[-8,-34],k:6.6,cos:1,sea:'#1f4a8a',other:'#5a6248',land:'#3f8a46',landHi:'#58a456',
    polys:[[[-60,-8],[-38,-8],[-38,-12.9],[-39,-14.8],[-39.2,-17.8],[-40.3,-20.3],[-41,-21.6],[-42,-22.9],[-43.2,-22.95],[-44.3,-23.1],[-45.4,-23.8],[-46.3,-24],[-47.9,-25],[-48.5,-25.9],[-48.6,-27],[-48.5,-27.6],[-48.8,-28.5],[-49.4,-29],[-50,-29.9],[-50.7,-31],[-51.6,-32],[-52.4,-33],[-53.4,-33.75],
      [-53.2,-32.6],[-54.2,-31.8],[-55.5,-30.9],[-56.45,-30.4],[-57.6,-30.2],[-56,-28.6],[-55,-27.8],[-53.8,-27.1],[-53.6,-26.2],[-54.6,-25.6],[-54.4,-24],[-55.6,-22.6],[-57.8,-22.1],[-57.65,-19],[-58.2,-17.4],[-60,-15.5]]],
    seaPoly:[[-38,-12.9],[-39,-14.8],[-39.2,-17.8],[-40.3,-20.3],[-41,-21.6],[-42,-22.9],[-43.2,-22.95],[-44.3,-23.1],[-45.4,-23.8],[-46.3,-24],[-47.9,-25],[-48.5,-25.9],[-48.6,-27],[-48.5,-27.6],[-48.8,-28.5],[-49.4,-29],[-50,-29.9],[-50.7,-31],[-51.6,-32],[-52.4,-33],[-53.4,-33.75],[-53.9,-34],[-38,-34]],
    lagoons:[[[-51.2,-30.2],[-50.6,-30.4],[-51.6,-31.6],[-52.1,-31.7],[-51.8,-31],[-51.3,-30.6]]],
    borders:[[[-53.8,-27.15],[-52.5,-27.3],[-51.4,-27.9],[-50.2,-28.4],[-49.75,-29.3]],[[-53.6,-26.25],[-52,-26.1],[-50.5,-26.2],[-49.3,-26.1],[-48.6,-25.95]],
      [[-54.4,-24],[-53.8,-22.7],[-52.2,-22.6],[-50.5,-22.9],[-49.5,-23.3],[-48.6,-24.6],[-48.1,-25.1]],[[-57.8,-22.1],[-53.8,-22.7],[-51.2,-20],[-51,-19.4],[-53.2,-17.4],[-53.2,-15.5],[-53.1,-12.7],[-50.6,-12.5]],[[-50.6,-12.5],[-50.6,-8]]],
    label:[['BRASIL',-50,-17]]},
  EU:{lon:[-10.5,20],lat:[60,35.5],k:7.1,cos:.67,sea:'#1f4a8a',other:'#1f4a8a',land:'#4f8a4a',landHi:'#68a45e',
    polys:[
      [[-5.6,36],[-2,36.7],[-.5,38.2],[.2,38.8],[-.3,39.5],[.9,41],[3.2,41.9],[3.1,43.1],[4.8,43.4],[6.6,43.1],[7.5,43.8],[8.8,44.4],[10.2,43.9],[10.5,42.9],[11.1,42.4],[12.2,41.8],[13.6,41.2],[14.3,40.6],[15.7,40],[15.6,38.9],[16.1,38],[16.6,38.4],[17.2,39],[17.1,39.4],[16.5,39.7],[17,40.5],[18.5,40.2],[18,40.6],[16,41.5],[15,42],[14,42.7],[13.6,43.5],[12.4,44.2],[12.3,45.3],[13,45.7],[13.7,45.6],[14.5,45.2],[15.2,44.3],[16,43.5],[17.6,43],[19.5,41.8],[20,41.5],
       [20,54.6],[18.5,54.8],[16.5,54.5],[14.2,53.9],[12.5,54.4],[11,54],[10,54.4],[10.3,55.2],[10.6,56.5],[10.5,57.6],[8.6,57.1],[8.1,55.5],[8.6,54.9],[8.9,54],[8,53.6],[7,53.4],[6,53.4],[4.8,52.9],[4.5,52.4],[4.1,52],[3.4,51.4],[2.5,51.1],[1.6,50.9],[1.6,50.2],[.2,49.7],[-1.2,49.4],[-1.9,49.7],[-1.6,48.6],[-3.2,48.8],[-4.7,48.4],[-4.3,47.8],[-2.5,47.3],[-2.2,46.8],[-1.2,46.2],[-1.2,44.7],[-1.5,43.4],[-3.8,43.4],[-5.8,43.6],[-8,43.7],[-9.3,43],[-8.9,42],[-8.8,40.5],[-9.5,38.8],[-8.8,38.4],[-8.9,37],[-7.4,37.2],[-6.3,36.6]],
      [[-5.7,50],[-3,50.6],[1.4,51.2],[1.7,52.6],[.3,53.5],[-.2,54.5],[-1.6,55.6],[-2,56],[-2.8,56.4],[-1.8,57.6],[-3.3,58.6],[-5,58.6],[-5.5,57.5],[-5.7,56.5],[-5,55.8],[-4.9,54.8],[-3.4,54.9],[-3,53.4],[-4.6,53.3],[-4.2,52.3],[-5.1,51.8],[-3.3,51.4],[-4.2,51.2]],
      [[-6,52.2],[-6.2,53.9],[-5.9,55.2],[-7.3,55.4],[-8.5,54.6],[-10,54.2],[-9.9,53],[-10.3,51.9],[-8.5,51.6]],
      [[12.6,56.2],[12.9,55.4],[14.3,55.6],[16,56.2],[16.6,57.3],[16.7,58.6],[18.4,59.3],[19,60],[5,60],[5.2,59.3],[5.8,58.5],[7,58],[8.2,58.1],[9.6,59],[10.6,59.4],[11.2,58.9],[11.8,58]],
      [[11,55.6],[12,56.1],[12.6,55.7],[12.1,55.1],[11.2,55.2]],
      [[8.6,41.4],[9.4,41.4],[9.5,42.9],[8.6,42.3]],[[8.4,39],[9.6,39.1],[9.8,41],[8.3,40.9]],[[12.4,37.8],[15.1,36.7],[15.6,38.2],[13.5,38.2]],[[2.4,39.6],[3.4,39.7],[3.2,39.3],[2.7,39.4]]],
    label:[['EUROPA',13,51]]},
};
const MAP_X=8,MAP_Y=58,MAP_W=144,MAP_H=176;
function mapPt(m,lon,lat){const M=MAPS[m],w=(M.lon[1]-M.lon[0])*M.cos*M.k,h=Math.abs(M.lat[1]-M.lat[0])*M.k;
  const ox=(MAP_W-w)/2,oy=(MAP_H-h)/2;return[ox+(lon-M.lon[0])*M.cos*M.k,oy+Math.abs(lat-M.lat[0])*M.k]}
const MAPC={};
function mapCanvas(m){
  if(MAPC[m])return MAPC[m];const M=MAPS[m],c=document.createElement('canvas');c.width=MAP_W;c.height=MAP_H;const g=c.getContext('2d');
  const keep=cx;cx=g;
  try{
    R(0,0,MAP_W,MAP_H,M.other);
    const P=pts=>pts.map(p=>mapPt(m,p[0],p[1]));
    if(M.seaPoly)sPoly(P(M.seaPoly),M.sea);
    for(let y=2;y<MAP_H;y+=5)for(let x=(y*3)%9;x<MAP_W;x+=9)R(x,y,2,1,'rgba(255,255,255,.08)');
    for(const pl of M.polys){const q=P(pl);sPoly(q.map(p=>[p[0]+1,p[1]+1]),'rgba(0,0,0,.35)');sPoly(q,M.land)}
    for(const pl of M.polys){const q=P(pl);for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];sLine(a[0],a[1],b[0],b[1],M.landHi)}}
    for(const pl of M.borders||[]){const q=P(pl);for(let i=1;i<q.length;i++){const a=q[i-1],b=q[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let j=0;j<n;j+=2)R(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n,1,1,'#2c6a34')}}
    for(const pl of M.lagoons||[])sPoly(P(pl),M.sea);
    for(const[t,lo,la]of M.label){const[x,y]=mapPt(m,lo,la);cx.globalAlpha=.35;txt(t,x,y,'#ffffff','center');cx.globalAlpha=1}
  }finally{cx=keep}
  return MAPC[m]=c;
}
function drawSeasonMap(selW){
  const m=car.circ==='BR'?'BR':'EU',C=calOf(car.circ),X=MAP_X,Y=MAP_Y;
  R(X-2,Y-2,MAP_W+4,MAP_H+4,'#05071a');cx.drawImage(mapCanvas(m),X,Y);
  const pt=city=>{const g=GEO[city];if(!g)return null;const p=mapPt(m,g[0],g[1]);return[X+Math.round(p[0]),Y+Math.round(p[1])]};
  /* todas as etapas da temporada */
  C.forEach(e=>{const p=pt(e[0]);if(p)R(p[0]-1,p[1]-1,3,3,'#05071a'),R(p[0],p[1],1,1,CATS[e[1]].col)});
  /* rota já jogada */
  const H=(car.hist||[]).slice().sort((a,b)=>a.w-b.w),route=H.map(h=>pt(h.city)).filter(Boolean);
  for(let i=1;i<route.length;i++)sLine(route[i-1][0],route[i-1][1],route[i][0],route[i][1],'#ffd23f');
  H.forEach(h=>{const p=pt(h.city);if(!p)return;const champ=h.res==='CAMPEAO';R(p[0]-2,p[1]-2,5,5,'#05071a');R(p[0]-1,p[1]-1,3,3,champ?ACC:'#ff8a5a')});
  /* próxima parada: tracejado piscando a partir da última cidade */
  if(car.week<SEASON_W){const nx=pt(weekInfo().city),from=route[route.length-1];
    if(nx){if(from&&Math.floor(frame/20)%2){const d=Math.hypot(nx[0]-from[0],nx[1]-from[1]),n=Math.floor(d/4);for(let i=1;i<n;i+=2){const f=i/n;R(from[0]+(nx[0]-from[0])*f,from[1]+(nx[1]-from[1])*f,1,1,'#ffffff')}}
      const r=2+((frame>>3)%2);R(nx[0]-r,nx[1],r*2+1,1,'#ffffff');R(nx[0],nx[1]-r,1,r*2+1,'#ffffff')}}
  /* semana selecionada */
  const se=C[selW],sp=pt(se[0]);if(sp){R(sp[0]-3,sp[1]-3,7,1,ACC);R(sp[0]-3,sp[1]+3,7,1,ACC);R(sp[0]-3,sp[1]-3,1,7,ACC);R(sp[0]+3,sp[1]-3,1,7,ACC)}
}

/* ---------- entrevista pós-torneio ----------
   Uma pergunta, três respostas. Cada resposta mexe em algo: confiança do parceiro, patrocínio ou rivalidade. */
let intv=null;
function intvKind(t){if(t.injured)return null;if(t.champ===-1)return'champ';const idx=t.R-(t.res[-1]||0);if(idx===1)return'final';if(idx>=t.R-1&&t.R>=3)return'early';return Math.random()<.5?'mid':null}
const INTV={
  champ:{q:'O QUE FEZ A DIFERENCA NESTE TITULO?',a:[
    {t:'MEU PARCEIRO FOI GIGANTE',fx:{pmor:.15,chem:.05}},
    {t:'O TREINO DESTA SEMANA',fx:{gain:.4}},
    {t:'O APOIO DO PATROCINIO',fx:{money:1}}]},
  final:{q:'COMO VOCE AVALIA O VICE?',a:[
    {t:'VAMOS VOLTAR MAIS FORTES',fx:{pmor:.08,cond:6}},
    {t:'ELES TIVERAM SORTE HOJE',fx:{rival:1,pmor:.03}},
    {t:'SEMANA HISTORICA PRA NOS',fx:{money:.6}}]},
  early:{q:'O QUE DEU ERRADO HOJE?',a:[
    {t:'EU ASSUMO A CULPA',fx:{pmor:.1}},
    {t:'MEU PARCEIRO NAO ESTAVA BEM',fx:{pmor:-.15,gain:.2}},
    {t:'ELES FORAM MELHORES, MAS VAMOS DEVOLVER',fx:{rival:1}}]},
  mid:{q:'SATISFEITOS COM A CAMPANHA?',a:[
    {t:'A DUPLA ESTA CRESCENDO',fx:{pmor:.06,chem:.03}},
    {t:'QUERO MAIS. TREINO DOBRADO',fx:{gain:.25,cond:-6}},
    {t:'OBRIGADO A QUEM APOIA',fx:{money:.4}}]},
};
function startInterview(){
  const t=car.tour,k=intvKind(t);if(!k)return false;
  intv={k,opp:t.lastOpp,done:null};mode='cint';cur=0;sfx.ui();return true;
}
function answerInterview(i){
  const Q=INTV[intv.k],A=Q.a[i],fx=A.fx,out=[];
  if(fx.pmor){car.pmor=clamp((car.pmor??.7)+fx.pmor,0,1);out.push(['CONFIANCA DO PARCEIRO '+(fx.pmor>0?'+':'-'),fx.pmor>0?GRN:RED])}
  if(fx.chem){car.chem=Math.min(1,car.chem+fx.chem);out.push(['QUIMICA +',GRN])}
  if(fx.gain){gain(car.focus,fx.gain);out.push(['FOCO NO TREINO: '+ATN[car.focus],BLU])}
  if(fx.cond){car.cond=clamp(car.cond+fx.cond,0,100);out.push(['FISICO '+(fx.cond>0?'+':'')+fx.cond,fx.cond>0?GRN:RED])}
  if(fx.money){const v=Math.max(200,Math.round(salary()*.15*fx.money/50)*50);car.money+=v;out.push(['PATROCINIO +'+money$(v),GRN])}
  if(fx.rival&&intv.opp>=0){carEnsure();const h=car.h2h[intv.opp]||(car.h2h[intv.opp]={w:0,l:0});h.l=Math.max(h.l,2);if(h.w>=h.l)h.w=h.l-1;out.push(['RIVALIDADE: '+teamKeyName(intv.opp).slice(0,10),RED]);out.push(['VENCER ELES DA BONUS',MUT])}
  pushNews(myName()+': '+A.t);
  intv.done={t:A.t,out};store();sfx.game();
}
function finishTourWeek(){
  const c=car.tour;car.msg=c&&c.champ===-1?'CAMPEAO EM '+c.city+'!':'VOLTANDO PRA CASA';nextWeek('played');if(mode!=='cseason'){mode='career';cur=0}
}
function stepInterview(){
  if(!intv){finishTourWeek();return}
  if(!intv.done){nav(3);if(prs(menu,'a')||prs(menu,'start'))answerInterview(cur)}
  else if(prs(menu,'a')||prs(menu,'start')||prs(menu,'b')){intv=null;sfx.ui();finishTourWeek()}
}
function drawReporter(x,y){
  R(x+4,y,8,8,'#e0b088');R(x+3,y-1,10,3,'#3a2a1a');R(x+6,y+3,1,1,'#222');R(x+10,y+3,1,1,'#222');
  R(x+2,y+8,12,14,'#2e5a9a');R(x+6,y+8,4,6,'#f4f4f4');R(x+7,y+9,2,5,'#c0392b');
  R(x+13,y+11,6,2,'#2e5a9a');R(x+18,y+8,2,6,'#3a3a3a');R(x+17,y+5,4,4,'#555');R(x+18,y+6,2,2,'#888');
  R(x+3,y+22,4,8,'#2a2a3a');R(x+9,y+22,4,8,'#2a2a3a');
}
function drawCInt(){
  const Q=INTV[intv.k];
  txt('ENTREVISTA',80,30,ACC,'center',F16);
  R(8,52,144,40,'#141a3c');R(8,52,144,1,BLU);drawReporter(12,58);
  wrap(Q.q,13).forEach((l,i)=>txt(l,96,58+i*11,WHITE,'center'));
  if(!intv.done){
    Q.a.forEach((a,i)=>{const on=i===cur,L=wrap(a.t,17),y=106+i*38;
      R(8,y-4,144,32,on?'#2b3470':'#10163a');if(on)R(8,y-4,3,32,ACC);
      L.forEach((l,j)=>txt(l,18,y+j*11,on?ACC:WHITE))});
    txt('A RESPONDE',80,262,MUT,'center');
  }else{
    wrap('"'+intv.done.t+'"',18).forEach((l,i)=>txt(l,80,108+i*12,ACC,'center'));
    intv.done.out.forEach(([s,c],i)=>txt(s.slice(0,20),80,160+i*14,c,'center'));
    if(Math.floor(frame/28)%2)txt('A CONTINUA',80,250,ACC,'center');
  }
}
