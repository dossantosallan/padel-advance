/* ---------- backup do progresso ----------
   Gera um código de texto com tudo (carreiras, opções, escola). Compacta com gzip quando o navegador permite. */
const b64=buf=>{let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
async function packSave(){
  syncSlot();const json=JSON.stringify(save);
  try{if(window.CompressionStream){const st_=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));return'PADV2:'+b64(await new Response(st_).arrayBuffer())}}catch(_){}
  return'PADV1:'+btoa(unescape(encodeURIComponent(json)));
}
async function unpackSave(code){
  code=(code||'').trim().replace(/\s+/g,'');
  if(code.startsWith('PADV2:')){const bin=atob(code.slice(6)),u=Uint8Array.from(bin,c=>c.charCodeAt(0));const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(ds).text())}
  if(code.startsWith('PADV1:'))return JSON.parse(decodeURIComponent(escape(atob(code.slice(6)))));
  if(code.startsWith('{'))return JSON.parse(code);
  throw new Error('formato');
}
function overlay(html){
  let ov=document.getElementById('shareOv');
  if(!ov){ov=document.createElement('div');ov.id='shareOv';document.body.appendChild(ov)}
  ov.innerHTML='<div class="sh-box">'+html+'</div>';ov.hidden=false;sharing=true;
  const close=()=>{ov.hidden=true;sharing=false};
  const c=document.getElementById('ovClose');if(c)c.onclick=close;
  return{ov,close,$:id=>document.getElementById(id)};
}
async function openExport(){
  const code=await packSave(),n=save.slots.filter(Boolean).length;
  const o=overlay('<h3>Backup</h3><p>'+n+' carreira(s) salvas. Copie o código e guarde nas Notas, ou baixe o arquivo.</p><textarea id="bkTxt" readonly rows="6"></textarea><div class="sh-row"><button id="bkCopy">Copiar</button>'+(window.NO_DL?'':'<button id="bkFile">Baixar</button>')+'<button id="ovClose">Fechar</button></div><p id="bkMsg"></p>');
  const t=o.$('bkTxt');t.value=code;
  o.$('bkCopy').onclick=()=>{const done=()=>{o.$('bkMsg').textContent='Código copiado.'};
    try{navigator.clipboard.writeText(code).then(done,()=>{t.focus();t.select();o.$('bkMsg').textContent='Selecionei o código: use Copiar do sistema.'})}catch(_){t.focus();t.select()}};
  if(o.$('bkFile'))o.$('bkFile').onclick=()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download='padel-advance-backup.txt';document.body.appendChild(a);a.click();a.remove();o.$('bkMsg').textContent='Se o arquivo não baixar, use Copiar.'}catch(_){o.$('bkMsg').textContent='Não deu para baixar aqui. Use Copiar.'}};
}
function openImport(){
  const o=overlay('<h3>Restaurar</h3><p>Cole o código do backup ou escolha o arquivo. Isso substitui todo o progresso deste aparelho.</p><textarea id="bkTxt" rows="6" placeholder="PADV..."></textarea><input id="bkFileIn" type="file" accept=".txt,.json,text/plain"><div class="sh-row"><button id="bkGo">Restaurar</button><button id="ovClose">Fechar</button></div><p id="bkMsg"></p>');
  let armed=false;
  o.$('bkFileIn').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{o.$('bkTxt').value=r.result};r.readAsText(f)};
  o.$('bkGo').onclick=async()=>{
    let data;
    try{data=await unpackSave(o.$('bkTxt').value)}catch(_){o.$('bkMsg').textContent='Código inválido. Confira se copiou inteiro.';return}
    if(!data||typeof data!=='object'||!data.opts){o.$('bkMsg').textContent='Esse código não é de um backup do Padel Advance.';return}
    const n=(data.slots||[]).filter(Boolean).length;
    if(!armed){armed=true;o.$('bkGo').textContent='Confirmar';o.$('bkMsg').textContent='Backup com '+n+' carreira(s). Toque em Confirmar para substituir.';return}
    data.active=null;data.base=null;
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(data))}catch(_){o.$('bkMsg').textContent='Não consegui gravar neste navegador.';return}
    o.$('bkMsg').textContent='Restaurado! Recarregando...';setTimeout(()=>location.reload(),600);
  };
}
function drawBackup(){
  txt('BACKUP',80,34,ACC,'center',F16);
  ['EXPORTAR','RESTAURAR','VOLTAR'].forEach((s,i)=>{const on=i===cur;txt((on?'> ':'  ')+s,36,92+i*22,on?ACC:WHITE)});
  txt('SEU PROGRESSO FICA',80,176,MUT,'center');txt('SO NESTE APARELHO.',80,188,MUT,'center');
  txt('EXPORTE DE VEZ EM',80,206,BLU,'center');txt('QUANDO PRA NAO PERDER',80,218,BLU,'center');
  txt('B VOLTA',80,262,MUT,'center');
}

