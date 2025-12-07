import { useEffect } from "react";

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
export default function GoogleTranslateLoad() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_container"
      );
    };

    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_container" style={{ display: "none" }} />;
}
