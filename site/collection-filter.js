(() => {
  for (const catalog of document.querySelectorAll("[data-filter-catalog]")) {
    const parameter = catalog.dataset.param;
    const controls = [...catalog.querySelectorAll("[data-filter-value]")];
    const items = [...catalog.querySelectorAll("[data-filter-item]")];
    const count = catalog.querySelector("[data-filter-count]");
    const empty = catalog.querySelector("[data-filter-empty]");
    const initial = new URLSearchParams(location.search).get(parameter) || "";

    const apply = (value) => {
      let visible = 0;
      for (const item of items) {
        const match = !value || item.dataset.filterItem === value;
        item.hidden = !match;
        if (match) visible++;
      }
      for (const control of controls) {
        const active = control.dataset.filterValue === value;
        control.classList.toggle("active", active);
        control.setAttribute("aria-pressed", String(active));
      }
      count.textContent = `${visible} 项内容`;
      empty.hidden = visible !== 0;
      const params = new URLSearchParams(location.search);
      if (value) params.set(parameter, value);
      else params.delete(parameter);
      history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
    };

    for (const control of controls) control.addEventListener("click", () => apply(control.dataset.filterValue));
    apply(controls.some((control) => control.dataset.filterValue === initial) ? initial : "");
  }
})();
