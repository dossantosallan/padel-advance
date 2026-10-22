#!/usr/bin/env python3
"""Junta src/*.js num único script e gera:
   index.html            (GitHub Pages / app instalável)
   dist/padel.html       (versão de página única, sem instalação nem offline)
Uso: python3 tools/build.py"""
import glob,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
game=''.join(open(f).read() for f in sorted(glob.glob(os.path.join(root,'src','*.js'))))
def build(tpl,out):
    t=open(os.path.join(root,'shell',tpl)).read()
    assert '/*@GAME@*/' in t
    os.makedirs(os.path.dirname(os.path.join(root,out)) or root,exist_ok=True)
    open(os.path.join(root,out),'w').write(t.replace('/*@GAME@*/',game.rstrip('\n')))
build('index.template.html','index.html')
build('artifact.template.html','dist/padel.html')
print('ok:',len(game.splitlines()),'linhas de jogo')
