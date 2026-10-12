/** Enhance both React banners and inert static MDX islands. Never redraw on scroll. */
export function attachAsciiCanvases(root: HTMLElement) {
  const cleanups = [...root.querySelectorAll<HTMLCanvasElement>("canvas[data-ascii-canvas]")].map(canvas => {
    const grid = canvas.parentElement!;
    const context = canvas.getContext("2d");
    if (!context) {
      grid.classList.add("ascii-canvas-fallback");
      return () => grid.classList.remove("ascii-canvas-fallback");
    }
    const columns = Number(canvas.dataset.columns);
    const rows = Number(canvas.dataset.rows);
    const glyphs = Array.from(grid.querySelector("pre")!.textContent.replace(/\n/g, ""));
    const colors = canvas.dataset.colors!;
    const palette = canvas.dataset.palette!.split(",");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let disposed = false;
    let frame = 0;
    let previous = "";
    const draw = (force = false) => {
      if (disposed) return;
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const size = `${width}:${height}:${ratio}`;
      if (!width || !height || (!force && size === previous)) return;
      previous = size;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      // Match the original 64px text grid's outline scale, not tiny-font hinting.
      const pitch = 64 * (1233 / 2048);
      const tileWidth = canvas.closest(".homepage-banner") ? Math.min(width, 1200) : width;
      const scale = tileWidth / (columns * pitch);
      context.setTransform(canvas.width / width * scale, 0, 0, canvas.height / height * scale, 0, 0);
      context.fillStyle = canvas.dataset.background!;
      context.fillRect(0, 0, width / scale, height / scale);
      // Original ArtGrid: advance 1233/2048 em; baseline 1149/1233 cell.
      context.font = "400 64px ArtGrid, ArtGridFallback, monospace";
      context.textBaseline = "alphabetic";
      const top = (height / scale - rows * pitch) / 2;
      for (let tile = 0; tile < Math.ceil(width / tileWidth); tile++) {
        context.save();
        // Alternate symmetric dot artwork so neighboring tiles meet at matching edges.
        context.translate((tile + tile % 2) * columns * pitch, 0);
        context.scale(tile % 2 ? -1 : 1, 1);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            const index = y * columns + x;
            if (glyphs[index] === " ") continue;
            context.fillStyle = palette[alphabet.indexOf(colors[index])];
            context.fillText(glyphs[index], x * pitch, top + (y + 1149 / 1233) * pitch);
          }
        }
        context.restore();
      }
      grid.classList.add("ascii-canvas-ready");
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => draw());
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(grid);
    let density: MediaQueryList;
    const watchDensity = () => {
      density?.removeEventListener("change", onDensityChange);
      density = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      density.addEventListener("change", onDensityChange);
    };
    const onDensityChange = () => { watchDensity(); schedule(); };
    watchDensity();
    window.addEventListener("resize", schedule);
    draw();
    const fontReady = () => draw(true);
    void document.fonts.load("16px ArtGrid", "·•●").then(fontReady).catch(() => { /* Keep local font fallback. */ });
    void document.fonts.ready.then(fontReady);
    document.fonts.addEventListener("loadingdone", fontReady);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      density.removeEventListener("change", onDensityChange);
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", fontReady);
      grid.classList.remove("ascii-canvas-ready");
    };
  });
  return () => cleanups.forEach(cleanup => cleanup());
}
