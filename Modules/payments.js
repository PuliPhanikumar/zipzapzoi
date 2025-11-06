// modules/payments.js
// This module extends window.API if present; otherwise defines its own mock APIs.

(function(){
  // attach or extend shared API
  window.API = window.API || {};
  const API = window.API;

  API.mockDelay = API.mockDelay || (ms=>new Promise(r=>setTimeout(r,ms)));

  API.getPayments = API.getPayments || (async function({ page=1, perPage=20, q='', status='' } = {}){
    await API.mockDelay(120);
    let list = JSON.parse(localStorage.getItem('zzz_payments_v1') || 'null');
    if(!list){
      list = [
        { id:'TXN-12345', user:'john.doe@example.com', amount:150.00, date: Date.now()-3600e3*72, status:'Completed', item:'Premium Listing Boost', fees:4.65, gateway:'Stripe' },
        { id:'TXN-12346', user:'jane.smith@example.com', amount:45.50, date: Date.now()-3600e3*96, status:'Pending', item:'Featured Ad', fees:1.10, gateway:'Stripe' },
        { id:'TXN-12347', user:'mike.j@example.com', amount:99.99, date: Date.now()-3600e3*120, status:'Failed', item:'Subscription', fees:0, gateway:'Stripe' },
      ];
      localStorage.setItem('zzz_payments_v1', JSON.stringify(list));
    }

    let results = list.filter(r => {
      if(status && r.status !== status) return false;
      if(q && !(`${r.id} ${r.user} ${r.item}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });

    return {
      items: results.slice((page-1)*perPage, page*perPage),
      total: results.length,
      page,
      perPage
    };
  });

  API.getPaymentDetail = API.getPaymentDetail || (async function(id){
    await API.mockDelay(80);
    const list = JSON.parse(localStorage.getItem('zzz_payments_v1') || '[]');
    return list.find(x=>x.id===id) || null;
  });

  API.issueRefund = API.issueRefund || (async function(id, note=''){
    await API.mockDelay(250);
    let list = JSON.parse(localStorage.getItem('zzz_payments_v1') || '[]');
    list = list.map(x => x.id===id ? {...x, status:'Refunded', refundedAt:Date.now(), refundNote:note } : x);
    localStorage.setItem('zzz_payments_v1', JSON.stringify(list));
    return { ok:true };
  });

  API.exportPaymentReceipt = API.exportPaymentReceipt || (async function(id){
    await API.mockDelay(80);
    const list = JSON.parse(localStorage.getItem('zzz_payments_v1') || '[]');
    return list.find(x=>x.id===id) || null;
  });

  // Payment module UI wiring
  async function renderPayments({ page=1, q='', status='' } = {}){
    const res = await API.getPayments({ page, perPage: 50, q, status });
    const tb = document.getElementById('paymentsTableBody');
    if(!tb) return;
    tb.innerHTML = '';
    res.items.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="p-3 font-medium">${p.id}</td>
        <td class="p-3">${p.user}</td>
        <td class="p-3 font-bold">$${p.amount.toFixed(2)}</td>
        <td class="p-3">${new Date(p.date).toLocaleString()}</td>
        <td class="p-3"><span class="${p.status==='Completed' ? 'text-green-700' : p.status==='Pending' ? 'text-yellow-700' : 'text-red-700'}">${p.status}</span></td>
        <td class="p-3 text-right"><button data-id="${p.id}" class="viewBtn px-3 py-1 border rounded">View</button></td>`;
      tb.appendChild(tr);
    });
    document.getElementById('paymentsCount').textContent = `Showing ${res.items.length} of ${res.total} entries`;

    tb.querySelectorAll('.viewBtn').forEach(b=>{
      b.addEventListener('click', async ()=>{
        const id = b.dataset.id;
        const detail = await API.getPaymentDetail(id);
        openDrawer(detail);
      });
    });
  }

  function openDrawer(detail){
    if(!detail) return alert('Detail not found.');
    document.getElementById('drawerTitle').textContent = detail.id;
    document.getElementById('drawerSub').textContent = `${detail.user} • ${new Date(detail.date).toLocaleString()}`;
    document.getElementById('drawerBody').innerHTML = `
      <div class="space-y-2">
        <div><strong>Amount:</strong> $${detail.amount.toFixed(2)}</div>
        <div><strong>Item:</strong> ${detail.item}</div>
        <div><strong>Gateway:</strong> ${detail.gateway}</div>
        <div><strong>Fees:</strong> $${(detail.fees||0).toFixed(2)}</div>
        <div><strong>Status:</strong> ${detail.status}</div>
        <div><strong>Notes:</strong> ${(detail.refundNote||'—')}</div>
      </div>
    `;
    document.getElementById('paymentDrawer').classList.remove('hidden');

    document.getElementById('downloadReceipt').onclick = async ()=>{
      const p = await API.exportPaymentReceipt(detail.id);
      if(!p) return alert('No receipt');
      const csv = `id,user,amount,date,item,gateway\n${p.id},${p.user},${p.amount},${new Date(p.date).toISOString()},${p.item},${p.gateway}`;
      const blob = new Blob([csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${p.id}_receipt.csv`; a.click(); URL.revokeObjectURL(url);
    };

    document.getElementById('issueRefund').onclick = async ()=>{
      if(!confirm('Issue refund for '+detail.id+'?')) return;
      await API.issueRefund(detail.id, 'Refund via admin-module');
      await renderPayments();
      document.getElementById('paymentDrawer').classList.add('hidden');
      alert('Refund issued (mock).');
    };

    document.getElementById('closePaymentDrawer').onclick = ()=> document.getElementById('paymentDrawer').classList.add('hidden');
  }

  // Controls
  document.addEventListener('click', (e)=>{
    if(e.target && e.target.id === 'btnExportPayments'){
      (async ()=>{
        const res = await API.getPayments({ q:'', status:'', page:1, perPage:1000 });
        const csv = ['id,user,amount,date,status,item'].concat(res.items.map(i=>`${i.id},${i.user},${i.amount},${new Date(i.date).toISOString()},${i.status},${i.item}`)).join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'payments_export.csv'; a.click(); URL.revokeObjectURL(url);
      })();
    }
  });

  // search/filter wiring (delegate safe - element may not exist on load)
  function wireSearch(){
    const s = document.getElementById('paymentsSearch');
    const f = document.getElementById('paymentsFilter');
    if(s) s.addEventListener('input', ()=> renderPayments({ q: s.value.trim(), status: f ? f.value : '' }));
    if(f) f.addEventListener('change', ()=> renderPayments({ q: s ? s.value.trim() : '', status: f.value }));
  }

  // init when module DOM present
  function tryInit(){
    if(!document.getElementById('paymentsTableBody')) return;
    wireSearch();
    renderPayments();
  }

  // If module was added after script load, wait for DOM to be ready + tryInit, also observe
  document.addEventListener('DOMContentLoaded', tryInit);
  // also try after a short delay (mounted asynchronously)
  setTimeout(tryInit, 300);
})();
