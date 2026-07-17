const screens = [...document.querySelectorAll('.screen')];
const tabs = [...document.querySelectorAll('.prototype-tab')];
function openScreen(name){screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===name));tabs.forEach(t=>t.classList.toggle('active',t.dataset.screen===name));document.querySelector('.screen.active')?.scrollTo(0,0);if(location.hash!==`#${name}`)history.replaceState(null,'',`#${name}`)}
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-open],[data-screen].prototype-tab');if(trigger)openScreen(trigger.dataset.open||trigger.dataset.screen)});

document.querySelectorAll('.segmented').forEach(group=>group.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;group.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}));

const orbs=[
  ['DRIFTER','Balanced. Equal powerup chances.'],
  ['PHANTOM','Longer ghost. Ghosts spawn more often.'],
  ['INFERNO','Bigger novas. Novas spawn more often.'],
  ['WARP','Bend space with hyperspeed: go faster, stay longer, or hold more.'],
  ['BULWARK','Durable shields. Shields spawn more often.']
];
let orbIndex=0;
const dots=document.getElementById('orbDots');
function renderOrb(){document.getElementById('orbName').textContent=orbs[orbIndex][0];document.getElementById('orbDesc').textContent=orbs[orbIndex][1];dots.innerHTML=orbs.map((_,i)=>`<i class="${i===orbIndex?'active':''}"></i>`).join('')}
document.getElementById('orbPrev').onclick=()=>{orbIndex=(orbIndex+orbs.length-1)%orbs.length;renderOrb()};
document.getElementById('orbNext').onclick=()=>{orbIndex=(orbIndex+1)%orbs.length;renderOrb()};
renderOrb();

const guidePages=[
  ['CONTROLS','HOLD the LEFT side to attract toward the nearest body. HOLD the RIGHT side to repel away. Your orb always targets the CLOSEST object.'],
  ['POWERUPS','Collect powerups to gain abilities. SHIELD absorbs planet hits. NOVA destroys nearby planets. HYPERSPEED creates a barrier at high speed. GHOST lets you phase through planets. Grab two powerups to trigger powerful COMBOS.'],
  ['SCORING','Pass planets for points. Destroy planets to score more — each kill is multiplied by your current streak, so longer chains pay off fast. Survive longer for a TIME BONUS.'],
  ['BURST','Press BOTH sides at the same time to activate your BURST. It instantly grants a powerful powerup. Each orb has a unique burst effect.'],
  ['THE VOID AWAKENS','The longer you survive, the faster and more dangerous space becomes. At 10 minutes… the Void itself descends for you.'],
  ['ORBS','Unlock new orbs with Drift Crystals earned every run. Each orb changes your playstyle and gives a unique BURST ability.']
];
let guideIndex=0;
const rail=document.getElementById('chapterRail');
function renderGuide(){rail.innerHTML=guidePages.map((p,i)=>`<button class="${i===guideIndex?'active':''}" data-guide="${i}">${i+1}. ${p[0]}</button>`).join('');document.getElementById('guideChapter').textContent=`CHAPTER ${guideIndex+1}`;document.getElementById('guideTitle').textContent=guidePages[guideIndex][0];document.getElementById('guideText').textContent=guidePages[guideIndex][1];document.getElementById('guideProgress').textContent=`${guideIndex+1} / ${guidePages.length}`;document.getElementById('guidePrev').disabled=guideIndex===0;document.getElementById('guideNext').textContent=guideIndex===guidePages.length-1?'RETURN TO MENU':'NEXT →'}
rail.onclick=e=>{const b=e.target.closest('[data-guide]');if(b){guideIndex=Number(b.dataset.guide);renderGuide()}};
document.getElementById('guidePrev').onclick=()=>{if(guideIndex>0){guideIndex--;renderGuide()}};
document.getElementById('guideNext').onclick=()=>{if(guideIndex<guidePages.length-1){guideIndex++;renderGuide()}else openScreen('menu')};
renderGuide();

const initialScreen=location.hash.slice(1);
if(screens.some(screen=>screen.dataset.screen===initialScreen))openScreen(initialScreen);

document.querySelectorAll('.node').forEach(node=>node.addEventListener('click',()=>{document.querySelectorAll('.node').forEach(n=>n.classList.remove('selected'));node.classList.add('selected');const detail=document.getElementById('nodeDetail');detail.querySelector('h2').textContent=node.dataset.title;detail.querySelector('p').textContent=node.dataset.desc;detail.querySelector('dd').textContent=node.classList.contains('owned')?'OWNED':node.classList.contains('available')?'AVAILABLE':'LOCKED';detail.querySelector('.primary').disabled=!node.classList.contains('available')}));
