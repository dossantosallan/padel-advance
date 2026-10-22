/* ---------- física ----------
   Bola com efeito (w: + topspin, − slice), resistência do ar e efeito Magnus.
   1 unidade ≈ 10 cm. */
const CT=()=>COURTS[save.opts.court];
const DRAG=.0016,MAG=.34;
function flight(o){
  const hs=Math.hypot(o.vx,o.vy),d=1-DRAG*hs;
  o.vx*=d;o.vy*=d;
  o.vz-=G*(1+MAG*(o.w||0)*Math.min(1,hs/2.2));
  if(o.sv)o.vx+=o.sv*.003;   /* efeito lateral (saque cortado) */
}
function physics(o,ev){
  flight(o);
  const py=o.y;
  o.x+=o.vx;o.y+=o.vy;o.z+=o.vz;
  if(!o.out&&(py-NET)*(o.y-NET)<=0&&py!==o.y){
    if(o.z<NETH){o.y=py<NET?NET-.6:NET+.6;o.vy*=-.15;o.vx*=.3;ev('net')}
    else if(o.z<NETH+1.3){
      if(Math.random()<.55){o.vy*=.35;o.vx*=.5;o.vz=Math.abs(o.vz)*.3+.45;ev('cord',1)}
      else{o.y=py<NET?NET-.6:NET+.6;o.vy*=-.12;o.vx*=.3;o.vz=.4;ev('cord',0)}
    }
  }
  if(o.z<=0){o.z=0;if(o.vz<0){const v=-o.vz,c=CT(),w=o.w||0;
    if(o.spin==='kick'){o.vz=o.kickV;o.vx*=.92;o.vy*=.92;o.spin='none'}
    else{o.vz=v>.3?v*clamp(c.bounce+.2*w,.3,.85):0;const f=clamp(c.fric+.07*w,.7,.98);o.vx*=f;o.vy*=f}
    if(o.sv){o.vx+=o.sv*.1;o.sv=0}
    o.w=w*.5;ev('floor',v)}}
  if(o.out)return;
  let hit=false;
  if(o.x<0||o.x>W){const zn=wallZone(o,'x');
    if(zn==='out'||zn==='door'){o.out=zn;o.outAx='x';ev('out',zn)}else{o.x=o.x<0?0:W;bounceWall(o,'vx',zn);hit=true;ev('wall',zn)}}
  if(!o.out&&(o.y<0||o.y>L)){const zn=wallZone(o,'y');
    if(zn==='out'){o.out=zn;o.outAx='y';ev('out',zn)}else{o.y=o.y<0?0:L;bounceWall(o,'vy',zn);hit=true;ev('wall',zn)}}
  /* canto: vidro do fundo e lateral quase juntos = rebote imprevisível */
  if(hit&&!o.corner&&Math.hypot(o.vx,o.vy)>.5&&Math.min(o.x,W-o.x)<5&&Math.min(o.y,L-o.y)<5){o.corner=10;o.vx*=rnd(.55,1.3);o.vy*=rnd(.55,1.3);o.vz+=rnd(-.3,.4);ev('corner')}
  if(o.corner>0)o.corner--;
}
/* Paredes: fundo = vidro 3 m + alambrado até 4 m; laterais = vidro nos 4 m do fundo, alambrado de 3 m no meio, com portas */
function wallZone(o,axis){
  if(axis==='y')return o.z<=30?'glass':o.z<=40?'fence':'out';
  const yd=Math.min(o.y,L-o.y);
  if(yd>=50&&yd<=70)return'door';
  if(yd<40)return o.z<=30?'glass':o.z<=40?'fence':'out';
  return o.z<=30?'fence':'out';
}
function bounceWall(o,k,zn){
  const w=o.w||0;
  if(zn==='glass'){
    o[k]=-o[k]*clamp(.74+.16*w,.45,.9);
    if(w>0)o.vz+=.35*w;                                  /* topspin: a bola salta do vidro */
    else if(w<0)o.vz=o.vz>0?o.vz*(1+.6*w):o.vz*(1-.3*w); /* slice: morre rente ao vidro */
    const q=k==='vx'?'vy':'vx';o[q]*=1-.12*Math.abs(w);
  }else{o[k]=-o[k]*rnd(.12,.42);o.vz*=rnd(.2,.8);const q=k==='vx'?'vy':'vx';o[q]*=rnd(.5,1.1);o[q]+=rnd(-.25,.25)}
  o.w=w*.6;
}
/* Mira: acha a velocidade que leva a bola ao alvo em ~T quadros, já com efeito e ar.
   O erro do golpe entra depois, na direção, na velocidade e na elevação: a bola vai para onde a física levar. */
function simLand(x,y,z,vx,vy,vz,w){
  const o={x,y,z,vx,vy,vz,w};let netZ=99;
  for(let t=1;t<400;t++){
    flight(o);const py=o.y;o.x+=o.vx;o.y+=o.vy;o.z+=o.vz;
    if((py-NET)*(o.y-NET)<=0&&py!==o.y)netZ=o.z;
    if(o.z<=0)return{x:o.x,y:o.y,t,netZ};
  }
  return{x:o.x,y:o.y,t:400,netZ};
}
function solveShot(tx,ty,T,w,minNet=2.5){
  for(let k=0;k<20;k++){
    let vx=(tx-b.x)/T,vy=(ty-b.y)/T,vz=(.5*G*T*T-b.z)/T,r;
    for(let i=0;i<6;i++){r=simLand(b.x,b.y,b.z,vx,vy,vz,w);vx+=(tx-r.x)/T*.9;vy+=(ty-r.y)/T*.9;vz+=(T-r.t)*G*.5}
    r=simLand(b.x,b.y,b.z,vx,vy,vz,w);
    if((b.y-NET)*(ty-NET)<0&&r.netZ<NETH+minNet){T+=2;continue}
    return{vx,vy,vz};
  }
  return{vx:(tx-b.x)/T,vy:(ty-b.y)/T,vz:(.5*G*T*T-b.z)/T};
}
function launch(tx,ty,T,w=0,e=0,minNet){
  const v=solveShot(tx,ty,T,w,minNet);b.sv=0;b.offWall=false;
  if(e>0){const a=rnd(-1,1)*e*.009,c=Math.cos(a),s=Math.sin(a),f=1+rnd(-1,1)*e*.0075;
    const vx=v.vx*c-v.vy*s,vy=v.vx*s+v.vy*c;v.vx=vx*f;v.vy=vy*f;v.vz+=rnd(-1,1)*e*.006}
  b.vx=v.vx;b.vy=v.vy;b.vz=v.vz;b.w=w;
}
