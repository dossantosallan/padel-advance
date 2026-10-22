/* ---------- replay ---------- */
function snap(){
  rec.push({b:[b.x,b.y,b.z],p:P.map(p=>[p.x,p.y,p.swing,p.stype,p.hand,p.charging,p.charge,p.moving,p.anim,p.ready,p.lunge,p.dive,p.diveDir,p.split]),f:flash?{...flash}:null});
  if(rec.length>260)rec.shift();
}
function applySnap(s){
  [b.x,b.y,b.z]=s.b;
  P.forEach((p,i)=>{[p.x,p.y,p.swing,p.stype,p.hand,p.charging,p.charge,p.moving,p.anim,p.ready,p.lunge,p.dive,p.diveDir,p.split]=s.p[i];p.lblT=0});
  flash=s.f?{...s.f}:null;
}
function startReplay(){
  const f=rec.slice(Math.max(0,rec.length-210),Math.max(1,rec.length-25));
  if(f.length<10){if(after){const g=after;after=null;g()}return}
  replay={f,i:0};st='replay';
}
