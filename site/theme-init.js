(() => {
  let saved = null;
  try {
    saved = localStorage.getItem("cosmichan-theme");
  } catch {
    // A restricted browser may disable storage; system theme remains the safe default.
  }
  const choice = saved === "light" || saved === "dark" ? saved : "system";
  const resolved = choice === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : choice;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
  let sidebar = "expanded";
  try {
    sidebar = localStorage.getItem("cosmichan-sidebar") === "collapsed" ? "collapsed" : "expanded";
  } catch {
    // The expanded sidebar is the safe default when storage is unavailable.
  }
  document.documentElement.dataset.sidebar = sidebar;
})();
