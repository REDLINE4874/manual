class ThemeBackgroundPicker extends HTMLElement {
  static PROFILE_STORAGE_KEY = "agenda_profile";
  static BACKGROUND_PROFILE_KEY = "backgroundColor";
  static SAVED_COLORS_PROFILE_KEY = "backgroundColors";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: relative; display: inline-flex; }
        .picker {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid rgba(148, 163, 184, .35);
          border-radius: 999px;
          background: var(--bg, #fff);
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(15, 23, 42, .12);
          transition: transform .2s ease, border-color .2s ease;
        }
        .picker:hover { transform: translateY(-1px); border-color: var(--accent-color, #111); }
        .picker:focus-visible { outline: 3px solid var(--input-focus-ring, rgba(17, 17, 17, .16)); outline-offset: 2px; }
        .swatch {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          background: var(--page-background, #f2f2f2);
          border: 1px solid rgba(100, 116, 139, .45);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .7), 0 1px 3px rgba(0, 0, 0, .2);
        }
        .popover {
          position: absolute;
          z-index: 120;
          top: calc(100% + 10px);
          right: 0;
          width: min(280px, calc(100vw - 32px));
          padding: 16px;
          border: 1px solid var(--sidebar-border, rgba(15, 23, 42, .14));
          border-radius: 14px;
          background: var(--bg, #fff);
          color: var(--text, var(--ink, #12232c));
          box-shadow: 0 14px 34px rgba(15, 23, 42, .2);
          font: 13px var(--font-body, Inter, sans-serif);
        }
        .popover[hidden] { display: none; }
        .popover-title {
          margin: 0 0 12px;
          color: var(--custom-accent-text, var(--ink, #12232c));
          font: 700 14px var(--font-display, sans-serif);
        }
        .saved-section[hidden] { display: none; }
        .saved-section { margin: 0 0 14px; }
        .saved-title {
          margin: 0 0 9px;
          color: var(--text-muted, var(--ink-soft, #4b5b63));
          font: 700 10px var(--font-body, Inter, sans-serif);
          letter-spacing: .7px;
          text-transform: uppercase;
        }
        .saved-colors {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }
        .saved-item { position: relative; width: 32px; height: 32px; }
        .saved-option {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid rgba(100, 116, 139, .35);
          border-radius: 9px;
          cursor: pointer;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .55);
        }
        .saved-option[aria-pressed="true"] {
          outline: 2px solid var(--custom-accent-text, var(--ink, #12232c));
          outline-offset: 2px;
        }
        .remove-color {
          position: absolute;
          top: -6px;
          right: -6px;
          display: grid;
          width: 16px;
          height: 16px;
          padding: 0;
          place-items: center;
          border: 1px solid var(--bg, #fff);
          border-radius: 50%;
          background: var(--text-muted, #4b5b63);
          color: var(--bg, #fff);
          font: 700 12px/1 var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .saved-option:focus-visible,
        .remove-color:focus-visible,
        .save-color:focus-visible {
          outline: 2px solid var(--custom-accent-text, var(--ink, #12232c));
          outline-offset: 2px;
        }
        .custom-color:focus-within,
        .hex-input:focus-visible,
        .reset:focus-visible {
          outline: 2px solid var(--brand-teal, #003848);
          outline-offset: 2px;
        }
        .custom-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid var(--border, rgba(15, 23, 42, .14));
        }
        .custom-color {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text, var(--ink, #12232c));
          font: 600 12px var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .color-input {
          width: 28px;
          height: 28px;
          padding: 2px;
          border: 1px solid var(--border, rgba(15, 23, 42, .2));
          border-radius: 8px;
          background: var(--bg, #fff);
          cursor: pointer;
        }
        .hex-input {
          width: 76px;
          height: 30px;
          box-sizing: border-box;
          padding: 0 7px;
          border: 1px solid var(--border, rgba(15, 23, 42, .2));
          border-radius: 7px;
          background: var(--input-bg, #fff);
          color: var(--text, var(--ink, #12232c));
          font: 12px var(--font-body, Inter, sans-serif);
          text-transform: uppercase;
        }
        .reset {
          margin-left: auto;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: var(--brand-teal, #003848);
          font: 600 11px var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .save-color {
          width: 100%;
          margin-top: 10px;
          padding: 8px 10px;
          border: 1px solid var(--border, rgba(15, 23, 42, .2));
          border-radius: 8px;
          background: var(--bg, #fff);
          color: var(--custom-accent-text, var(--ink, #12232c));
          font: 600 12px var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .save-color:hover { background: var(--bg-3, #f4f2ec); }
        .save-color:disabled { cursor: default; opacity: .6; }
        @media (max-width: 420px) {
          .popover { right: -56px; }
        }
      </style>
      <button class="picker" type="button" aria-label="Elegir color de fondo" aria-expanded="false" aria-controls="background-picker-panel" title="Elegir color de fondo">
        <span class="swatch" aria-hidden="true"></span>
      </button>
      <section class="popover" id="background-picker-panel" aria-label="Selector de color de fondo" hidden>
        <h2 class="popover-title">Fondo personalizado</h2>
        <section class="saved-section" aria-label="Colores guardados" hidden>
          <h3 class="saved-title">Mis colores guardados</h3>
          <div class="saved-colors"></div>
        </section>
        <div class="custom-row">
          <label class="custom-color">
            <input class="color-input" type="color" aria-label="Elegir otro color" />
            <span>Personalizar</span>
          </label>
          <input class="hex-input" type="text" value="#F4F2EC" maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="Código hexadecimal del color" />
          <button class="reset" type="button">Restablecer</button>
        </div>
        <button class="save-color" type="button">Guardar este color</button>
      </section>
    `;

    this.trigger = this.shadowRoot.querySelector(".picker");
    this.panel = this.shadowRoot.querySelector(".popover");
    this.colorInput = this.shadowRoot.querySelector(".color-input");
    this.hexInput = this.shadowRoot.querySelector(".hex-input");
    this.swatch = this.shadowRoot.querySelector(".swatch");
    this.savedColorsSection = this.shadowRoot.querySelector(".saved-section");
    this.savedColorsContainer = this.shadowRoot.querySelector(".saved-colors");
    this.saveColorButton = this.shadowRoot.querySelector(".save-color");
    this.savedColors = this._getSavedColors();
    const savedColor = this._getSavedColor();
    const initialColor = this._normalizeColor(savedColor || "#f4f2ec");
    this._lastAppliedColor = initialColor;
    this._syncColorControls(initialColor);
    this._renderSavedColors();
    if (savedColor) this._applyColor(initialColor, false);

    this.trigger.addEventListener("click", () => this._setOpen(this.panel.hidden));
    this.colorInput.addEventListener("input", () => this._applySelectedColor(this.colorInput.value));
    this.colorInput.addEventListener("change", () => this._applySelectedColor(this.colorInput.value));
    this.hexInput.addEventListener("input", () => {
      const color = this.hexInput.value.trim();
      const isValid = /^#[0-9a-f]{6}$/i.test(color);
      this.hexInput.setAttribute("aria-invalid", String(!isValid));
      if (isValid) this._applySelectedColor(color);
    });
    this.shadowRoot.querySelector(".reset").addEventListener("click", () => {
      this._applySelectedColor("#F4F2EC");
      this._setOpen(false);
      this.trigger.focus();
    });
    this.saveColorButton.addEventListener("click", () => {
      if (!this.savedColors.includes(this._lastAppliedColor)) {
        this.savedColors.push(this._lastAppliedColor);
        this._saveSavedColors();
        this._renderSavedColors();
      }
    });
    this._handleDocumentClick = (event) => {
      if (!event.composedPath().includes(this)) this._setOpen(false);
    };
    this._handleKeydown = (event) => {
      if (event.key === "Escape" && !this.panel.hidden) {
        this._setOpen(false);
        this.trigger.focus();
      }
    };
    this._handleThemeChange = (event) => {
      if (event.detail?.theme !== "dark") return;
      this._saveColor("");
      this._clearCustomBackground();
      this._lastAppliedColor = "#f4f2ec";
      this._syncColorControls(this._lastAppliedColor);
      this._setOpen(false);
    };
    document.addEventListener("click", this._handleDocumentClick);
    document.addEventListener("keydown", this._handleKeydown);
    document.addEventListener("theme-change", this._handleThemeChange);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._handleDocumentClick);
    document.removeEventListener("keydown", this._handleKeydown);
    document.removeEventListener("theme-change", this._handleThemeChange);
  }

  _setOpen(isOpen) {
    this.panel.hidden = !isOpen;
    this.trigger.setAttribute("aria-expanded", String(isOpen));
  }

  _syncColorControls(color) {
    this.colorInput.value = color;
    this.hexInput.value = color.toUpperCase();
    this.hexInput.setAttribute("aria-invalid", "false");
    this.swatch.style.background = color;
    this.savedColorsContainer?.querySelectorAll(".saved-option").forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.color === color.toLowerCase()));
    });
    if (this.saveColorButton) this.saveColorButton.disabled = this.savedColors?.includes(color.toLowerCase()) || false;
  }

  _renderSavedColors() {
    this.savedColorsContainer.replaceChildren();
    this.savedColorsSection.hidden = this.savedColors.length === 0;
    this.savedColors.forEach((color, index) => {
      const item = document.createElement("div");
      item.className = "saved-item";

      const option = document.createElement("button");
      option.className = "saved-option";
      option.type = "button";
      option.dataset.color = color;
      option.style.backgroundColor = color;
      option.setAttribute("aria-label", `Usar color guardado ${color.toUpperCase()}`);
      option.setAttribute("aria-pressed", String(color === this._lastAppliedColor));
      option.title = color.toUpperCase();
      option.addEventListener("click", () => {
        this._applySelectedColor(color);
        this._setOpen(false);
        this.trigger.focus();
      });

      const remove = document.createElement("button");
      remove.className = "remove-color";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Eliminar color guardado ${color.toUpperCase()}`);
      remove.addEventListener("click", () => {
        this.savedColors.splice(index, 1);
        this._saveSavedColors();
        this._renderSavedColors();
      });

      item.append(option, remove);
      this.savedColorsContainer.append(item);
    });
    this._syncColorControls(this._lastAppliedColor);
  }

  _getSavedColors() {
    try {
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      const colors = profile[ThemeBackgroundPicker.SAVED_COLORS_PROFILE_KEY];
      return Array.isArray(colors)
        ? [...new Set(colors.filter((color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)).map((color) => color.toLowerCase()))]
        : [];
    } catch (error) {
      return [];
    }
  }

  _saveSavedColors() {
    try {
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      profile[ThemeBackgroundPicker.SAVED_COLORS_PROFILE_KEY] = this.savedColors;
      localStorage.setItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) { /* Los colores guardados siguen disponibles durante esta sesión. */ }
  }

  _applySelectedColor(color) {
    const normalizedColor = this._normalizeColor(color);
    if (!/^#[0-9a-f]{6}$/i.test(color) || normalizedColor === this._lastAppliedColor) return;
    this._lastAppliedColor = normalizedColor;
    this._syncColorControls(normalizedColor);
    this._applyColor(normalizedColor, true);
  }

  _normalizeColor(value) { return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : "#f4f2ec"; }

  _getSavedColor() {
    try {
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      if (profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY]) return profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY];
      const legacyColor = localStorage.getItem("background-color");
      if (legacyColor) { this._saveColor(legacyColor); return legacyColor; }
    } catch (error) { /* El selector sigue funcionando si storage está bloqueado. */ }
    return "";
  }

  _saveColor(color) {
    try {
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      if (color) {
        profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY] = color;
        localStorage.setItem("background-color", color);
      } else {
        delete profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY];
        localStorage.removeItem("background-color");
      }
      localStorage.setItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) { /* El color sigue aplicándose visualmente. */ }
  }

  _hexToRgb(hex) {
    const value = hex.slice(1);
    return { red: parseInt(value.slice(0, 2), 16), green: parseInt(value.slice(2, 4), 16), blue: parseInt(value.slice(4, 6), 16) };
  }

  _mix(hex, target, amount) {
    const sourceRgb = this._hexToRgb(hex);
    const targetRgb = this._hexToRgb(target);
    const channel = (source, destination) => Math.round(source + (destination - source) * amount);
    const toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(channel(sourceRgb.red, targetRgb.red))}${toHex(channel(sourceRgb.green, targetRgb.green))}${toHex(channel(sourceRgb.blue, targetRgb.blue))}`;
  }

  _luminance(hex) {
    const { red, green, blue } = this._hexToRgb(hex);
    const values = [red, green, blue].map((value) => {
      const channel = value / 255;
      return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
  }

  _applyColor(color, persist) {
    const root = document.documentElement;
    const surface = this._mix(color, "#000000", .14);
    const surfaceAlt = this._mix(color, "#000000", .22);
    const inputSurface = this._mix(color, "#000000", .1);
    const isDarkSurface = this._luminance(surface) < .52;
    const accentText = isDarkSurface ? "#ffffff" : "#003848";
    const goldText = isDarkSurface ? "#f6d98b" : "#75570d";

    root.style.setProperty("--page-background", color);
    root.style.setProperty("--custom-navbar-background", color);
    root.style.setProperty("--custom-sidebar-background", surface);
    root.style.setProperty("--custom-accent-text", accentText);
    root.style.setProperty("--custom-gold-text", goldText);
    root.style.setProperty("--bg-2", color);
    root.style.setProperty("--bg", surface);
    root.style.setProperty("--bg-3", surfaceAlt);
    root.style.setProperty("--text", isDarkSurface ? "#f5f7fa" : "#101828");
    root.style.setProperty("--text-muted", isDarkSurface ? "#e2e8f0" : "#3f4652");
    root.style.setProperty("--border", isDarkSurface ? "rgba(255, 255, 255, .24)" : "rgba(15, 23, 42, .2)");
    root.style.setProperty("--input-bg", inputSurface);
    root.style.setProperty("--input-border", isDarkSurface ? "rgba(255, 255, 255, .26)" : "rgba(15, 23, 42, .22)");
    root.style.setProperty("--input-text", isDarkSurface ? "#f5f7fa" : "#101828");
    root.style.setProperty("--shadow", isDarkSurface ? "0 16px 36px rgba(0, 0, 0, .42)" : "0 3px 14px rgba(15, 23, 42, .18)");
    document.body.classList.add("custom-background");
    document.body.classList.toggle("custom-background-dark", isDarkSurface);
    document.body.classList.remove("dark-mode");
    this._syncColorControls(this._normalizeColor(color));
    if (persist) this._saveColor(color);
  }

  _clearCustomBackground() {
    const root = document.documentElement;
    ["--page-background", "--custom-navbar-background", "--custom-sidebar-background", "--custom-accent-text", "--custom-gold-text", "--bg", "--bg-2", "--bg-3", "--text", "--text-muted", "--border", "--input-bg", "--input-border", "--input-text", "--shadow"].forEach((property) => root.style.removeProperty(property));
    document.body.classList.remove("custom-background", "custom-background-dark");
  }
}

customElements.define("theme-background-picker", ThemeBackgroundPicker);
