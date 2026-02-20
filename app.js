/* ── preserveQueryParams ─────────────────────────────────── */
// Reads ?id= and ?sync from current URL.
// For SPA hash-navigation, rewrites the href to carry those params forward.
// Usage: call from onclick on every nav link.
function preserveQueryParams(link) {
    const currentParams = new URLSearchParams(window.location.search);
    const id = currentParams.get('id');
    const isSync = window.location.href.includes('sync');

    if (id || isSync) {
        const href = link.getAttribute('href');
        // href is a hash like "#forms" — reconstruct full URL with params
        const page = href.replace('#', '');
        const newUrl = new URL(window.location.href);
        if (id) newUrl.searchParams.set('id', id);
        if (isSync) newUrl.searchParams.set('sync', '');
        newUrl.hash = page;
        window.location.href = newUrl.toString();
        return false;
    }
    return true; // no params to preserve, let default hash nav happen
}

/* ── changeFieldId ───────────────────────────────────────── */
// Appends a random suffix to the field's id on change.
function changeFieldId(field) {
    var suffix = Math.floor(Math.random() * 1000);
    field.id = field.id + '_' + suffix;
    console.log('[changeFieldId] New id:', field.id, '| name stays:', field.name);
    var display = document.getElementById('dynamic-id-display');
    if (display) display.textContent = 'Current ID: ' + field.id;
}

/* ── SPA Router ──────────────────────────────────────────── */
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.add('active');
    document.getElementById('current-page-name').textContent = page;

    // Update URL: preserve existing query params + update hash
    const currentParams = new URLSearchParams(window.location.search);
    const newUrl = window.location.pathname + (currentParams.toString() ? '?' + currentParams.toString() : '') + '#' + page;
    window.history.pushState({ page }, 'VWO QA TestBed – ' + page, newUrl);

    // Trigger page-specific init
    if (page === 'shadow') setupShadowDOMs();
    if (page === 'canvas') initCanvases();
    if (page === 'tables') initTable();
    if (page === 'interactions') initInteractions();
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigate(link.dataset.page);
    });
});

document.getElementById('nav-toggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
});

// Handle hash on load
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigate(hash);
    updateViewportSize();
    initStandardForm();
    initDynamicForm();
    initCustomForm();
    initMultiStep();
    initInfiniteScroll();
    initTimer();
    initCustomSlider();
    initTagInput();
});

window.addEventListener('resize', updateViewportSize);
function updateViewportSize() {
    const el = document.getElementById('viewport-size');
    if (el) el.textContent = `${window.innerWidth}×${window.innerHeight}`;
}

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg, duration = 2500) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

/* ── VWO Goal Tracking Stub ──────────────────────────────── */
function trackGoal(goalKey) {
    console.log('[VWO] Goal tracked:', goalKey);
    showToast(`Goal tracked: ${goalKey}`);
}

/* ── Standard Form ───────────────────────────────────────── */
function initStandardForm() {
    const form = document.getElementById('standard-form');
    if (!form) return;

    const textarea = document.getElementById('txt-textarea');
    const charCount = document.getElementById('char-count');
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            charCount.textContent = `${textarea.value.length} / 500`;
        });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;

        const name = document.getElementById('txt-name');
        const errName = document.getElementById('err-name');
        if (!name.value.trim()) { errName.textContent = 'Name is required'; valid = false; }
        else errName.textContent = '';

        const email = document.getElementById('txt-email');
        const errEmail = document.getElementById('err-email');
        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { errEmail.textContent = 'Valid email required'; valid = false; }
        else errEmail.textContent = '';

        const result = document.getElementById('form-result');
        if (valid) {
            const data = Object.fromEntries(new FormData(form));
            result.innerHTML = `<strong>Form submitted!</strong><pre>${JSON.stringify(data, null, 2)}</pre>`;
            result.classList.remove('hidden', 'error');
            trackGoal('standard_form_submit');
        } else {
            result.textContent = 'Please fix the errors above.';
            result.classList.remove('hidden');
            result.classList.add('error');
        }
    });
}

/* ── Dynamic Form ────────────────────────────────────────── */
function handleAccountType(val) {
    ['individual', 'business', 'enterprise'].forEach(t => {
        document.getElementById(`${t}-fields`).classList.add('hidden');
    });
    if (val) document.getElementById(`${val}-fields`).classList.remove('hidden');
}

let dynFieldCount = 1;
function addDynField() {
    dynFieldCount++;
    const container = document.getElementById('dynamic-fields-container');
    const row = document.createElement('div');
    row.className = 'dynamic-field-row';
    row.id = `field-row-${dynFieldCount}`;
    row.innerHTML = `<input type="text" name="dynField[]" placeholder="Field ${dynFieldCount}" class="dyn-input" />
    <button type="button" class="btn btn-danger btn-sm" onclick="removeDynField(this)">✕</button>`;
    container.appendChild(row);
}
function removeDynField(btn) {
    const row = btn.closest('.dynamic-field-row');
    if (document.querySelectorAll('.dynamic-field-row').length > 1) row.remove();
}

