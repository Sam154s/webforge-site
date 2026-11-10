// PLACEHOLDER for the price estimator widget. The coordinator replaces this whole file with the real built bundle (same name).
// It only defines the <wf-tool> element so /estimate can be checked locally. It does nothing else.
if (!customElements.get("wf-tool")) {
  customElements.define("wf-tool", class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: "open" }).innerHTML = "<p style=\"font:16px/1.5 system-ui;margin:0\">Placeholder estimator. The real tool replaces this file.</p>";
    }
  });
}
