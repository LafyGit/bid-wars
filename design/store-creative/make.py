from PIL import Image, ImageDraw, ImageFont, ImageFilter
F='/Users/lafy/bid-wars/bid-wars/assets/fonts/'
BG=(14,15,18); GREEN=(57,255,106); PINK=(255,46,154); INK=(243,241,236); INK3=(150,150,156)
def font(n,s): return ImageFont.truetype(F+n,s)
def glow(W,H):
    g=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(g)
    d.ellipse((-W*0.25,H*0.35,W*0.45,H*1.6),fill=(10,70,32))
    d.ellipse((W*0.55,H*0.3,W*1.3,H*1.6),fill=(75,10,48))
    return g.filter(ImageFilter.GaussianBlur(int(W/14)))
def card(w,h,color,sym,angle):
    s=4; im=Image.new('RGBA',(w*s//4,h*s//4),(0,0,0,0))
    im=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((0,0,w-1,h-1),int(w*0.13),fill=color)
    f=font('Archivo-Expanded-Black.ttf',int(h*0.42))
    bb=d.textbbox((0,0),sym,font=f); d.text(((w-(bb[2]-bb[0]))/2-bb[0],(h-(bb[3]-bb[1]))/2-bb[1]),sym,font=f,fill=BG)
    return im.rotate(angle,resample=Image.BICUBIC,expand=True)
def paste_shadow(base,im,xy):
    sh=Image.new('RGBA',im.size,(0,0,0,0)); a=im.split()[3]
    sh.putalpha(a.point(lambda v:int(v*0.5))); sh=sh.filter(ImageFilter.GaussianBlur(40))
    base.paste((0,0,0),(xy[0]+20,xy[1]+40),sh); base.paste(im,xy,im)
def text_c(d,cx,y,t,f,fill):
    w=d.textlength(t,font=f); d.text((cx-w/2,y),t,font=f,fill=fill)

# ---------- HEADER 3840x1646 ----------
W,H=3840,1646
im=glow(W,H).convert('RGB'); d=ImageDraw.Draw(im)
c1=card(560,760,GREEN,'?',10); c2=card(560,760,PINK,'$',-10)
paste_shadow(im,c1,(170,400)); paste_shadow(im,c2,(W-170-c2.size[0],360))
fw=font('Archivo-Expanded-Black.ttf',300)
text_c(d,W/2,470,'BID WARS',fw,INK)
fs=font('Archivo-SemiExpanded-Black.ttf',92)
text_c(d,W/2,830,'OUTBID YOUR FRIEND. OR BACK OUT.',fs,GREEN)
fm=font('IBMPlexMono-SemiBold.ttf',60)
text_c(d,W/2,1000,'TWO PLAYERS  ·  ONE PHONE  ·  TEN HIDDEN ITEMS',fm,INK3)
im.save('header-3840x1646.png',optimize=True)

# ---------- SEARCH RESULT 3840x2560 ----------
W,H=3840,2560
im=glow(W,H).convert('RGB'); d=ImageDraw.Draw(im)
fw=font('Archivo-Expanded-Black.ttf',210)
text_c(d,W/2,140,'BID WARS',fw,INK)
fs=font('Archivo-SemiExpanded-Black.ttf',84)
text_c(d,W/2,400,'THE TWO-PLAYER AUCTION PARTY GAME',fs,PINK)
shots=['01-home','03-surprise','04-bidding','05-sold']
S='/Users/lafy/bid-wars/bid-wars/design/store2/'
raws=['raw-01-home.png','food-04-item.png','food-05-bid.png','food-06-sold.png']
pw=760; ph=int(pw*2778/1284); gap=110; total=4*pw+3*gap; x0=(W-total)//2; y0=640
for i,r in enumerate(raws):
    s=Image.open(S+r).convert('RGB').resize((pw-28,ph-28),Image.LANCZOS)
    frame=Image.new('RGB',(pw,ph),(30,32,38)); m=Image.new('L',(pw-28,ph-28),0)
    ImageDraw.Draw(m).rounded_rectangle((0,0,pw-29,ph-29),80,fill=255)
    frame.paste(s,(14,14),m)
    fm_=Image.new('L',(pw,ph),0); ImageDraw.Draw(fm_).rounded_rectangle((0,0,pw-1,ph-1),92,fill=255)
    y=y0+(60 if i%2 else 0)
    sh=Image.new('L',(pw,ph),0); ImageDraw.Draw(sh).rounded_rectangle((0,0,pw-1,ph-1),92,fill=150); sh=sh.filter(ImageFilter.GaussianBlur(40))
    im.paste((0,0,0),(x0+i*(pw+gap)+15,y+35),sh)
    im.paste(frame,(x0+i*(pw+gap),y),fm_)
im.save('search-3840x2560.png',optimize=True)
print('ok')