function loadAjaxContent() {
    const result = document.getElementById('ajax-result');
    result.textContent = 'Loading...';
    // Simulate fetch with setTimeout
    setTimeout(() => {
        const items = ['Product A — $29.99', 'Product B — $49.99', 'Product C — $99.99'];
        result.innerHTML = `<strong>Loaded ${items.length} items:</strong><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }, 1000);
}

function initDynamicForm() {
    const form = document.getElementById('dynamic-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        showToast('Dynamic form submitted!');
    });
}

/* ── Multi-Step Form ─────────────────────────────────────── */
let currentStep = 1;
function initMultiStep() {
    const form = document.getElementById('multistep-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const result = document.getElementById('ms-result');
        result.innerHTML = '<strong>✓ Registration complete!</strong>';
        result.classList.remove('hidden');
        trackGoal('multistep_form_complete');
    });
}
function nextStep(from) {
    document.getElementById(`step-${from}`).classList.remove('active');
    document.getElementById(`dot-${from}`).classList.remove('active');
    currentStep = from + 1;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`dot-${currentStep}`).classList.add('active');
    if (currentStep === 3) {
        document.getElementById('ms-summary').innerHTML =
            `<p><strong>Name:</strong> ${document.getElementById('ms-name').value}</p>
       <p><strong>Email:</strong> ${document.getElementById('ms-email').value}</p>
       <p><strong>Company:</strong> ${document.getElementById('ms-company').value}</p>
       <p><strong>Role:</strong> ${document.getElementById('ms-role').value}</p>`;
    }
}
function prevStep(from) {
    document.getElementById(`step-${from}`).classList.remove('active');
    document.getElementById(`dot-${from}`).classList.remove('active');
    currentStep = from - 1;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`dot-${currentStep}`).classList.add('active');
}

/* ── Custom Form ─────────────────────────────────────────── */
function initCustomForm() {
    // Tag input
    initTagInput();
}

function submitCustomForm(e) {
    e.preventDefault();
    const result = document.getElementById('custom-form-result');
    const name = document.getElementById('cf-name').value;
    const rating = document.getElementById('cf-rating').getAttribute('value');
    const toggle = document.getElementById('cf-toggle').hasAttribute('checked');
    const color = document.getElementById('selected-color').value;
    const tags = document.getElementById('tags-hidden').value;
    result.innerHTML = `<strong>Custom Form Submitted:</strong>
    <ul>
      <li>Name: ${name}</li>
      <li>Rating: ${rating} stars</li>
      <li>Notifications: ${toggle}</li>
      <li>Color: ${color || 'none'}</li>
      <li>Tags: ${tags || 'none'}</li>
    </ul>`;
    result.classList.remove('hidden');
    trackGoal('custom_form_submit');
}

function selectColor(el) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('selected-color').value = el.dataset.color;
    document.getElementById('selected-color-label').textContent = el.dataset.color;
}

function incrementProgress() {
    const el = document.getElementById('custom-progress-1');
    let val = parseInt(el.getAttribute('value')) || 0;
    val = Math.min(100, val + 10);
    el.setAttribute('value', val);
    if (val >= 100) showToast('Upload complete!');
}

/* ── Custom Slider ───────────────────────────────────────── */
function initCustomSlider() {
    const track = document.getElementById('custom-slider-track');
    const thumb = document.getElementById('custom-slider-thumb');
    const valDisplay = document.getElementById('custom-slider-value');
    if (!track) return;
    let dragging = false;
    thumb.addEventListener('mousedown', () => { dragging = true; });
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const rect = track.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = Math.round((x / rect.width) * 100);
        thumb.style.left = `${x - 10}px`;
        if (valDisplay) valDisplay.textContent = pct;
    });
    document.addEventListener('mouseup', () => { dragging = false; });
}

/* ── Tag Input ───────────────────────────────────────────── */
const tags = [];
function initTagInput() {
    const input = document.getElementById('tag-input');
    if (!input) return;
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.value.trim().replace(',', '');
            if (val && !tags.includes(val)) {
                tags.push(val);
                renderTags();
                input.value = '';
            }
        }
    });
}
function renderTags() {
    const display = document.getElementById('tags-display');
    const hidden = document.getElementById('tags-hidden');
    if (!display) return;
    display.innerHTML = tags.map((t, i) =>
        `<span class="tag">${t}<span class="tag-remove" onclick="removeTag(${i})">×</span></span>`
    ).join('');
    if (hidden) hidden.value = tags.join(',');
}
function removeTag(i) { tags.splice(i, 1); renderTags(); }

/* ── Canvas ──────────────────────────────────────────────── */
let drawCtx, isDrawing = false, lastX = 0, lastY = 0;
let particleAnimId = null;

function initCanvases() {
    initDrawCanvas();
    initChartCanvas();
    initClickCanvas();
}

function initDrawCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas || canvas._initialized) return;
    canvas._initialized = true;
    drawCtx = canvas.getContext('2d');
    drawCtx.fillStyle = '#fff';
    drawCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    canvas.addEventListener('mousemove', e => {
        if (!isDrawing) return;
        const tool = document.getElementById('canvas-tool').value;
        const color = document.getElementById('canvas-color').value;
        const size = document.getElementById('canvas-size').value;
        drawCtx.strokeStyle = tool === 'eraser' ? '#fff' : color;
        drawCtx.lineWidth = size;
        drawCtx.lineCap = 'round';
        if (tool === 'pen' || tool === 'eraser') {
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.stroke();
        }
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });
}

function clearCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    drawCtx.fillStyle = '#fff';
    drawCtx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'canvas-drawing.png';
    a.href = canvas.toDataURL();
    a.click();
}

function initChartCanvas() {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas || canvas._initialized) return;
    canvas._initialized = true;
    drawBarChart(canvas, [0, 0, 0, 0, 0]);
}

function animateChart() {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas) return;
    const data = [65, 80, 45, 90, 70];
    const current = [0, 0, 0, 0, 0];
    const step = () => {
        let done = true;
        for (let i = 0; i < data.length; i++) {
            if (current[i] < data[i]) { current[i] = Math.min(data[i], current[i] + 2); done = false; }
        }
        drawBarChart(canvas, current);
        if (!done) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function drawBarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const barW = 80, gap = 40, startX = 60, maxH = 220, baseY = 260;
    data.forEach((val, i) => {
        const x = startX + i * (barW + gap);
        const h = (val / 100) * maxH;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, baseY - h, barW, h);
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, baseY + 18);
        ctx.fillText(val + '%', x + barW / 2, baseY - h - 6);
    });
    // Axis
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(50, baseY); ctx.lineTo(canvas.width - 20, baseY); ctx.stroke();
}

function initClickCanvas() {
    const canvas = document.getElementById('click-canvas');
    if (!canvas || canvas._initialized) return;
    canvas._initialized = true;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click anywhere on this canvas', canvas.width / 2, canvas.height / 2);

    canvas.addEventListener('click', e => {
        const x = e.offsetX, y = e.offsetY;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        const log = document.getElementById('click-log');
        if (log) log.innerHTML += `<span>Click at (${x}, ${y})</span> `;
        trackGoal('canvas_click');
    });
}

function startParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 360},70%,60%)`
    }));
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        particleAnimId = requestAnimationFrame(loop);
    }
    if (particleAnimId) cancelAnimationFrame(particleAnimId);
    loop();
}
function stopParticles() {
    if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }
}

