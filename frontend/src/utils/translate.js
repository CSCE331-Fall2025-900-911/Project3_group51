// src/utils/translate.js
export async function translateText(text, targetLangCode) {
  try {
    const res = await fetch("http://localhost:3000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text, targetLangCode 
      }),
    });
    console.log("🔥 translateText send to backend:", text, targetLangCode);


    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Translation failed:", err);
    return { translatedText: text };
  }
}
