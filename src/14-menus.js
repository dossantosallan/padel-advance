/* ---------- partidas, torneio e menus ---------- */
function setupTeams(oppId,skill){
  const pair=typeof oppId==='object'?oppId:(PAIRS[oppId]||PAIRS[0]),me=save.me,my=SHIRTS[me.shirt],my2=KIT2[me.c2];
  oppPair=pair;
  let oc=pair.c;if(oc===my)oc=my==='#f2f2f2'?'#24305e':'#f2f2f2';
  const look=a=>({name:a[0],first:a[0].split(' ')[0],hs:a[1],hair:a[2],skin:typeof a[3]==='number'?SKINS[a[3]]:a[3]});
  const kit={shirt:my,shirt2:my2,pat:me.pat,shorts:my2===my?'#f4f4f4':my2};
  const okit={shirt:oc,shirt2:'#24305e',pat:pair.pat||0,shorts:'#24305e'};
  const inCar=kind==='car'&&car;
  const pa=inCar?PL_(car.partner):null,part=inCar?[pa.n,pa.hs,pa.hair,pa.skin]:PARTNER;
  Object.assign(P[0],{name:myName(),first:myName().split(' ')[0],hs:HS[me.hs],hair:HAIRS[me.hair],skin:SKINS[me.skin],...kit,band:null,acc:me.acc,accC:ACCS[me.accC],shoe:SHOES[me.shoe],rktC:RKTC[me.rkt],skill:1.6,style:'equil',lefty:!!me.lefty,ctrl:pad1,homeX:me.side?28:72});
  Object.assign(P[1],look(part),kit,{band:'#ffd23f',acc:0,shoe:null,rktC:null,skill:inCar?Math.min(3.5,pa.sk+car.chem*.4):1.6,style:inCar?pa.st:'equil',lefty:inCar&&pa.st==='canhoto',ctrl:null,homeX:me.side?72:28});
  Object.assign(P[2],look(pair.p[0]),okit,{band:null,acc:0,shoe:null,rktC:null,skill,style:pair.s,lefty:!!STY[pair.s].lefty,ctrl:null});
  Object.assign(P[3],look(pair.p[1]),okit,{band:'#3fd0ff',acc:0,shoe:null,rktC:null,skill,style:pair.s,lefty:!!STY[pair.s].lefty,ctrl:null});
  if(twoP){
    const c2=my==='#2e86ff'?'#f2f2f2':'#2e86ff';
    for(const p of[P[2],P[3]])Object.assign(p,{shirt:c2,pat:0,style:'equil',lefty:false,skill:1.6});
    P[3].ctrl=pad2;P[3].first='J2';P[0].first='J1';
  }
  P.forEach(p=>{p.stam=1;p.lblT=0;p.hidden=false});
  if(inCar)P[0].stam=clamp(car.cond/100,.45,1);
}
let friendlySwap=false;
function enterDemo(){
  resetRules();
  if(friendlySwap){if(save.base)profApply(save.base);save.base=null;friendlySwap=false;store()}
  mode='title';kind='demo';demo=true;twoP=false;paused=false;replay=null;replayPending=false;bo3=false;sets=[0,0];
  setupTeams((Math.random()*PAIRS.length)|0,1.5);P[1].skill=P[0].skill=1.5;
  pts=[0,0];games=[0,0];serveTeam=0;cur=0;setupServe();
}
function startMatch(k,oppId,skill,best3){
  resetRules();mstReset();exclaim=null;lvlUps=[];
  kind=k;demo=false;twoP=k==='2p';opp=oppId;mode='game';paused=false;replay=null;replayPending=false;bo3=!!best3;sets=[0,0];
  pts=[0,0];games=[0,0];serveTeam=0;faults=0;partnerMode=['AUTO','AUTO'];
  setupTeams(oppId,skill);rec.length=0;setupServe();sfx.game();
}
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function newTour(){
  const L0=shuffle([0,1,2,3,4]),L1=shuffle([5,6,7,8]),L2=shuffle([9,10,11]),L3=shuffle([12,13,14]);
  save.tour={v2:1,season:save.season,round:0,rounds:[[-1,L0[0],L1[0],L0[1],L2[0],L0[2],L1[1],L0[3],L3[0],L0[4],L1[2],L2[1],L3[1],L1[3],L2[2],L3[2]]]};
  store();
}
const lvlOf=(id,season)=>id<0?2.4:Math.min(3.5,PAIRS[id].lv+(season-1)*.35);
const simWinner=(a,c,s)=>Math.random()<1/(1+Math.exp(-(lvlOf(a,s)-lvlOf(c,s))*1.2))?a:c;
const nameOf=id=>id<0?myName():PAIRS[id].n;
function endMatch(w){
  mode='result';resultW=w;resLines=[];
  if(kind==='daily'||kind==='quick'){challengeEnd(w)}
  else if(kind==='tour'&&save.tour){
    const t=save.tour,r=t.round,ids=t.rounds[r],me=ids.indexOf(-1),winners=[];
    for(let i=0;i<ids.length;i+=2){if(i===(me&~1))winners.push(w===0?-1:ids[me^1]);else winners.push(simWinner(ids[i],ids[i+1],t.season))}
    t.rounds.push(winners);
    if(w===0){
      save.wins++;save.xp+=2;t.round++;
      if(t.round===4){save.titles++;save.xp+=3;save.season++;save.tour=null;resNext='champion';resLines=['TITULO DA','TEMPORADA '+(save.season-1),'+5 PONTOS']}
      else{resNext='player';nextAfterPlayer='bracket';resLines=['PROXIMA FASE',RN[t.round],'+2 PONTOS']}
    }else{save.xp+=1;save.tour=null;resNext='player';nextAfterPlayer='title';resLines=['ELIMINADOS',RN_NA[r],'+1 PONTO']}
  }else if(kind==='car'&&car&&car.tour){
    matchGains(w===0);const t=car.tour,rn=ROUNDN(t.cur.length),inj=tourMatchDone(w===0,false);
    careerResultLines(w===0,rn,inj);
  }else if(kind==='friendly'){
    resNext='title';if(w===0){save.wins++;save.xp+=1;resLines=['AMISTOSO','+1 PONTO']}else resLines=['AMISTOSO','SEM PONTOS']
  }else{resNext='title';resLines=[(w===0?'J1':'J2')+' VENCEU']}
  statsSave(w===0);store();
  if(w===0||twoP)sfx.fanfare();
}
const tourOppId=()=>{const t=save.tour,ids=t.rounds[t.round];return ids[ids.indexOf(-1)^1]};
const TITLE_ITEMS=()=>['CARREIRA','DESAFIOS','ESCOLA','AMISTOSO','2 JOGADORES','PERSONAGEM','OPCOES'];
function careerResultLines(win,rn,inj){
  const t=car.tour;
  if(inj){resLines=['LESAO!','FORA POR '+car.inj+' SEM.'];resNext='cdone';return}
  if(!t.alive){resLines=t.champ===-1?['CAMPEOES DO','TORNEIO!']:['ELIMINADOS',ROUNDNA(Math.pow(2,t.R-(t.res[-1]||0)))];resNext='cdone'}
  else{resLines=['PROXIMA FASE',ROUNDN(t.cur.length)];resNext='ctour'}
  if(lvlUps.length){const c={};for(const k of lvlUps)c[k]=(c[k]||0)+1;resLines.push(Object.keys(c).map(k=>({vel:'VEL',for:'FOR',pre:'PRE',top:'CIMA'})[k]+'+'+c[k]).join(' '))}
}
function simCareerMatch(){
  lvlUps=[];mst=null;const t=car.tour,o=tourOpp(),win=Math.random()<winP(-1,o),rn=ROUNDN(t.cur.length);gainSpread(win?.22:.14);
  const best3=CATS[t.code].bo3&&t.cur.length===2;
  kind='car';demo=false;twoP=false;bo3=false;sets=[0,0];oppPair=pairObj(o);
  const lo=(Math.random()*3)|0;games=win?[4,lo]:[lo,4];pts=[0,0];
  if(best3){bo3=true;sets=win?[2,(Math.random()*2)|0]:[(Math.random()*2)|0,2]}
  resultW=win?0:1;const inj=tourMatchDone(win,true);
  careerResultLines(win,rn,inj);mode='result';
  if(win)sfx.fanfare();else sfx.fault();
}
function openName(tg){nameTarget=tg||'me';nameBuf=nameTarget==='team'?save.me.team:save.me.name;nameCur=0;typeQ.length=0;mode='name'}
const nameMax=()=>nameTarget==='team'?10:8;
function nav(n){if(prs(menu,'up')){cur=(cur+n-1)%n;sfx.ui()}if(prs(menu,'down')){cur=(cur+1)%n;sfx.ui()}}
const back=()=>prs(menu,'b');
function update(){
  readInput();frame++;if(sharing)return;if(cheer>0)cheer--;
  switch(mode){
    case 'boot':stepBoot();break;
    case 'intro':stepIntro();break;
    case 'title':{
      nav(7);
      if(prs(menu,'a')||prs(menu,'start')){
        sfx.ui();
        if(!save.me.name&&cur!==6){mode='create';cpage=0;cur=0}
        else if(cur===0){mode='cmenu';cur=0}
        else if(cur===1){mode='chal';cur=0}
        else if(cur===2){mode='school';cur=0}
        else if(cur===3){mode='friendly';cur=0}
        else if(cur===4){mode='twop'}
        else if(cur===5){mode='create';cpage=0;cur=0}
        else{mode='options';cur=0}
      }else{quiet=true;stepGame();quiet=false}
      break;}
    case 'bracket':
      if(prs(menu,'a')||prs(menu,'start')){const id=tourOppId();startMatch('tour',id,lvlOf(id,save.tour.season))}
      else if(back()){enterDemo()}
      break;
    case 'friendly':
      nav(3);
      {const dv=prs(menu,'right')-prs(menu,'left');
        if(dv){sfx.ui();if(cur===0)friendly.pair=(friendly.pair+PAIRS.length+dv)%PAIRS.length;else if(cur===1)friendly.lvl=(friendly.lvl+3+dv)%3;
          else{const opts=[-1,...save.slots.map((s,i)=>s?i:null).filter(i=>i!==null)];friendly.ath=opts[(opts.indexOf(friendly.ath??-1)+opts.length+dv)%opts.length]}}}
      if(prs(menu,'a')||prs(menu,'start')){
        const a=friendly.ath??-1;
        if(a>=0&&save.slots[a]){save.base=profSnap();profApply({me:save.slots[a].prof.me,attr:save.slots[a].prof.attr});friendlySwap=true}
        startMatch('friendly',friendly.pair,[0,1.5,3][friendly.lvl]);
      }
      else if(back())enterDemo();
      break;
    case 'twop':
      if(prs(menu,'a')||prs(menu,'start'))startMatch('2p',2,1.6);
      else if(back())enterDemo();
      break;
    case 'player':
      nav(4);
      if(prs(menu,'a')){const k=ATTR[cur][0];if(save.attr[k]<99&&save.xp>0){save.attr[k]=Math.min(99,save.attr[k]+3);save.xp--;store();sfx.game()}else sfx.fault()}
      if(back()||prs(menu,'start')){store();if(nextAfterPlayer==='career'&&car){mode='career';cur=6}else enterDemo()}
      break;
    case 'options':{
      nav(10);const dv=prs(menu,'right')-prs(menu,'left')||(prs(menu,'a')?1:0);
      if(cur===9){if(prs(menu,'a')){mode='backup';cur=0;sfx.ui()}}
      else if(dv){
        const o=save.opts;sfx.ui();
        if(cur===0){o.court=(o.court+COURTS.length+dv)%COURTS.length;buildCrowd()}
        else if(cur===1)setCam(1-o.cam);
        else if(cur===6){o.full=!o.full;applyScreen()}
        else if(cur===2)o.golden=!o.golden;
        else if(cur===3)o.marker=!o.marker;
        else if(cur===4){o.btn=(o.btn+BTNS.length+dv)%BTNS.length;applyBtn()}
        else if(cur===5){o.sound=!o.sound;unlock();if(o.sound)beep(660,.05)}
        else if(cur===7){o.music=!o.music;unlock()}
        else if(cur===8){o.tips=!o.tips;if(o.tips)save.tipsSeen={}}
        store();
      }
      if(back()||prs(menu,'start'))enterDemo();
      break;}
    case 'create':{
      const me=save.me,dv=prs(menu,'right')-prs(menu,'left'),cyc=(k,n)=>{me[k]=(me[k]+n+dv)%n};
      nav(cpage===0?12:5);
      if(dv){sfx.ui();
        if(cpage===0){
          if(cur===1)cyc('side',2);else if(cur===2)cyc('lefty',2);else if(cur===3)cyc('style',3);
          else if(cur===4)cyc('hs',HS.length);else if(cur===5)cyc('hair',HAIRS.length);else if(cur===6)cyc('skin',SKINS.length);
          else if(cur===7)cyc('acc',4);else if(cur===8)cyc('accC',ACCS.length);else if(cur===9)cyc('shoe',SHOES.length);else if(cur===10)cyc('rkt',RKTC.length);
        }else{if(cur===1)cyc('shirt',SHIRTS.length);else if(cur===2)cyc('c2',KIT2.length);else if(cur===3)cyc('pat',4)}
        store();
      }
      if(prs(menu,'a')||prs(menu,'start')){
        sfx.ui();
        if(!me.name||(cpage===0&&cur===0))openName('me');
        else if(cpage===0&&(cur===11||prs(menu,'start'))){cpage=1;cur=0}
        else if(cpage===1&&cur===0&&!prs(menu,'start'))openName('team');
        else if(cpage===1&&(cur===4||prs(menu,'start'))){store();if(creatingSlot!=null){mode='cattr';cur=0}else enterDemo()}
      }else if(back()){if(cpage===1){cpage=0;cur=11}else if(creatingSlot!=null)cancelCreate();else if(me.name){store();enterDemo()}else openName('me')}
      break;}
    case 'name':{
      const put=ch=>{if(ch==='<')nameBuf=nameBuf.slice(0,-1);else if(nameBuf.length<nameMax()&&!(ch===' '&&(!nameBuf||nameBuf.endsWith(' '))))nameBuf+=ch;sfx.ui()};
      while(typeQ.length)put(typeQ.shift());
      if(prs(menu,'left')){nameCur=nameCur===28?27:(nameCur+27)%28;sfx.ui()}
      if(prs(menu,'right')){nameCur=nameCur===28?0:(nameCur+1)%28;sfx.ui()}
      if(prs(menu,'down')){nameCur=nameCur===28?3:nameCur>=21?28:nameCur+7;sfx.ui()}
      const NM=nameMax();
      if(prs(menu,'up')){nameCur=nameCur===28?24:nameCur<7?28:nameCur-7;sfx.ui()}
      const done=()=>{const n=nameBuf.trim();if(nameTarget==='team'){save.me.team=n;store();mode='create';cpage=1;cur=0;sfx.game();return}if(!n){sfx.fault();return}save.me.name=n;store();mode='create';cpage=0;cur=1;sfx.game()};
      if(prs(menu,'start'))done();
      else if(prs(menu,'a')){if(nameCur===28)done();else put(NAMEGRID[nameCur])}
      else if(prs(menu,'b')){if(nameBuf)put('<');else if(nameTarget==='team'){mode='create';cpage=1;cur=0}else if(save.me.name){mode='create';cpage=0;cur=0}}
      break;}
    case 'career':{
      if(car.needOffer){car.needOffer=false;offerContract();break}
      const IT=9;nav(IT);
      if(cur===0){const o=weekOpts(),dv=prs(menu,'right')-prs(menu,'left');if(dv&&o.length>1){car.pick=((car.pick||0)+1)%o.length;sfx.ui()}}
      if(prs(menu,'a')){
        sfx.ui();
        if(cur===0){
          if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE'}
          else if(!eligible()){sfx.fault();car.msg='SEM RANKING PARA ESTE'}
          else if(car.money<weekInfo().cost){sfx.fault();car.msg='SEM DINHEIRO P/ VIAGEM'}
          else{enterTour();mode='ctour';cur=0}
        }else if(cur===1){
          if(car.inj>0){sfx.fault();car.msg='LESIONADO: DESCANSE'}
          else if(car.money<400){sfx.fault();car.msg='SEM DINHEIRO'}
          else{car.money-=400;lvlUps=[];car.msg='TREINO: '+ATN[car.focus];gain(car.focus,1.3+(car.coach?.6:0));nextWeek('train')}
        }else if(cur===2){car.msg=car.inj>0?'RECUPERANDO':'DESCANSO: FISICO +35';nextWeek(car.inj>0?'inj':'rest')}
        else if(cur===3){mode='crank';rkOff=Math.max(0,myRank()-8)}
        else if(cur===4){mode='cpartner';cur=0}
        else if(cur===5){mode='cteam';cur=0}
        else if(cur===6){mode='cevo';cur=['vel','for','pre','top'].indexOf(car.focus)}
        else if(cur===7){mode='cmore';cur=0}
        else{leaveSlot();enterDemo()}
      }else if(back()){leaveSlot();enterDemo()}
      break;}
    case 'ctour':
      nav(3);
      if(prs(menu,'a')){
        const t=car.tour,o=tourOpp();
        if(cur===0)startMatch('car',pairObj(o),clamp(teamSk(o)+DIFF_ADJ[car.diff??1],.2,3.7),CATS[t.code].bo3&&t.cur.length===2);
        else if(cur===1)simCareerMatch();
        else{const inj=tourMatchDone(false,true);careerResultLines(false,'',inj);mode='cdone'}
      }
      break;
    case 'cdone':
      if(back()&&car.tour&&car.tour.champ===-1){shareCard('title');break}
      if(prs(menu,'a')||prs(menu,'start')){sfx.ui();const c=car.tour;car.msg=c&&c.champ===-1?'CAMPEAO EM '+c.city+'!':'VOLTANDO PRA CASA';nextWeek('played');if(mode!=='cseason'){mode='career';cur=0}}
      break;
    case 'crank':
      if(prs(menu,'down'))rkOff=Math.min(rkOff+1,indivRank().length-12);
      if(prs(menu,'up'))rkOff=Math.max(0,rkOff-1);
      if(prs(menu,'right'))rkOff=Math.min(rkOff+12,indivRank().length-12);
      if(prs(menu,'left'))rkOff=Math.max(0,rkOff-12);
      if(back()||prs(menu,'a')){mode='career';cur=3}
      break;
    case 'cpartner':{
      const L=freeSorted();nav(L.length);
      if(prs(menu,'a')){
        const id=L[cur],need=reqRankFor(PL_(id).sk);
        if(myRank()<=need){car.free=car.free.filter(x=>x!==id);car.free.push(car.partner);car.partner=id;car.chem=0;car.msg='NOVO PARCEIRO: '+PL_(id).n.split(' ')[0];sfx.game();store();mode='career';cur=4}
        else sfx.fault();
      }else if(back()){mode='career';cur=4}
      break;}
    case 'cteam':{
      nav(5);if(cur===3){const d=prs(menu,'right')-prs(menu,'left')||(prs(menu,'a')?1:0);if(d){car.diff=((car.diff??1)+3+d)%3;sfx.ui();store()}}const dv=prs(menu,'right')-prs(menu,'left');
      if(cur===2&&dv){car.rkView=((car.rkView||0)+RKTS.length+dv)%RKTS.length;sfx.ui()}
      if(prs(menu,'a')){
        if(cur===0){if(car.physio===car.week||car.money<1500)sfx.fault();else{car.money-=1500;car.cond=Math.min(100,car.cond+30);car.physio=car.week;sfx.game()}}
        else if(cur===1){car.coach=!car.coach;sfx.ui()}
        else if(cur===3){}
        else if(cur===2){const v=car.rkView||0;if(car.rk.includes(v)){car.rkEq=v;sfx.ui()}else if(car.money>=RKTS[v].c){car.money-=RKTS[v].c;car.rk.push(v);car.rkEq=v;sfx.game()}else sfx.fault()}
        else{mode='career';cur=5}
        store();
      }else if(back()){mode='career';cur=5}
      break;}
    case 'cmenu':
      nav(3);
      if(prs(menu,'a')||prs(menu,'start')){sfx.ui();const has=save.slots.some(Boolean);
        if(cur===0){slotMode='new';mode='cslots';const e=save.slots.findIndex(s=>!s);cur=e<0?0:e}
        else if(cur===1){if(has){slotMode='load';mode='cslots';cur=save.slots.findIndex(Boolean)}else sfx.fault()}
        else enterDemo()}
      else if(back())enterDemo();
      break;
    case 'cslots':
      if(slotConfirm){if(prs(menu,'a')||prs(menu,'start')){slotConfirm=false;beginCreate(cur)}else if(back())slotConfirm=false;break}
      nav(4);
      if(prs(menu,'a')||prs(menu,'start')){
        if(cur===3){mode='cmenu';cur=slotMode==='new'?0:1}
        else if(slotMode==='load'){if(save.slots[cur]){enterSlot(cur);kind='car';mode=car.retired?'cretire':car.week>=CAL.length?'cseason':car.tour?(car.tour.alive?'ctour':'cdone'):'career';cur=0;sfx.game()}else sfx.fault()}
        else{if(save.slots[cur])slotConfirm=true;else beginCreate(cur)}
      }else if(back()){mode='cmenu';cur=slotMode==='new'?0:1}
      break;
    case 'cattr':{
      nav(6);const K=['vel','for','pre','top'],dv=prs(menu,'right')-prs(menu,'left');
      if(cur===4&&dv){newDiff=(newDiff+3+dv)%3;sfx.ui()}
      if(cur<4&&dv){const k=K[cur];if(dv>0&&startPts>0&&save.attr[k]<START_MAX){save.attr[k]++;startPts--;sfx.ui()}else if(dv<0&&save.attr[k]>START_BASE){save.attr[k]--;startPts++;sfx.ui()}else sfx.fault()}
      if((prs(menu,'a')||prs(menu,'start'))&&cur===5){if(startPts===0)finishCreate();else sfx.fault()}
      else if(back()){mode='create';cpage=1;cur=4}
      break;}
    case 'cevo':
      nav(4);
      if(prs(menu,'a')){car.focus=['vel','for','pre','top'][cur];sfx.ui();store()}
      else if(back()){mode='career';cur=6}
      break;
    case 'chal':
      nav(3);
      if(prs(menu,'a')||prs(menu,'start')){sfx.ui();if(cur===0)startChallenge('daily');else if(cur===1)startChallenge('quick');else enterDemo()}
      else if(back())enterDemo();
      break;
    case 'backup':
      nav(3);
      if(prs(menu,'a')||prs(menu,'start')){sfx.ui();if(cur===0)openExport();else if(cur===1)openImport();else{mode='options';cur=9}}
      else if(back()){mode='options';cur=9}
      break;
    case 'cmore':
      nav(4);
      if(prs(menu,'a')){sfx.ui();if(cur===0)mode='cnews';else if(cur===1)mode='ctroph';else if(cur===2)mode='cstats';else{mode='career';cur=7}}
      else if(back()){mode='career';cur=7}
      break;
    case 'cnews':case 'ctroph':case 'cstats':
      if(mode==='ctroph'&&prs(menu,'a')){shareCard('season');break}
      if(back()||prs(menu,'a')){mode='cmore';cur={cnews:0,ctroph:1,cstats:2}[mode]}
      break;
    case 'school':{
      const n=LESSONS.length+1;nav(n);
      if(cur===LESSONS.length){const dv=prs(menu,'right')-prs(menu,'left');if(dv){freeSel=(freeSel+FREE_N.length+dv)%FREE_N.length;sfx.ui()}}
      if(prs(menu,'a')||prs(menu,'start')){if(cur<LESSONS.length)startTrain(cur);else startTrain(null,freeSel)}
      else if(back())enterDemo();
      break;}
    case 'cseason':{
      const canRet=car.age>=RETIRE_AGE,force=car.age>=FORCE_RETIRE;
      if(canRet&&!force)nav(2);
      if(back()){shareCard('season');break}
      if(prs(menu,'a')||prs(menu,'start')){
        if(force||(canRet&&cur===1))retire();
        else{newSeason();mode='career';cur=0;sfx.fanfare()}
      }
      break;}
    case 'csponsor':
      nav(2);
      if(prs(menu,'a')||prs(menu,'start')){signContract(cur);mode='career';cur=0;sfx.game()}
      break;
    case 'cretire':
      if(back()){shareCard('retire');break}
      if(prs(menu,'a')||prs(menu,'start')){leaveSlot();enterDemo()}
      break;
    case 'game':
      if(prs(menu,'start')&&st!=='replay'){paused=!paused;pauseCur=0;sfx.ui();break}
      if(paused){
        if(prs(menu,'up')||prs(menu,'down')){pauseCur=(pauseCur+(prs(menu,'down')?1:4))%5;sfx.ui()}
        if(prs(menu,'a')){
          if(pauseCur===0)paused=false;
          else if(pauseCur===1){setCam(1-save.opts.cam);sfx.ui()}
          else if(pauseCur===3){save.opts.full=!save.opts.full;store();applyScreen();sfx.ui()}
          else if(pauseCur===2){save.opts.sound=!save.opts.sound;store();unlock();if(save.opts.sound)beep(660,.05)}
          else if(kind==='train'){paused=false;mode='school';cur=train.li==null?LESSONS.length:train.li}
          else if(kind==='car'&&car&&car.tour){paused=false;resultW=1;const inj=tourMatchDone(false,false);careerResultLines(false,'',inj);mode='cdone'}
          else enterDemo();
        }
        if(back())paused=false;
      }else stepGame();
      break;
    case 'result':
      if(prs(menu,'a')||prs(menu,'start')){
        if(resNext==='chal'){mode='chal';cur=0}
        else if(resNext==='ctour'){mode='ctour';cur=0}
        else if(resNext==='cdone'){mode='cdone'}
        else if(resNext==='champion'){mode='champion'}
        else if(resNext==='player'){mode='player';cur=0}
        else enterDemo();
      }
      break;
    case 'champion':
      if(prs(menu,'a')||prs(menu,'start')){mode='player';nextAfterPlayer='title';cur=0}
      break;
  }
}
