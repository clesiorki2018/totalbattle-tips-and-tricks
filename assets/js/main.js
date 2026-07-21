const DEFAULT_LOCALE = "pt-BR";
const SUPPORTED_LOCALES = ["pt-BR", "en", "es", "fr", "de", "ru", "pl"];
const languageButtons = document.querySelectorAll("[data-locale]");
const tipsList = document.querySelector("#tips-list");
const tipsStatus = document.querySelector("#tips-status");
let languageRequestId = 0;

function readSavedLocale() {
  try {
    return localStorage.getItem("totalbattle-locale");
  } catch {
    return null;
  }
}

function saveLocale(locale) {
  try {
    localStorage.setItem("totalbattle-locale", locale);
  } catch {
    // Some mobile webviews disable storage. The language still works for this visit.
  }
}

function valueAtPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function browserLocale() {
  const savedLocale = readSavedLocale();

  if (SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  const preferredLanguages = navigator.languages ?? [navigator.language];

  for (const language of preferredLanguages) {
    const match = SUPPORTED_LOCALES.find((locale) =>
      language.toLowerCase().startsWith(locale.split("-")[0].toLowerCase()),
    );

    if (match) {
      return match;
    }
  }

  return DEFAULT_LOCALE;
}

async function fetchMessages(locale) {
  const response = await fetch(`data/${locale}.json`);

  if (!response.ok) {
    throw new Error(`Could not load locale ${locale}: ${response.status}`);
  }

  return response.json();
}

function applyInterface(messages) {
  document.documentElement.lang = messages.locale;
  document.title = messages.site.title;
  document.querySelector('meta[name="description"]').content = messages.site.description;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = valueAtPath(messages, element.dataset.i18n);

    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = valueAtPath(messages, element.dataset.i18nAriaLabel);

    if (typeof value === "string") {
      element.setAttribute("aria-label", value);
    }
  });

}

function renderTips(tips) {
  tipsList.replaceChildren();

  tips.forEach((tip, index) => {
    const card = document.createElement("article");
    const number = document.createElement("span");
    const category = document.createElement("span");
    const title = document.createElement("h3");
    const text = document.createElement("p");

    card.className = "card";
    number.className = "card-number";
    number.textContent = String(index + 1).padStart(2, "0");
    category.className = "card-category";
    category.textContent = tip.category;
    title.textContent = tip.title;
    text.textContent = tip.text;

    card.append(number, category, title, text);
    tipsList.append(card);
  });
}

async function changeLanguage(locale) {
  const requestId = ++languageRequestId;
  tipsStatus.hidden = false;

  try {
    let messages;

    try {
      messages = await fetchMessages(locale);
    } catch (error) {
      if (locale === DEFAULT_LOCALE) {
        throw error;
      }

      messages = await fetchMessages(DEFAULT_LOCALE);
      locale = DEFAULT_LOCALE;
    }

    if (requestId !== languageRequestId) {
      return;
    }

    applyInterface(messages);
    renderTips(messages.tips);
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
    });
    saveLocale(locale);
    tipsStatus.hidden = true;
  } catch (error) {
    console.error(error);
    tipsStatus.textContent = "Não foi possível carregar as dicas.";
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeLanguage(button.dataset.locale);
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();
changeLanguage(browserLocale());
