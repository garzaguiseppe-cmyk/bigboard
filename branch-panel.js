/* Guiseppe Drafts — canvas navigation + on-demand data branches (v2). */
(function(){
  if(window.__cvNav) return; window.__cvNav=true;
  var D=document, B=D.body, NS='http://www.w3.org/2000/svg';
  var HAND='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M6 11.5V7a1.5 1.5 0 0 1 3 0v3.5M9 10V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V6a1.5 1.5 0 0 1 3 0v4m0-1.4a1.5 1.5 0 0 1 3 0V14a5 5 0 0 1-5 5h-1a4 4 0 0 1-3.3-1.7L5 14.6a1.4 1.4 0 0 1 2.2-1.7L9 14.5"/></svg>';

  var CSS=[
   'html,body{height:100%;margin:0;overflow:hidden}',
   '#cv-vp{position:fixed;inset:0;overflow:hidden;background:#fff;cursor:grab;-webkit-user-select:none;user-select:none}',
   '#cv-vp.grab{cursor:grabbing}',
   '#cv-cv{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}',
   '#cv-vp img{-webkit-user-drag:none;user-drag:none}',
   '#cv-vp a,#cv-vp button,#cv-vp [data-cv]{cursor:pointer}',
   '#cv-cv .wrap{width:1060px;max-width:none;margin:0 0 0 26px}',
   '.cv-branch{position:absolute;font-family:Arial,Helvetica,sans-serif}',
   '.cv-plane{position:absolute;left:0;top:0;width:3000px;height:2000px}',
   '.cv-svg{position:absolute;left:0;top:0;width:3000px;height:2000px;overflow:visible;pointer-events:none}',
   '.cv-titlebox{position:absolute;border:2px solid #0a0a0a;border-radius:14px;background:#fff;padding:12px 16px;box-shadow:0 3px 14px rgba(0,0,0,.08);cursor:pointer}',
   '.cv-titlebox .k{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:17px;letter-spacing:.02em;display:block}',
   '.cv-titlebox .s{font-size:12px;color:#666;margin-top:3px;display:block}',
   '.cv-dot{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #0a0a0a;transform:translate(-10px,-10px);z-index:5;box-shadow:0 1px 3px rgba(0,0,0,.15)}',
   '.cv-dot.subj{border-color:#d0021b;background:#d0021b;width:26px;height:26px;transform:translate(-13px,-13px)}',
   '.cv-lab{position:absolute;font-family:ui-monospace,Consolas,monospace;font-size:13px;font-weight:700;white-space:nowrap;transform:translate(-50%,0);z-index:5;pointer-events:none;text-shadow:0 1px 2px #fff,0 0 2px #fff}',
   '.cv-lab .sub{display:block;font-family:Arial,sans-serif;font-weight:400;font-size:11px;color:#666;text-align:center}',
   '.cv-lab.subj{color:#d0021b}',
   '.cv-card{position:absolute;background:#fff;border:2px solid #0a0a0a;border-radius:14px;padding:15px 17px;z-index:6;box-shadow:0 4px 18px rgba(0,0,0,.08)}',
   '.cv-card.hero{border-color:#d0021b;border-width:2.5px}',
   '.cv-card .nm{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:19px}',
   '.cv-card.hero .nm{font-size:23px}',
   '.cv-card .meta{font-size:11px;color:#666;margin-top:1px}',
   '.cv-slot{margin-top:10px;height:84px;border:1.5px dashed #c9c9c9;border-radius:8px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;color:#a6a6a6;font-size:11px;text-align:center;padding:8px}',
   '.cv-card.hero .cv-slot{height:104px}','.cv-photo{margin-top:10px;border-radius:8px;overflow:hidden}','.cv-photo img{width:100%;height:auto;display:block}',
   '.cv-sl{margin-top:10px;display:flex;gap:13px;flex-wrap:wrap}',
   '.cv-st{min-width:42px}.cv-st .v{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:18px;line-height:1}',
   '.cv-st .l{font-size:9px;color:#9a9a9a;letter-spacing:.06em;text-transform:uppercase;margin-top:3px}',
   '.cv-st.hi .v{color:#d0021b}',
   '.cv-p40{margin-top:9px;font-size:12px;line-height:1.45;background:#fff5f5;border-left:3px solid #d0021b;padding:7px 10px;border-radius:0 6px 6px 0}',
   '.cv-p40 b{color:#d0021b;font-family:ui-monospace,Consolas,monospace}',
   '.cv-out{margin-top:9px;font-size:12.5px;line-height:1.45;color:#333;border-top:1px solid #e6e6e6;padding-top:8px}',
   '.cv-out .tag{display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:10px;font-weight:700;letter-spacing:.05em;background:#0a0a0a;color:#fff;padding:2px 7px;border-radius:4px;margin-bottom:6px}',
   '.cv-card.hero .cv-out .tag{background:#d0021b}',
   '.cv-note{margin-top:8px;font-size:12px;font-style:italic;color:#444;line-height:1.4}',
   '.cv-cl{position:absolute;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.35;color:#d0021b;max-width:190px;z-index:4;pointer-events:none;text-shadow:0 1px 2px #fff}',
   '.cv-cl b{font-family:ui-monospace,Consolas,monospace;text-transform:uppercase;font-size:10px;letter-spacing:.05em;display:block;color:#7a0010}',
   '.cv-tag{position:absolute;font-family:Arial,sans-serif;z-index:3;pointer-events:none}',
   '.cv-axt{font-family:ui-monospace,Consolas,monospace;font-size:15px;font-weight:700;letter-spacing:.06em;color:#333}',
   '.cv-axn{font-size:12px;color:#9a9a9a;max-width:230px;line-height:1.4}',
   '.cv-tools{position:fixed;top:14px;right:14px;z-index:60;display:none;align-items:center;gap:6px;background:rgba(255,255,255,.96);border:1.5px solid #0a0a0a;border-radius:10px;padding:7px 9px;box-shadow:0 4px 16px rgba(0,0,0,.14)}',
   '.cv-tools.on{display:flex}',
   '.cv-tools .tl{font-family:ui-monospace,Consolas,monospace;font-size:11px;font-weight:700;margin:0 4px;max-width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
   '.cv-b{font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;border:1.5px solid #0a0a0a;background:#fff;color:#0a0a0a;padding:6px 9px;border-radius:6px;cursor:pointer}',
   '.cv-b:hover{background:#0a0a0a;color:#fff}',
   '.cv-b.red{border-color:#d0021b;color:#d0021b}.cv-b.red:hover{background:#d0021b;color:#fff}',
   '.cv-b.on{background:#d0021b;border-color:#d0021b;color:#fff}',
   '.cv-x{width:36px;height:32px;border:2px solid #0a0a0a;background:#fff;border-radius:8px;font-size:21px;line-height:1;cursor:pointer;color:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:Arial}',
   '.cv-x:hover{background:#d0021b;border-color:#d0021b;color:#fff}',
   '.cv-navtop{position:absolute;width:300px;border:2px solid #0a0a0a;border-radius:9px;overflow:hidden;background:#fff;font-family:Arial,sans-serif;z-index:6}',
   '.cv-navtop .h{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:6px 10px;border-bottom:1.5px solid #0a0a0a}',
   '.cv-navtop .bd{padding:8px 10px;font-size:11.5px;line-height:1.75;color:#333}',
   '.cv-navtop .bd b{font-family:ui-monospace,Consolas,monospace}',
   '.cv-hint{position:fixed;right:16px;bottom:16px;z-index:55;display:none;font-family:Arial,sans-serif;font-size:11.5px;color:#444;background:rgba(255,255,255,.96);border:1.5px solid #0a0a0a;border-radius:9px;padding:8px 11px;max-width:260px;line-height:1.6}',
   '.cv-hint.on{display:block}',
   '.cv-hint b{font-family:ui-monospace,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em;font-size:10px;display:block;margin-bottom:3px}'
  ].join('');
  var st=D.createElement('style'); st.textContent=CSS; D.head.appendChild(st);

  var vp=D.createElement('div'); vp.id='cv-vp';
  var cv=D.createElement('div'); cv.id='cv-cv';
  while(B.firstChild) cv.appendChild(B.firstChild);
  vp.appendChild(cv); B.appendChild(vp);
  cv.querySelectorAll('img').forEach(function(i){i.draggable=false;});
  var conn=D.createElementNS(NS,'svg'); conn.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:1'; conn.setAttribute('width','10'); conn.setAttribute('height','10'); cv.appendChild(conn);

  var tools=D.createElement('div'); tools.className='cv-tools';
  tools.innerHTML='<span class="tl" id="cvTL"></span><button class="cv-b" data-cv="field">&#8690; Field</button><button class="cv-b red" data-cv="subject" id="cvSubj">&#9670;</button><button class="cv-b" data-cv="prev">&lsaquo;</button><button class="cv-b" data-cv="next">&rsaquo;</button><button class="cv-b" data-cv="toggle" id="cvTog" hidden>Per 40</button><button class="cv-x" data-cv="close" title="Back to board">&times;</button>';
  vp.appendChild(tools);
  var hint=D.createElement('div'); hint.className='cv-hint'; hint.innerHTML='<b>Navigation</b>'+HAND+' drag to pan &middot; scroll &darr; the page &middot; &#8984;/Ctrl + scroll to zoom'; vp.appendChild(hint);

  var X=0,Y=0,K=1,KMIN=0.14,KMAX=3.2,raf=null,active=null,navTopBottom=200,tX=0,tY=0,sRaf=null,uMoved=false;
  function apply(){ cv.style.transform='translate('+X+'px,'+Y+'px) scale('+K+')'; hint.classList.toggle('on', !active && (Y+K*navTopBottom)<8); }
  function cl(v,a,b){return Math.max(a,Math.min(b,v));}
  function clampPan(){ var vw=vp.clientWidth,vh=vp.clientHeight,m=300,w=cv.scrollWidth,h=cv.scrollHeight; X=cl(X,vw-w*K-m,m); Y=cl(Y,vh-h*K-m,0); }
  function clampT(){ var vw=vp.clientWidth,vh=vp.clientHeight,m=300,w=cv.scrollWidth,h=cv.scrollHeight; tX=cl(tX,vw-w*K-m,m); tY=cl(tY,vh-h*K-m,0); }
  function sLoop(){ var dx=tX-X,dy=tY-Y; if(Math.abs(dx)<0.4&&Math.abs(dy)<0.4){X=tX;Y=tY;apply();sRaf=null;return;} X+=dx*0.15;Y+=dy*0.15;apply();sRaf=requestAnimationFrame(sLoop); }
  function animateTo(nx,ny,nk){ if(raf)cancelAnimationFrame(raf); if(sRaf){cancelAnimationFrame(sRaf);sRaf=null;} var sx=X,sy=Y,sk=K,t0=performance.now();
    (function step(now){ var t=Math.min(1,(now-t0)/640),e=1-Math.pow(1-t,3); X=sx+(nx-sx)*e;Y=sy+(ny-sy)*e;K=sk+(nk-sk)*e;apply(); if(t<1){raf=requestAnimationFrame(step);}else{tX=X;tY=Y;} })(performance.now()); }
  function focusRect(r){ if(!r)return; var vw=vp.clientWidth,vh=vp.clientHeight,pad=r.pad||70; var k=cl(Math.min(vw/(r.w+2*pad),vh/(r.h+2*pad)),KMIN,KMAX); var cx=r.x+r.w/2,cy=r.y+r.h/2; animateTo(vw/2-k*cx,vh/2-k*cy,k); }
  function rectOf(el){ var r=el.getBoundingClientRect(), v=vp.getBoundingClientRect(); return {x:(r.left-v.left-X)/K,y:(r.top-v.top-Y)/K,w:r.width/K,h:r.height/K}; }

  vp.addEventListener('wheel', function(e){ e.preventDefault(); uMoved=true;
    if(e.ctrlKey||e.metaKey){ if(sRaf){cancelAnimationFrame(sRaf);sRaf=null;} var rc=vp.getBoundingClientRect(),mx=e.clientX-rc.left,my=e.clientY-rc.top,wx=(mx-X)/K,wy=(my-Y)/K,nk=cl(K*(e.deltaY<0?1.12:0.893),KMIN,KMAX); X=mx-wx*nk;Y=my-wy*nk;K=nk;clampPan();apply();tX=X;tY=Y; }
    else { if(sRaf===null){tX=X;tY=Y;} tY-=e.deltaY*0.55; tX-=(e.deltaX||0)*0.55; clampT(); if(sRaf===null)sLoop(); }
  }, {passive:false});
  var down=false,lx=0,ly=0,moved=false,drag=false;
  var autoOn=false,aAx=0,aAy=0,aMx=0,aMy=0,aRaf=null;
  function aLoop(){ if(!autoOn)return; var dy=aMy-aAy,dx=aMx-aAx,dead=14; if(Math.abs(dy)>dead)Y-=(dy-(dy>0?dead:-dead))*0.16; if(Math.abs(dx)>dead)X-=(dx-(dx>0?dead:-dead))*0.16; clampPan();apply();tX=X;tY=Y; aRaf=requestAnimationFrame(aLoop); }
  function startAuto(x,y){ autoOn=true;aAx=x;aAy=y;aMx=x;aMy=y;vp.style.cursor='ns-resize'; if(aRaf)cancelAnimationFrame(aRaf); aLoop(); }
  function stopAuto(){ autoOn=false;vp.style.cursor=''; if(aRaf)cancelAnimationFrame(aRaf); }
  vp.addEventListener('pointerdown', function(e){ if(e.button===1){ e.preventDefault(); if(autoOn){stopAuto();}else{startAuto(e.clientX,e.clientY);} return; } if(autoOn){stopAuto();} if(e.button!==0)return; if(e.target.closest('a,button,[data-cv]'))return; e.preventDefault(); if(sRaf){cancelAnimationFrame(sRaf);sRaf=null;} down=true;moved=false;drag=false;lx=e.clientX;ly=e.clientY; try{vp.setPointerCapture(e.pointerId);}catch(_){ } });
  window.addEventListener('pointermove', function(e){ if(autoOn){aMx=e.clientX;aMy=e.clientY;} });
  window.addEventListener('keydown', function(e){ if(autoOn&&e.key==='Escape')stopAuto(); });
  vp.addEventListener('auxclick', function(e){ if(e.button===1)e.preventDefault(); });
  vp.addEventListener('pointermove', function(e){ if(!down)return; var dx=e.clientX-lx,dy=e.clientY-ly; if(!drag&&Math.abs(dx)+Math.abs(dy)>4){drag=true;moved=true;uMoved=true;vp.classList.add('grab');} if(drag){X+=dx;Y+=dy;lx=e.clientX;ly=e.clientY;clampPan();apply();tX=X;tY=Y;} });
  vp.addEventListener('pointerup', function(){ down=false;vp.classList.remove('grab'); });
  vp.addEventListener('pointercancel', function(){ down=false;drag=false;vp.classList.remove('grab'); });
  vp.addEventListener('click', function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
  vp.addEventListener('dragstart', function(e){ e.preventDefault(); });
  window.addEventListener('resize', function(){ clampPan(); apply(); });

  var BR=1, PH=2000;
  function rnd(v){return Math.round(v*10)/10;}
  function axVal(p,stat,mode){var v=p[stat];if(mode==='p40'&&p.mpg)v=v*40/p.mpg;return v;}
  function axPos(a,v,mode){var lo,hi;if(mode==='p40'&&a.per40){lo=a.per40.min;hi=a.per40.max;}else{lo=a.min;hi=a.max;}return a.p0+(v-lo)/(hi-lo)*(a.p1-a.p0);}
  function axTk(a,mode){return (mode==='p40'&&a.per40&&a.per40.ticks)?a.per40.ticks:(a.ticks||[]);}
  function axLb(a,mode){return (mode==='p40'&&a.per40&&a.per40.label)?a.per40.label:a.label;}
  function rareFor(ax,mode){var Xa=ax.x,Ya=ax.y;if(mode==='p40'&&Xa.per40&&Xa.per40.rare!=null)return {x:Xa.per40.rare,y:Ya.per40.rare};if(Xa.rare!=null)return {x:Xa.rare,y:Ya.rare};return null;}
  function axisChrome(DATA,mode){var ax=DATA.axis,Xa=ax.x,Ya=ax.y,g='';
    g+='<line x1="850" y1="380" x2="850" y2="1500" stroke="#111" stroke-width="2"/><line x1="850" y1="1500" x2="2280" y2="1500" stroke="#111" stroke-width="2"/>';
    axTk(Xa,mode).forEach(function(t){var px=axPos(Xa,t,mode);g+='<line x1="'+px+'" y1="380" x2="'+px+'" y2="1500" stroke="#e6e6e6"/><text x="'+px+'" y="1525" fill="#9a9a9a" font-family="Arial" font-size="15" text-anchor="middle">'+t+'</text>';});
    axTk(Ya,mode).forEach(function(t){var py=axPos(Ya,t,mode);g+='<line x1="850" y1="'+py+'" x2="2280" y2="'+py+'" stroke="#e6e6e6"/><text x="835" y="'+(py+5)+'" fill="#9a9a9a" font-family="Arial" font-size="15" text-anchor="end">'+t+'</text>';});
    var r=rareFor(ax,mode);if(r){var rx=axPos(Xa,r.x,mode),ry=axPos(Ya,r.y,mode);g+='<rect x="'+rx+'" y="500" width="'+(2280-rx)+'" height="'+(ry-500)+'" fill="#d0021b" fill-opacity=".04" stroke="#d0021b" stroke-opacity=".22" stroke-dasharray="6 5"/>';}
    return g;}
  function clampAnc(p,c){var x=Math.max(c.x,Math.min(c.x+c.w,p.x)),y=Math.max(c.y,Math.min(c.y+(c.h||300),p.y));return [x,y];}
  function arrowSVG(x0,y0,x1,y1){var ang=Math.atan2(y1-y0,x1-x0),h=24,b1x=x1-h*Math.cos(ang-0.42),b1y=y1-h*Math.sin(ang-0.42),b2x=x1-h*Math.cos(ang+0.42),b2y=y1-h*Math.sin(ang+0.42);
    return '<path d="M'+x0+' '+y0+' L'+x1+' '+y1+'" stroke="#d0021b" stroke-width="2.4" fill="none"/><path d="M'+x1+' '+y1+' L'+b1x+' '+b1y+' M'+x1+' '+y1+' L'+b2x+' '+b2y+'" stroke="#d0021b" stroke-width="2.4" fill="none"/>';}
  function leadersSVG(DATA,subj,comps,mode){var g='';
    comps.forEach(function(c){g+='<path d="M'+subj.x+' '+subj.y+' L'+c.x+' '+c.y+'" stroke="#d0021b" stroke-width="1.6" stroke-opacity=".7" fill="none"/>';});
    var sa=clampAnc(subj,subj.card);g+='<path d="M'+subj.x+' '+(subj.y+13)+' L'+sa[0]+' '+sa[1]+'" stroke="#111" stroke-width="1" stroke-opacity=".33" fill="none"/>';
    comps.forEach(function(c){var a=clampAnc(c,c.card);g+='<path d="M'+c.x+' '+c.y+' L'+a[0]+' '+a[1]+'" stroke="#111" stroke-width="1" stroke-opacity=".33" fill="none"/>';});
    if(mode==='p40'&&DATA.arrow){var a0=subj.x+DATA.arrow.dx,b0=subj.y+DATA.arrow.dy;g+=arrowSVG(a0,b0,subj.x-17,subj.y-17);g+='<text x="'+a0+'" y="'+(b0-8)+'" fill="#d0021b" font-family="Arial" font-size="27" font-weight="700" text-anchor="middle">'+DATA.arrow.text+'</text>';}
    return g;}
  function sagPath(x0,y0,x1,y1){ var d=Math.hypot(x1-x0,y1-y0),sag=Math.min(300,d*0.30+30),mx=(x0+x1)/2,my=Math.max(y0,y1)+sag; return 'M'+x0+' '+y0+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+x1.toFixed(1)+' '+y1.toFixed(1); }
  function isCount(l){return /^(PPG|RPG|APG|SPG|BPG|AST|STL|BLK|STOCKS|REB|PTS|TOV)$/i.test((l||'').trim());}
  function statHTML(p,mode){return p.stats.map(function(t){var v=t[0];if(mode==='p40'&&p.mpg&&isCount(t[1])&&/^[0-9.]+$/.test(String(v).trim())){v=(parseFloat(v)*40/p.mpg).toFixed(1);}return '<div class="cv-st'+(t[2]?' hi':'')+'"><div class="v">'+v+'</div><div class="l">'+t[1]+'</div></div>';}).join('');}
  function photoHTML(p,hero){ return p.photo?('<div class="cv-photo'+(hero?' hero':'')+'"><img src="'+p.photo+'" alt="'+p.name+'" draggable="false"></div>'):('<div class="cv-slot">[ photo slot ]</div>'); }
  function cardHTML(p,hero,mode){var body=hero?((p.per40?'<div class="cv-p40">'+p.per40+'</div>':'')+(p.note?'<div class="cv-note">'+p.note+'</div>':'')+photoHTML(p,true)):('<div class="cv-out"><span class="tag">Became</span><br>'+p.became+'</div>'+photoHTML(p,false));
    return '<div class="cv-card'+(hero?' hero':'')+'" style="left:'+p.card.x+'px;top:'+p.card.y+'px;width:'+p.card.w+'px" data-focus="'+p.key+'"><div class="nm">'+p.name+'</div><div class="meta">'+p.meta+'</div><div class="cv-sl">'+statHTML(p,mode)+'</div>'+body+'</div>';}
  function subVals(DATA,p,mode){var ax=DATA.axis;return rnd(axVal(p,ax.x.stat,mode))+' '+ax.x.short+' &middot; '+rnd(axVal(p,ax.y.stat,mode))+' '+ax.y.short;}
  function dotHTML(DATA,p,subj,mode){var last=p.name.split(' ').pop().toUpperCase();
    return '<div class="cv-dot'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+p.y+'px" data-focus="'+p.key+'"></div><div class="cv-lab'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+(p.y+25)+'px">'+last+'<span class="sub">'+subVals(DATA,p,mode)+'</span></div>';}
  function renderPlane(planeEl,DATA,mode){var ax=DATA.axis,subj=DATA.subject,comps=DATA.comps;
    subj.x=axPos(ax.x,axVal(subj,ax.x.stat,mode),mode);subj.y=axPos(ax.y,axVal(subj,ax.y.stat,mode),mode);
    comps.forEach(function(c){c.x=axPos(ax.x,axVal(c,ax.x.stat,mode),mode);c.y=axPos(ax.y,axVal(c,ax.y.stat,mode),mode);});
    var svg='<svg class="cv-svg" viewBox="0 0 3000 2000">'+axisChrome(DATA,mode)+leadersSVG(DATA,subj,comps,mode)+'</svg>';
    var h='';
    h+='<div class="cv-tag cv-axt" style="left:1300px;top:1545px;transform:translateX(-50%)">'+axLb(ax.x,mode)+' &rarr;</div>';
    h+='<div class="cv-tag cv-axt" style="left:770px;top:980px;transform:rotate(-90deg);transform-origin:left top">'+axLb(ax.y,mode)+' &rarr;</div>';
    if(DATA.fingerprint)h+='<div class="cv-tag" style="left:900px;top:300px;max-width:520px"><div class="cv-axt" style="color:#111">'+DATA.fingerprint.title+'</div><div class="cv-axn" style="max-width:520px;margin-top:4px">'+DATA.fingerprint.text+'</div></div>';
    var r=rareFor(ax,mode);if(r)h+='<div class="cv-tag cv-axn" style="left:'+(axPos(ax.x,r.x,mode)+14)+'px;top:'+(axPos(ax.y,r.y,mode)-50)+'px">'+(DATA.rareLabel||'RARE AIR')+'</div>';
    h+=dotHTML(DATA,subj,true,mode);comps.forEach(function(c){h+=dotHTML(DATA,c,false,mode);});
    if(mode!=='p40')comps.forEach(function(c){if(c.rel)h+='<div class="cv-cl" style="left:'+c.rel.lx+'px;top:'+c.rel.ly+'px'+(c.rel.align==='right'?';text-align:right':'')+'"><b>'+c.rel.tag+'</b>'+c.rel.text+'</div>';});
    h+=cardHTML(subj,true,mode);comps.forEach(function(c){h+=cardHTML(c,false,mode);});
    planeEl.innerHTML=svg+h;}

  function targetsFor(b){ var data=b.data,bLeft=b.bLeft,pTop=b.planeTop;
    function cr(p){var el=b.planeEl.querySelector('.cv-card[data-focus="'+p.key+'"]');var h=(el&&el.offsetHeight>10)?el.offsetHeight:(p.card.h||300);return {x:bLeft+p.card.x,y:pTop+p.card.y,w:p.card.w,h:h,pad:60};}
    var t={}; t[data.subject.key]=cr(data.subject); data.comps.forEach(function(c){t[c.key]=cr(c);});
    t.field={x:bLeft+110,y:pTop+230,w:2760,h:PH-190,pad:80};
    b.targets=t; b.order=['field',data.subject.key].concat(data.comps.map(function(c){return c.key;})); if(b.idx==null)b.idx=1;
    var home=rectOf(b.door.closest('.player')||b.door); home.pad=110; b.homeRect=home; }
  function onBtn(cmd){ var b=active; if(!b)return;
    if(cmd==='field')focusRect(b.targets.field);
    else if(cmd==='subject')focusRect(b.targets[b.data.subject.key]);
    else if(cmd==='prev'){b.idx=(b.idx-1+b.order.length)%b.order.length;focusRect(b.targets[b.order[b.idx]]);}
    else if(cmd==='next'){b.idx=(b.idx+1)%b.order.length;focusRect(b.targets[b.order[b.idx]]);}
    else if(cmd==='close'){focusRect(b.homeRect);var bb=b;setTimeout(function(){closeBranch(bb);},560);}
    else if(cmd==='toggle'){b.mode=b.mode==='pg'?'p40':'pg';renderPlane(b.planeEl,b.data,b.mode);wireFocus(b);
      var tg=D.getElementById('cvTog');if(tg){tg.textContent=b.mode==='pg'?'Per 40':'Per game';tg.classList.toggle('on',b.mode==='p40');}}
  }
  function wireFocus(b){ b.planeEl.querySelectorAll('[data-focus]').forEach(function(el){ el.onclick=function(e){e.stopPropagation();focusRect(b.targets[el.getAttribute('data-focus')]);}; }); }
  function closeBranch(b){ if(!b)return; if(b.wrap)b.wrap.remove(); if(b.connPath)b.connPath.remove(); if(b.connPath2)b.connPath2.remove(); if(active===b){active=null;tools.classList.remove('on');} apply(); }

  function openBranch(door){ var id=door.getAttribute('data-branch');
    if(active&&active.id===id){ focusRect(active.targets[active.data.subject.key]); return; }
    if(active) closeBranch(active);
    var b={id:id,door:door,mode:'pg'};
    fetch(id+'-branch.json?ts='+Date.now()).then(function(r){return r.json();}).then(function(data){ b.data=data;
      var dr=rectOf(door), mr=rectOf(cv.querySelector('main.wrap'));
      b.bLeft=mr.x+mr.w+130; b.titleY=dr.y; b.planeTop=b.titleY-PH;
      var wrap=D.createElement('div'); wrap.className='cv-branch'; wrap.style.left=b.bLeft+'px'; wrap.style.top=b.planeTop+'px';
      wrap.innerHTML='<div class="cv-plane"></div><div class="cv-titlebox" data-focus="__field" style="left:0;top:'+(PH+18)+'px;width:520px"><span class="k">'+data.title+'</span><span class="s">'+(data.subtitle||'')+'</span></div>';
      cv.appendChild(wrap); b.wrap=wrap; b.planeEl=wrap.querySelector('.cv-plane');
      renderPlane(b.planeEl,data,b.mode); targetsFor(b); wireFocus(b);
      wrap.querySelector('.cv-titlebox').onclick=function(e){e.stopPropagation();focusRect(b.targets.field);};
      function mkLeader(dd){ var p=D.createElementNS(NS,'path'); p.setAttribute('d',dd); p.setAttribute('stroke','#d0021b');p.setAttribute('stroke-width','1.7');p.setAttribute('fill','none');p.setAttribute('stroke-dasharray','2 7');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-opacity','.85'); conn.appendChild(p); return p; }
      b.connPath=mkLeader(sagPath(dr.x+dr.w,dr.y+dr.h/2,b.bLeft-8,b.titleY+50));
      b.connPath2=mkLeader(sagPath(b.bLeft+520,b.titleY+48,b.bLeft+850,b.planeTop+1500));
      active=b;
      D.getElementById('cvTL').textContent=data.title.replace(/ — THE DATA BRANCH/,'');
      D.getElementById('cvSubj').innerHTML='&#9670; '+data.subject.name.split(' ').pop();
      var tg=D.getElementById('cvTog'); tg.hidden=!data.axis.x.per40; tg.textContent='Per 40'; tg.classList.remove('on');
      tools.classList.add('on');
      uMoved=false; focusRect(b.targets[data.subject.key]);
      b.planeEl.querySelectorAll('.cv-photo img').forEach(function(img){ img.addEventListener('load',function(){ targetsFor(b); if(!uMoved&&active===b) focusRect(b.targets[b.data.subject.key]); }); });
    }).catch(function(){});
  }

  D.addEventListener('click', function(e){ var d=e.target.closest('[data-branch]'); if(!d)return; e.preventDefault(); openBranch(d); });
  tools.querySelectorAll('[data-cv]').forEach(function(btn){ btn.addEventListener('click', function(e){ e.stopPropagation(); onBtn(btn.getAttribute('data-cv')); }); });

  // top nav box beside the revision table
  function addTopNav(){ var rt=cv.querySelector('.revtable');
    var box=D.createElement('div'); box.className='cv-navtop';
    box.innerHTML='<div class="h">Navigation</div><div class="bd">'+HAND+' <b>drag</b> to pan &middot; <b>scroll</b> &darr; the page &middot; <b>&#8984;/Ctrl + scroll</b> to zoom</div>';
    cv.appendChild(box);
    if(rt && window.innerWidth>980){ var r=rt.getBoundingClientRect(), v=vp.getBoundingClientRect(); box.style.width='280px'; box.style.left=(r.right-v.left-280)+'px'; box.style.top=(r.bottom-v.top+12)+'px'; }
    else { box.style.left='26px'; box.style.top='150px'; box.style.width='300px'; }
    navTopBottom=box.getBoundingClientRect().bottom; }

  apply();
  function boot(){ addTopNav(); apply(); }
  if(D.readyState!=='loading') setTimeout(boot,120); else D.addEventListener('DOMContentLoaded',function(){setTimeout(boot,120);});
})();
