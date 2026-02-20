/* ============================================================
   components.js  —  Web Components / Custom Elements
   ============================================================ */

/* ── 1. <star-rating> ─────────────────────────────────────── */
class StarRating extends HTMLElement {
  constructor() {
    super();
    this._value = 0;
    this._max = 5;
    this.attachShadow({ mode: 'open' });
  }
  static get observedAttributes() { return ['value', 'max']; }
  attributeChangedCallback(name, _, newVal) {
    if (name === 'value') this._value = parseInt(newVal) || 0;
    if (name === 'max')   this._max   = parseInt(newVal) || 5;
    this.render();
  }
  connectedCallback() {
    this._value = parseInt(this.getAttribute('value')) || 0;
    this._max   = parseInt(this.getAttribute('max'))   || 5;
    this.render();
  }
  render() {
    const stars = Array.from({ length: this._max }, (_, i) => {
      const filled = i < this._value ? '★' : '☆';
      return `<span class="star" data-index="${i+1}" style="font-size:1.8rem;cursor:pointer;color:${i < this._value ? '#f59e0b' : '#cbd5e1'}">${filled}</span>`;
    }).join('');
    this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;gap:2px}</style>${stars}`;
    this.shadowRoot.querySelectorAll('.star').forEach(s => {
      s.addEventListener('click', () => {
        this._value = parseInt(s.dataset.index);
        this.setAttribute('value', this._value);
        this.dispatchEvent(new CustomEvent('rating-change', { detail: this._value, bubbles: true, composed: true }));
        const out = document.getElementById('star-rating-output');
        if (out) out.textContent = this._value;
      });
    });
  }
}
customElements.define('star-rating', StarRating);


/* ── 2. <toggle-switch> ───────────────────────────────────── */
class ToggleSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  static get observedAttributes() { return ['checked', 'label']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  get checked() { return this.hasAttribute('checked'); }
  set checked(val) { val ? this.setAttribute('checked','') : this.removeAttribute('checked'); }
  render() {
    const isChecked = this.hasAttribute('checked');
    const label = this.getAttribute('label') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:inline-flex; align-items:center; gap:0.5rem; cursor:pointer; user-select:none; }
        .track { width:44px; height:24px; background:${isChecked ? '#3b82f6' : '#cbd5e1'}; border-radius:12px; position:relative; transition:background 0.2s; }
        .thumb { width:20px; height:20px; background:#fff; border-radius:50%; position:absolute; top:2px; left:${isChecked ? '22px' : '2px'}; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.3); }
        .lbl { font-size:0.9rem; }
      </style>
      <div class="track"><div class="thumb"></div></div>
      <span class="lbl">${label}</span>`;
    this.shadowRoot.querySelector('.track').addEventListener('click', () => {
      this.checked = !this.checked;
      this.render();
      this.dispatchEvent(new CustomEvent('toggle-change', { detail: this.checked, bubbles: true, composed: true }));
    });
  }
}
customElements.define('toggle-switch', ToggleSwitch);


