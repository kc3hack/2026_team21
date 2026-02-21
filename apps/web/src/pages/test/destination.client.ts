// オレンジが到着する時のロジック

document.addEventListener("DOMContentLoaded", () => {
  const area = document.getElementById("destination-area");
  if (!area) return;
  setTimeout(() => {
    area.classList.add("is-arriving");
  }, 100);

  setTimeout(() => {
    area.classList.remove("is-arriving");
    area.classList.add("has-arrived");
  }, 1600);
});
