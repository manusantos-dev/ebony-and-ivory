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

  const keySigOptions = document.getElementById("customKeySigOptions");
  if (keySigOptions) {
    keySigOptions.innerHTML = optionsHtml(false);
    const val = (document.getElementById("keySig") as HTMLInputElement)?.value || "C";
    updateCustomSelectUI("customKeySig", val);
  }

  const filterOptions = document.getElementById("customFilterKeyOptions");
  if (filterOptions) {
    filterOptions.innerHTML = optionsHtml(true);
    const val = (document.getElementById("filterKeySig") as HTMLInputElement)?.value || "all";
    updateCustomSelectUI("customFilterKeySig", val);
  }

  const codexFilterOptions = document.getElementById("customFilterCodexKeyOptions");
  if (codexFilterOptions) {
    codexFilterOptions.innerHTML = optionsHtml(true);
    const val = (document.getElementById("filterCodexKeySig") as HTMLInputElement)?.value || "all";
    updateCustomSelectUI("customFilterCodexKeySig", val);
  }
};

export const updateCustomSelectUI = (wrapperId: string, val: string): void => {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  let option = wrapper.querySelector(`.select-items div[data-val="${val}"]`);
  if (!option && val === "all") option = wrapper.querySelector(`.select-items div[data-val="all"]`);
  if (!option) return;

  const selected = wrapper.querySelector(".select-selected");
  if (selected) selected.innerHTML = option.innerHTML;

  let targetInputId = "";
  if (wrapperId === "customKeySig") targetInputId = "keySig";
  else if (wrapperId === "customFilterCodexKeySig") targetInputId = "filterCodexKeySig";
  else if (wrapperId === "customFilterKeySig") targetInputId = "filterKeySig";

  if (targetInputId) {
    const targetInput = document.getElementById(targetInputId) as HTMLInputElement;
    if (targetInput) targetInput.value = val;
  }
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
