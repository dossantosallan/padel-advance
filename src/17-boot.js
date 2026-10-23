/* ---------- carregamento e abertura ---------- */
const TIPS=['BANDEJA E MAIS|SEGURA QUE REMATE','SEGURE A PARA|CARREGAR A FORCA','DEIXE A BOLA|VOLTAR DO VIDRO','LOB NO FUNDO TIRA|A DUPLA DA REDE','REMATE NA LATERAL|PODE SAIR POR 4','CANSOU? ENCURTE|OS PONTOS','VIBORA: SEGURE|CIMA E APERTE A','O SAQUE E CRUZADO|E POR BAIXO','BAIXO + B PERTO DO|VIDRO: CONTRAPARED','BOLA LONGE? APERTE|A: PEIXINHO','POR 3 NA LATERAL?|CORRA PELA PORTA'];
let bootT=0,bootP=0,bootStep=0,bootReady=false,fontOk=false,introT=0,tapAny=false;const tip=TIPS[(Math.random()*TIPS.length)|0];
try{(document.fonts?document.fonts.load('16px "Press Start 2P"'):Promise.resolve()).then(()=>{fontOk=true},()=>{fontOk=true})}catch(_){fontOk=true}
setTimeout(()=>{fontOk=true},2500);
cv.addEventListener('pointerdown',()=>{tapAny=true;unlock()});
const bootSteps=[()=>getBg(),()=>getCourt(),()=>{const c=save.opts.cam;CAM=CAMS[1-c];getCourt();CAM=CAMS[c]},()=>buildCrowd()];
const anyKey=()=>prs(menu,'a')||prs(menu,'b')||prs(menu,'start')||tapAny;
function stepBoot(){
  bootT++;
  if(bootStep<bootSteps.length&&bootT>8){bootSteps[bootStep]();bootStep++}
  const target=Math.min((bootStep/bootSteps.length)*.85+(fontOk?.15:0),bootT/75);
  bootP+=(target-bootP)*.12;if(target>=1&&bootP>.995)bootP=1;
  if(bootP>=1&&!bootReady){bootReady=true;tapAny=false}
  if(bootReady&&anyKey()){tapAny=false;unlock();mode='intro';introT=0}
}
const easeB=p=>{const n=7.5625,d=2.75;if(p<1/d)return n*p*p;if(p<2/d)return n*(p-=1.5/d)*p+.75;if(p<2.5/d)return n*(p-=2.25/d)*p+.9375;return n*(p-=2.625/d)*p+.984375};
const LOGO='PADEL',L_T0=62,L_GAP=10,ADV_T=L_T0+5*L_GAP+14,PRESS_T=ADV_T+44;
function stepIntro(){
  const t=++introT;
  if(t===24||t===40)sfx.bounce();
  if(t===52){beep(1400,.12,'square',.06,.3);applause(6,.02)}
  for(let i=0;i<5;i++)if(t===L_T0+i*L_GAP+12)beep([523,587,659,698,784][i],.07,'square',.07);
  if(t===ADV_T+10)[784,988,1175,1568].forEach((f,i)=>beep(f,.16,'square',.06,0,i*.07));
  if(t===PRESS_T+2)applause(26,.04);
  if(tapAny||prs(menu,'a')||prs(menu,'start')||prs(menu,'b')){tapAny=false;if(t<PRESS_T)introT=PRESS_T;else finishIntro()}
  if(t>PRESS_T+420)finishIntro();
}
function finishIntro(){sfx.ui();buildCrowd();enterDemo();if(firstRun&&!save.setupDone){mode='setup';cur=0;return}if(!save.me.name){mode='create';cur=0}}
function drawBoot(){
  R(0,0,CW,CH,NAVY);
  for(let y=0;y<CH;y+=4)for(let x=2;x<CW;x+=6)R(x+((y>>2)%2)*3,y,1,1,'#141b44');
  const by=150-Math.round(Math.abs(Math.sin(bootT*.09))*26);
  R(78,by,5,5,'#dfff3a');R(78,by,2,2,'#fff');R(77,156,7,1,'rgba(0,0,0,.6)');
  R(36,158,88,1,'#2b3470');
  if(fontOk)txt(bootReady?'PRONTO!':'CARREGANDO',80,176,bootReady?ACC:MUT,'center');
  R(29,192,102,8,'#05071a');R(30,193,Math.round(100*bootP),6,bootReady?GRN:ACC);
  for(let x=30;x<30+100*bootP;x+=4)R(x,193,1,1,'rgba(255,255,255,.35)');
  if(fontOk){txt('DICA',80,220,MUT,'center');tip.split('|').forEach((l,i)=>txt(l,80,234+i*12,WHITE,'center'))}
  if(bootReady&&Math.floor(bootT/24)%2)txt(matchMedia('(pointer:coarse)').matches?'TOQUE NA TELA':'APERTE START',80,112,ACC,'center');
}
function drawIntro(){
  const t=introT;
  R(0,0,CW,CH,'#05060f');
  if(t>=52){
    const p=clamp((t-52)/26,0,1),h=Math.round(CH*p);
    cx.save();cx.beginPath();cx.rect(0,(CH-h)/2,CW,h);cx.clip();cx.drawImage(getBg(),0,0,CW,CH);drawCrowd();cx.drawImage(getCourt(),0,0,CW,CH);cx.restore();
    cx.fillStyle=`rgba(5,6,15,${.55*p})`;cx.fillRect(0,0,CW,CH);
  }
  if(t<52){
    let y;if(t<24)y=-6+(150+6)*(t/24)**2;else if(t<40){const u=(t-24)/16;y=150-44*Math.sin(u*Math.PI)}else{const u=(t-40)/12;y=150-12*Math.sin(u*Math.PI)}
    R(77,Math.round(y)-2,5,5,'#dfff3a');R(77,Math.round(y)-2,2,2,'#fff');
    const sh=clamp(1-(150-y)/80,.2,1);R(80-Math.round(4*sh),153,Math.round(8*sh),1,'rgba(220,230,255,.35)');
  }else if(t<62){const r=(t-52)*14;cx.fillStyle=`rgba(255,255,255,${1-(t-52)/10})`;cx.beginPath();cx.arc(80,150,r,0,7);cx.fill()}
  cx.font=F16;const lw=cx.measureText(LOGO).width/5,lx0=80-lw*2;
  for(let i=0;i<5;i++){
    const t0=L_T0+i*L_GAP;if(t<t0)continue;
    const p=clamp((t-t0)/16,0,1),y=Math.round(84-130*(1-easeB(p))),x=Math.round(lx0+i*lw);
    cx.font=F16;cx.textAlign='center';cx.textBaseline='top';
    cx.fillStyle='#05071a';cx.fillText(LOGO[i],x+2,y+3);cx.fillStyle='#ef3e36';cx.fillText(LOGO[i],x+2,y+2);cx.fillStyle=WHITE;cx.fillText(LOGO[i],x,y);
  }
  if(t>=ADV_T){
    const p=clamp((t-ADV_T)/14,0,1),x=Math.round(80+(1-p)*(1-p)*140);
    txt('ADVANCE',x,108,ACC,'center');
    const sx=Math.round(-20+((t-ADV_T-14)%90)*3.2);
    if(p>=1&&sx<190){cx.save();cx.beginPath();cx.rect(50,106,60,12);cx.clip();cx.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<3;k++)cx.fillRect(sx+k*3-12,106,1,12);cx.restore()}
  }
  if(t>=ADV_T+16){for(let i=0;i<8;i++){const a=i*.785+t*.03,r=54+Math.sin(t*.07+i)*3;if((t+i*7)%24<14)R(80+Math.cos(a)*r,96+Math.sin(a)*r*.55,1,1,i%2?ACC:WHITE)}}
  if(t>=PRESS_T){
    if(Math.floor(t/24)%2)txt('PRESS START',80,206,ACC,'center');
    txt('TEMPORADA '+save.season,80,250,MUT,'center');
  }
}
