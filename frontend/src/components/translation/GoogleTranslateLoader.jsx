/**
 * GoogleTranslateLoader Component
 *
 * Description:
 * 1. Dynamically loads the Google Translate Widget script into the page.
 * 2. Registers the required global callback to initialize the widget once loaded.
 * 3. Renders a hidden container for Google to attach its translation controls.
 * 4. Activates Google’s client-side translation engine, enabling automatic
 *    translation of all visible text across the entire React application.
 *
 */
import { useEffect } from "react";

export default function GoogleTranslateLoad() {
  useEffect(() => {
    // Prevent double loading in StrictMode or rerenders
    if (window._googleTranslateScriptLoaded) return;
    window._googleTranslateScriptLoaded = true;

    // Define callback ONCE
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_container"
        );
      }
    };

    // Load script only once
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      console.error("Google Translate failed to load.");
    };
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_container" style={{ display: "none" }} />;
}