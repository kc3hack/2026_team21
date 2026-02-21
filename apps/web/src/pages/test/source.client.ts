// 緑が出発する時のロジック

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("source-start-btn");
  const area = document.getElementById("source-area");

  startBtn?.addEventListener("click", () => {
    if (!area) return;

    area.classList.add("is-moving");

    setTimeout(() => {
      window.location.href = "/test/test2";
    }, 1500);
  });
});
