/* ---------- passo do jogo ---------- */
function humanStep(h){
  const pd=h.ctrl,C=pd.cur;
  if(prs(pd,'sel'))togglePartner(h.team);
  if(h.dive>0){h.vx*=.8;h.vy*=.8;h.x+=h.vx;h.y+=h.vy;h.moving=false;constrain(h);return}
  const pa=prs(pd,'a'),pb=prs(pd,'b'),isServer=st==='serve'&&server===h;
  if(isServer&&toss)return;
  if((pa||pb)&&!isServer&&h.swing===0&&canHit(h)&&reachInfo(h,1)===2){diveHit(h,pb?'lob':'drive');return}
  if(!h.charging&&(pa||pb)&&(h.swing===0||isServer)){h.charging=true;h.charge=0;h.ctype=pa?'a':'b';h.lastD=1e9;h.hand=handFor(h)}
  if(h.charging){
    h.charge=Math.min(1,h.charge+1/(44-2*attrOf(h).for));
    if(isServer){if(!C[h.ctype])startToss(h,.25+.75*h.charge,h.ctype)}
    else{
      h.hand=handFor(h);
      const wantC=h.ctype==='b'&&C.down&&b.bounces>0&&toMyWall(h);
      if(canHit(h)&&reachInfo(h,1)===1){
        if(wantC){if(depthOf(h)>2)humanHit(h,.25+.75*h.charge,true)}
        else{
          const d=Math.hypot(b.x-h.x,b.y-h.y);
          if(depthOf(h)>=-1.5||(d>h.lastD&&d>10))humanHit(h,.25+.75*h.charge);
          else h.lastD=d;
        }
      }
      if(h.charging&&!C[h.ctype]){h.charging=false;h.swing=SW;h.stype=h.ctype==='b'?'lob':'drive';h.relPow=.25+.75*h.charge}
    }
  }
  if(!h.charging&&h.swing>SW*.3&&h.relPow&&canHit(h)&&reachInfo(h,1)===1){const pw=h.relPow;h.relPow=0;humanHit(h,pw)}
  if(h.swing===0)h.relPow=0;
  let mx=C.right-C.left,my=C.down-C.up;
  if(isServer){my=0;if(h.charging)mx=0}
  const n=Math.hypot(mx,my),sp=humanSpeed(h)*(h.charging?.62:h.swing>0?.55:1);
  accel(h,n?mx/n*sp:0,n?my/n*sp:0,n?.13:.2);
  h.x+=h.vx;h.y+=h.vy;h.moving=Math.hypot(h.vx,h.vy)>.12;
  if(isServer){const r=h.homeX>50;h.x=clamp(h.x,r?54:6,r?94:46)}
  constrain(h);
}
function stepGame(){
  if(st==='replay'){
    replay.i+=.5;const i=Math.floor(replay.i);
    if(i>=replay.f.length||prs(menu,'a')||prs(pad1,'a')){applySnap(replay.f[replay.f.length-1]);replay=null;st='point';ptimer=1;replayPending=false}
    else{applySnap(replay.f[i]);return}
  }
  if(shake>0)shake--;
  if(hitstop>0){hitstop--;return}
  timer++;
  if(st==='chase'){
    tipsCheck();stepChase();
    for(const p of P){if(p.lblT>0)p.lblT--;if(p.swing>0)p.swing--;if(p.dive>0)p.dive--}
    if(flash&&--flash.t<=0)flash=null;
    trail();return;
  }
  if(frame%5===0){
    planTeam(0);planTeam(1);
    marker=(markerOn()&&st==='play'&&b.bounces===0&&P.some(p=>p.team!==b.lastTeam&&isHuman(p)))?predictBounce():null;
  }
  for(const p of P)if(isHuman(p))humanStep(p);
  tipsCheck();if(exclaim&&--exclaim.t<=0)exclaim=null;
  if(bo3&&!demo&&frame%150===0)cheer=Math.max(cheer,40);
  for(const p of P){
    if(p.hidden)continue;
    if(!isHuman(p)){
      if(st==='serve'){p.moving=false;p.vx=p.vy=0;p.charging=p===server&&!toss&&timer>(demo?22:37);if(p.charging)p.charge=Math.min(1,p.charge+1/40)}
      else{
        moveAI(p);
        const want=canHit(p)&&reach(p,22)&&p.cool<=0&&p.dive<=0;
        if(want&&!p.charging){p.charging=true;p.charge=0}
        if(p.charging){p.charge=Math.min(1,p.charge+1/40);p.hand=handFor(p);if(!want)p.charging=false}
      }
    }
    p.ready=st==='play'&&b.lastTeam!==p.team&&!p.moving;
    if(p.swing>0)p.swing--;if(p.cool>0)p.cool--;if(p.lblT>0)p.lblT--;if(p.lunge>0)p.lunge--;
    if(p.dive>0)p.dive--;if(p.split>0)p.split--;if(p.react>0)p.react--;if(p.readDelay>0)p.readDelay--;
    if(p.moving){p.stam=Math.max(0,p.stam-.0009);p.anim++;if(p.anim%8===0&&parts.length<40)parts.push({x:p.x+rnd(-1,1),y:p.y,t:14})}
    else p.stam=Math.min(1,p.stam+.0004);
  }
  for(let i=parts.length-1;i>=0;i--)if(--parts[i].t<=0)parts.splice(i,1);
  if(flash&&--flash.t<=0)flash=null;
  if(st==='serve'){
    if(toss){
      toss.t++;b.vz-=G;b.z+=b.vz;
      if(b.z<=0){b.z=0;b.vz=-b.vz*.62;toss.bounced=true;sfx.bounce()}
      if((toss.bounced&&b.vz<=.05&&b.z>1)||toss.t>90){const t=toss;toss=null;doServe(server,t.pow,t.ctype)}
      return;
    }
    const ch=server.charging?server.charge:0;
    b.x=server.x+3;b.y=server.y+(server.team===0?-2:2);b.z=ch>0?9+ch*2:7+Math.abs(Math.sin(timer*.09))*2;b.vx=b.vy=b.vz=0;
    if(!isHuman(server)&&!toss&&timer>(demo?40:55))startToss(server);
    return;
  }
  physics(b,onEvent);
  trail();
  if(!demo&&(st==='play'||st==='point'||st==='chase'))snap();
  if(st==='play'){
    for(const p of P){
      if(p.hidden||isHuman(p)||p.cool>0||p.dive>0||!canHit(p))continue;
      const ri=reachInfo(p,.78);
      /* contrapared da IA: bola passou e vai para o vidro do fundo */
      if(ri===1&&depthOf(p)>1&&toMyWall(p)&&Math.min(b.y,L-b.y)<20&&b.z<14&&Math.random()<.04){doHit(p,'contra',50,false,.6,rnd(.5,.9),0);if(st!=='play')break;continue}
      if(ri===1){
        const miss=isPartner(p)?.03:Math.max(.01,.10-.027*sk(p));
        if(Math.random()<miss){p.cool=45;p.charging=false;p.swing=SW;p.stype='drive'}else aiHit(p);
      }else if(ri===2&&!p.diveTried&&depthOf(p)>=-1.5){
        p.diveTried=true;if(Math.random()<.3+.08*(isPartner(p)?1.6:sk(p)))diveHit(p,Math.random()<.5?'lob':'drive');
      }
      if(st!=='play')break;
    }
  }else if(st==='point'){
    if(--ptimer<=0){
      if(replayPending){replayPending=false;startReplay()}
      else if(after){const f=after;after=null;f()}
    }
  }
}
function trail(){if(!b.trail)b.trail=[];b.trail.unshift({x:b.x,y:b.y,z:b.z});if(b.trail.length>6)b.trail.pop()}
const markerOn=()=>save.opts.marker||(kind==='friendly'&&friendly.lvl===0);
