/* ---------- carreiras salvas e evolução ----------
   Até 3 carreiras. Cada uma guarda o próprio personagem (perfil) e a liga.
   Ao entrar numa carreira, o perfil dela substitui o perfil base (usado em amistoso/2P) até você sair. */
const PROF_KEYS=['me','attr','xp','stats','titles','wins','season'];
const clone=o=>JSON.parse(JSON.stringify(o===undefined?null:o));
function profSnap(){const o={};for(const k of PROF_KEYS)o[k]=clone(save[k]);return o}
function profApply(o){for(const k of PROF_KEYS)if(o[k]!==undefined)save[k]=clone(o[k])}
if(!save.slots){save.slots=[null,null,null];if(save.car){save.slots[0]={prof:profSnap(),car:save.car};save.car=null;car=null}}
/* recuperação: se o app fechou dentro de uma carreira, devolve os dados para o slot e restaura o perfil base */
if(save.active!=null&&save.slots[save.active]){save.slots[save.active]={prof:profSnap(),car:save.car};if(save.base)profApply(save.base)}
else if(save.base)profApply(save.base);
save.active=null;save.base=null;save.car=null;car=null;
let creatingSlot=null,slotMode='load',slotConfirm=false,lvlUps=[],startPts=20;
const START_BASE=40,START_MAX=55;
function syncSlot(){if(save.active==null||!car)return;save.slots[save.active]={prof:profSnap(),car}}
function enterSlot(i){save.base=profSnap();const s=save.slots[i];profApply(s.prof);car=save.car=s.car;save.active=i;carEnsure();if(!car.prog){car.prog={vel:0,for:0,pre:0,top:0};car.focus='pre'}store()}
function leaveSlot(){if(save.active!=null){syncSlot();if(save.base)profApply(save.base)}save.base=null;save.active=null;car=save.car=null;store()}
function slotMeta(s){if(!s)return null;const c=s.car,p=s.prof;return{n:p.me.name||'?',season:c.season,week:c.week,titles:(c.trophies||[]).length,pts:c.myPts}}
function beginCreate(i){
  save.base=profSnap();
  profApply({me:{name:'',hs:0,hair:0,skin:0,shirt:0,side:0,lefty:0,style:0,acc:0,accC:0,shoe:0,rkt:0,c2:0,pat:0,team:''},attr:{vel:START_BASE,for:START_BASE,pre:START_BASE,top:START_BASE},xp:0,stats:null,titles:0,wins:0,season:1});
  creatingSlot=i;startPts=20;car=save.car=null;mode='create';cpage=0;cur=0;openName('me');
}
function cancelCreate(){if(save.base)profApply(save.base);save.base=null;creatingSlot=null;store();mode='cmenu';cur=0}
function finishCreate(){
  const i=creatingSlot;creatingSlot=null;
  newCareer();car.prog={vel:0,for:0,pre:0,top:0};car.focus=['vel','for','pre','top'].sort((a,c)=>save.attr[a]-save.attr[c])[0];
  save.slots[i]={prof:profSnap(),car};save.active=i;store();mode='career';cur=0;sfx.fanfare();
}
/* evolução: cada ponto de atributo custa mais que o anterior (0,3 no começo, ~3 perto de 99).
   Em média uma temporada rende ~25 unidades: sair de 45 para 75 num atributo leva umas 3 temporadas. */
