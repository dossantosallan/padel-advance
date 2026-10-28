import os
HERE=os.path.dirname(os.path.abspath(__file__))
OUTD=os.path.join(HERE,'out')
os.makedirs(OUTD,exist_ok=True)
import json, numpy as np
pal=json.load(open(os.path.join(OUTD,'palette.json')))
meta=json.load(open(os.path.join(OUTD,'player_sheet.json')))
R=np.load(os.path.join(OUTD,'roles.npy'),allow_pickle=True).item()
AX,AY=meta['anchor']['x'],meta['anchor']['y']
CH='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-/:;<=>?@[]^_{|}~'
inks=[];inkid={}
# lado da raquete na arte (+1 = direita da tela)
SIDE={'back_ready':1,'back_run':1,'back_serve':1,'back_forehand':1,'back_backhand':-1,'back_smash':1,'back_jumpsmash':-1,'back_dive':1,
      'front_ready':1,'front_run':1,'front_serve':-1,'front_forehand':1,'front_backhand':1,'front_jumpsmash':-1,'front_dive':1}
frames={}
for name,(I,role) in R.items():
    op=I>=0; ys,xs=np.nonzero(op); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    rows=[]
    for y in range(y0,y1):
        for x in range(x0,x1):
            if I[y,x]<0: rows.append('.')
            else:
                k=(role[y,x],int(I[y,x]))
                if k not in inkid: inkid[k]=len(inks); inks.append([k[0]]+pal[k[1]])
                rows.append(CH[inkid[k]])
    s=''.join(rows); enc=[];i=0
    while i<len(s):
        j=i
        while j<len(s) and s[j]==s[i]: j+=1
        n=j-i; enc.append((str(n) if n>1 else '')+s[i]); i=j
    shoe=role=='shoe'; fy=np.nonzero(shoe)[0].max() if shoe.any() else y1-1
    frames[name]=dict(w=int(x1-x0),h=int(y1-y0),ax=int(AX-x0),ay=int(AY-y0),gap=int(max(0,AY-1-fy)),side=SIDE[name],d=''.join(enc))
assert len(inks)<=len(CH)
from collections import Counter
cnt=Counter()
for name,(I,role) in R.items():
    for r,i in zip(role[I>=0].tolist(),I[I>=0].tolist()): cnt[(r,i)]+=1
REF={}
for (r,i),n in cnt.most_common():
    if r not in REF and sum(pal[i])>75: REF[r]=pal[i]
REF={k:v for k,v in REF.items() if k in ('shirt','shoe','shorts','skin','hair','racket')}
js='/* Sprites do jogador (arte em pixel gerada e convertida por tools). Cada pixel = tinta [papel,r,g,b]; papéis recoloríveis: shirt, shorts, skin, hair, shoe, racket. */\n'
js+='const SPR_CH='+json.dumps(CH)+';\n'
js+='const SPR_INK='+json.dumps(inks,separators=(',',':'))+';\n'
js+='const SPR_REF='+json.dumps(REF,separators=(',',':'))+';\n'
js+='const SPR_FR='+json.dumps(frames,separators=(',',':'))+';\n'
open(os.path.join(OUTD,'sprite-data.js'),'w').write(js)
src=os.path.join(HERE,'..','..','src','15g-sprites.js')
old=open(src).read()
open(src,'w').write(js+old[old.index('/* ---------- desenho com os sprites'):])
print('src/15g-sprites.js atualizado')
print(len(inks),'inks', len(js),'bytes')
for n,f in frames.items(): print(n,f['w'],f['h'],f['ax'],f['ay'],'gap',f['gap'])
