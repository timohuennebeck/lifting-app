(() => {
  if (customElements.get('muscle-map')) return;
  const cache = {};
  const load = src => cache[src] || (cache[src] = fetch(src).then(r => r.text()).then(t => t.replace(/<metadata>[\s\S]*?<\/metadata>/, '')));
  const CSS = `:host{display:block;width:100%;height:100%}
svg{width:100%;height:100%;display:block}
.sil{fill:#181818;stroke:#2C2C2C;stroke-width:2}.hd{fill:#2E2E2E}
.m,.fx{fill:#3E3E3E;transition:fill .18s}
.m.on{fill:var(--mm-accent,var(--accent,#DFFF1F))}
:host([interactive="true"]) .m{cursor:pointer}
:host([interactive="true"]) .m:not(.on):hover{fill:#4C4C4C}`;
  const PROPS = ['src', 'selected', 'accent', 'interactive', 'group', 'fit'];
  class MuscleMap extends HTMLElement {
    static get observedAttributes() { return PROPS; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() { this.render(); }
    attributeChangedCallback(n, a, b) { if (a === b) return; if (n === 'src' || n === 'fit') this.render(); else this.paint(); }
    async render() {
      const src = this.getAttribute('src'); if (!src) return;
      const t = await load(src); if (src !== this.getAttribute('src')) return;
      this.shadowRoot.innerHTML = `<style>${CSS}</style>` + t;
      const svg = this.shadowRoot.querySelector('svg'); if (!svg) return;
      svg.setAttribute('preserveAspectRatio', this.getAttribute('fit') === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet');
      const front = svg.dataset.view === 'front';
      svg.querySelectorAll('.fx').forEach(p => { const m = /M\s*([\d.]+)[\s,]+([\d.]+)/.exec(p.getAttribute('d') || ''); if (!m) return; const y = +m[2]; const id = front ? (y > 990 && y < 1070 ? 'knees' : y > 690 && y < 830 ? 'hands' : y > 1190 ? 'feet' : null) : (y > 700 && y < 830 ? 'hands' : y > 1300 ? 'feet' : null); if (id) { p.setAttribute('class', 'm'); p.dataset.muscle = id; } });
      svg.addEventListener('click', e => {
        if (this.getAttribute('interactive') !== 'true') return;
        const p = e.target.closest('.m'); if (!p) return;
        this.dispatchEvent(new CustomEvent('muscle-toggle', { bubbles: true, composed: true, detail: { group: this.getAttribute('group'), id: p.dataset.muscle } }));
      });
      this.paint();
    }
    paint() {
      const acc = this.getAttribute('accent'); if (acc) this.style.setProperty('--mm-accent', acc); else this.style.removeProperty('--mm-accent');
      const sel = new Set((this.getAttribute('selected') || '').split(/[\s,]+/).filter(Boolean));
      this.shadowRoot.querySelectorAll('.m').forEach(p => p.classList.toggle('on', sel.has(p.dataset.muscle)));
    }
  }
  PROPS.forEach(k => Object.defineProperty(MuscleMap.prototype, k, {
    get() { return this.getAttribute(k); },
    set(v) { if (v == null || v === false) this.removeAttribute(k); else this.setAttribute(k, String(v)); }
  }));
  customElements.define('muscle-map', MuscleMap);
})();
