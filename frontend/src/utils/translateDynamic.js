import { translateText } from "./translate";

export async function translateDynamicList(list, langCode, extract) {
  // extract = function(item) => field to translate (string)
  const translated = [];

  for (const item of list) {
    const text = extract(item);
    const resp = await translateText(text, langCode);

    translated.push({
      ...item,
      translatedText: resp.translatedText || text,
    });
  }

  return translated;
}