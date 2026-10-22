/* ---------- jogadores e bola ---------- */
const P=[{team:0,homeX:72},{team:0,homeX:28},{team:1,homeX:28},{team:1,homeX:72}];
P.forEach(p=>Object.assign(p,{x:p.homeX,y:p.team?40:160,tx:p.homeX,ty:p.team?40:160,swing:0,stype:'drive',cool:0,moving:false,anim:0,lbl:'',lblT:0,
  charging:false,charge:0,ctype:'a',hand:'fh',lunge:0,lastD:1e9,ready:false,stam:1,relPow:0,shirt:'#ef3e36',shorts:'#f4f4f4',hair:'#3b2416',band:null,skill:1.5,style:'equil',lefty:false,ctrl:null,vx:0,vy:0,dive:0,diveDir:1,split:0,react:0,readDelay:0,readErr:{x:0,y:0},tossing:false,diveTried:false}));
const b={x:50,y:100,z:0,vx:0,vy:0,vz:0,w:0,trail:[],corner:0,outAx:null,contra:false,lastTeam:0,bounces:0,serving:false,mustBounce:false,netTouched:false,cord:false,box:[0,50],spin:'none',kickV:0,out:null};

let mode='title',kind='demo',demo=true,twoP=false,st='serve',timer=0,ptimer=0,frame=0;
let paused=false,pauseCur=0,cur=0,nextAfterPlayer='title',resNext='title',resLines=[],resultW=0;
let pts=[0,0],games=[0,0],serveTeam=0,faults=0,server=P[0],after=null,msg='',sub='';
let opp=0,partnerMode=['AUTO','AUTO'],marker=null,flash=null,cheer=0,replay=null,replayPending=false;
const friendly={pair:2,lvl:1};
const parts=[],rec=[];
const isHuman=p=>!!p.ctrl&&!demo;
const isPartner=p=>!isHuman(p)&&P.some(q=>q.team===p.team&&isHuman(q));
const sk=p=>Math.min(p.skill,3.5);
const stamF=p=>.78+.22*p.stam;
const attrOf=()=>{
  if(twoP)return{vel:3,for:3,pre:3,top:3};
  const a=save.attr,me=save.me,o={};
  const bon={vel:0,for:0,pre:0,top:0};
  if(me.style===1){bon.for++;bon.top++}else if(me.style===2){bon.vel++;bon.pre++}else bon.pre+=.5;
  if(me.side===1)bon.top++;else bon.pre++;
  if(typeof car!=='undefined'&&car)for(const k in RKTS[car.rkEq].b)bon[k]+=RKTS[car.rkEq].b[k];
  for(const k in bon)o[k]=Math.min(5.5,1+(a[k]+bon[k]-1)*.6);
  return o;
};
const myName=()=>save.me.name||'VOCE';
let oppPair=null,bo3=false,sets=[0,0],cpage=0,nameTarget='me',rkOff=0;
const teamName=t=>twoP?(t?'J2':'J1'):(t?(oppPair||PAIRS[0]).n:(kind==='car'&&car?teamKeyName(-1):(save.me.team||myName())));
let nameBuf='',nameCur=0;const typeQ=[];
const golden=()=>save.opts.golden;