/* ── Table ───────────────────────────────────────────────── */
const tableData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'][i % 10] + ' ' + String.fromCharCode(65 + (i % 26)),
    email: `user${i + 1}@example.com`,
    role: ['QA Engineer', 'Developer', 'Designer', 'PM', 'DevOps'][i % 5],
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending'
}));
let filteredData = [...tableData];
let sortCol = 'id', sortDir = 1, currentPage = 1, pageSize = 10;

function initTable() {
    if (document.getElementById('table-body').children.length > 0) return;
    renderTable();
}

function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const rows = filteredData.slice(start, start + pageSize);
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = rows.map(r => `
    <tr id="row-${r.id}">
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td><a href="mailto:${r.email}">${r.email}</a></td>
      <td>${r.role}</td>
      <td><span class="status-badge status-${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editRow(${r.id})">Edit</button>
        <button class="btn btn-sm btn-danger"  onclick="deleteRow(${r.id})">Del</button>
      </td>
    </tr>`).join('');
    renderPagination();
}

function sortTable(col) {
    if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = 1; }
    filteredData.sort((a, b) => {
        const av = a[col], bv = b[col];
        return typeof av === 'number' ? (av - bv) * sortDir : String(av).localeCompare(String(bv)) * sortDir;
    });
    currentPage = 1;
    renderTable();
}

function filterTable(q) {
    const lq = q.toLowerCase();
    filteredData = tableData.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(lq))
    );
    currentPage = 1;
    renderTable();
}

function changePageSize(size) { pageSize = parseInt(size); currentPage = 1; renderTable(); }

