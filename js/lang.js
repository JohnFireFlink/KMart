// js/lang.js

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

async function loadLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    const translations = await response.json();

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[key]) {
        el.placeholder = translations[key];
      }
    });
  } catch (err) {
    console.error("Error loading language file:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let lang = getQueryParam("lang") || localStorage.getItem("selectedLang") || "en";
  loadLanguage(lang);

  const switcher = document.getElementById("languageSwitcher");
  if (switcher) {
    switcher.value = lang;
    switcher.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("selectedLang", newLang);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("lang", newLang);
      window.location.href = currentUrl.toString();
    });
  }
});
