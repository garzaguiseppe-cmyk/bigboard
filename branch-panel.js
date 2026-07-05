/* Guiseppe Drafts — inline Data Branch panel engine.
   Included on any board. A door element with data-branch="<id>" opens a
   fixed side panel that loads <id>-branch.json and renders a pan/zoom data plane.
   Big X closes it; the board stays scrollable underneath. */
(function(){
  if(window.__dbPanel) return; window.__dbPanel=true;

  var CSS=''
  +'.dbpanel{position:fixed;top:0;right:0;height:100vh;width:min(780px,94vw);background:#fff;'
  +'border-left:2px solid #0a0a0a;box-shadow:-12px 0 36px rgba(0,0,0,.16);z-index:9999;display:flex;'
  +'flex-direction:column;transform:translateX(103%);transition:transform .34s cubic-bezier(.4,0,.2,1);'
  +'font-family:Arial,Helvetica,sans-serif}'
  +'.dbpanel.open{transform:none}'
  +'.dbp-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border-bottom:1px solid #e6e6e6}'
  +'.dbp-tt .k{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:14px;letter-spacing:.02em;display:block}'
  +'.dbp-tt .s{font-size:11px;color:#666;margin-top:2px;display:block}'
  +'.dbp-ctrls{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}'
  +'.dbp-btn{font-family:ui-monospace,Consolas,monospace;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;'
  +'border:1.5px solid #0a0a0a;background:#fff;color:#0a0a0a;padding:6px 9px;border-radius:6px;cursor:pointer}'
  +'.dbp-btn:hover{background:#0a0a0a;color:#fff}'
  +'.dbp-btn.red{border-color:#d0021b;color:#d0021b}.dbp-btn.red:hover{background:#d0021b;color:#fff}'
  +'.dbp-btn.on{background:#d0021b;color:#fff;border-color:#d0021b}'
  +'.dbp-x{width:40px;height:40px;flex:0 0 auto;border:2px solid #0a0a0a;background:#fff;border-radius:9px;'
  +'font-size:24px;line-height:1;cursor:pointer;color:#0a0a0a;display:flex;align-items:center;justify-content:center;font-family:Arial}'
  +'.dbp-x:hover{background:#d0021b;border-color:#d0021b;color:#fff}'
  +'.dbp-stage{flex:1 1 auto;position:relative;overflow:hidden;cursor:grab;touch-action:none;'
  +'background:linear-gradient(0deg,rgba(0,0,0,.015) 1px,transparent 1px) 0 0/24px 24px,'
  +'linear-gradient(90deg,rgba(0,0,0,.015) 1px,transparent 1px) 0 0/24px 24px,#fbfbfb}'
  +'.dbp-stage.drag{cursor:grabbing}'
  +'.dbp-world{position:absolute;left:0;top:0;width:3000px;height:2000px;transform-origin:0 0}'
  +'.dbp-plane{position:absolute;left:0;top:0;width:3000px;height:2000px;overflow:visible;pointer-events:none}'
  +'.dbp-dot{position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #0a0a0a;'
  +'transform:translate(-10px,-10px);cursor:pointer;z-index:5;box-shadow:0 1px 3px rgba(0,0,0,.15);'
  +'transition:left .55s cubic-bezier(.4,0,.2,1),top .55s cubic-bezier(.4,0,.2,1)}'
  +'.dbp-dot.subj{border-color:#d0021b;background:#d0021b;width:26px;height:26px;transform:translate(-13px,-13px)}'
  +'.dbp-lab{position:absolute;font-family:ui-monospace,Consolas,monospace;font-size:13px;font-weight:700;white-space:nowrap;'
  +'transform:translate(-50%,0);z-index:5;pointer-events:none;text-shadow:0 1px 2px #fff,0 0 2px #fff;transition:left .55s,top .55s}'
  +'.dbp-lab .sub{display:block;font-family:Arial,sans-serif;font-weight:400;font-size:11px;color:#666;text-align:center}'
  +'.dbp-lab.subj{color:#d0021b}'
  +'.dbp-card{position:absolute;background:#fff;border:2px solid #0a0a0a;border-radius:14px;padding:15px 17px;z-index:6;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.08)}'
  +'.dbp-card.hero{border-color:#d0021b;border-width:2.5px}'
  +'.dbp-card .nm{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:19px}'
  +'.dbp-card.hero .nm{font-size:23px}'
  +'.dbp-card .meta{font-size:11px;color:#666;margin-top:1px}'
  +'.dbp-slot{margin-top:10px;height:84px;border:1.5px dashed #c9c9c9;border-radius:8px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;color:#a6a6a6;font-size:11px;text-align:center;padding:8px}'
  +'.dbp-card.hero .dbp-slot{height:104px}'
  +'.dbp-sl{margin-top:10px;display:flex;gap:13px;flex-wrap:wrap}'
  +'.dbp-st{min-width:42px}.dbp-st .v{font-family:ui-monospace,Consolas,monospace;font-weight:700;font-size:18px;line-height:1}'
  +'.dbp-st .l{font-size:9px;color:#9a9a9a;letter-spacing:.06em;text-transform:uppercase;margin-top:3px}'
  +'.dbp-st.hi .v{color:#d0021b}'
  +'.dbp-p40{margin-top:9px;font-size:12px;line-height:1.45;background:#fff5f5;border-left:3px solid #d0021b;padding:7px 10px;border-radius:0 6px 6px 0}'
  +'.dbp-p40 b{color:#d0021b;font-family:ui-monospace,Consolas,monospace}'
  +'.dbp-out{margin-top:9px;font-size:12.5px;line-height:1.45;color:#333;border-top:1px solid #e6e6e6;padding-top:8px}'
  +'.dbp-out .tag{display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:10px;font-weight:700;letter-spacing:.05em;background:#0a0a0a;color:#fff;padding:2px 7px;border-radius:4px;margin-bottom:6px}'
  +'.dbp-card.hero .dbp-out .tag{background:#d0021b}'
  +'.dbp-note{margin-top:8px;font-size:12px;font-style:italic;color:#444;line-height:1.4}'
  +'.dbp-cl{position:absolute;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.35;color:#d0021b;max-width:190px;z-index:4;pointer-events:none;text-shadow:0 1px 2px #fff}'
  +'.dbp-cl b{font-family:ui-monospace,Consolas,monospace;text-transform:uppercase;font-size:10px;letter-spacing:.05em;display:block;color:#7a0010}'
  +'.dbp-tag{position:absolute;font-family:Arial,sans-serif;z-index:3;pointer-events:none}'
  +'.dbp-axt{font-family:ui-monospace,Consolas,monospace;font-size:15px;font-weight:700;letter-spacing:.06em;color:#333}'
  +'.dbp-axn{font-size:12px;color:#9a9a9a;max-width:230px;line-height:1.4}'
  +'.dbp-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:20;font-size:11.5px;color:#666;background:rgba(255,255,255,.92);border:1px solid #e6e6e6;border-radius:20px;padding:6px 13px;transition:opacity .4s}'
  +'@media(max-width:520px){.dbpanel{width:100vw}.dbp-tt .s{display:none}}';
  var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);

  var panel=document.createElement('div'); panel.className='dbpanel'; panel.setAttribute('aria-hidden','true');
  panel.innerHTML=''
   +'<div class="dbp-head"><div class="dbp-tt"><span class="k" id="dbpK">THE DATA BRANCH</span><span class="s" id="dbpS"></span></div>'
   +'<div class="dbp-ctrls">'
   +'<button class="dbp-btn" data-go="field">⤢ Field</button>'
   +'<button class="dbp-btn red" data-go="subject" id="dbpSubjBtn">◆</button>'
   +'<button class="dbp-btn" data-go="prev">‹</button>'
   +'<button class="dbp-btn" data-go="next">›</button>'
   +'<button class="dbp-btn" id="dbpToggle" hidden>Per 40</button>'
   +'<button class="dbp-x" id="dbpX" aria-label="Close data branch">×</button></div></div>'
   +'<div class="dbp-stage" id="dbpStage"><div class="dbp-world" id="dbpWorld">'
   +'<svg class="dbp-plane" id="dbpPlane" viewBox="0 0 3000 2000"></svg><div id="dbpPlayers"></div></div>'
   +'<div class="dbp-hint" id="dbpHint">Scroll to zoom · drag to pan · click a player</div></div>';
  document.body.appendChild(panel);

  var $=function(id){return panel.querySelector(id);};
  var stage=$('#dbpStage'),world=$('#dbpWorld'),plane=$('#dbpPlane'),playersEl=$('#dbpPlayers'),hintEl=$('#dbpHint'),toggleBtn=$('#dbpToggle');
  var s=1,tx=0,ty=0,MIN=.2,MAX=2.6,raf=null,faded=false,T={},ORDER=[],idx=1,DATA=null,MODE='pg',cache={};

  function rnd(v){return Math.round(v*10)/10;}
  function apply(){world.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')';}
  function ssz(){return {w:stage.clientWidth,h:stage.clientHeight};}
  function animate(nx,ny,ns){if(raf)cancelAnimationFrame(raf);var sx=tx,sy=ty,s0=s,t0=performance.now();
    (function step(now){var k=Math.min(1,(now-t0)/520),e=1-Math.pow(1-k,3);tx=sx+(nx-sx)*e;ty=sy+(ny-sy)*e;s=s0+(ns-s0)*e;apply();if(k<1)raf=requestAnimationFrame(step);})(performance.now());}
  function go(name){var t=T[name];if(!t)return;var d=ssz();var sc=Math.min(d.w/(t.w+2*t.pad),d.h/(t.h+2*t.pad));sc=Math.max(MIN,Math.min(MAX,sc));var cx=t.x+t.w/2,cy=t.y+t.h/2;animate(d.w/2-sc*cx,d.h/2-sc*cy,sc);idx=Math.max(0,ORDER.indexOf(name));}

  function axVal(p,stat,mode){var v=p[stat];if(mode==='p40'&&p.mpg)v=v*40/p.mpg;return v;}
  function axPos(a,v,mode){var lo,hi;if(mode==='p40'&&a.per40){lo=a.per40.min;hi=a.per40.max;}else{lo=a.min;hi=a.max;}return a.p0+(v-lo)/(hi-lo)*(a.p1-a.p0);}
  function axTicks(a,mode){return (mode==='p40'&&a.per40&&a.per40.ticks)?a.per40.ticks:(a.ticks||[]);}
  function axLabel(a,mode){return (mode==='p40'&&a.per40&&a.per40.label)?a.per40.label:a.label;}
  function rareFor(ax,mode){var X=ax.x,Y=ax.y;if(mode==='p40'&&X.per40&&X.per40.rare!=null)return {x:X.per40.rare,y:Y.per40.rare};if(X.rare!=null)return {x:X.rare,y:Y.rare};return null;}

  function axisChrome(mode){var ax=DATA.axis,X=ax.x,Y=ax.y,g='';
    g+='<line x1="850" y1="380" x2="850" y2="1500" stroke="#111" stroke-width="2"/><line x1="850" y1="1500" x2="2280" y2="1500" stroke="#111" stroke-width="2"/>';
    axTicks(X,mode).forEach(function(t){var px=axPos(X,t,mode);g+='<line x1="'+px+'" y1="380" x2="'+px+'" y2="1500" stroke="#e6e6e6"/><text x="'+px+'" y="1525" fill="#9a9a9a" font-family="Arial" font-size="15" text-anchor="middle">'+t+'</text>';});
    axTicks(Y,mode).forEach(function(t){var py=axPos(Y,t,mode);g+='<line x1="850" y1="'+py+'" x2="2280" y2="'+py+'" stroke="#e6e6e6"/><text x="835" y="'+(py+5)+'" fill="#9a9a9a" font-family="Arial" font-size="15" text-anchor="end">'+t+'</text>';});
    var r=rareFor(ax,mode);if(r){var rx=axPos(X,r.x,mode),ry=axPos(Y,r.y,mode);g+='<rect x="'+rx+'" y="500" width="'+(2280-rx)+'" height="'+(ry-500)+'" fill="#d0021b" fill-opacity=".04" stroke="#d0021b" stroke-opacity=".22" stroke-dasharray="6 5"/>';}
    return g;}
  function clampAnc(p,c){var x=Math.max(c.x,Math.min(c.x+c.w,p.x)),y=Math.max(c.y,Math.min(c.y+(c.h||300),p.y));return [x,y];}
  function arrowSVG(x0,y0,x1,y1){var ang=Math.atan2(y1-y0,x1-x0),h=24;
    var b1x=x1-h*Math.cos(ang-0.42),b1y=y1-h*Math.sin(ang-0.42),b2x=x1-h*Math.cos(ang+0.42),b2y=y1-h*Math.sin(ang+0.42);
    return '<path d="M'+x0+' '+y0+' L'+x1+' '+y1+'" stroke="#d0021b" stroke-width="2.4" fill="none"/>'
      +'<path d="M'+x1+' '+y1+' L'+b1x+' '+b1y+' M'+x1+' '+y1+' L'+b2x+' '+b2y+'" stroke="#d0021b" stroke-width="2.4" fill="none"/>';}
  function leadersSVG(subj,comps,mode){var g='';
    comps.forEach(function(c){g+='<path d="M'+subj.x+' '+subj.y+' L'+c.x+' '+c.y+'" stroke="#d0021b" stroke-width="1.6" stroke-opacity=".7" fill="none"/>';});
    var sa=clampAnc(subj,subj.card);g+='<path d="M'+subj.x+' '+(subj.y+13)+' L'+sa[0]+' '+sa[1]+'" stroke="#111" stroke-width="1" stroke-opacity=".33" fill="none"/>';
    comps.forEach(function(c){var a=clampAnc(c,c.card);g+='<path d="M'+c.x+' '+c.y+' L'+a[0]+' '+a[1]+'" stroke="#111" stroke-width="1" stroke-opacity=".33" fill="none"/>';});
    if(mode==='p40'&&DATA.arrow){var ax0=subj.x+DATA.arrow.dx,ay0=subj.y+DATA.arrow.dy;g+=arrowSVG(ax0,ay0,subj.x-17,subj.y-17);
      g+='<text x="'+ax0+'" y="'+(ay0-8)+'" fill="#d0021b" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="700" text-anchor="middle">'+DATA.arrow.text+'</text>';}
    return g;}

  function statHTML(arr){return arr.map(function(t){return '<div class="dbp-st'+(t[2]?' hi':'')+'"><div class="v">'+t[0]+'</div><div class="l">'+t[1]+'</div></div>';}).join('');}
  function cardHTML(p,hero){var body=hero
    ?((p.per40?'<div class="dbp-p40">'+p.per40+'</div>':'')+(p.note?'<div class="dbp-note">'+p.note+'</div>':'')+'<div class="dbp-slot">[ photo slot — '+p.key+'.jpg ]</div>')
    :('<div class="dbp-out"><span class="tag">Became</span><br>'+p.became+'</div><div class="dbp-slot">[ photo slot ]</div>');
    return '<div class="dbp-card'+(hero?' hero':'')+'" style="left:'+p.card.x+'px;top:'+p.card.y+'px;width:'+p.card.w+'px" data-focus="'+p.key+'">'
      +'<div class="nm">'+p.name+'</div><div class="meta">'+p.meta+'</div><div class="dbp-sl">'+statHTML(p.stats)+'</div>'+body+'</div>';}
  function subVals(p){var ax=DATA.axis,m=MODE;return rnd(axVal(p,ax.x.stat,m))+' '+ax.x.short+' · '+rnd(axVal(p,ax.y.stat,m))+' '+ax.y.short;}
  function dotHTML(p,subj){var last=p.name.split(' ').pop().toUpperCase();
    return '<div class="dbp-dot'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+p.y+'px" data-focus="'+p.key+'"></div>'
      +'<div class="dbp-lab'+(subj?' subj':'')+'" style="left:'+p.x+'px;top:'+(p.y+25)+'px">'+last+'<span class="sub">'+subVals(p)+'</span></div>';}
  function bbox(p,c){var x0=Math.min(p.x,c.x),y0=Math.min(p.y,c.y),x1=Math.max(p.x,c.x+c.w),y1=Math.max(p.y,c.y+(c.h||300));return {x:x0,y:y0,w:x1-x0,h:y1-y0,pad:60};}

  function build(){var ax=DATA.axis,subj=DATA.subject,comps=DATA.comps,mode=MODE;
    subj.x=axPos(ax.x,axVal(subj,ax.x.stat,mode),mode);subj.y=axPos(ax.y,axVal(subj,ax.y.stat,mode),mode);
    comps.forEach(function(c){c.x=axPos(ax.x,axVal(c,ax.x.stat,mode),mode);c.y=axPos(ax.y,axVal(c,ax.y.stat,mode),mode);});
    plane.innerHTML=axisChrome(mode)+leadersSVG(subj,comps,mode);
    var h='';
    h+='<div class="dbp-tag dbp-axt" style="left:1300px;top:1545px;transform:translateX(-50%)">'+axLabel(ax.x,mode)+' →</div>';
    h+='<div class="dbp-tag dbp-axt" style="left:770px;top:980px;transform:rotate(-90deg);transform-origin:left top">'+axLabel(ax.y,mode)+' →</div>';
    if(DATA.fingerprint)h+='<div class="dbp-tag" style="left:900px;top:300px;max-width:520px"><div class="dbp-axt" style="color:#111">'+DATA.fingerprint.title+'</div><div class="dbp-axn" style="max-width:520px;margin-top:4px">'+DATA.fingerprint.text+'</div></div>';
    var r=rareFor(ax,mode);if(r)h+='<div class="dbp-tag dbp-axn" style="left:'+(axPos(ax.x,r.x,mode)+14)+'px;top:'+(axPos(ax.y,r.y,mode)-50)+'px">'+(DATA.rareLabel||'RARE AIR')+'</div>';
    h+=dotHTML(subj,true);comps.forEach(function(c){h+=dotHTML(c,false);});
    if(mode==='pg')comps.forEach(function(c){if(c.rel)h+='<div class="dbp-cl" style="left:'+c.rel.lx+'px;top:'+c.rel.ly+'px'+(c.rel.align==='right'?';text-align:right':'')+'"><b>'+c.rel.tag+'</b>'+c.rel.text+'</div>';});
    h+=cardHTML(subj,true);comps.forEach(function(c){h+=cardHTML(c,false);});
    playersEl.innerHTML=h;
    T={field:{x:150,y:280,w:2680,h:1600,pad:70}};T[subj.key]=bbox(subj,subj.card);comps.forEach(function(c){T[c.key]=bbox(c,c.card);});
    ORDER=['field',subj.key].concat(comps.map(function(c){return c.key;}));
    playersEl.querySelectorAll('[data-focus]').forEach(function(el){el.addEventListener('click',function(e){e.stopPropagation();go(el.getAttribute('data-focus'));});});
    if(ax.x.per40){toggleBtn.hidden=false;toggleBtn.textContent=mode==='pg'?'Per 40':'Per game';toggleBtn.classList.toggle('on',mode==='p40');}else toggleBtn.hidden=true;
    $('#dbpSubjBtn').innerHTML='◆ '+subj.name.split(' ').pop();
    $('#dbpK').textContent=DATA.title;$('#dbpS').innerHTML=DATA.subtitle||'';}

  function show(){panel.classList.add('open');panel.setAttribute('aria-hidden','false');faded=false;hintEl.style.display='';hintEl.style.opacity='';}
  function openPanel(id){if(DATA&&DATA.id===id){show();go(DATA.subject.key);return;}
    if(cache[id]){DATA=cache[id];MODE='pg';build();show();setTimeout(function(){go(DATA.subject.key);},30);return;}
    fetch(id+'-branch.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){cache[id]=d;DATA=d;MODE='pg';build();show();setTimeout(function(){go(DATA.subject.key);},30);}).catch(function(){});}
  function closePanel(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');}

  document.addEventListener('click',function(e){var d=e.target.closest('[data-branch]');if(d){e.preventDefault();openPanel(d.getAttribute('data-branch'));}});
  $('#dbpX').addEventListener('click',closePanel);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePanel();});
  panel.querySelectorAll('.dbp-head [data-go]').forEach(function(b){b.addEventListener('click',function(){if(!DATA)return;var g=b.getAttribute('data-go');
    if(g==='subject')go(DATA.subject.key);else if(g==='field')go('field');else if(g==='prev'){idx=(idx-1+ORDER.length)%ORDER.length;go(ORDER[idx]);}else if(g==='next'){idx=(idx+1)%ORDER.length;go(ORDER[idx]);}});});
  toggleBtn.addEventListener('click',function(){if(!DATA)return;MODE=MODE==='pg'?'p40':'pg';build();go(DATA.subject.key);});
  stage.addEventListener('wheel',function(e){e.preventDefault();var r=stage.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;var wx=(mx-tx)/s,wy=(my-ty)/s,ns=Math.max(MIN,Math.min(MAX,s*(e.deltaY<0?1.12:.893)));tx=mx-ns*wx;ty=my-ns*wy;s=ns;apply();fade();},{passive:false});
  var down=false,lx=0,ly=0;
  stage.addEventListener('pointerdown',function(e){down=true;lx=e.clientX;ly=e.clientY;stage.classList.add('drag');stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',function(e){if(!down)return;tx+=e.clientX-lx;ty+=e.clientY-ly;lx=e.clientX;ly=e.clientY;apply();});
  stage.addEventListener('pointerup',function(){down=false;stage.classList.remove('drag');fade();});
  stage.addEventListener('pointercancel',function(){down=false;stage.classList.remove('drag');});
  function fade(){if(faded)return;faded=true;hintEl.style.opacity=0;setTimeout(function(){hintEl.style.display='none';},500);}
  window.addEventListener('resize',function(){if(panel.classList.contains('open')&&ORDER.length)go(ORDER[idx]);});
})();
