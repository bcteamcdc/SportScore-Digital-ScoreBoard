/**
 * Security Script for SportMeet 2026
 * Protects the codebase and content from unauthorized inspection and copying.
 * Enhanced Security Features v2.0
 */
(function () {
  "use strict";

  // 1. Disable Right Click (Context Menu)
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  // 2. Disable Text Selection (Multiple Methods)
  document.addEventListener("selectstart", (e) => {
    e.preventDefault();
    return false;
  }, true);

  document.addEventListener("mousedown", (e) => {
    if (e.detail > 1) {
      e.preventDefault();
    }
  }, true);

  // Apply CSS-based selection prevention
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.msUserSelect = "none";
  document.body.style.MozUserSelect = "none";

  // 3. Disable Keyboard Shortcuts for DevTools
  document.addEventListener("keydown", (e) => {
    // Disable F12
    if (e.keyCode === 123 || e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+Shift+I (Inspector)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 73 || e.key === "I" || e.key === "i")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+Shift+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 74 || e.key === "J" || e.key === "j")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+Shift+C (Element Selector)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 67 || e.key === "C" || e.key === "c")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 85 || e.key === "U" || e.key === "u")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 83 || e.key === "S" || e.key === "s")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+Shift+K (Firefox Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 75 || e.key === "K" || e.key === "k")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+Shift+M (Mobile view toggle)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 77 || e.key === "M" || e.key === "m")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+P (Print)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 80 || e.key === "P" || e.key === "p")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+A (Select All)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 65 || e.key === "A" || e.key === "a")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Disable Ctrl+C (Copy) - except in input fields
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.keyCode === 67 || e.key === "C" || e.key === "c")) {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Disable F5/Ctrl+F5 (Refresh with DevTools) - optional, uncomment if needed
    // if (e.keyCode === 116) {
    //   e.preventDefault();
    //   return false;
    // }
  }, true);

  // 4. Console Protection & DevTools Detection
  const protect = () => {
    const devtools = {
      isOpen: false,
      orientation: undefined,
    };
    const threshold = 160;

    const emitEvent = (isOpen, orientation) => {
      if (isOpen) {
        console.clear();
        console.log(
          "%cSTOP!",
          "color: red; font-family: sans-serif; font-size: 4rem; font-weight: bold; text-shadow: 2px 2px 0 #000;"
        );
        console.log(
          "%cDevTools access is restricted on this application.",
          "font-size: 1.2rem; color: #fff; background: #000; padding: 5px;"
        );
        console.log(
          "%cFor security reasons, developer tools are disabled.",
          "font-size: 1rem; color: #888;"
        );
      }
    };

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? "vertical" : "horizontal";

      if (
        !(heightThreshold && widthThreshold) &&
        ((window.Firebug &&
          window.Firebug.chrome &&
          window.Firebug.chrome.isInitialized) ||
          widthThreshold ||
          heightThreshold)
      ) {
        if (!devtools.isOpen || devtools.orientation !== orientation) {
          emitEvent(true, orientation);
        }
        devtools.isOpen = true;
        devtools.orientation = orientation;
      } else {
        if (devtools.isOpen) {
          emitEvent(false, undefined);
        }
        devtools.isOpen = false;
        devtools.orientation = undefined;
      }

      if (devtools.isOpen) {
        console.clear();
      }
    }, 1500);
  };

  // 5. Debugger trap - makes debugging harder
  const debuggerTrap = () => {
    setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        console.clear();
      }
    }, 3000);
  };

  // 6. Disable image dragging
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
    return false;
  }, true);

  // 7. Disable copy event
  document.addEventListener("copy", (e) => {
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      return false;
    }
  }, true);

  // 8. Disable cut event
  document.addEventListener("cut", (e) => {
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      return false;
    }
  }, true);

  // 9. Disable paste in non-input areas (optional - for extra security)
  // document.addEventListener("paste", (e) => {
  //   if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
  //     e.preventDefault();
  //     return false;
  //   }
  // }, true);

  // 10. Prevent window.print()
  window.print = function() {
    console.log("Printing is disabled on this application.");
    return false;
  };

  // Initialize all protections
  protect();
  
  // Enable debugger trap only in production (uncomment if needed)
  // debuggerTrap();

  console.log("%cSecurity Active v2.0", "color: green; font-weight: bold;");
})();