const costAt=v=>.25*Math.pow(1.045,v-40);
const ATN={vel:'VELOCIDADE',for:'FORCA',pre:'PRECISAO',top:'POR CIMA'};
function gain(k,u){
  if(!car||!car.prog)return;
  car.prog[k]+=u;
  while(save.attr[k]<99&&car.prog[k]>=costAt(save.attr[k])){car.prog[k]-=costAt(save.attr[k]);save.attr[k]++;lvlUps.push(k);
    if(save.attr[k]%5===0){pushNews(ATN[k]+' CHEGOU A '+save.attr[k]);car.msg=ATN[k]+' '+save.attr[k]+'!'}}
  if(save.attr[k]>=99)car.prog[k]=0;
}
function gainSpread(u){for(const k of['vel','for','pre','top'])gain(k,u/4)}
/* partida jogada de verdade: o que você mais fez em quadra é o que mais evolui */
function matchGains(win){
  if(!mst)return gainSpread(win?.25:.15);
  const sh=mst.shots,over=(sh.smash||0)+(sh.bandeja||0)+(sh.vibora||0);
  const w={top:over+1,for:mst.win+(sh.drive||0)*.25+1,pre:Math.max(1,6-mst.err)+mst.svIn*.3,vel:(mst.run||0)/180+1};
  const tot=w.top+w.for+w.pre+w.vel,budget=win?.75:.45;
  for(const k in w)gain(k,budget*w[k]/tot);
}
function drawSlots(){
  txt(slotMode==='new'?'NOVA CARREIRA':'CARREGAR',80,32,ACC,'center');
  for(let i=0;i<3;i++){const m=slotMeta(save.slots[i]),y=58+i*52,on=i===cur;
    R(8,y-6,144,44,on?'#2b3470':'#141a3c');if(on)R(8,y-6,3,44,ACC);
    txt('CARREIRA '+(i+1),18,y,on?ACC:MUT);
    if(m){txt(m.n,18,y+12,WHITE);txt('TEMP '+m.season+'  SEM '+(m.week+1),18,y+24,MUT);txt(m.titles+' TIT',148,y+24,ACC,'right')}
    else txt('VAZIO',18,y+12,'#55507a');
  }
  const on=cur===3;txt((on?'> ':'  ')+'VOLTAR',40,222,on?ACC:WHITE);
  if(slotConfirm){cx.fillStyle='rgba(5,7,26,.95)';cx.fillRect(10,96,140,64);R(10,96,140,1,RED);R(10,159,140,1,RED);
    txt('APAGAR CARREIRA',80,106,RED,'center');txt((cur+1)+' E COMECAR?',80,120,WHITE,'center');txt('A SIM   B NAO',80,142,ACC,'center')}
  else txt('A ESCOLHE  B VOLTA',80,262,MUT,'center');
}
function drawCMenu(){
  txt('CARREIRA',80,40,ACC,'center',F16);
  const n=save.slots.filter(Boolean).length;
  ['NOVA CARREIRA','CARREGAR ('+n+'/3)','VOLTAR'].forEach((s,i)=>{const on=i===cur;txt((on?'> ':'  ')+s,24,100+i*22,on?ACC:(i===1&&!n?'#55507a':WHITE))});
  txt('CRIE SEU ATLETA',80,196,MUT,'center');txt('E SUBA NO RANKING',80,208,MUT,'center');
  txt('ATE 3 CARREIRAS',80,232,MUT,'center');
}
function drawCAttr(){
  txt('INICIO',80,30,ACC,'center',F16);
  txt('DISTRIBUA '+20+' PONTOS',80,54,WHITE,'center');txt('RESTAM '+startPts,80,66,startPts?ACC:GRN,'center');
  const K=['vel','for','pre','top'];
  K.forEach((k,i)=>{const y=88+i*24,on=cur===i,v=save.attr[k],bn=attrBonus(k);txt(ATN[k],8,y,on?ACC:WHITE);txt(String(v)+(bn?'+'+bn:''),152,y,on?ACC:WHITE,'right');R(8,y+11,144,4,'#05071a');R(8,y+11,Math.round(144*v/99),4,on?ACC:GRN);if(bn)R(8+Math.round(144*v/99),y+11,Math.round(144*bn/99),4,BLU)});
  const on=cur===4;txt((on?'> ':'  ')+'COMECAR',40,192,on?(startPts?MUT:ACC):WHITE);
  const me=save.me;txt('BONUS: '+STYLE_N[me.style]+', '+SIDE_N[me.side],80,214,BLU,'center');
  txt('< > AJUSTA (MAX '+START_MAX+')',80,240,MUT,'center');txt('B VOLTA AO VISUAL',80,254,MUT,'center');
}
function drawCEvo(){
  txt('EVOLUCAO',80,30,ACC,'center',F16);
  const K=['vel','for','pre','top'];
  K.forEach((k,i)=>{const y=56+i*34,on=cur===i,v=save.attr[k],foc=car.focus===k,bn=attrBonus(k);
    txt((foc?'*':' ')+ATN[k],6,y,on?ACC:WHITE);txt(String(v)+(bn?'+'+bn:''),154,y,ACC,'right');
    R(8,y+12,144,5,'#05071a');R(9,y+13,Math.round(142*v/99),3,foc?ACC:GRN);
    if(v<99){const p=car.prog[k]/costAt(v);R(9,y+19,Math.round(142*clamp(p,0,1)),1,BLU)}});
  txt('* = FOCO DO TREINO',80,196,ACC,'center');
  txt('TREINO: SOBE O FOCO',80,212,MUT,'center');txt('JOGOS: O QUE VOCE',80,224,MUT,'center');txt('MAIS FAZ EM QUADRA',80,236,MUT,'center');
  txt('A MUDA FOCO  B VOLTA',80,262,MUT,'center');
}
