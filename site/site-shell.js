(() => {
  const root = document.documentElement;
  const body = document.body;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navClose = document.querySelector("[data-nav-close]");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const sidebarIcon = document.querySelector("[data-sidebar-icon]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const dialog = document.querySelector("#site-search");
  const searchInput = document.querySelector("[data-global-search]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchSummary = document.querySelector("[data-search-summary]");
  const searchOpeners = [...document.querySelectorAll("[data-search-open]")];
  const searchCloser = document.querySelector("[data-search-close]");
  const media = matchMedia("(prefers-color-scheme: dark)");
  const choices = ["system", "light", "dark"];
  const themeNames = { system: "跟随系统", light: "浅色", dark: "深色" };
  const themeIcons = { system: "◐", light: "☀", dark: "☾" };
  let searchIndex = null;
  let resultLinks = [];

  const applySidebar = (collapsed) => {
    root.dataset.sidebar = collapsed ? "collapsed" : "expanded";
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle.setAttribute("aria-label", collapsed ? "展开板块索引" : "收起板块索引");
    sidebarIcon.textContent = collapsed ? "›" : "‹";
  };

  const saveSidebar = (collapsed) => {
    try {
      localStorage.setItem("cosmichan-sidebar", collapsed ? "collapsed" : "expanded");
    } catch {
      // Collapsing still works for the current page when storage is unavailable.
    }
  };

  const saveTheme = (choice) => {
    try {
      if (choice === "system") localStorage.removeItem("cosmichan-theme");
      else localStorage.setItem("cosmichan-theme", choice);
    } catch {
      // Theme switching still works for the current page when storage is unavailable.
    }
  };

  const resolveTheme = (choice) => choice === "system" ? (media.matches ? "dark" : "light") : choice;

  const applyTheme = (choice) => {
    const resolved = resolveTheme(choice);
    root.dataset.themeChoice = choice;
    root.dataset.theme = resolved;
    themeLabel.textContent = themeNames[choice];
    themeIcon.textContent = themeIcons[choice];
    themeToggle.setAttribute("aria-label", `当前为${themeNames[choice]}，切换主题`);
    themeColor.setAttribute("content", resolved === "dark" ? "#181614" : "#F7F6F2");
  };

  applyTheme(root.dataset.themeChoice || "system");
  applySidebar(root.dataset.sidebar === "collapsed");

  themeToggle.addEventListener("click", () => {
    const current = root.dataset.themeChoice || "system";
    const next = choices[(choices.indexOf(current) + 1) % choices.length];
    saveTheme(next);
    applyTheme(next);
  });

  media.addEventListener("change", () => {
    if (root.dataset.themeChoice === "system") applyTheme("system");
  });

  const setNavigation = (open) => {
    body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };

  navToggle.addEventListener("click", () => setNavigation(!body.classList.contains("nav-open")));
  navClose.addEventListener("click", () => setNavigation(false));
  sidebarToggle.addEventListener("click", () => {
    const collapsed = root.dataset.sidebar !== "collapsed";
    applySidebar(collapsed);
    saveSidebar(collapsed);
  });
  document.querySelectorAll(".site-sidebar a").forEach((link) => link.addEventListener("click", () => setNavigation(false)));

  const createResult = (item) => {
    const link = document.createElement("a");
    link.className = "search-result";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.title = "在新标签页打开";
    const copy = document.createElement("span");
    copy.className = "search-result-copy";
    const title = document.createElement("strong");
    const description = document.createElement("small");
    const type = document.createElement("span");
    type.className = "search-result-type";
    title.textContent = item.title;
    description.textContent = item.description;
    type.textContent = item.type;
    copy.append(title, description);
    link.append(copy, type);
    return link;
  };

  const renderSearch = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("zh-CN");
    searchResults.replaceChildren();
    resultLinks = [];

    if (!query) {
      searchSummary.textContent = "输入关键词，搜索工具、AI 知识和学习路径。";
      return;
    }

    if (!searchIndex) {
      searchSummary.textContent = "正在载入搜索索引…";
      return;
    }

    const words = query.split(/\s+/).filter(Boolean);
    const matches = searchIndex
      .filter((item) => words.every((word) => item.searchText.includes(word)))
      .slice(0, 12);

    searchSummary.textContent = matches.length ? `显示前 ${matches.length} 条相关内容` : "没有找到相关内容，请换一个关键词。";
    const fragment = document.createDocumentFragment();
    for (const item of matches) fragment.append(createResult(item));
    searchResults.append(fragment);
    resultLinks = [...searchResults.querySelectorAll("a")];
  };

  const loadSearchIndex = async () => {
    if (searchIndex) return;
    try {
      const response = await fetch("/search-index.json", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Search index request failed");
      searchIndex = await response.json();
      renderSearch();
    } catch {
      searchSummary.textContent = "搜索索引暂时不可用，请通过左侧板块索引浏览。";
    }
  };

  const openSearch = () => {
    if (!dialog.open) dialog.showModal();
    searchInput.focus();
    void loadSearchIndex();
  };

  const closeSearch = () => {
    dialog.close();
    searchInput.value = "";
    renderSearch();
  };

  for (const opener of searchOpeners) opener.addEventListener("click", openSearch);
  searchCloser.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", renderSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && resultLinks[0]) {
      event.preventDefault();
      resultLinks[0].click();
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && body.classList.contains("nav-open")) setNavigation(false);
  });
})();
