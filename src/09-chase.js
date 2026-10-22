/* ---------- saída pela porta ----------
   Por 3 ou por 4 pela lateral: o defensor mais perto pode sair pela porta e devolver de fora. */
function tryChase(hitT,why){
  if(b.outAx!=='x')return false;
  const R=1-hitT,side=b.x<50?0:1,dy=R===0?140:60,dx=side?100:0;
  const defs=P.filter(p=>p.team===R&&p.dive<=0&&!p.hidden);if(!defs.length)return false;
  const d=defs.reduce((a,p)=>Math.hypot(p.x-dx,p.y-dy)<Math.hypot(a.x-dx,a.y-dy)?p:a);
  const s={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,w:b.w};let hang=0;
  while(s.z>0&&hang<300){flight(s);s.x+=s.vx;s.y+=s.vy;s.z+=s.vz;hang++}
  const sp=isHuman(d)?humanSpeed(d):aiSpeed(d);
  if(Math.hypot(d.x-dx,d.y-dy)/sp+20>hang)return false;
  chase={p:d,hitT,why,side,dx,dy,t:0,hang,aiTried:false,ready:false};
  d.charging=false;st='chase';d.lbl='CORRE!';d.lblT=30;
  return true;
}
function stepChase(){
  const c=chase,p=c.p;c.t++;
  physics(b,(e,v)=>{if(e==='floor'&&v>.3)sfx.bounce()});
  if(!demo)snap();
  const gx=c.dx+(c.side?8:-8),gy=c.dy,dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy);
  const sp=(isHuman(p)?humanSpeed(p):aiSpeed(p))*1.05;
  if(d>1){const m=Math.min(sp,d);p.x+=dx/d*m;p.y+=dy/d*m;p.moving=true;p.anim++}else p.moving=false;
  c.ready=d<5&&b.z<14&&b.z>0;
  if(c.ready){
    if(isHuman(p)){if(prs(p.ctrl,'a')||prs(p.ctrl,'b'))return chaseReturn()}
    else if(!c.aiTried){c.aiTried=true;if(Math.random()<.45+.12*(isPartner(p)?1.6:sk(p)))return chaseReturn()}
  }
  if((b.z<=0&&c.t>3)||c.t>c.hang+30){const h=c.hitT,w=c.why;chase=null;point(h,w)}
}
function chaseReturn(){
  const c=chase,p=c.p;chase=null;
  b.x=c.side?98.5:1.5;b.y=c.dy;b.z=Math.max(b.z,4);b.out=null;b.outAx=null;
  const toTop=p.team===0,tx=rnd(25,75),ty=toTop?rnd(18,45):L-rnd(18,45);
  launch(tx,ty,Math.hypot(tx-b.x,ty-b.y)/1.35,.1,isHuman(p)?6:8);
  b.lastTeam=p.team;b.bounces=0;b.mustBounce=false;b.netTouched=false;b.cord=false;b.spin='none';b.contra=false;
  p.x=c.side?96:4;p.vx=p.vy=0;p.swing=Math.round(SW*.7);p.stype='lob';p.lbl='DE FORA!';p.lblT=60;
  st='play';cheer=90;applause(20,.05);sfx.lob();hitstop=3;
  lastShot={team:p.team,type:'lob',deep:true,q:.5,chase:true};b.land=null;lastHitter=p;
  afterHit(p);
}
