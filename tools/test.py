#!/usr/bin/env python3
"""Bateria de testes do Padel Advance. Rode antes de publicar:

    python3 tools/test.py

1. Gera o build (index.html e dist/padel.html).
2. Lógica sem navegador (Node): temporadas de carreira inteiras, aposentadoria,
   lições da escola e duração dos ralis.
3. Navegador (Chromium, iPhone simulado): direcional nas 4 direções em todos os tamanhos
   de botão, em retrato, paisagem e tela cheia; botões A/B; todas as telas sem erro.
Precisa de node e do pacote python playwright. Sai com código 1 se algo falhar."""
import os,sys,json,subprocess,tempfile,shutil,threading,http.server,socketserver,functools
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
results=[]
def check(name,ok,info=''):
    results.append((name,ok,info));print(('PASS ' if ok else 'FAIL ')+name+(' — '+info if info else ''),flush=True)

# ---------- 1. build ----------
r=subprocess.run([sys.executable,os.path.join(ROOT,'tools','build.py')],capture_output=True,text=True)
check('build',r.returncode==0,r.stdout.strip() or r.stderr.strip())
html=open(os.path.join(ROOT,'index.html')).read()
game=html[html.index('<script>',html.index('iOS Safari')+10)+8:];game=game[:game.index('</script>')]
HOOK="mode='boot';applyScreen();"
assert HOOK in game

# ---------- 2. Node ----------
STUB=r"""
const ctxStub=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='measureText'?(()=>({width:80})):()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
const el=()=>({getContext:()=>ctxStub,width:160,height:288,style:{setProperty(){}},addEventListener(){},classList:{add(){},remove(){},toggle(){}},getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),clientWidth:100,clientHeight:100,closest:()=>null,appendChild(){},toDataURL:()=>'',toBlob(){}});
global.document={getElementById:el,createElement:el,addEventListener(){},querySelector:el,documentElement:el(),body:el(),fonts:{load:()=>Promise.resolve()}};
global.addEventListener=()=>{};global.setInterval=()=>0;global.matchMedia=()=>({matches:false});
const store={};global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}};
global.requestAnimationFrame=()=>{};global.performance={now:()=>0};
"""
NODE_TESTS=r"""
const out={};
try{
  // carreira: 3 temporadas com escolhas variadas
  save.me.name='TESTE';
  beginCreate(0);save.me.name='TESTE';save.attr={vel:45,for:45,pre:45,top:45};startPts=0;finishCreate();
  if(car.needOffer){car.needOffer=false;offerContract();signContract(1)}
  let weeks=0,played=0,errors=[];
  for(let s=0;s<3;s++){
    for(let w=0;w<20;w++){
      const o=weekOpts();car.pick=o.length>1&&Math.random()<.4?1:0;if(!eligible())car.pick=0;
      const W=weekInfo();
      if(car.inj===0&&eligible()&&car.money>=W.cost&&car.cond>45){enterTour();played++;let g=0;while(car.tour&&car.tour.alive&&g++<10)simCareerMatch();nextWeek('played')}
      else if(car.inj>0)nextWeek('inj');
      else if(w%3===0&&car.money>=400){car.money-=400;gain(car.focus,1.3);nextWeek('train')}
      else nextWeek('rest');
      weeks++;
      if(car.needOffer){car.needOffer=false;offerContract();signContract(0)}
      if(!(car.partner>=0)||car.free.includes(car.partner)||car.teams.some(t=>t.includes(car.partner)))errors.push('parceiro invalido semana '+weeks);
      if(!isFinite(car.money))errors.push('dinheiro invalido');
      for(const k in save.attr)if(save.attr[k]<40||save.attr[k]>99)errors.push('atributo fora da escala '+k);
      if(mode==='cseason')break;
    }
    newSeason();
  }
  out.career={weeks,played,rank:myRank(),age:car.age,attr:save.attr,money:car.money,news:car.news.length,errors};
  // aposentadoria forçada
  car.age=FORCE_RETIRE;car.week=CAL.length;mode='cseason';retire();out.retire={mode,retired:car.retired,hof:(save.hof||[]).length};
  leaveSlot();
  // lições: a bola de cada lição chega do jeito certo
  const L={};
  for(const [li,need] of [[0,'r1'],[3,'high'],[6,'behind'],[7,'r2only'],[8,'chase']]){
    let st_={r1:0,r2:0,high:0,behind:0,chase:0};
    for(let rep=0;rep<10;rep++){startTrain(li);for(let i=0;i<500;i++){stepGame();
      if(st==='play'&&canHit(P[0])){const r=reachInfo(P[0],1);if(r===1){st_.r1++;if(b.z>16)st_.high++;if(depthOf(P[0])>2&&toMyWall(P[0])&&b.bounces>0)st_.behind++}if(r===2)st_.r2++}
      if(st==='chase')st_.chase++}}
    L[li]={need,ok:need==='r2only'?st_.r2>0&&st_.r1===0:st_[need]>0,st_};
  }
  out.lessons=L;
  // ralis da demonstração
  enterDemo();let hits=0,points=0;const oh=doHit,op=point;
  for(let i=0;i<30000;i++){const lt=b.lastTeam,bn=st;stepGame();if(st==='point'&&bn==='play')points++}
  out.demo={points};
}catch(e){out.fatal=String(e&&e.stack||e)}
console.log('@@'+JSON.stringify(out));
process.exit(0);
"""
with tempfile.TemporaryDirectory() as td:
    g=game.replace(HOOK,'enterDemo();');i=g.rindex('})();')
    js=STUB+g[:i]+NODE_TESTS+g[i:]
    f=os.path.join(td,'t.js');open(f,'w').write(js)
    r=subprocess.run(['node',f],capture_output=True,text=True,timeout=300)
    line=[l for l in r.stdout.splitlines() if l.startswith('@@')]
    if not line:check('node: executou',False,(r.stderr or r.stdout)[-400:])
    else:
        o=json.loads(line[0][2:])
        if 'fatal' in o:check('node: sem erro fatal',False,o['fatal'][:300])
        else:
            c=o['career'];check('carreira: 3 temporadas',not c['errors'] and c['weeks']>=55,f"{c['weeks']} semanas, {c['played']} torneios, rank #{c['rank']}, idade {c['age']}, attr {c['attr']}"+('; '+'; '.join(c['errors'][:3]) if c['errors'] else ''))
            check('carreira: aposentadoria',o['retire']['retired'] and o['retire']['mode']=='cretire',str(o['retire']))
            for li,v in o['lessons'].items():check(f'escola: lição {int(li)+1}',v['ok'],json.dumps(v['st_']))
            check('demonstração: pontos acontecem',o['demo']['points']>20,f"{o['demo']['points']} pontos em 30000 quadros")

