/* Guiseppe Drafts — unified canvas navigation + on-canvas data branches.
   The whole board becomes one pannable/zoomable sheet:
     • grab-hand cursor by default
     • scroll = move down the page,  Ctrl/Cmd + scroll = zoom to cursor
     • drag empty space = pan
   Each card with data-branch="<id>" gets a data branch rendered ON the canvas
   to its right (dotted leader). Clicking the door flies (pan+zoom) to it;
   the branch's header buttons + X fly you around / back to the card. */
(function(){
  if(window.__cvNav) return; window.__cvNav=true;
  var D=document, B=D.body, NS='http://www.w3.org/2000/svg';

  var CSS=[
   'html,body{height:100%;margin:0;overflow:hidden}',
   '#cv-vp{position:fixed;inset:0;overflow:hidden;background:#fff;cursor:grab}',
   '#cv-vp.grab{cursor:grabbing}',
   '#cv-cv{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}',
   '#cv-vp a,#cv-vp button,#cv-vp [data-cv],#cv-vp [data-cvfocus],#cv-vp .databranch,#cv-vp input,#cv-vp video,#cv-vp iframe{cursor:pointer}',
   '#cv-cv .wrap{width:1060px;max-width:none;margin:0 0 0 26px}',
   '.cv-branch{position:absolute;font-family:Arial,Helvetica,sans-serif}',
   '.cv-bhead{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px}',
   '.cv-bt .k{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:15px;letter-spacing:.02em;display:block}',
   '.cv-bt .s{font-size:11px;color:#666;display:block;margin-top:1px}',
   '.cv-btns{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:auto}',
   '.cv-b{font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;border:1.5px solid #0a0a0a;background:#fff;color:#0a0a0a;padding:6px 9px;border-radius:6px;cursor:pointer}',
   '.cv-b:hover{background:#0a0a0a;color:#fff}',
   '.cv-b.red{border-color:#d0021b;color:#d0021b}.cv-b.red:hover{background:#d0021b;color:#fff}',
   '.cv-b.on{background:#d0021b;border-color:#d0021b;color:#fff}',
   '.cv-x{width:38px;height:34px;border:2px solid #0a0a0a;background:#fff;border-radius:8px;font-size:22px;line-height:1;cursor:pointer;color:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:Arial}',
   '.cv-x:hover{background:#d0021b;border-color:#d0021b;color:#fff}',
   '.cv-plane{position:absolute;left:0;top:0;width:3000px;height:2000px;transform-origin:0 0}',
   '.cv-svg{position:absolute;left:0;top:0;width:3000px;height:2000px;overflow:visible;pointer-events:none}',
   '.cv-dot{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #0a0a0a;transform:translate(-10px,-10px);z-index:5;box-shadow:0 1px 3px rgba(0,0,0,.15);cursor:pointer}',
   '.cv-dot.subj{border-color:#d0021b;background:#d0021b;width:26px;height:26px;transform:translate(-13px,-13px)}',
   '.cv-lab{position:absolute;font-family:ui-monospace,Consolas,monospace;font-size:13px;font-weight:700;white-space:nowrap;transform:translate(-50%,0);z-index:5;pointer-events:none;text-shadow:0 1px 2px #fff,0 0 2px #fff}',
   '.cv-lab .sub{display:block;font-family:Arial,sans-serif;font-weight:400;font-size:11px;color:#666;text-align:center}',
   '.cv-lab.subj{color:#d0021b}',
   '.cv-card{position:absolute;background:#fff;border:2px solid #0a0a0a;border-radius:14px;padding:15px 17px;z-index:6;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.08)}',
   '.cv-card.hero{border-color:#d0021b;border-width:2.5px}',
   '.cv-card .nm{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:19px}',
   '.cv-card.hero .nm{font-size:23px}',
   '.cv-card .meta{font-size:11px;color:#666;margin-top:1px}',
   '.cv-slot{margin-top:10px;height:84px;border:1.5px dashed #c9c9c9;border-radius:8px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;color:#a6a6a6;font-size:11px;text-align:center;padding:8px}',
   '.cv-card.hero .cv-slot{height:104px}',
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
   '.cv-hint{position:fixed;left:14px;bottom:14px;z-index:50;font-family:Arial,sans-serif;font-size:11.5px;color:#555;background:rgba(255,255,255,.95);border:1.5px solid #0a0a0a;border-radius:9px;padding:8px 11px;max-width:250px;line-height:1.55}',
   '.cv-hint b{font-family:ui-monospace,Consolas,monospace;text-transform:uppercase;letter-spacing:.09em;font-size:10px;display:block;margin-bottom:3px;color:#0a0a0a}'
  ].join('');
  var st=D.createElement('style'); st.textContent=CSS; D.head.appendChild(st);

  var vp=D.createElement('div'); vp.id='cv-vp';
  var cv=D.createElement('div'); cv.id='cv-cv';
  while(B.firstChild) cv.appendChild(B.firstChild);
  vp.appendChild(cv); B.appendChild(vp);
  var conn=D.createElementNS(NS,'svg'); conn.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:1'; conn.setAttribute('width','10'); conn.setAttribute('height','10'); cv.appendChild(conn);
  var hint=D.createElement('div'); hint.className='cv-hint'; hint.innerHTML='<b>Navigation</b>&#9995; drag to pan &middot; scroll &darr; the page &middot; &#8984;/Ctrl + scroll to zoom'; vp.appendChild(hint);

  var X=0,Y=0,K=1,KMIN=0.18,KMAX=3,raf=null;
  function apply(){ cv.style.transform='translate('+X+'px,'+Y+'px) scale('+K+')'; }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function clampPan(){ var vw=vp.clientWidth,vh=vp.clientHeight,m=280,w=cv.scrollWidth,h=cv.scrollHeight; X=clamp(X,vw-w*K-m,m); Y=clamp(Y,vh-h*K-m,m); }
  function animateTo(nx,ny,nk){ if(raf)cancelAnimationFrame(raf); var sx=X,sy=Y,sk=K,t0=performance.now();
    (function step(now){ var t=Math.min(1,(now-t0)/560),e=1-Math.pow(1-t,3); X=sx+(nx-sx)*e;Y=sy+(ny-sy)*e;K=sk+(nk-sk)*e;apply(); if(t<1)raf=requestAnimationFrame(step); })(performance.now()); }
  function focusRect(r){ if(!r)return; var vw=vp.clientWidth,vh=vp.clientHeight,pad=r.pad||70; var k=clamp(Math.min(vw/(r.w+2*pad),vh/(r.h+2*pad)),KMIN,KMAX); var cx=r.x+r.w/2,cy=r.y+r.h/2; animateTo(vw/2-k*cx,vh/2-k*cy,k); }
  function rectOf(el){ var r=el.getBoundingClientRect(), v=vp.getBoundingClientRect(); return {x:(r.left-v.left-X)/K,y:(r.top-v.top-Y)/K,w:r.width/K,h:r.height/K}; }

  vp.addEventListener('wheel', function(e){ e.preventDefault();
    if(e.ctrlKey||e.metaKey){ var rc=vp.getBoundingClientRect(),mx=e.clientX-rc.left,my=e.clientY-rc.top,wx=(mx-X)/K,wy=(my-Y)/K,nk=clamp(K*(e.deltaY<0?1.12:0.893),KMIN,KMAX); X=mx-wx*nk;Y=my-wy*nk;K=nk;clampPan();apply(); }
    else { Y-=e.deltaY; X-=(e.deltaX||0); clampPan(); apply(); }
  }, {passive:false});
  var down=false,lx=0,ly=0,INT='a,button,input,textarea,select,video,iframe,[data-cv],[data-cvfocus],.databranch';
  vp.addEventListener('pointerdown', function(e){ if(e.target.closest(INT))return; down=true;lx=e.clientX;ly=e.clientY;vp.classList.add('grab'); try{vp.setPointerCapture(e.pointerId);}catch(_){ } });
  vp.addEventListener('pointermove', function(e){ if(!down)return; X+=e.clientX-lx;Y+=e.clientY-ly;lx=e.clientX;ly=e.clientY;clampPan();apply(); });
  vp.addEventListener('pointerup', function(){down=false;vp.classList.remove('grab');});
  vp.addEventListener('pointercancel', function(){down=false;vp.classList.remove('grab');});
  window.addEventListener('resize', function(){ clampPan(); apply(); });

  var BR=0.5, HEAD_H=54;
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
  function statHTML(arr){return arr.map(function(t){return '<div class="cv-st'+(t[2]?' hi':'')+'"><div class="v">'+t[0]+'</div><div class="l">'+t[1]+'</div></div>';}).join('');}
  function cardHTML(p,hero){var body=hero?((p.per40?'<div class="cv-p40">'+p.per40+'</div>':'')+(p.note?'<div class="cv-note">'+p.note+'</div>':'')+'<div class="cv-slot">[ photo slot &mdash; '+p.key+'.jpg ]</div>'):('<div class="cv-out"><span class="tag">Became</span><br>'+p.became+'</div><div class="cv-slot">[ photo slot ]</div>');
    return '<div class="cv-card'+(hero?' hero':'')+'" style="left:'+p.card.x+'px;top:'+p.card.y+'px;width:'+p.card.w+'px" data-cvfocus="'+p.key+'"><div class="nm">'+p.name+'</div><div class="meta">'+p.meta+'</div><div class="cv-sl">'+statHTML(p.stats)+'</div>'+body+'</div>';}
  function subVals(DATA,p,mode){var ax=DATA.axis;return rnd(axVal(p,ax.x.stat,mode))+' '+ax.x.short+' &middot; '+rnd(axVal(p,ax.y.stat,mode))+' '+ax.y.short;}
  function dotHTML(DATA,p,subj,mode){var last=p.name.split(' ').pop().toUpperCase();
    return '<div class="cv-dot'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+p.y+'px" data-cvfocus="'+p.key+'"></div><div class="cv-lab'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+(p.y+25)+'px">'+last+'<span class="sub">'+subVals(DATA,p,mode)+'</span></div>';}
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
    h+=cardHTML(subj,true);comps.forEach(function(c){h+=cardHTML(c,false);});
    planeEl.innerHTML=svg+h;}

  var branches={};
  function computeTargets(b){ var data=b.data,bLeft=b.bLeft,bTop=b.bTop,headH=b.headH||HEAD_H;
    function toC(px,py){return {x:bLeft+px*BR,y:bTop+headH+py*BR};}
    function cr(p){var c=toC(p.card.x,p.card.y);return {x:c.x,y:c.y,w:p.card.w*BR,h:(p.card.h||300)*BR,pad:34};}
    b.targets={}; b.targets[data.subject.key]=cr(data.subject); data.comps.forEach(function(c){b.targets[c.key]=cr(c);});
    b.targets.field={x:bLeft-30,y:bTop-30,w:2850*BR+60,h:headH+2000*BR+60,pad:40};
    b.order=['field',data.subject.key].concat(data.comps.map(function(c){return c.key;})); if(b.idx==null)b.idx=1;
    var home=rectOf(b.door.closest('.player')||b.door); home.pad=90; b.homeRect=home; }
  function wireFocus(b){ b.wrap.querySelectorAll('[data-cvfocus]').forEach(function(el){ el.onclick=function(e){e.stopPropagation();focusRect(b.targets[el.getAttribute('data-cvfocus')]);}; }); }
  function drawConnector(b){ var dr=rectOf(b.door),x0=dr.x+dr.w,y0=dr.y+dr.h/2,x1=b.bLeft-6,y1=b.bTop+(b.headH||HEAD_H)+40;
    var p=D.createElementNS(NS,'path'); p.setAttribute('d','M'+x0+' '+y0+' C'+(x0+130)+' '+y0+' '+(x1-130)+' '+y1+' '+x1+' '+y1);
    p.setAttribute('stroke','#d0021b');p.setAttribute('stroke-width','1.6');p.setAttribute('fill','none');p.setAttribute('stroke-dasharray','2 7');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-opacity','.85'); conn.appendChild(p); }
  function onBtn(b,cmd){
    if(cmd==='field')focusRect(b.targets.field);
    else if(cmd==='subject')focusRect(b.targets[b.data.subject.key]);
    else if(cmd==='prev'){b.idx=(b.idx-1+b.order.length)%b.order.length;focusRect(b.targets[b.order[b.idx]]);}
    else if(cmd==='next'){b.idx=(b.idx+1)%b.order.length;focusRect(b.targets[b.order[b.idx]]);}
    else if(cmd==='close')focusRect(b.homeRect);
    else if(cmd==='toggle'){b.mode=b.mode==='pg'?'p40':'pg';renderPlane(b.planeEl,b.data,b.mode);wireFocus(b);computeTargets(b);
      var tb=b.wrap.querySelector('[data-cv=toggle]');if(tb){tb.textContent=b.mode==='pg'?'Per 40':'Per game';tb.classList.toggle('on',b.mode==='p40');}
      focusRect(b.targets[b.data.subject.key]);}
  }
  function buildBranch(door){ var id=door.getAttribute('data-branch'); if(branches[id])return branches[id];
    var b={id:id,door:door,mode:'pg',data:null,targets:null,pending:false}; branches[id]=b;
    fetch(id+'-branch.json').then(function(r){return r.json();}).then(function(data){ b.data=data;
      var dr=rectOf(door), mr=rectOf(D.querySelector('main.wrap')); b.bLeft=mr.x+mr.w+90; b.bTop=dr.y-16;
      var wrap=D.createElement('div'); wrap.className='cv-branch'; wrap.style.left=b.bLeft+'px'; wrap.style.top=b.bTop+'px'; wrap.style.width=(2850*BR)+'px';
      wrap.innerHTML='<div class="cv-bhead"><div class="cv-bt"><span class="k">'+data.title+'</span><span class="s">'+(data.subtitle||'')+'</span></div><div class="cv-btns">'
        +'<button class="cv-b" data-cv="field">&#8690; Field</button>'
        +'<button class="cv-b red" data-cv="subject">&#9670; '+data.subject.name.split(' ').pop()+'</button>'
        +'<button class="cv-b" data-cv="prev">&lsaquo;</button><button class="cv-b" data-cv="next">&rsaquo;</button>'
        +(data.axis.x.per40?'<button class="cv-b" data-cv="toggle">Per 40</button>':'')
        +'<button class="cv-x" data-cv="close" title="Back to board">&times;</button></div></div>'
        +'<div class="cv-plane" style="transform:scale('+BR+')"></div>';
      cv.appendChild(wrap); b.wrap=wrap; b.headEl=wrap.querySelector('.cv-bhead'); b.planeEl=wrap.querySelector('.cv-plane');
      b.headH=b.headEl.offsetHeight||HEAD_H; b.planeEl.style.top=b.headH+'px';
      renderPlane(b.planeEl,data,b.mode); computeTargets(b); drawConnector(b); wireFocus(b);
      wrap.querySelectorAll('[data-cv]').forEach(function(btn){ btn.addEventListener('click',function(e){e.stopPropagation();onBtn(b,btn.getAttribute('data-cv'));}); });
      if(b.pending)focusRect(b.targets.field);
    }).catch(function(){});
    return b; }

  D.addEventListener('click', function(e){ var d=e.target.closest('[data-branch]'); if(!d)return; e.preventDefault();
    var b=buildBranch(d); if(b.targets)focusRect(b.targets.field); else b.pending=true; });

  function initBranches(){ D.querySelectorAll('[data-branch]').forEach(function(d){ buildBranch(d); }); }
  apply();
  if(D.readyState!=='loading') setTimeout(initBranches,140); else D.addEventListener('DOMContentLoaded',function(){setTimeout(initBranches,140);});
})();
