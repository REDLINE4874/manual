class ThemeBackgroundPicker extends HTMLElement {
  static PROFILE_STORAGE_KEY = "agenda_profile";
  static BACKGROUND_PROFILE_KEY = "backgroundColor";
  static SAVED_COLORS_PROFILE_KEY = "backgroundColors";
  static BACKGROUND_RESET_KEY = "backgroundReset";
  static BACKGROUND_MIN_LIGHTNESS = 15;
  static PANEL_MIN_LIGHTNESS = 20;
  static PANEL_LIGHTNESS_DIFFERENCE = 15;
  static MAX_LIGHTNESS = 30;
  static NEUTRAL_SATURATION_LIMIT = 30;
  static MAX_NEUTRAL_LIGHTNESS = 93;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) {
      document.addEventListener("click", this._handleDocumentClick);
      document.addEventListener("keydown", this._handleKeydown);
      document.addEventListener("theme-change", this._handleThemeChange);
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { border: 0 !important; }
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
          background: var(--bg, hsl(0 0% 93%));
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(15, 23, 42, .12);
          transition: transform .2s ease, border-color .2s ease;
        }
        .picker:hover { transform: translateY(-1px); border-color: var(--custom-accent-text, var(--accent-color, #111)); }
        .picker:focus-visible { outline: 3px solid var(--custom-accent-text, var(--input-focus-ring, rgba(17, 17, 17, .16))); outline-offset: 2px; }
        .swatch {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          background: var(--page-background, hsl(0 0% 93%));
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
          background: var(--bg, hsl(0 0% 93%));
          color: var(--text, var(--ink, #12232c));
          box-shadow: 0 14px 34px rgba(15, 23, 42, .2);
          font: 13px var(--font-body, Inter, sans-serif);
        }
        .popover[hidden] { display: none; }
        @media (max-width: 900px) {
          .popover {
            position: fixed;
            top: calc(72px + env(safe-area-inset-top, 0px));
            right: 12px;
            bottom: auto;
            box-sizing: border-box;
            max-height: calc(100dvh - 96px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
            overflow-y: auto;
            overscroll-behavior: contain;
          }
        }
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
          outline: 2px solid var(--custom-accent-text, var(--brand-teal, #003848));
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
        }
        .color-input {
          display: grid;
          width: 30px;
          height: 30px;
          padding: 3px;
          place-items: center;
          border: 1px solid var(--input-border, var(--border, rgba(15, 23, 42, .2)));
          border-radius: 9px;
          background: var(--bg, hsl(0 0% 93%));
          cursor: pointer;
        }
        .color-preview { width: 100%; height: 100%; border: 1px solid rgba(100,116,139,.38); border-radius: 5px; background: hsl(40 25% 93%); }
        .color-input:focus-visible, .hsl-slider:focus-visible, .hsl-input:focus-visible { outline: 2px solid var(--custom-accent-text, var(--brand-teal, #008ca1)); outline-offset: 2px; }
        .color-editor { display: grid; gap: 12px; margin-top: 12px; padding: 12px; border: 1px solid var(--border, rgba(15,23,42,.16)); border-radius: 12px; background: var(--bg-2, var(--bg, hsl(0 0% 93%))); }
        .color-editor[hidden] { display: none; }
        .color-result { display: flex; align-items: center; gap: 10px; }
        .result-preview { width: 48px; height: 48px; flex: none; border: 1px solid rgba(100,116,139,.45); border-radius: 9px; background: hsl(40 25% 93%); box-shadow: 0 2px 6px rgba(15,23,42,.16); }
        .result-details { display: grid; gap: 3px; }
        .result-label { color: var(--text-muted, #56636b); font: 600 10px var(--font-body, Inter, sans-serif); }
        .result-hex { color: var(--text, #12232c); font: 700 12px var(--font-body, Inter, sans-serif); letter-spacing: .35px; }
        .hsl-row { display: grid; gap: 9px; }
        .hsl-field { display: grid; grid-template-columns: 16px minmax(0, 1fr) 48px; align-items: center; gap: 8px; color: var(--text-muted, #56636b); font: 700 10px var(--font-body, Inter, sans-serif); }
        .hsl-slider { --slider-track: hsl(0 0% 70%); --slider-thumb-color: hsl(200 21% 20%); width: 100%; min-width: 0; height: 24px; margin: 0; padding: 0; appearance: none; border: 0; background: transparent; cursor: pointer; touch-action: pan-y; }
        .hsl-slider::-webkit-slider-runnable-track { height: 6px; border-radius: 99px; background: var(--slider-track); }
        .hsl-slider::-webkit-slider-thumb { width: 16px; height: 16px; margin-top: -5px; appearance: none; border: 2px solid #fff; border-radius: 50%; background: var(--slider-thumb-color); box-shadow: 0 1px 4px #0008; }
        .hsl-slider::-moz-range-track { height: 6px; border: 0; border-radius: 99px; background: var(--slider-track); }
        .hsl-slider::-moz-range-thumb { width: 12px; height: 12px; border: 2px solid #fff; border-radius: 50%; background: var(--slider-thumb-color); box-shadow: 0 1px 4px #0008; }
        .hsl-input { width: 48px; height: 30px; box-sizing: border-box; border: 1px solid var(--input-border, var(--border, rgba(15,23,42,.2))); border-radius: 8px; background: var(--input-bg, hsl(0 0% 93%)); color: var(--text, #12232c); text-align: center; font: 600 11px var(--font-body, Inter, sans-serif); }
        .hex-input {
          width: 90px;
          height: 36px;
          box-sizing: border-box;
          padding: 0 11px;
          border: 1px solid var(--input-border, var(--border, rgba(15, 23, 42, .2)));
          border-radius: 10px;
          background: var(--input-bg, hsl(0 0% 93%));
          color: var(--text, var(--ink, #12232c));
          font: 700 13px/1 var(--font-body, Inter, sans-serif);
          letter-spacing: .45px;
          text-transform: uppercase;
          text-align: center;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, .06);
          transition: border-color .16s ease, box-shadow .16s ease;
        }
        .hex-input:hover { border-color: var(--custom-accent-text, var(--brand-teal, #003848)); }
        .hex-input:focus-visible { outline: 0; border-color: var(--custom-accent-text, var(--brand-teal, #003848)); box-shadow: 0 0 0 3px var(--input-focus-ring, rgba(17, 17, 17, .16)); }
        .hex-input[aria-invalid="true"] { border-color: #c2413b; box-shadow: 0 0 0 3px rgba(194, 65, 59, .14); }
        .reset {
          margin-left: auto;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: var(--custom-accent-text, var(--brand-teal, #003848));
          font: 600 11px var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .save-color {
          width: 100%;
          margin-top: 10px;
          padding: 8px 10px;
          border: 1px solid var(--border, rgba(15, 23, 42, .2));
          border-radius: 8px;
          background: var(--custom-control-background, var(--brand-teal, #003848));
          color: var(--custom-control-text, #fff);
          font: 600 12px var(--font-body, Inter, sans-serif);
          cursor: pointer;
        }
        .save-color:hover { background: var(--custom-control-hover, var(--brand-teal-hover, #00556c)); }
        .save-color:disabled { cursor: default; opacity: .72; }
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
          <div class="custom-color">
            <button class="color-input" type="button" aria-label="Abrir selector personalizado" aria-expanded="false" aria-controls="custom-color-editor"><span class="color-preview"></span></button>
            <span>Personalizar</span>
          </div>
          <input class="hex-input" type="text" value="#F4F2EC" maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="Código hexadecimal del color" />
          <button class="reset" type="button">Restablecer</button>
        </div>
        <section class="color-editor" id="custom-color-editor" aria-label="Selector de color" hidden>
          <div class="color-result">
            <span class="result-preview" role="img" aria-label="Color resultante"></span>
            <span class="result-details"><span class="result-label">Color resultante</span><strong class="result-hex">#F4F2EC</strong></span>
          </div>
          <div class="hsl-row" aria-label="Valores HSL">
            <label class="hsl-field"><span>H</span><input class="hsl-slider" type="range" min="0" max="360" step="1" aria-label="Tono HSL" /><input class="hsl-input" type="number" min="0" max="360" aria-label="Valor de tono HSL" /></label>
            <label class="hsl-field"><span>S</span><input class="hsl-slider" type="range" min="0" max="100" step="1" aria-label="Saturación HSL" /><input class="hsl-input" type="number" min="0" max="100" aria-label="Valor de saturación HSL" /></label>
            <label class="hsl-field"><span>L</span><input class="hsl-slider" type="range" min="15" max="93" step="1" aria-label="Luminosidad HSL" /><input class="hsl-input" type="number" min="15" max="93" aria-label="Valor de luminosidad HSL" /></label>
          </div>
        </section>
        <button class="save-color" type="button">Guardar este color</button>
      </section>
    `;

    this.trigger = this.shadowRoot.querySelector(".picker");
    this.panel = this.shadowRoot.querySelector(".popover");
    this.colorInput = this.shadowRoot.querySelector(".color-input");
    this.colorPreview = this.shadowRoot.querySelector(".color-preview");
    this.colorEditor = this.shadowRoot.querySelector(".color-editor");
    this.resultPreview = this.shadowRoot.querySelector(".result-preview");
    this.resultHex = this.shadowRoot.querySelector(".result-hex");
    this.hslSliders = [...this.shadowRoot.querySelectorAll(".hsl-slider")];
    this.hslInputs = [...this.shadowRoot.querySelectorAll(".hsl-input")];
    this.hexInput = this.shadowRoot.querySelector(".hex-input");
    this.swatch = this.shadowRoot.querySelector(".swatch");
    this.savedColorsSection = this.shadowRoot.querySelector(".saved-section");
    this.savedColorsContainer = this.shadowRoot.querySelector(".saved-colors");
    this.saveColorButton = this.shadowRoot.querySelector(".save-color");
    this._clearStoredActiveBackground();
    this.savedColors = this._getSavedColors();
    const savedColor = this._getSavedColor();
    const initialColor = this._normalizeColor(savedColor || "#f4f2ec");
    this._lastAppliedColor = initialColor;
    if (typeof savedColor === "string" && savedColor.toLowerCase() !== initialColor) this._saveColor(initialColor);
    this._syncColorControls(initialColor);
    this._renderSavedColors();
    if (savedColor) this._applyColor(initialColor, false);

    this.trigger.addEventListener("click", () => this._setOpen(this.panel.hidden));
    this.colorInput.addEventListener("click", () => {
      this.colorEditor.hidden = !this.colorEditor.hidden;
      this.colorInput.setAttribute("aria-expanded", String(!this.colorEditor.hidden));
    });
    this.hslSliders.forEach((slider, index) => slider.addEventListener("input", () => {
      this.hslInputs[index].value = slider.value;
      this._applyHslControls();
    }));
    this.hslInputs.forEach((input) => input.addEventListener("change", () => this._applyHslControls()));
    this.hexInput.addEventListener("input", () => {
      const color = this.hexInput.value.trim();
      const isValid = /^#[0-9a-f]{6}$/i.test(color);
      this.hexInput.setAttribute("aria-invalid", String(!isValid));
      if (isValid) this._applySelectedColor(color);
    });
    this.shadowRoot.querySelector(".reset").addEventListener("click", () => {
      this._resetBackground();
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
      this._lastAppliedColor = this._normalizeColor("#f4f2ec");
      this._syncColorControls(this._lastAppliedColor);
      this._setOpen(false);
    };
    this._initialized = true;
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
    if (!isOpen) {
      this.colorEditor.hidden = true;
      this.colorInput.setAttribute("aria-expanded", "false");
    }
  }

  _syncColorControls(color) {
    const hsl = this._clampHsl(this._hexToHsl(color));
    const colorCss = this._hslToCss(hsl);
    const values = [hsl.hue, hsl.saturation, hsl.lightness];
    const maxLightness = hsl.saturation <= ThemeBackgroundPicker.NEUTRAL_SATURATION_LIMIT
      ? ThemeBackgroundPicker.MAX_NEUTRAL_LIGHTNESS
      : ThemeBackgroundPicker.MAX_LIGHTNESS;
    const sliderTracks = [
      "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
      `linear-gradient(to right, hsl(${hsl.hue} 0% ${hsl.lightness}%), hsl(${hsl.hue} 100% ${hsl.lightness}%))`,
      `linear-gradient(to right, hsl(${hsl.hue} ${hsl.saturation}% ${ThemeBackgroundPicker.BACKGROUND_MIN_LIGHTNESS}%), hsl(${hsl.hue} ${hsl.saturation}% ${maxLightness}%))`,
    ];
    this.colorPreview.style.background = colorCss;
    this.hexInput.value = color.toUpperCase();
    this.hexInput.setAttribute("aria-invalid", "false");
    this.swatch.style.background = colorCss;
    this.resultPreview.style.background = colorCss;
    this.resultHex.textContent = color.toUpperCase();
    this.hslInputs?.forEach((input, index) => {
      input.value = String(Math.round(values[index]));
    });
    if (this.hslInputs?.[2]) {
      this.hslInputs[2].max = String(maxLightness);
    }
    this.hslSliders?.forEach((slider, index) => {
      if (index === 2) slider.max = String(maxLightness);
      slider.value = String(Math.round(values[index]));
      slider.style.setProperty("--slider-track", sliderTracks[index]);
      slider.style.setProperty("--slider-thumb-color", colorCss);
      slider.setAttribute("aria-valuetext", index === 0
        ? `${Math.round(values[index])} grados`
        : `${Math.round(values[index])}%`);
    });
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
      option.style.backgroundColor = this._hslToCss(this._hexToHsl(color));
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
      if (!Array.isArray(colors)) return [];
      const normalizedColors = [...new Set(
        colors
          .filter((color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color))
          .map((color) => this._normalizeColor(color))
      )];
      if (JSON.stringify(colors) !== JSON.stringify(normalizedColors)) {
        profile[ThemeBackgroundPicker.SAVED_COLORS_PROFILE_KEY] = normalizedColors;
        localStorage.setItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY, JSON.stringify(profile));
      }
      return normalizedColors;
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

  _resetBackground() {
    this._saveColor("");
    this._clearCustomBackground();
    this._lastAppliedColor = this._normalizeColor("#f4f2ec");
    this._syncColorControls(this._lastAppliedColor);
  }

  _normalizeColor(value) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) value = "#f0eee8";
    const hsl = this._clampHsl(this._hexToHsl(value));
    return this._hslToHex(hsl.hue, hsl.saturation, hsl.lightness);
  }

  _clearStoredActiveBackground() {
    try {
      localStorage.removeItem("background-color");
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      if (profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY]) {
        delete profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY];
        localStorage.setItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (error) { /* Los colores favoritos siguen disponibles si storage falla. */ }
  }

  _getSavedColor() {
    // El fondo activo no se restaura automáticamente al abrir una nueva sesión.
    // Solo los colores favoritos continúan disponibles en el selector.
    return "";
  }

  _saveColor(color) {
    try {
      const profile = JSON.parse(localStorage.getItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY) || "{}");
      if (color) {
        profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY] = color;
        localStorage.setItem("background-color", color);
        localStorage.removeItem(ThemeBackgroundPicker.BACKGROUND_RESET_KEY);
      } else {
        delete profile[ThemeBackgroundPicker.BACKGROUND_PROFILE_KEY];
        localStorage.removeItem("background-color");
        localStorage.setItem(ThemeBackgroundPicker.BACKGROUND_RESET_KEY, "1");
      }
      localStorage.setItem(ThemeBackgroundPicker.PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) { /* El color sigue aplicándose visualmente. */ }
  }

  _hexToRgb(hex) {
    const value = hex.slice(1);
    return { red: parseInt(value.slice(0, 2), 16), green: parseInt(value.slice(2, 4), 16), blue: parseInt(value.slice(4, 6), 16) };
  }

  _hexToHsl(hex) {
    const { red, green, blue } = this._hexToRgb(hex);
    const r = red / 255, g = green / 255, b = blue / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const lightness = (max + min) / 2;
    let hue = 0, saturation = 0;
    if (delta) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else hue = 60 * ((r - g) / delta + 4);
    }
    return {
      hue: (hue + 360) % 360,
      saturation: saturation * 100,
      lightness: lightness * 100,
    };
  }

  _rgbToHex(red, green, blue) {
    return `#${[red, green, blue].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
  }

  _hslToHex(hue, saturation, lightness) {
    const h = ((hue % 360) + 360) % 360 / 60;
    const s = saturation / 100, l = lightness / 100;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs(h % 2 - 1));
    const m = l - chroma / 2;
    let rgb = [0, 0, 0];
    if (h < 1) rgb = [chroma, x, 0];
    else if (h < 2) rgb = [x, chroma, 0];
    else if (h < 3) rgb = [0, chroma, x];
    else if (h < 4) rgb = [0, x, chroma];
    else if (h < 5) rgb = [x, 0, chroma];
    else rgb = [chroma, 0, x];
    return this._rgbToHex(...rgb.map((channel) => (channel + m) * 255));
  }

  _hslToCss(hsl) {
    return `hsl(${hsl.hue.toFixed(1)} ${hsl.saturation.toFixed(1)}% ${hsl.lightness.toFixed(1)}%)`;
  }

  _clampHsl(hsl, minimumLightness = ThemeBackgroundPicker.BACKGROUND_MIN_LIGHTNESS) {
    const hueValue = Number(hsl.hue);
    const saturationValue = Number(hsl.saturation);
    const lightnessValue = Number(hsl.lightness);
    const hue = ((Number.isFinite(hueValue) ? hueValue : 0) % 360 + 360) % 360;
    const saturation = Math.max(0, Math.min(100, Number.isFinite(saturationValue) ? saturationValue : 0));
    const maxLightness = saturation <= ThemeBackgroundPicker.NEUTRAL_SATURATION_LIMIT
      ? ThemeBackgroundPicker.MAX_NEUTRAL_LIGHTNESS
      : ThemeBackgroundPicker.MAX_LIGHTNESS;
    const lightness = Math.max(
      minimumLightness,
      Math.min(maxLightness, Number.isFinite(lightnessValue) ? lightnessValue : minimumLightness)
    );
    return { hue, saturation, lightness };
  }

  _applyHslControls() {
    if (this.hslInputs.some((input) => input.value === "")) return;
    const values = this.hslInputs.map((input) => Number(input.value));
    const hsl = this._clampHsl({
      hue: values[0],
      saturation: values[1],
      lightness: values[2],
    });
    const color = this._hslToHex(hsl.hue, hsl.saturation, hsl.lightness);
    this._syncColorControls(color);
    this._applySelectedColor(color);
  }

  _surfaceHsl(baseHsl, lightness) {
    return this._hslToCss(this._clampHsl({ ...baseHsl, lightness }, ThemeBackgroundPicker.PANEL_MIN_LIGHTNESS));
  }

  _relativeLuminance(hex) {
    const { red, green, blue } = this._hexToRgb(hex);
    const values = [red, green, blue].map((value) => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
  }

  _minimumContrast(foreground, backgrounds) {
    const foregroundLuminance = this._relativeLuminance(foreground);
    return Math.min(...backgrounds.map((background) => {
      const backgroundLuminance = this._relativeLuminance(background);
      return (Math.max(foregroundLuminance, backgroundLuminance) + .05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + .05);
    }));
  }

  _highContrastText(backgrounds) {
    const darkText = "#000000";
    const lightText = "#ffffff";
    return this._minimumContrast(lightText, backgrounds) > this._minimumContrast(darkText, backgrounds)
      ? lightText
      : darkText;
  }

  _panelSurface(baseHsl, additionalBackgrounds = []) {
    const renderHex = (hsl) => this._hslToHex(
      Number(hsl.hue.toFixed(1)),
      Number(hsl.saturation.toFixed(1)),
      Number(hsl.lightness.toFixed(1))
    );
    const backgroundHex = renderHex(baseHsl);
    const preferredDirection = baseHsl.lightness >= 50 ? -1 : 1;
    const candidates = [preferredDirection, -preferredDirection].map((direction) => {
      const hsl = {
        ...baseHsl,
        lightness: Math.max(0, Math.min(100,
          baseHsl.lightness + direction * ThemeBackgroundPicker.PANEL_LIGHTNESS_DIFFERENCE
        )),
      };
      const textBackgrounds = [backgroundHex, ...additionalBackgrounds, renderHex(hsl)];
      const textColor = this._highContrastText(textBackgrounds);
      return {
        hsl,
        textBackgrounds,
        textColor,
        contrast: this._minimumContrast(textColor, textBackgrounds),
      };
    });
    return candidates.find((candidate) => candidate.contrast >= 4.5)
      || candidates.reduce((best, candidate) => candidate.contrast > best.contrast ? candidate : best);
  }

  _applyColor(color, persist) {
    const themeToggle = document.querySelector("theme-toggle");
    if (typeof themeToggle?.setTheme === "function") {
      themeToggle.setTheme("light", { persist: true });
    } else {
      document.body.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch (error) { /* El fondo personalizado sigue aplicándose. */ }
    }
    const root = document.documentElement;
    const backgroundHsl = this._clampHsl(this._hexToHsl(color));
    const isNeutralBackground = backgroundHsl.saturation <= ThemeBackgroundPicker.NEUTRAL_SATURATION_LIMIT;
    const panelBaseLightness = isNeutralBackground
      ? backgroundHsl.lightness
      : backgroundHsl.lightness >= ThemeBackgroundPicker.MAX_LIGHTNESS
        ? ThemeBackgroundPicker.MAX_LIGHTNESS + 2
        : Math.max(20, backgroundHsl.lightness - 3);
    const inputLightnessOffset = backgroundHsl.lightness >= 50 ? 20 : 5;
    const inputSurfaceHsl = this._clampHsl(
      { ...backgroundHsl, lightness: panelBaseLightness - inputLightnessOffset },
      ThemeBackgroundPicker.PANEL_MIN_LIGHTNESS
    );
    const renderedHex = (hsl) => this._hslToHex(
      Number(hsl.hue.toFixed(1)),
      Number(hsl.saturation.toFixed(1)),
      Number(hsl.lightness.toFixed(1))
    );
    const panelSurface = this._panelSurface(backgroundHsl, [renderedHex(inputSurfaceHsl)]);
    const surface = this._hslToCss(panelSurface.hsl);
    const surfaceAlt = surface;
    const inputSurface = this._hslToCss(inputSurfaceHsl);
    const controlBackground = this._surfaceHsl(backgroundHsl, isNeutralBackground ? 27 : 25);
    const controlHover = this._surfaceHsl(backgroundHsl, isNeutralBackground ? 24 : 22);
    const notesSurface = surface;
    const notesEditorSurface = surface;
    const textBackgrounds = panelSurface.textBackgrounds;
    const textColor = panelSurface.textColor;
    const isDarkSurface = textColor === "#ffffff";
    const controlHsl = this._clampHsl(
      { ...backgroundHsl, lightness: isNeutralBackground ? 27 : 25 },
      ThemeBackgroundPicker.PANEL_MIN_LIGHTNESS
    );
    const controlText = this._highContrastText([renderedHex(controlHsl)]);
    const accentCandidate = isDarkSurface ? "#ffffff" : "#003848";
    const goldCandidate = isDarkSurface ? "#f6d98b" : "#75570d";
    const dangerCandidate = isDarkSurface ? "#ff8da3" : "#b4234d";
    const accentText = this._minimumContrast(accentCandidate, textBackgrounds) >= 4.5 ? accentCandidate : textColor;
    const goldText = this._minimumContrast(goldCandidate, textBackgrounds) >= 4.5 ? goldCandidate : textColor;
    const dangerText = this._minimumContrast(dangerCandidate, textBackgrounds) >= 4.5 ? dangerCandidate : textColor;
    const notesText = textColor;
    const notesMuted = textColor;

    root.style.setProperty("--page-background", this._hslToCss(backgroundHsl));
    root.style.setProperty("--custom-navbar-background", surface);
    root.style.setProperty("--custom-sidebar-background", surface);
    root.style.setProperty("--custom-panel-background", surface);
    root.style.setProperty("--custom-panel-alt-background", surfaceAlt);
    root.style.setProperty("--custom-control-background", controlBackground);
    root.style.setProperty("--custom-control-hover", controlHover);
    root.style.setProperty("--custom-control-text", controlText);
    root.style.setProperty("--custom-accent-text", accentText);
    root.style.setProperty("--custom-gold-text", goldText);
    root.style.setProperty("--custom-danger-text", dangerText);
    root.style.setProperty("--bg-2", surface);
    root.style.setProperty("--bg", surface);
    root.style.setProperty("--bg-3", surfaceAlt);
    root.style.setProperty("--text", textColor);
    root.style.setProperty("--text-muted", textColor);
    root.style.setProperty("--border", isDarkSurface ? "hsl(0 0% 93% / .24)" : "hsl(215 50% 20% / .2)");
    root.style.setProperty("--input-bg", inputSurface);
    root.style.setProperty("--input-border", isDarkSurface ? "hsl(0 0% 93% / .26)" : "hsl(215 50% 20% / .22)");
    root.style.setProperty("--input-text", textColor);
    root.style.setProperty("--notes-surface", notesSurface);
    root.style.setProperty("--notes-editor-surface", notesEditorSurface);
    root.style.setProperty("--notes-text", notesText);
    root.style.setProperty("--notes-muted", notesMuted);
    root.style.setProperty("--shadow", isDarkSurface
      ? "0 16px 36px rgba(0, 0, 0, .42), 0 4px 12px rgba(0, 0, 0, .30)"
      : "0 16px 34px rgba(0, 0, 0, .20), 0 4px 10px rgba(0, 0, 0, .14)");
    root.style.setProperty("--shadow-nav", isDarkSurface
      ? "0 20px 46px rgba(0, 0, 0, .55), 0 6px 16px rgba(0, 0, 0, .40)"
      : "0 20px 44px rgba(0, 0, 0, .34), 0 6px 16px rgba(0, 0, 0, .22)");
    document.body.classList.add("custom-background");
    document.body.classList.toggle("custom-background-dark", isDarkSurface);
    document.body.classList.remove("dark-mode");
    this._syncColorControls(this._normalizeColor(color));
    if (persist) this._saveColor(this._normalizeColor(color));
  }

  _clearCustomBackground() {
    const root = document.documentElement;
    ["--page-background", "--custom-navbar-background", "--custom-sidebar-background", "--custom-panel-background", "--custom-panel-alt-background", "--custom-control-background", "--custom-control-hover", "--custom-control-text", "--custom-accent-text", "--custom-gold-text", "--custom-danger-text", "--bg", "--bg-2", "--bg-3", "--text", "--text-muted", "--border", "--input-bg", "--input-border", "--input-text", "--notes-surface", "--notes-editor-surface", "--notes-text", "--notes-muted", "--shadow", "--shadow-nav"].forEach((property) => root.style.removeProperty(property));
    document.body.classList.remove("custom-background", "custom-background-dark");
  }
}

customElements.define("theme-background-picker", ThemeBackgroundPicker);
