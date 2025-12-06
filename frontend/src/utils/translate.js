// src/utils/translate.js

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function translateText(text, targetLangCode) {
  // if text empty or English return 
  if(!text || targetLangCode === 'en-US'){
    console.log("Used Cached Translation:", text, "->", cachedValue);
    return {translatedText: text};
  }

  //cache for language
  const cacheKey = `translate_${targetLangCode}_${text}`;  
  
  try {
    const cachedValue = localStorage.getItem(cacheKey);
    if(cachedValue){
      return {translatedText: cachedValue};
    }

    const res = await fetch(`${API}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text, targetLangCode 
      }),
    });

    if(!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    console.log("API Call (No Cache):", text, targetLangCode);

    const data = await res.json();
    
    if(data && data.translatedText){
      localStorage.setItem(cacheKey, data.translatedText);
    }

    return data;
  } catch (err) {
    console.error("Translation failed:", err);
    return { translatedText: text };
  }
}
