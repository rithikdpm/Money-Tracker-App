// Offline version: data is saved on the phone (localStorage), no server needed.
const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
const KEY = 'moneyTrackerEntries';
let type = 'IN';
let filter = 'ALL';

// amounts are stored in paise (integers) so calculations are always exact
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
function balancePaise(list) {
  return list.reduce((sum, e) => sum + (e.type === 'IN' ? e.paise : -e.paise), 0);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function addEntry(entryType, amount, note) {
  const list = load();
  const paise = Math.round(amount * 100);
  if (entryType === 'OUT' && paise > balancePaise(list)) throw new Error('Not enough balance');
  list.unshift({
    id: Date.now(),
    type: entryType,
    paise,
    note: (note || '').trim(),
    createdAt: new Date().toISOString()
  });
  save(list);
}

function deleteEntry(id) {
  const list = load();
  const e = list.find(x => x.id === id);
  if (!e) throw new Error('Entry not found');
  if (e.type === 'IN' && balancePaise(list) - e.paise < 0) throw new Error('Deleting this would make the balance negative');
  save(list.filter(x => x.id !== id));
}

function renderList(items) {
  const el = $('#list');
  el.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No transactions yet';
    el.appendChild(li);
    return;
  }
  items.forEach(e => {
    const isIn = e.type === 'IN';
    const li = document.createElement('li');

    const ico = document.createElement('div');
    ico.className = 'ico ' + (isIn ? 'in' : 'out');
    ico.textContent = isIn ? '↙' : '↗';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = e.note || (isIn ? 'Amount added' : 'Amount sent');
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = new Date(e.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    meta.append(note, date);

    const amt = document.createElement('div');
    amt.className = 'amt';
    amt.style.color = isIn ? 'var(--in)' : 'var(--out)';
    amt.textContent = (isIn ? '+' : '−') + fmt(e.paise / 100);

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Delete');
    del.onclick = () => {
      if (!confirm('Delete this entry?')) return;
      try { deleteEntry(e.id); refresh(); toast('Deleted'); }
      catch (err) { toast(err.message); }
    };

    li.append(ico, meta, amt, del);
    el.appendChild(li);
  });
}

function refresh() {
  const list = load();
  $('#balance').textContent = fmt(balancePaise(list) / 100);
  renderList(filter === 'ALL' ? list : list.filter(e => e.type === filter));
}

function setType(t) {
  type = t;
  $('#btnIn').classList.toggle('active', t === 'IN');
  $('#btnOut').classList.toggle('active', t === 'OUT');
}
$('#btnIn').onclick = () => setType('IN');
$('#btnOut').onclick = () => setType('OUT');

document.querySelectorAll('.filters button').forEach(b => {
  b.onclick = () => {
    filter = b.dataset.f;
    document.querySelectorAll('.filters button').forEach(x => x.classList.toggle('active', x === b));
    refresh();
  };
});

$('#add').onclick = () => {
  const amount = parseFloat($('#amount').value);
  if (!(amount > 0)) { toast('Enter a valid amount'); return; }
  try {
    addEntry(type, amount, $('#note').value);
    $('#amount').value = '';
    $('#note').value = '';
    refresh();
    toast(type === 'IN' ? 'Added to balance' : 'Deducted from balance');
  } catch (err) {
    toast(err.message);
  }
};

refresh();
