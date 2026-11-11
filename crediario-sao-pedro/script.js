'use strict';
// ============================================================
// CONFIGURAÇÃO DA LOJA — EDITE AQUI O WHATSAPP DO SEU PAI
// Exemplo: '5598999999999' (55 + DDD + número, só dígitos)
// ============================================================
const WHATSAPP_DA_LOJA = '5598991792139'; // <-- COLOQUE O NÚMERO AQUI
// Depois de publicar no Netlify, configure a URL do site abaixo
// para que a mensagem inclua um link direto para a foto do produto.
const URL_DO_SITE = ''; // Exemplo: 'https://crediariosaopedro.netlify.app'
// ============================================================
let produtos = window.PRODUTOS || [];
const $ = id => document.getElementById(id);
const reais = v => v == null ? 'Consulte o preço' : v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const state={category:'',brand:'',search:'',sort:'default',visible:16};
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function whatsUrl(text){const num=WHATSAPP_DA_LOJA.replace(/\D/g,'');return num ? `https://wa.me/${num}?text=${encodeURIComponent(text)}` : '#contato';}
function contactSetup(){const num=WHATSAPP_DA_LOJA.replace(/\D/g,'');for(const id of ['whatsHeader','whatsAbout']){const a=$(id);a.href=num?whatsUrl('Olá! Gostaria de saber mais sobre os móveis do Everaldo Móveis e Eletro.'): '#catalogo';if(num){a.target='_blank';a.rel='noopener noreferrer';}}}
function populate(){$('category').length=1;$('brand').length=1;$('chips').replaceChildren();const cats=[...new Set(produtos.map(p=>p.categoria))].sort();const brands=[...new Set(produtos.map(p=>p.marca))].sort();for(const [id,vals] of [['category',cats],['brand',brands]])for(const v of vals){const o=el('option','',v);o.value=v;$(id).append(o);}const chips=$('chips');const all=['Todos',...cats];for(const c of all){const b=el('button','chip'+(c==='Todos'?' active':''),c);b.type='button';b.onclick=()=>{state.category=c==='Todos'?'':c;$('category').value=state.category;state.visible=16;render()};chips.append(b);}}
function filtered(){let a=produtos.filter(p=>(!state.category||p.categoria===state.category)&&(!state.brand||p.marca===state.brand)&&norm([p.nome,p.marca,p.categoria].join(' ')).includes(norm(state.search)));if(state.sort==='asc')a.sort((x,y)=>(x.preco??Infinity)-(y.preco??Infinity));if(state.sort==='desc')a.sort((x,y)=>(y.preco??-1)-(x.preco??-1));if(state.sort==='name')a.sort((x,y)=>x.nome.localeCompare(y.nome,'pt-BR'));return a;}
function disponibilidade(p){
  if(p.esgotado)return {texto:'Esgotado',classe:'sold'};
  if(p.ultimo)return {texto:'Última unidade!',classe:'last'};
  return {texto:'Disponível',classe:'available'};
}
function render(){const a=filtered();$('resultCount').textContent=`${a.length} produto${a.length===1?'':'s'} encontrado${a.length===1?'':'s'}`;const list=$('products');list.replaceChildren();for(const p of a.slice(0,state.visible)){const card=el('article','product');const picture=el('div','product-image');const img=el('img');img.src=p.imagem;img.alt=`Foto do produto ${p.nome}`;img.loading='lazy';picture.append(img);{const d=disponibilidade(p);const badge=el('span','tag '+d.classe,d.texto);picture.append(badge);}const body=el('div','product-content');body.append(el('span','maker',p.marca));body.append(el('h3','',p.nome));body.append(el('div','price',reais(p.preco)));const btn=el('button','see','Ver detalhes ↗');btn.type='button';btn.onclick=()=>openProduct(p);body.append(btn);card.append(picture,body);list.append(card);}$('empty').hidden=a.length>0;$('more').hidden=a.length<=state.visible;[...$('chips').children].forEach(b=>b.classList.toggle('active',b.textContent===(state.category||'Todos')));}
function openProduct(p){$('modalImg').src=p.imagem;$('modalImg').alt=`Foto do ${p.nome}`;$('modalBrand').textContent=p.marca+' · '+p.categoria;$('modalTitle').textContent=p.nome;$('modalPrice').textContent=reais(p.preco);$('modalDesc').textContent=p.descricao||`${p.nome} — fabricante ${p.marca}. Confira a imagem do catálogo e consulte os detalhes diretamente com nossa equipe.`;const notes=$('modalNotes');notes.replaceChildren();for(const note of p.observacoes||[])notes.append(el('li','',note));const status=$('modalStatus');status.replaceChildren();{const d=disponibilidade(p);status.append(el('span','status '+d.classe,d.texto));}const base=(URL_DO_SITE.trim()||location.origin).replace(/\/$/,'');const photo=p.imagem?.startsWith('http')?p.imagem:(base.startsWith('http')?`${base}/${p.imagem}`:'');const msg=`Olá! Tenho interesse neste produto do Everaldo Móveis e Eletro:\n\n🛋️ *${p.nome}*\n🏷️ Fabricante: ${p.marca}\n💰 Preço: ${reais(p.preco)}\n📋 Categoria: ${p.categoria}${p.observacoes?.length?'\nℹ️ '+p.observacoes.join('; '):''}${photo?'\n📷 Foto do produto: '+photo:''}\n\nPoderia confirmar a disponibilidade, as cores e as condições de pagamento?`;
const a=$('modalWhats');const num=WHATSAPP_DA_LOJA.replace(/\D/g,'');a.href=num?whatsUrl(msg):'#';a.onclick=num?null:(e)=>{e.preventDefault();alert('Configure WHATSAPP_DA_LOJA no arquivo script.js para ativar o atendimento.');};$('whatsTip').textContent='A mensagem inclui os dados do produto e um link para a foto. O WhatsApp não anexa automaticamente a imagem.';$('modal').hidden=false;document.body.classList.add('locked');$('close').focus();}
function closeModal(){$('modal').hidden=true;document.body.classList.remove('locked');}
for(const [id,key] of [['search','search'],['category','category'],['brand','brand'],['sort','sort']])$(id).addEventListener(id==='search'?'input':'change',e=>{state[key]=e.target.value;state.visible=16;render();});$('more').onclick=()=>{state.visible+=16;render();};$('close').onclick=closeModal;$('modal').addEventListener('click',e=>{if(e.target.hasAttribute('data-close'))closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal').hidden)closeModal();});$('year').textContent=new Date().getFullYear();$('countHero').textContent='+'+produtos.length;populate();contactSetup();render();
async function sincronizarCatalogo(){
  if(!window.supabase || !window.SP_SUPABASE_URL) return;
  try {
    const client=window.supabase.createClient(window.SP_SUPABASE_URL,window.SP_SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    let all=[];
    for(let from=0;from<10000;from+=1000){
      const {data,error}=await client.from('produtos').select('id,legacy_id,nome,descricao,categoria,fabricante,preco,quantidade,imagem_url,observacoes,ativo').eq('ativo',true).order('legacy_id',{ascending:true,nullsFirst:false}).range(from,from+999);
      if(error) throw error;
      all.push(...data);if(data.length<1000)break;
    }
    // Evita catálogo vazio se a importação ainda não foi executada.
    if(!all.length)return;
    produtos=all.map(p=>({id:p.id,nome:p.nome,marca:p.fabricante||'',categoria:p.categoria||'Outros',preco:p.preco==null?null:Number(p.preco),imagem:p.imagem_url||'imagens/produto-001.webp',esgotado:p.quantidade===0,ultimo:p.quantidade===1,observacoes:Array.isArray(p.observacoes)?p.observacoes:[],descricao:p.descricao}));
    state.category='';state.brand='';state.visible=16;
    $('countHero').textContent='+'+produtos.length;populate();render();
  }catch(e){console.warn('Catálogo local mantido: falha ao consultar Supabase.',e);}
}
sincronizarCatalogo();