/* ── 3. <custom-progress> ─────────────────────────────────── */
class CustomProgress extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  static get observedAttributes() { return ['value', 'max', 'label']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const value = parseInt(this.getAttribute('value')) || 0;
    const max   = parseInt(this.getAttribute('max'))   || 100;
    const label = this.getAttribute('label') || 'Progress';
    const pct   = Math.min(100, Math.round((value / max) * 100));
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        .wrap { font-size:0.85rem; margin-bottom:0.25rem; display:flex; justify-content:space-between; }
        .bar-bg { background:#e2e8f0; border-radius:4px; height:16px; overflow:hidden; }
        .bar-fill { background:#3b82f6; height:100%; width:${pct}%; transition:width 0.4s; border-radius:4px; }
      </style>
      <div class="wrap"><span>${label}</span><span>${pct}%</span></div>
      <div class="bar-bg"><div class="bar-fill"></div></div>`;
  }
}
customElements.define('custom-progress', CustomProgress);


/* ── 4. <custom-accordion> + <accordion-item> ─────────────── */
class AccordionItem extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    const title = this.getAttribute('title') || 'Item';
    const content = this.innerHTML;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:4px; }
        .header { padding:0.75rem 1rem; cursor:pointer; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; font-weight:600; }
        .header:hover { background:#eff6ff; }
        .body { padding:0.75rem 1rem; display:none; }
        .body.open { display:block; }
        .icon { transition:transform 0.2s; }
        .icon.open { transform:rotate(180deg); }
      </style>
      <div class="header"><span>${title}</span><span class="icon">▼</span></div>
      <div class="body">${content}</div>`;
    this.shadowRoot.querySelector('.header').addEventListener('click', () => {
      const body = this.shadowRoot.querySelector('.body');
      const icon = this.shadowRoot.querySelector('.icon');
      body.classList.toggle('open');
      icon.classList.toggle('open');
    });
  }
}
customElements.define('accordion-item', AccordionItem);

class CustomAccordion extends HTMLElement {
  connectedCallback() { /* just a container */ }
}
customElements.define('custom-accordion', CustomAccordion);


/* ── 5. <slotted-card> (Shadow DOM with slots) ────────────── */
class SlottedCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; max-width:400px; }
        .card-header { background:#1e293b; color:#fff; padding:1rem; font-size:1.1rem; font-weight:bold; }
        .card-body   { padding:1rem; }
        .card-footer { padding:0.75rem 1rem; background:#f8fafc; border-top:1px solid #e2e8f0; }
      </style>
      <div class="card-header"><slot name="title">Default Title</slot></div>
      <div class="card-body"><slot name="content">Default content.</slot></div>
      <div class="card-footer"><slot name="action"></slot></div>`;
  }
}
customElements.define('slotted-card', SlottedCard);


/* ── 6. Shadow DOM setup (open / closed / form / nested) ──── */
function setupShadowDOMs() {
  /* Open shadow root */
  const openHost = document.getElementById('open-shadow-host');
  if (openHost) {
    const openRoot = openHost.attachShadow({ mode: 'open' });
    openRoot.innerHTML = `
      <style>p{color:#1d4ed8;} button{padding:0.4rem 0.8rem;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;}</style>
      <p>I am inside an <strong>open</strong> shadow root.</p>
      <button id="shadow-open-btn" onclick="this.textContent='Clicked!'">Click me (shadow)</button>
      <input type="text" id="shadow-open-input" placeholder="Input inside open shadow" style="margin-top:0.5rem;padding:0.4rem;border:1px solid #ccc;border-radius:4px;width:100%"/>`;
  }

  /* Closed shadow root */
  const closedHost = document.getElementById('closed-shadow-host');
  if (closedHost) {
    const closedRoot = closedHost.attachShadow({ mode: 'closed' });
    closedRoot.innerHTML = `
      <style>p{color:#dc2626;} button{padding:0.4rem 0.8rem;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;}</style>
      <p>I am inside a <strong>closed</strong> shadow root. <code>element.shadowRoot === null</code></p>
      <button onclick="this.textContent='Clicked!'">Click me (closed shadow)</button>
      <input type="text" placeholder="Input inside closed shadow" style="margin-top:0.5rem;padding:0.4rem;border:1px solid #ccc;border-radius:4px;width:100%"/>`;
  }

  /* Shadow DOM with form */
  const formHost = document.getElementById('shadow-form-host');
  if (formHost) {
    const formRoot = formHost.attachShadow({ mode: 'open' });
    formRoot.innerHTML = `
      <style>
        form{display:flex;flex-direction:column;gap:0.75rem;}
        label{font-weight:600;font-size:0.9rem;}
        input,select{padding:0.4rem 0.6rem;border:1px solid #ccc;border-radius:4px;width:100%;max-width:300px;}
        button{padding:0.5rem 1rem;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;width:fit-content;}
        #shadow-form-result{color:green;font-size:0.85rem;}
      </style>
      <form id="shadow-inner-form">
        <label>Name <input type="text" id="shadow-name" placeholder="Enter name" /></label>
        <label>Plan
          <select id="shadow-plan">
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </label>
        <label><input type="checkbox" id="shadow-agree" /> I agree to terms</label>
        <button type="submit">Submit (Shadow Form)</button>
        <div id="shadow-form-result"></div>
      </form>`;
    formRoot.querySelector('#shadow-inner-form').addEventListener('submit', e => {
      e.preventDefault();
      formRoot.querySelector('#shadow-form-result').textContent =
        `Submitted: ${formRoot.querySelector('#shadow-name').value} / ${formRoot.querySelector('#shadow-plan').value}`;
    });
  }

  /* Nested shadow DOM */
  const nestedHost = document.getElementById('nested-shadow-host');
  if (nestedHost) {
    const outerRoot = nestedHost.attachShadow({ mode: 'open' });
    outerRoot.innerHTML = `
      <style>:host{display:block;border:2px solid #3b82f6;padding:1rem;border-radius:6px;}</style>
      <p><strong>Outer Shadow Root</strong></p>
      <div id="inner-host" style="border:2px dashed #ef4444;padding:0.75rem;border-radius:4px;margin-top:0.5rem;"></div>`;
    const innerHost = outerRoot.getElementById('inner-host');
    const innerRoot = innerHost.attachShadow({ mode: 'open' });
    innerRoot.innerHTML = `
      <style>p{color:#dc2626;}</style>
      <p><strong>Inner Shadow Root</strong> (nested inside outer shadow)</p>
      <button style="padding:0.3rem 0.6rem;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;"
              onclick="this.textContent='Nested click!'">Click nested button</button>`;
  }
}
