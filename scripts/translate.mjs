import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const SOURCE_PATH = new URL("../data/pt-BR.json", import.meta.url);
const API_URL = "https://models.github.ai/inference/chat/completions";
const MODEL = process.env.TRANSLATION_MODEL ?? "openai/gpt-4.1-mini";
const TARGETS = [
  { locale: "en", language: "English" },
  { locale: "es", language: "Spanish" },
];

const sourceText = await readFile(SOURCE_PATH, "utf8");
const source = JSON.parse(sourceText);
const sourceHash = createHash("sha256").update(sourceText).digest("hex");
const token = process.env.GITHUB_TOKEN;

for (const target of TARGETS) {
  const outputPath = new URL(`../data/${target.locale}.json`, import.meta.url);

  try {
    const current = JSON.parse(await readFile(outputPath, "utf8"));

    if (current.sourceHash === sourceHash) {
      console.log(`${target.locale}: already up to date`);
      continue;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (!token) {
    throw new Error("GITHUB_TOKEN is required when translations are out of date.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            `Translate the supplied Total Battle website data from Brazilian Portuguese to ${target.language}.`,
            "Return only valid JSON with exactly the same object structure and keys.",
            `Set locale to ${target.locale}.`,
            "Keep every tip id unchanged. Translate all other human-readable string values naturally and concisely.",
            "Do not add sourceLocale or sourceHash; those fields are added by the automation.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify(source) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub Models returned ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  const translated = JSON.parse(result.choices[0].message.content);
  validateTranslation(source, translated, target.locale);

  const output = {
    locale: target.locale,
    sourceLocale: source.locale,
    sourceHash,
    site: translated.site,
    ui: translated.ui,
    tips: translated.tips,
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`${target.locale}: translated with ${MODEL}`);
}

function validateTranslation(original, translated, locale) {
  if (translated.locale !== locale) {
    throw new Error(`${locale}: the model returned an invalid locale`);
  }

  for (const section of ["site", "ui", "tips"]) {
    if (!translated[section]) {
      throw new Error(`${locale}: missing section ${section}`);
    }
  }

  if (translated.tips.length !== original.tips.length) {
    throw new Error(`${locale}: tip count changed during translation`);
  }

  original.tips.forEach((tip, index) => {
    if (translated.tips[index]?.id !== tip.id) {
      throw new Error(`${locale}: tip id ${tip.id} was changed or reordered`);
    }
  });
}
