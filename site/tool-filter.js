const fields = ["search", "group", "category"];
const controls = {
  search: document.querySelector("#search"),
  group: document.querySelector("#group"),
  category: document.querySelector("#category"),
};
const cards = [...document.querySelectorAll(".tool-card")];
const categorySections = [...document.querySelectorAll("[data-category-section]")];
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty");

const params = new URLSearchParams(location.search);
for (const id of fields) {
  const value = params.get(id);
  if (value && controls[id]) controls[id].value = value;
}

function filter() {
  const query = controls.search.value.trim().toLowerCase();
  let visible = 0;

  for (const card of cards) {
    const match =
      (!query || card.dataset.search.includes(query)) &&
      (!controls.group.value || card.dataset.group.split(",").includes(controls.group.value)) &&
      (!controls.category.value || card.dataset.category === controls.category.value);

    card.hidden = !match;
    if (match) visible++;
  }

  count.textContent = `${visible} 个工具`;
  empty.hidden = visible !== 0;

  for (const section of categorySections) {
    const sectionCount = section.querySelectorAll(".tool-card:not([hidden])").length;
    section.hidden = sectionCount === 0;
    section.querySelector("[data-category-count]").textContent = `${sectionCount} 个工具`;
  }

  const next = new URLSearchParams();
  for (const id of fields) {
    if (controls[id].value) next.set(id, controls[id].value);
  }
  history.replaceState(null, "", `${location.pathname}${next.size ? `?${next}` : ""}`);
}

for (const control of Object.values(controls)) {
  control.addEventListener("input", filter);
}
filter();
