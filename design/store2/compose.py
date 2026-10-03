from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1284,2778
BG=(14,15,18); GREEN=(57,255,106); PINK=(255,46,154); INK=(243,241,236)
FONT='/Users/lafy/bid-wars/bid-wars/assets/fonts/Archivo-Expanded-Black.ttf'
def font(sz): return ImageFont.truetype(FONT,sz)
HEL=ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc',58,index=1)

def bg(c1):
    im=Image.new('RGB',(W,H),BG)
    glow=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(glow)
    d.ellipse((-500,1500,700,2900),fill=tuple(int(x*0.30) for x in GREEN))
    d.ellipse((700,1700,1900,3000),fill=tuple(int(x*0.28) for x in PINK))
    glow=glow.filter(ImageFilter.GaussianBlur(220))
    return glow

def status_bar(img, sw, ox, oy):
    d=ImageDraw.Draw(img)
    d.text((ox+130,oy+52),'9:41',font=HEL,fill=INK)
    # signal
    x=ox+sw-330
    for i in range(4):
        h=14+i*8
        d.rounded_rectangle((x+i*17,oy+95-h,x+i*17+10,oy+95),3,fill=INK)
    # wifi (arcs)
    cx=ox+sw-235; cy=oy+95
    for r in (34,22,10):
        d.arc((cx-r,cy-r,cx+r,cy+r),225,315,fill=INK,width=7)
    d.ellipse((cx-5,cy-8,cx+5,cy+2),fill=INK)
    # battery
    bx=ox+sw-185
    d.rounded_rectangle((bx,oy+62,bx+78,oy+98),11,outline=(160,160,160),width=4)
    d.rounded_rectangle((bx+6,oy+68,bx+66,oy+92),6,fill=INK)
    d.rounded_rectangle((bx+82,oy+72,bx+88,oy+88),3,fill=(160,160,160))

def compose(raw, l1, l2, c1, c2, out):
    canvas=bg(c1)
    d=ImageDraw.Draw(canvas)
    # headline
    def fit(text,maxw,start):
        s=start
        while font(s).getlength(text)>maxw: s-=2
        return s
    s=min(fit(l1,1150,112),fit(l2,1150,112))
    y=120
    for t,c in ((l1,c1),(l2,c2)):
        w=font(s).getlength(t); d.text(((W-w)/2,y),t,font=font(s),fill=c); y+=int(s*1.12)
    # bar accent
    d.rounded_rectangle((W/2-128,y+18,W/2-8,y+30),6,fill=GREEN); d.rounded_rectangle((W/2+8,y+18,W/2+128,y+30),6,fill=PINK)
    # phone
    top=y+110
    pw=1040; ph=H-top+160   # bleeds off bottom
    ox=(W-pw)//2; oy=top
    scr_w=pw-28; scr_h=ph-28
    frame=Image.new('RGB',(pw,ph),(30,32,38))
    mask=Image.new('L',(pw,ph),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,pw-1,ph-1),130,fill=255)
    # screen
    r=Image.open(raw).convert('RGB')
    top_inset=int(scr_w*0.0)  # filled below
    scale=scr_w/ r.width
    inset=150
    rs=r.resize((scr_w,int(r.height*scale)),Image.LANCZOS)
    screen=Image.new('RGB',(scr_w,scr_h),r.getpixel((5,r.height-5)))
    # top fill with colour from top-left of raw
    ImageDraw.Draw(screen).rectangle((0,0,scr_w,inset+10),fill=r.getpixel((5,5)))
    screen.paste(rs,(0,inset))
    smask=Image.new('L',(scr_w,scr_h),0); ImageDraw.Draw(smask).rounded_rectangle((0,0,scr_w-1,scr_h-1),112,fill=255)
    frame.paste(screen,(14,14),smask)
    status_bar(frame,pw,0,14)
    fd=ImageDraw.Draw(frame)
    fd.rounded_rectangle((pw/2-170,38,pw/2+170,128),46,fill=(0,0,0))
    # subtle bezel highlight
    fd.rounded_rectangle((0,0,pw-1,ph-1),130,outline=(70,74,84),width=4)
    canvas.paste(frame,(ox,oy),mask)
    canvas.save(out,optimize=True)

S=[
 ('raw-01-home.png','TWO PLAYERS.','ONE PHONE.',GREEN,INK,'01-home.png'),
 ('raw-03c-landed.png','SPIN FOR','TONIGHT’S TOPIC',PINK,INK,'02-spin.png'),
 ('raw-04-item.png','EVERY ITEM','IS A SURPRISE',GREEN,INK,'03-surprise.png'),
 ('raw-05-bid.png','OUTBID THEM','OR BACK OUT',PINK,INK,'04-bidding.png'),
 ('raw-06-sold.png','SOLD TO THE','HIGHEST BIDDER',GREEN,INK,'05-sold.png'),
 ('raw-07-final.png','THEN SETTLE','WHO WON',PINK,INK,'06-final.png'),
 ('raw-decide.png','CAN’T DECIDE?','WE’LL HELP',GREEN,INK,'07-helper.png'),
 ('raw-02-topics.png','PLENTY FREE.','UNLOCK THE REST.',PINK,INK,'08-topics.png'),
]
import os
os.makedirs('final',exist_ok=True)
for raw,a,b,c1,c2,out in S:
    compose(raw,a,b,c1,c2,'final/'+out); print(out)
