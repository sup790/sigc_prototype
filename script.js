(() => {
  const $ = id => document.getElementById(id);
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.tab-panel')];

  const state = {
    people: [
      {codigo:1, cpf:'', nome:'Colaborador Exemplo', telefone1:'', telefone2:'', email:'',
       sexo:'', nascimento:'', admissao:'', demissao:'', empresa:'Confiança', nte:'NTE - 01',
       municipio:'', lotacao:'uee', uee:'UEE - Unidade 01', unidadeAdm:'', codigoSec:'SEC-001',
       status:'ativo'}
    ],
    current: null,
    banks: [],
    docs: []
  };

  function toast(msg){
    $('toast').textContent=msg;
    $('toast').classList.add('show');
    clearTimeout(toast.t);
    toast.t=setTimeout(()=> $('toast').classList.remove('show'),2200);
  }

  function openTab(name){
    tabs.forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
    panels.forEach(p=>p.classList.toggle('active',p.id===name));
    if(name==='localizar') renderPeople();
  }
  tabs.forEach(t=>t.addEventListener('click',()=>openTab(t.dataset.tab)));

  function formatCpf(v){
    v=v.replace(/\D/g,'').slice(0,11);
    if(v.length>9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');
    if(v.length>6) return v.replace(/(\d{3})(\d{3})(\d{0,3})/,'$1.$2.$3');
    if(v.length>3) return v.replace(/(\d{3})(\d{0,3})/,'$1.$2');
    return v;
  }
  function formatPhone(v){
    v=v.replace(/\D/g,'').slice(0,11);
    if(v.length>10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
    if(v.length>6) return v.replace(/(\d{2})(\d{4,5})(\d{0,4})/,'($1) $2-$3');
    return v;
  }
  $('cpf').addEventListener('input',e=>e.target.value=formatCpf(e.target.value));
  ['telefone1','telefone2'].forEach(id=>$(id).addEventListener('input',e=>e.target.value=formatPhone(e.target.value)));

  function toggleConditional(){
    const val=$('lotacao').value;
    $('wrapUee').classList.toggle('show',val==='uee');
    $('wrapSec').classList.toggle('show',val==='uee');
    $('wrapAdm').classList.toggle('show',val==='administrativa');
    if(val!=='uee'){ $('uee').value=''; $('codigoSec').value=''; }
    if(val!=='administrativa') $('unidadeAdm').value='';
  }
  $('lotacao').addEventListener('change',toggleConditional);

  function getForm(){
    return {
      cpf:$('cpf').value.trim(), nome:$('nome').value.trim(), telefone1:$('telefone1').value.trim(),
      telefone2:$('telefone2').value.trim(), email:$('email').value.trim(), sexo:$('sexo').value,
      nascimento:$('nascimento').value, admissao:$('admissao').value, demissao:$('demissao').value,
      empresa:$('empresa').value, nte:$('nte').value, municipio:$('municipio').value.trim(),
      lotacao:$('lotacao').value, uee:$('uee').value, unidadeAdm:$('unidadeAdm').value,
      codigoSec:$('codigoSec').value, status:$('status').value
    };
  }
  function setForm(p){
    Object.entries(p).forEach(([k,v])=>{
      const el=$(k); if(el) el.value=v ?? '';
    });
    toggleConditional();
  }
  function clearForm(){
    document.querySelectorAll('#pessoa input,#pessoa select').forEach(el=>el.value='');
    toggleConditional();
    state.current=null;
    $('recordStatus').textContent='Novo cadastro';
  }

  $('savePerson').addEventListener('click',()=>{
    const p=getForm();
    if(!p.cpf || !p.nome){toast('Preencha CPF e Nome.');return}
    if(state.current){
      Object.assign(state.current,p);
      toast('Cadastro atualizado com sucesso.');
    }else{
      const codigo=Math.max(0,...state.people.map(x=>x.codigo))+1;
      const rec={codigo,...p};
      state.people.push(rec); state.current=rec;
      $('recordStatus').textContent=`Cadastro ${codigo}`;
      toast('Cadastro salvo com sucesso.');
    }
    renderPeople();
  });
  $('clearPerson').addEventListener('click',clearForm);
  $('newBtn').addEventListener('click',()=>{clearForm();openTab('pessoa');});
  $('editBtn').addEventListener('click',()=>{if(state.current) toast('Modo de edição ativado.');else toast('Selecione um cadastro em Localizar.');});
  $('deleteBtn').addEventListener('click',()=>{
    if(!state.current){toast('Nenhum cadastro selecionado.');return}
    $('confirmText').textContent=`Excluir o cadastro "${state.current.nome}"?`;
    $('confirmModal').classList.add('show');
    $('confirmYes').onclick=()=>{
      state.people=state.people.filter(x=>x!==state.current);
      state.current=null; clearForm(); renderPeople();
      $('confirmModal').classList.remove('show'); toast('Cadastro excluído.');
    };
  });
  $('refreshBtn').addEventListener('click',()=>{renderPeople();toast('Dados atualizados.');});
  $('backBtn').addEventListener('click',()=>openTab('pessoa'));
  $('nextBtn').addEventListener('click',()=>openTab('documentos'));
  $('next2Btn').addEventListener('click',()=>openTab('bancarios'));
  $('prevBtn').addEventListener('click',()=>openTab('localizar'));
  $('menuBtn').addEventListener('click',()=>toast('Menu de opções'));
  $('focusSearchBtn').addEventListener('click',()=>{openTab('localizar');setTimeout(()=>$('searchNome').focus(),50);});

  function renderPeople(){
    const qn=$('searchNome').value.toLowerCase().trim();
    const qc=$('searchCpf').value.replace(/\D/g,'');
    const qcod=$('searchCodigo').value.trim();
    const rows=state.people.filter(p=>
      (!qn || p.nome.toLowerCase().includes(qn)) &&
      (!qc || p.cpf.replace(/\D/g,'').includes(qc)) &&
      (!qcod || String(p.codigo).includes(qcod))
    );
    $('peopleBody').innerHTML=rows.map(p=>`
      <tr data-code="${p.codigo}" class="${state.current===p?'selected-row':''}">
        <td>${p.codigo}</td><td>${p.nome||'—'}</td><td>${p.sexo||'—'}</td>
        <td>${p.cpf||'—'}</td><td>${p.telefone1||'—'}</td><td>${p.email||'—'}</td>
        <td>${formatDate(p.nascimento)}</td><td>${p.empresa||'—'}</td>
        <td><span class="tag ${p.status==='inativo'?'inactive':''}">${p.status==='ativo'?'Ativo':p.status==='inativo'?'Inativo':'—'}</span></td>
      </tr>`).join('') || `<tr><td colspan="9" style="text-align:center;padding:45px">Nenhum cadastro encontrado</td></tr>`;
    document.querySelectorAll('#peopleBody tr[data-code]').forEach(tr=>{
      tr.addEventListener('click',()=>selectPerson(Number(tr.dataset.code)));
      tr.addEventListener('dblclick',()=>{selectPerson(Number(tr.dataset.code));openTab('pessoa');});
    });
  }
  function selectPerson(code){
    const p=state.people.find(x=>x.codigo===code); if(!p)return;
    state.current=p; setForm(p); $('recordStatus').textContent=`Cadastro ${p.codigo} — ${p.nome}`;
    renderPeople();
  }
  function formatDate(v){ if(!v)return '—'; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; }
  $('searchBtn').addEventListener('click',renderPeople);
  $('clearSearch').addEventListener('click',()=>{['searchNome','searchCpf','searchCodigo'].forEach(id=>$(id).value='');renderPeople();});
  $('searchNome').addEventListener('keydown',e=>{if(e.key==='Enter')renderPeople()});
  $('searchCpf').addEventListener('input',e=>e.target.value=formatCpf(e.target.value));

  // Documentos
  $('attachBtn').addEventListener('click',()=>$('fileInput').click());
  $('fileInput').addEventListener('change',e=>{
    [...e.target.files].forEach(file=>{
      state.docs.push({codigo:state.docs.length+1,nome:file.name,arquivo:file.name,data:new Date()});
    });
    renderDocs(); e.target.value='';
    toast('Documento(s) anexado(s).');
  });
  function renderDocs(){
    if(!state.docs.length){
      $('docsBody').innerHTML=`<tr><td colspan="5" style="text-align:center;padding:45px">Não existem documentos a serem exibidos</td></tr>`;
      return;
    }
    $('docsBody').innerHTML=state.docs.map(d=>`
      <tr><td>${d.codigo}</td><td>Documento</td><td>${d.arquivo}</td><td>${d.data.toLocaleDateString('pt-BR')}</td>
      <td><button class="btn danger" data-doc="${d.codigo}">Excluir</button></td></tr>`).join('');
    document.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>{
      const c=Number(b.dataset.doc);state.docs=state.docs.filter(d=>d.codigo!==c);renderDocs();toast('Documento removido.');
    });
  }

  // Bancários
  $('addBank').addEventListener('click',()=>$('bankModal').classList.add('show'));
  $('saveBank').addEventListener('click',()=>{
    const bank=$('bankName').value,type=$('accountType').value,agency=$('agency').value.trim(),account=$('account').value.trim();
    if(!bank||!type||!agency||!account){toast('Preencha todos os dados bancários.');return}
    state.banks.push({codigo:state.banks.length+1,bank,type,agency,account});
    renderBanks();
    ['bankName','accountType','agency','account'].forEach(id=>$(id).value='');
    $('bankModal').classList.remove('show');toast('Dados bancários adicionados.');
  });
  function renderBanks(){
    $('bankBody').innerHTML=state.banks.length?state.banks.map(b=>`
      <tr><td>${b.codigo}</td><td>${b.bank}</td><td>${b.type}</td><td>${b.agency}</td><td>${b.account}</td>
      <td><button class="btn danger" data-bank="${b.codigo}">Excluir</button></td></tr>`).join(''):
      `<tr><td colspan="6" style="text-align:center;padding:80px">Não existem dados a serem exibidos</td></tr>`;
    document.querySelectorAll('[data-bank]').forEach(btn=>btn.onclick=()=>{
      state.banks=state.banks.filter(b=>b.codigo!==Number(btn.dataset.bank));renderBanks();toast('Conta bancária removida.');
    });
  }
  $('refreshBanks').addEventListener('click',()=>{renderBanks();toast('Dados bancários atualizados.')});
  $('filterBanks').addEventListener('click',()=>toast('Filtro de contas bancárias'));

  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).classList.remove('show')));
  document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));

  // Inicialização
  setForm(state.people[0]);
  state.current=state.people[0];
  $('recordStatus').textContent=`Cadastro ${state.current.codigo} — ${state.current.nome}`;
  renderPeople();
  renderDocs();
  renderBanks();
})()