function renderPagination() {
    const total = Math.ceil(filteredData.length / pageSize);
    const pag = document.getElementById('table-pagination');
    pag.innerHTML = Array.from({ length: total }, (_, i) =>
        `<button class="page-btn ${i + 1 === currentPage ? 'active' : ''}" onclick="goPage(${i + 1})">${i + 1}</button>`
    ).join('');
}

function goPage(p) { currentPage = p; renderTable(); }
function editRow(id) { showToast(`Editing row ${id}`); }
function deleteRow(id) {
    filteredData = filteredData.filter(r => r.id !== id);
    renderTable();
    showToast(`Row ${id} deleted`);
}

/* ── Interactions ────────────────────────────────────────── */
function initInteractions() {
    initInfiniteScroll();
}

function openModal() { document.getElementById('modal-overlay').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
function submitModalForm(e) {
    e.preventDefault();
    closeModal();
    showToast('Modal form submitted: ' + document.getElementById('modal-input').value);
    trackGoal('modal_form_submit');
}

function switchTab(n) {
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', i + 1 === n);
        b.setAttribute('aria-selected', i + 1 === n);
    });
    document.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i + 1 === n));
}

/* Drag & Drop */
let draggedId = null;
function dragStart(e) { draggedId = e.target.id; e.dataTransfer.effectAllowed = 'move'; }
function dragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function drop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const el = document.getElementById(draggedId);
    if (el) {
        const placeholder = document.getElementById('drop-placeholder');
        if (placeholder) placeholder.remove();
        e.currentTarget.appendChild(el);
        showToast(`Dropped: ${el.textContent}`);
        trackGoal('drag_drop');
    }
}

/* Infinite Scroll */
let infiniteCount = 0;
function initInfiniteScroll() {
    const list = document.getElementById('infinite-items');
    if (!list || list.children.length > 0) return;
    loadMoreItems();
    const container = document.getElementById('infinite-list');
    container.addEventListener('scroll', () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            loadMoreItems();
        }
    });
}
function loadMoreItems() {
    const list = document.getElementById('infinite-items');
    const loader = document.getElementById('infinite-loader');
    if (!list) return;
    loader.textContent = 'Loading...';
    setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            infiniteCount++;
            const li = document.createElement('li');
            li.id = `inf-item-${infiniteCount}`;
            li.textContent = `Item #${infiniteCount} — loaded at ${new Date().toLocaleTimeString()}`;
            list.appendChild(li);
        }
        loader.textContent = 'Scroll for more...';
    }, 400);
}

/* Clipboard */
function copyToClipboard() {
    const input = document.getElementById('copy-input');
    navigator.clipboard.writeText(input.value).then(() => {
        document.getElementById('copy-status').textContent = ' ✓ Copied!';
        setTimeout(() => { document.getElementById('copy-status').textContent = ''; }, 2000);
    }).catch(() => {
        input.select();
        document.execCommand('copy');
        document.getElementById('copy-status').textContent = ' ✓ Copied (fallback)!';
    });
}

/* Geolocation */
function getLocation() {
    const result = document.getElementById('geo-result');
    if (!navigator.geolocation) { result.textContent = 'Geolocation not supported.'; return; }
    result.textContent = 'Fetching location...';
    navigator.geolocation.getCurrentPosition(
        pos => { result.textContent = `Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}, Accuracy: ${pos.coords.accuracy}m`; },
        err => { result.textContent = `Error: ${err.message}`; }
    );
}

/* Storage */
function setStorage() {
    const k = document.getElementById('storage-key').value;
    const v = document.getElementById('storage-value').value;
    if (!k) return;
    localStorage.setItem(k, v);
    sessionStorage.setItem(k, v);
    document.getElementById('storage-result').textContent = `Set: "${k}" = "${v}"`;
}
function getStorage() {
    const k = document.getElementById('storage-key').value;
    const lv = localStorage.getItem(k);
    const sv = sessionStorage.getItem(k);
    document.getElementById('storage-result').textContent = `localStorage: "${lv}" | sessionStorage: "${sv}"`;
}
function clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
    document.getElementById('storage-result').textContent = 'All storage cleared.';
}

/* Countdown Timer */
let timerSeconds = 30, timerInterval = null;
function initTimer() {
    updateTimerDisplay();
}
function updateTimerDisplay() {
    const el = document.getElementById('countdown-display');
    if (el) el.textContent = `00:${String(timerSeconds).padStart(2, '0')}`;
}
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (timerSeconds <= 0) { clearInterval(timerInterval); timerInterval = null; showToast('Timer done!'); return; }
        timerSeconds--;
        updateTimerDisplay();
    }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); timerInterval = null; }
function resetTimer() { pauseTimer(); timerSeconds = 30; updateTimerDisplay(); }
