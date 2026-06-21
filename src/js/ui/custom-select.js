import { KEYS_DB } from "../core/config.js";
import { state } from "../core/state.js";
import { t } from "./i18n.js";

export const renderCustomSelects = () => {
  const optionsHtml = (isFilter) => {
    const isEs = state.lang === "es";
    return [
      ...(isFilter ? [`<div data-val="all"><span>${t("optKeyAll")}</span></div>`] : []),
      ...KEYS_DB.map(k => `<div data-val="${k.val}"><span>${isEs ? k.eu : k.us}</span><span class="translucent">${isEs ? k.us : k.eu}</span></div>`)
    ].join("");
  };

  const keySigOptions = document.getElementById("customKeySigOptions");
  if (keySigOptions) {
    keySigOptions.innerHTML = optionsHtml(false);
    updateCustomSelectUI("customKeySig", document.getElementById("keySig").value);
  }

  const filterOptions = document.getElementById("customFilterKeyOptions");
  if (filterOptions) {
    filterOptions.innerHTML = optionsHtml(true);
    updateCustomSelectUI("customFilterKeySig", document.getElementById("filterKeySig").value);
  }
};

export const updateCustomSelectUI = (wrapperId, val) => {
  const wrapper = document.getElementById(wrapperId);
  const option = wrapper?.querySelector(`.select-items div[data-val="${val}"]`);
  if (!wrapper || !option) return;
  
  wrapper.querySelector(".select-selected").innerHTML = option.innerHTML;
  const targetInputId = wrapperId === "customKeySig" ? "keySig" : "filterKeySig";
  document.getElementById(targetInputId).value = val;
};

export const setupCustomSelect = (wrapperId, inputId, onSelect) => {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  
  const selected = wrapper.querySelector(".select-selected");
  const options = wrapper.querySelector(".select-items");
  const hiddenInput = document.getElementById(inputId);

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("active");
  });

  options.addEventListener("click", (e) => {
    const item = e.target.closest("div");
    if (!item?.hasAttribute("data-val")) return;
    
    const val = item.getAttribute("data-val");
    hiddenInput.value = val;
    updateCustomSelectUI(wrapperId, val);
    wrapper.classList.remove("active");
    if (onSelect) onSelect(val);
  });
};

document.addEventListener("click", () => {
  document.querySelectorAll(".custom-select.active").forEach(el => el.classList.remove("active"));
});