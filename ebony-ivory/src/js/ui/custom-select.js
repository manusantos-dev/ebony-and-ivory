import { KEYS_DB } from "../core/config.js";
import { state } from "../core/state.js";
import { t } from "./i18n.js";

export function renderCustomSelects() {
  const optionsHtml = (isFilter) => {
    let html = isFilter ? `<div data-val="all"><span>${t("optKeyAll")}</span></div>` : "";
    KEYS_DB.forEach((k) => {
      html += `<div data-val="${k.val}"><span>${state.lang === "es" ? k.eu : k.us}</span><span class="translucent">${state.lang === "es" ? k.us : k.eu}</span></div>`;
    });
    return html;
  };

  const keySigOptions = document.getElementById("customKeySigOptions");
  if (!keySigOptions) return;

  keySigOptions.innerHTML = optionsHtml(false);
  updateCustomSelectUI("customKeySig", document.getElementById("keySig").value);

  document.getElementById("customFilterKeyOptions").innerHTML = optionsHtml(true);
  updateCustomSelectUI("customFilterKeySig", document.getElementById("filterKeySig").value);
}

export function updateCustomSelectUI(wrapperId, val) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  const option = wrapper.querySelector(`.select-items div[data-val="${val}"]`);
  if (!option) return;
  wrapper.querySelector(".select-selected").innerHTML = option.innerHTML;
  document.getElementById(wrapperId === "customKeySig" ? "keySig" : "filterKeySig").value = val;
}

export function setupCustomSelect(wrapperId, inputId, onSelect) {
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
    if (!item || !item.hasAttribute("data-val")) return;
    const val = item.getAttribute("data-val");
    hiddenInput.value = val;
    updateCustomSelectUI(wrapperId, val);
    wrapper.classList.remove("active");
    onSelect(val);
  });
}

document.addEventListener("click", () => {
  document.querySelectorAll(".custom-select.active").forEach((el) => el.classList.remove("active"));
});