/* ---------- desafio do dia e partida relâmpago ---------- */
const DAILY=[
  {t:'VIRADA',d:['COMECE PERDENDO 0-2','E VENCA O SET'],cfg:{games:[0,2],to:4,sk:1.6},ok:w=>w===0},
  {t:'SEM ERROS',d:['VENCA 2 GAMES SEM','ERRO NAO FORCADO'],cfg:{to:2,sk:1.4},ok:w=>w===0&&mst&&mst.err===0},
  {t:'GIGANTES',d:['VENCA 2 GAMES','CONTRA A ELITE'],cfg:{to:2,sk:3.3},ok:w=>w===0},
  {t:'SHOWMAN',d:['VENCA 2 GAMES COM','4 WINNERS OU MAIS'],cfg:{to:2,sk:1.6},ok:w=>w===0&&mst&&mst.win>=4},
  {t:'POR 3',d:['FACA UM POR 3 OU 4','E VENCA 2 GAMES'],cfg:{to:2,sk:1.5},ok:w=>w===0&&dailyPor},
  {t:'OURO',d:['3 GAMES, TODOS','NO PONTO DE OURO'],cfg:{to:3,sk:2,gold:true},ok:w=>w===0},
  {t:'CANSADO',d:['FISICO PELA METADE:','VENCA 2 GAMES'],cfg:{to:2,sk:1.5,stam:.5},ok:w=>w===0},
];
let matchTo=0,forceGold=false,stamCap=1,dailyPor=false;
const dayKey=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()};
const todays=()=>DAILY[dayKey()%DAILY.length];
function dailyState(){const d=save.daily||(save.daily={last:0,streak:0,total:0,done:{}});return d}
function resetRules(){matchTo=0;forceGold=false;stamCap=1;dailyPor=false}
function startChallenge(k){
  const key=dayKey(),C=k==='daily'?todays().cfg:{to:1,sk:1.6,gold:true};
  const pair=k==='daily'?key%PAIRS.length:(Math.random()*PAIRS.length)|0;
  startMatch(k,pair,C.sk);
  matchTo=C.to;forceGold=!!C.gold;if(C.games)games=C.games.slice();if(C.stam){stamCap=C.stam;P[0].stam=C.stam}
}
function challengeEnd(w){
  if(kind==='daily'){
    const ok=todays().ok(w),d=dailyState(),key=dayKey();
    if(ok&&!d.done[key]){d.done[key]=1;d.total++;d.streak=d.last===prevDayKey()?d.streak+1:1;d.last=key}
    resLines=ok?['DESAFIO CUMPRIDO!','SEQUENCIA: '+d.streak+' DIA(S)']:['NAO FOI DESSA VEZ','TENTE DE NOVO'];
  }else resLines=[w===0?'RELAMPAGO!':'PERDEU NO OURO',''];
  resNext='chal';
}
function prevDayKey(){const d=new Date(Date.now()-864e5);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function drawChal(){
  const D=todays(),d=dailyState(),done=!!d.done[dayKey()];
  txt('DESAFIOS',80,30,ACC,'center',F16);
  R(8,52,144,92,'#05071a');R(8,52,144,1,ACC);
  txt('DESAFIO DO DIA',80,58,ACC,'center');txt(D.t,80,72,WHITE,'center',F16);
  D.d.forEach((l,i)=>txt(l,80,94+i*12,BLU,'center'));
  txt(done?'FEITO HOJE!':'SEQUENCIA '+d.streak,80,124,done?GRN:MUT,'center');
  txt('CONTRA '+PAIRS[dayKey()%PAIRS.length].n,80,134,MUT,'center');
  ['DESAFIO DO DIA','RELAMPAGO','VOLTAR'].forEach((s,i)=>{const on=i===cur;txt((on?'> ':'  ')+s,24,164+i*20,on?ACC:WHITE)});
  txt('RELAMPAGO: 1 GAME',80,232,MUT,'center');txt('COM PONTO DE OURO',80,244,MUT,'center');
}

/* ---------- comemoração e troca de lado ---------- */
function setMoods(w,why){
  const big=['WINNER!','POR 3!','POR 4!','NA FITA!','PONTO DELES'].includes(why),err=['FORA!','NA REDE','NAO PASSOU','DUPLA FALTA'].includes(why);
  for(const p of P){p.mood=0;
    if(big)p.mood=p.team===w?1:-1;
    else if(err){if(p===lastHitter)p.mood=-1;else if(p.team===w&&Math.random()<.5)p.mood=1}
  }
}
function drawChangeEnds(){
  const y=96;cx.fillStyle='rgba(13,19,51,.95)';cx.fillRect(12,y,136,76);R(12,y,136,1,ACC);R(12,y+75,136,1,ACC);
  txt('TROCA DE LADO',80,y+8,ACC,'center');
  [0,1].forEach(t=>{const yy=y+28+t*18;txt(teamName(t).slice(0,10),20,yy,t===0?P[0].shirt:P[2].shirt);if(bo3)txt(String(sets[t]),112,yy,MUT);R(124,yy-2,14,11,'#1b2350');txt(String(games[t]),128,yy,WHITE)});
}

/* ---------- primeira vez: escolher câmera e tela antes do menu ---------- */
function stepSetup(){
  nav(3);const dv=prs(menu,'right')-prs(menu,'left')||(cur<2&&prs(menu,'a')?1:0);
  if(dv&&cur===0){setCam(1-save.opts.cam);sfx.ui()}
  else if(dv&&cur===1){save.opts.full=!save.opts.full;applyScreen();store();sfx.ui()}
  if(cur===2&&(prs(menu,'a')||prs(menu,'start'))){save.setupDone=true;store();sfx.game();enterDemo();if(!save.me.name){mode='create';cur=0}return}
  quiet=true;stepGame();quiet=false;
}
function drawSetup(){
  cx.fillStyle='rgba(8,10,30,.55)';cx.fillRect(0,0,CW,CH);
  cx.fillStyle='rgba(13,19,51,.94)';cx.fillRect(8,34,144,76);R(8,34,144,1,ACC);R(8,109,144,1,ACC);
  txt('COMO PREFERE JOGAR?',80,40,ACC,'center');
  const rows=[['CAMERA',CAMS[save.opts.cam].n],['TELA',save.opts.full?'CHEIA':'GBA']];
  rows.forEach(([l,v],i)=>{const y=58+i*16,on=cur===i;txt(l,16,y,on?ACC:WHITE);txt((on?'< ':'')+v+(on?' >':''),146,y,on?ACC:MUT,'right')});
  const on=cur===2;txt((on?'> ':'  ')+'COMECAR',40,92,on?ACC:WHITE);
  cx.fillStyle='rgba(13,19,51,.9)';cx.fillRect(8,224,144,40);
  txt(cur===0?(save.opts.cam?'ATRAS DA QUADRA':'VISTA DE CIMA'):cur===1?(save.opts.full?'SEM A CARCACA':'PORTATIL ROXO'):'A CONFIRMA',80,230,BLU,'center');
  txt('MUDE DEPOIS EM OPCOES',80,246,MUT,'center');
}
