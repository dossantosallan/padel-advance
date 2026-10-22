/* ---------- IA ---------- */
const aiSpeed=p=>(isPartner(p)?1.05:(.82+.11*sk(p))*1.05)*stamF(p);
const humanSpeed=p=>(twoP?1.25:1.12+.045*attrOf(p).vel)*stamF(p);
function predictFor(team){
  const s={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,w:b.w,sv:b.sv,bounces:b.bounces,mustBounce:b.mustBounce,spin:b.spin,kickV:b.kickV,out:b.out,corner:b.corner||0};
  const out=[];
  for(let t=1;t<180;t++){
    let stop=false;
    physics(s,e=>{
      if(e==='floor'){if(s.bounces===0&&sideOf(s.y)!==team)stop=true;else{s.bounces++;if(s.bounces>=2)stop=true}}
      else if((e==='wall'&&s.bounces===0&&sideOf(s.y)===team)||e==='out')stop=true;
    });
    if(stop)break;
    if(sideOf(s.y)===team&&s.z<=19&&!(s.mustBounce&&s.bounces===0))out.push({x:s.x,y:s.y,t});
  }
  return out;
}
function predictBounce(){
  const s={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,w:b.w,sv:b.sv,spin:b.spin,kickV:b.kickV,out:b.out,corner:b.corner||0};
  for(let t=0;t<220;t++){let hit=null;physics(s,e=>{if(e==='floor'&&!hit)hit={x:s.x,y:s.y};if(e==='out'&&!hit)hit={out:1}});if(hit)return hit.out?null:hit}
  return null;
}
/* Posição da dupla: sobe junta depois de lob ou voleio, fica no meio após drive do fundo, recua junta quando é encoberta */
function homeYFor(p,weHit){
  const S=STY[p.style]||STY.equil;let back=S.back,net=S.net;
  if(isPartner(p)){const m=partnerMode[p.team];if(m==='REDE'){back=72;net=74}else if(m==='FUNDO'){back=32;net=36}}
  let v;
  if(weHit){
    const t=lastShot.type;
    if(t==='lob')v=net+4;
    else if(['bandeja','vibora','smash','volley','drop'].includes(t))v=net;
    else v=lastShot.deep?(back+net)/2:net;
  }else{
    v=back;
    if(lastShot.team!==p.team&&lastShot.type==='lob')v=back-4;
  }
  return p.team===0?L-v:v;
}
function planTeam(team){
  const mates=P.filter(p=>p.team===team&&!isHuman(p)&&!p.hidden);
  const weHit=st==='play'&&b.lastTeam===team;
  mates.forEach(p=>{p.tx=p.homeX;p.ty=homeYFor(p,weHit)});
  if(st!=='play'||b.lastTeam===team||!mates.length)return;
  const cand=predictFor(team);if(!cand.length)return;
  const hu=P.find(q=>q.team===team&&isHuman(q));
  const skip=q=>hu&&(hu.homeX>50?q.x>54:q.x<46);
  let best=null;
  for(const p of mates){
    if(p.dive>0)continue;
    const sp=aiSpeed(p)*.92;
    for(const q of cand){
      if(skip(q))continue;
      if(Math.hypot(q.x-p.x,q.y-p.y)<=sp*q.t+6){if(!best||q.t<best.q.t)best={p,q};break}
    }
  }
  if(!best){
    const q=cand[cand.length-1];
    if(!skip(q)){let d=1e9;for(const p of mates){if(p.dive>0)continue;const dd=Math.hypot(q.x-p.x,q.y-p.y);if(dd<d){d=dd;best={p,q}}}}
  }
  if(best){
    const p=best.p;if(p.readDelay>0)return;   /* ainda lendo a bola */
    const k=clamp(best.q.t/45,0,1),e=p.readErr||{x:0,y:0};
    p.tx=best.q.x+e.x*k;p.ty=best.q.y+(team===0?3:-3)+e.y*k;
  }
}
function constrain(p){p.x=clamp(p.x,3,97);p.y=p.team===0?clamp(p.y,NET+6,197):clamp(p.y,3,NET-6)}
/* Inércia: acelera e freia; o split step dá impulso de reação */
function accel(p,tx,ty,a){if(p.react>0)a*=1.8;const dx=tx-p.vx,dy=ty-p.vy,d=Math.hypot(dx,dy);if(d>a){p.vx+=dx/d*a;p.vy+=dy/d*a}else{p.vx=tx;p.vy=ty}}
function moveAI(p){
  if(p.dive>0){p.vx*=.8;p.vy*=.8;p.x+=p.vx;p.y+=p.vy;p.moving=false;constrain(p);return}
  const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),sp=Math.min(aiSpeed(p),d*.3);
  accel(p,d>.6?dx/d*sp:0,d>.6?dy/d*sp:0,.12);
  p.x+=p.vx;p.y+=p.vy;p.moving=Math.hypot(p.vx,p.vy)>.12;constrain(p);
}
function togglePartner(t){
  const M=['AUTO','REDE','FUNDO'];partnerMode[t]=M[(M.indexOf(partnerMode[t])+1)%3];
  const pt=P.find(p=>p.team===t&&!isHuman(p));if(pt){pt.lbl=partnerMode[t];pt.lblT=50}
  sfx.ui();planTeam(t);
}
