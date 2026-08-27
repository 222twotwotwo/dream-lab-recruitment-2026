const progress=document.querySelector('.progress span');
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max?scrollY/max*100:0}%`},{passive:true});
document.querySelectorAll('.copy-btn').forEach(btn=>btn.addEventListener('click',async()=>{await navigator.clipboard?.writeText(btn.dataset.copy||'');const old=btn.innerHTML;btn.innerHTML='<span style="color:var(--lime)">COPIED ✓</span>';setTimeout(()=>btn.innerHTML=old,1400)}));
document.querySelectorAll('.replay').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.floating-square').forEach(el=>{el.style.animation='none';void el.offsetWidth;el.style.animation='float 3.2s ease-in-out infinite'})}));
document.querySelector('#subscribe').addEventListener('submit',e=>{e.preventDefault();document.querySelector('#form-note').textContent='Thanks for subscribing.';e.target.reset()});
