/* ---------- cartão para compartilhar ----------
   Desenha um cartão pixelado (160x200, ampliado 3x) e mostra numa camada sobre o jogo:
   toque longo na imagem salva; o botão usa o compartilhamento do sistema quando disponível. */
let sharing=false;
function shareCard(kind){
  const c=document.createElement('canvas');c.width=160;c.height=200;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const keep=cx;cx=g;
  try{
    R(0,0,160,200,NAVY);for(let y=0;y<200;y+=4)for(let x=2;x<160;x+=6)R(x+((y>>2)%2)*3,y,1,1,'#141b44');
    R(4,4,152,192,'#1b2350');R(4,4,152,1,ACC);R(4,195,152,1,ACC);
    cx.font=F16;cx.textAlign='center';cx.textBaseline='top';cx.fillStyle='#ef3e36';cx.fillText('PADEL',82,12);cx.fillStyle=WHITE;cx.fillText('PADEL',80,10);
    txt('ADVANCE',80,30,ACC,'center');
    const tr=car&&car.trophies||[];
    if(kind==='title'&&car&&car.tour){
      const t=car.tour;drawTrophyC(80,46,2,CATS[t.code].col);
      txt('CAMPEOES!',80,86,ACC,'center',F16);txt(t.city,80,108,WHITE,'center');catBadge(t.code,80,122);
      txt(teamKeyName(-1).slice(0,18),80,140,WHITE,'center');txt('TEMPORADA '+car.season,80,156,MUT,'center');txt('RANKING #'+myRank(),80,170,MUT,'center');
    }else if(kind==='retire'&&car){
      drawTrophyC(80,46,2,tr.length?ACC:'#55507a');txt('FIM DE CARREIRA',80,86,ACC,'center');txt(myName(),80,100,WHITE,'center');
      [['TEMPORADAS',car.season],['TITULOS',tr.length],['MELHOR RANK',(car.best<999?'#'+car.best:'-')],['MAJORS',tr.filter(t=>t.c==='MA').length]].forEach(([l,v],i)=>{txt(l,14,118+i*14,MUT);txt(String(v),146,118+i*14,WHITE,'right')});
    }else if(car){
      txt('TEMPORADA '+car.season,80,50,ACC,'center');txt(myName(),80,66,WHITE,'center',F16);
      const S=save.stats||{m:0,w:0,shots:{}};
      [['RANKING','#'+myRank()],['PONTOS',car.myPts],['TITULOS',car.seasonTitles],['NA CARREIRA',tr.length],['GOLPE',favShot(S.shots||{})]].forEach(([l,v],i)=>{txt(l,14,94+i*15,MUT);txt(String(v),146,94+i*15,WHITE,'right')});
      tr.slice(-6).forEach((t,i)=>drawTrophyC(28+i*21,170,1,CATS[t.c].col));
    }
  }finally{cx=keep}
  const big=document.createElement('canvas');big.width=480;big.height=600;
  const bg=big.getContext('2d');bg.imageSmoothingEnabled=false;bg.drawImage(c,0,0,480,600);
  showShare(big);
}
function showShare(big){
  let ov=document.getElementById('shareOv');
  if(!ov){ov=document.createElement('div');ov.id='shareOv';document.body.appendChild(ov)}
  ov.innerHTML='<div class="sh-box"><img alt="Cartão do Padel Advance" src="'+big.toDataURL('image/png')+'"><p id="shMsg">Toque e segure a imagem para salvar</p><div class="sh-row"><button id="shShare">Compartilhar</button><button id="shClose">Fechar</button></div></div>';
  ov.hidden=false;sharing=true;
  const close=()=>{ov.hidden=true;sharing=false};
  document.getElementById('shClose').onclick=close;
  document.getElementById('shShare').onclick=()=>{
    big.toBlob(b=>{
      try{const f=new File([b],'padel-advance.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Padel Advance'}).catch(()=>{});return}}catch(_){}
      document.getElementById('shMsg').textContent='Compartilhar não está disponível aqui. Toque e segure a imagem para salvar.';
    },'image/png');
  };
}
