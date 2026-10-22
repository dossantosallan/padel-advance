/* ---------- salvamento ---------- */
const SAVE_KEY='padelAdvance.v1';
const save={attr:{vel:1,for:1,pre:1,top:1},xp:2,season:1,titles:0,wins:0,opts:{court:0,cam:0,btn:1,full:false,music:true,tips:true,shirt:0,hair:0,golden:true,marker:false,sound:true},me:{name:'',hs:0,hair:0,skin:0,shirt:0,side:0,lefty:0,style:0,acc:0,accC:0,shoe:0,rkt:0,c2:0,pat:0,team:''},car:null,school:[],tipsSeen:{},stats:null,tour:null};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s){Object.assign(save,s,{attr:{...save.attr,...s.attr},opts:{...save.opts,...s.opts},me:{...save.me,shirt:(s.opts&&s.opts.shirt)||0,hair:(s.opts&&s.opts.hair)||0,...s.me}})}}catch(_){}
CAM=CAMS[save.opts.cam]||CAMS[0];
if(save.attr)for(const k in save.attr)save.attr[k]=clamp(save.attr[k]|0,1,8);
const BTNS=[['P',.82],['M',1],['G',1.16],['GG',1.3]];
function applyBtn(){try{document.documentElement.style.setProperty('--cs',BTNS[save.opts.btn][1])}catch(_){}}
applyBtn();
function setCam(i){save.opts.cam=i;CAM=CAMS[i];buildCrowd();store()}
function store(){try{syncSlot()}catch(_){}try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(_){}}
