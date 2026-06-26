// INIT: Custom UI Select Component Logic
import { KEYS_DB } from "../core/config";
import { state } from "../core/state";
import { t } from "./i18n";

export const renderCustomSelects = (): void => {
  const optionsHtml = (isFilter: boolean): string => {
    const isEs = state.lang === "es";
    return [
      ...(isFilter ? [`<div data-val="all"><span>${t("optAll")}</span></div>`] : []),
      ...KEYS_DB.map(k => `<div data-val="${k.val}"><span>${isEs ? k.eu : k.us}</span><span class="translucent">${isEs ? k.us : k.eu}</span></div>`)
    ].join("");
  };

  const update = (optId: string, inputId: string, isFilter: boolean) => {
    const opts = document.getElementById(optId);
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (opts && input) {
      opts.innerHTML = optionsHtml(isFilter);
      updateCustomSelectUI(optId.replace("Options", ""), input.value);
    }
  };

  update("customKeySigOptions", "keySig", false);
  update("customFilterKeyOptions", "filterKeySig", true);
  update("customFilterCodexKeyOptions", "filterCodexKeySig", true);
};

export const updateCustomSelectUI = (wrapperId: string, val: string): void => {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  let option = wrapper.querySelector(`.select-items div[data-val="${val}"]`);
  if (!option && val === "all") option = wrapper.querySelector(`.select-items div[data-val="all"]`);
  if (!option) return;

  const selected = wrapper.querySelector(".select-selected");
  if (selected) selected.innerHTML = option.innerHTML;

  const targetInputId = wrapperId === "customKeySig" ? "keySig" : "filterKeySig";
  const targetInput = document.getElementById(targetInputId) as HTMLInputElement;
  if (targetInput) targetInput.value = val;
};

export const setupCustomSelect = (wrapperId: string, inputId: string, onSelect?: (val: string) => void): void => {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const selected = wrapper.querySelector(".select-selected");
  const options = wrapper.querySelector(".select-items");
  const hiddenInput = document.getElementById(inputId) as HTMLInputElement;

  if (selected) {
    selected.addEventListener("click", (e) => {
      e.stopPropagation();
      wrapper.classList.toggle("active");
    });
  }

  if (options) {
    options.addEventListener("click", (e) => {
      const item = (e.target as HTMLElement).closest("div");
      if (!item?.hasAttribute("data-val")) return;

      const val = item.getAttribute("data-val") || "";
      if (hiddenInput) hiddenInput.value = val;
      updateCustomSelectUI(wrapperId, val);
      wrapper.classList.remove("active");
      if (onSelect) onSelect(val);
    });
  }
};

document.addEventListener("click", () => document.querySelectorAll(".custom-select.active").forEach(el => el.classList.remove("active")));