# ---------- 3. navegador ----------
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    check('navegador',False,'playwright não instalado');sys.exit(1)
EXPOSE="enterDemo();applyScreen();window.__T={get mode(){return mode},setMode:m=>{mode=m;cur=0},P,b,pad1,save,set st(v){st=v},get st(){return st},startMatch,beginCreate,finishCreate,get car(){return car},enterTour,offerContract,startTrain,applyBtn,shareCard,get sharing(){return sharing},set paused(v){paused=v},applyScreen};"
td=tempfile.mkdtemp()
try:
    for n in ['manifest.webmanifest','sw.js']:shutil.copy(os.path.join(ROOT,n),td)
    shutil.copytree(os.path.join(ROOT,'icons'),os.path.join(td,'icons'))
    open(os.path.join(td,'index.html'),'w').write(html.replace(HOOK,EXPOSE))
    handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=td)
    handler.log_message=lambda *a:None
    httpd=socketserver.TCPServer(('127.0.0.1',0),handler);port=httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever,daemon=True).start()
    with sync_playwright() as p:
        br=p.chromium.launch()
        pg=br.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:200].replace(chr(10),' ')))
        pg.goto(f'http://127.0.0.1:{port}/');pg.wait_for_timeout(700)
        pg.evaluate("__T.save.me.name='TESTE';__T.startMatch('friendly',2,1.5)")
        def dpad_ok(label):
            r=pg.evaluate("(()=>{const r=document.getElementById('dpad').getBoundingClientRect();return[r.left,r.top,r.width,r.height]})()")
            x,y,w,h=r;bad=[]
            if w<20 or h<20:return check(label,False,'direcional invisível');
            for name,(fx,fy),(ex,ey) in [('baixo',(.5,.85),(0,1)),('cima',(.5,.15),(0,-1)),('esq',(.15,.5),(-1,0)),('dir',(.85,.5),(1,0))]:
                pg.evaluate("__T.st='play';__T.b.lastTeam=0;Object.assign(__T.P[0],{x:50,y:150,vx:0,vy:0})")
                pg.mouse.move(x+w*fx,y+h*fy);pg.mouse.down();pg.wait_for_timeout(250)
                dx,dy=pg.evaluate("[__T.P[0].x-50,__T.P[0].y-150]");pg.mouse.up();pg.wait_for_timeout(60)
                if (ex and dx*ex<4) or (ey and dy*ey<4) or (ex==0 and abs(dx)>3) or (ey==0 and abs(dy)>3):bad.append(f'{name}: dx={dx:.0f} dy={dy:.0f}')
            check(label,not bad,'; '.join(bad))
        for full in [False,True]:
            pg.evaluate(f"__T.save.opts.full={'true' if full else 'false'};__T.applyScreen()")
            for vp in [(390,844),(844,390)]:
                pg.set_viewport_size({'width':vp[0],'height':vp[1]});pg.wait_for_timeout(250)
                for bsz in range(4):
                    pg.evaluate(f"__T.save.opts.btn={bsz};__T.applyBtn()");pg.wait_for_timeout(80)
                    dpad_ok(f"direcional {'cheia' if full else 'gba'} {'retrato' if vp[0]<vp[1] else 'paisagem'} tamanho {['P','M','G','GG'][bsz]}")
        pg.set_viewport_size({'width':390,'height':844});pg.evaluate("__T.save.opts.full=false;__T.applyScreen();__T.save.opts.btn=1;__T.applyBtn()");pg.wait_for_timeout(200)
        for bid,key in [('bA','a'),('bB','b')]:
            r=pg.evaluate(f"(()=>{{const r=document.getElementById('{bid}').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}})()")
            pg.mouse.move(*r);pg.mouse.down();pg.wait_for_timeout(120);v=pg.evaluate(f"__T.pad1.cur.{key}");pg.mouse.up();pg.wait_for_timeout(60)
            check(f'botão {key.upper()} responde',v==1)
        # todas as telas
        pg.evaluate("__T.beginCreate(1);__T.save.me.name='TESTE';__T.finishCreate();__T.car.needOffer=false")
        modes=['title','school','friendly','twop','create','name','options','cmenu','cslots','cattr','career','crank','cpartner','cteam','cevo','cmore','cnews','ctroph','cstats','cseason']
        bad=[]
        for m in modes:
            n0=len(errs);pg.evaluate(f"__T.setMode('{m}')");pg.wait_for_timeout(120)
            if len(errs)>n0:bad.append(m+': '+errs[-1][:80])
        steps=[('contrato',"__T.offerContract()"),('pre-jogo',"__T.enterTour();__T.setMode('ctour')"),('fim de torneio',"__T.setMode('cdone')"),
               ('aposentadoria',"__T.car.retired=true;__T.setMode('cretire')"),('escola',"__T.startTrain(0)"),('pausa',"__T.paused=true")]
        for nm,code in steps:
            n0=len(errs)
            try:pg.evaluate(code)
            except Exception as e:errs.append(str(e))
            pg.wait_for_timeout(300 if nm=='escola' else 120)
            if len(errs)>n0:bad.append(nm+': '+errs[-1][:100])
        pg.evaluate("__T.paused=false")
        for k in ['title','season','retire']:
            n0=len(errs)
            try:pg.evaluate(f"__T.shareCard('{k}')")
            except Exception as e:errs.append(str(e))
            pg.wait_for_timeout(100)
            if len(errs)>n0:bad.append('cartao '+k+': '+errs[-1][:100])
        ov=pg.evaluate("!!document.querySelector('#shareOv img')")
        check('todas as telas sem erro',not bad and not errs,'; '.join(bad)+('; '+errs[0][:120] if errs else ''))
        check('cartão para compartilhar',ov)
        br.close()
    httpd.shutdown()
finally:
    shutil.rmtree(td,ignore_errors=True)

fails=[r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)}/{len(results)} testes passaram")
sys.exit(1 if fails else 0)
