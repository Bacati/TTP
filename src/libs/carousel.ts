// src/libs/carousel.ts

export interface InfiniteCarouselOptions {
  carouselSelector?: string;
  trackSelector?: string;
  moveIndicatorSelector?: string;
  minDesktopWidth?: number;
  speedPxPerSecond?: number;
}

export function initInfiniteCarousel(options: InfiniteCarouselOptions = {}): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const {
    carouselSelector = "#carousel",
    trackSelector = "#slide",
    moveIndicatorSelector = "#move",
    minDesktopWidth = 768,
    speedPxPerSecond = 120,
  } = options;

  const setup = () => {
    const carousel = document.querySelector<HTMLElement>(carouselSelector);
    const track = document.querySelector<HTMLElement>(trackSelector);
    // On récupère l'indicateur (la main)
    const moveIndicator = document.querySelector<HTMLElement>(moveIndicatorSelector);

    if (!carousel || !track) return;

    // -----------------------------
    // 1) DUPLICATION (SANS LA MAIN)
    // -----------------------------
    const originalItems = Array.from(track.children) as HTMLElement[];
    if (originalItems.length === 0) return;

    // ICI EST LA CORRECTION : 
    // On filtre pour ne cloner QUE les produits, pas l'indicateur (#move).
    // Cela évite d'avoir 3 mains superposées.
    const itemsToClone = originalItems.filter((item) => item !== moveIndicator);

    const beforeFrag = document.createDocumentFragment();
    const afterFrag = document.createDocumentFragment();

    itemsToClone.forEach((item) => {
      beforeFrag.appendChild(item.cloneNode(true));
      afterFrag.appendChild(item.cloneNode(true));
    });

    track.insertBefore(beforeFrag, track.firstChild);
    track.appendChild(afterFrag);

    // -----------------------------
    // 2) INITIALISATION POSITIONS
    // -----------------------------
    let segmentWidth = 0;
    const computeSegmentWidth = () => {
      // Le scrollWidth a changé après clonage, on recalcule
      // Attention: itemsToClone ne contient pas tout le DOM actuel, donc on se base sur le track complet
      // Mais pour segmentWidth, on veut la largeur d'un tiers (original)
      // Approximation fiable : scrollWidth / 3
      segmentWidth = track.scrollWidth / 3;
    };

    computeSegmentWidth();
    carousel.scrollLeft = segmentWidth;

    window.addEventListener("resize", () => {
      const current = carousel.scrollLeft;
      computeSegmentWidth();
      if (segmentWidth > 0) {
        const offset = current % segmentWidth;
        carousel.scrollLeft = segmentWidth + offset;
      }
    });

    // -----------------------------
    // 3) GESTION DU HINT (Main)
    // -----------------------------
    let hintShown = false;

    const hideHintOnce = () => {
      if (hintShown || !moveIndicator) return;
      hintShown = true;

      // On attend 1 seconde
      setTimeout(() => {
        // 1. Transition CSS forcée via JS pour passer outre les classes
        moveIndicator.style.transition = "opacity 0.5s ease";
        moveIndicator.style.opacity = "0";

        // 2. Suppression totale du flux
        setTimeout(() => {
          moveIndicator.style.display = "none";
        }, 500);
      }, 1000);
    };

    // -----------------------------
    // 4) NAVIGATION & DRAG
    // -----------------------------
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let isDragActive = false; 
    let longPressTimer: ReturnType<typeof setTimeout>;

    const DRAG_THRESHOLD = 5; 
    const LONG_PRESS_DURATION = 200; 

    // Désactive le drag natif
    carousel.querySelectorAll("img").forEach(img => img.draggable = false);
    carousel.querySelectorAll("a").forEach(a => a.draggable = false);

    const activateDragMode = (pointerId: number) => {
        if (isDragActive) return;
        isDragActive = true;
        carousel.setPointerCapture(pointerId); 
        carousel.style.cursor = "grabbing";
    };

    // Capture du click pour empêcher l'ouverture du lien SI drag
    carousel.addEventListener("click", (e) => {
        if (isDragActive) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }, { capture: true }
    );

    carousel.addEventListener("pointerdown", (e) => {
      // Dès qu'on touche, on cache le hint (s'il est unique, ça marchera)
      hideHintOnce();

      isDown = true;
      isDragActive = false; 
      startX = e.clientX;
      startScrollLeft = carousel.scrollLeft;

      longPressTimer = setTimeout(() => {
        if (isDown) {
            activateDragMode(e.pointerId);
            stopAutoplay(); 
        }
      }, LONG_PRESS_DURATION);
    });

    carousel.addEventListener("pointermove", (e) => {
      if (!isDown) return;

      const x = e.clientX;
      const walk = x - startX;

      if (!isDragActive && Math.abs(walk) > DRAG_THRESHOLD) {
        activateDragMode(e.pointerId);
        stopAutoplay();
      }

      if (isDragActive) {
        e.preventDefault(); 
        carousel.scrollLeft = startScrollLeft - walk;
        ensureInfiniteRange();
      }
    });

    const endInteraction = (e: PointerEvent) => {
      if (!isDown) return;
      
      clearTimeout(longPressTimer); 
      isDown = false;
      
      if (isDragActive) {
          carousel.style.cursor = "grab";
          try { carousel.releasePointerCapture(e.pointerId); } catch (err) {}
          
          setTimeout(() => {
              isDragActive = false;
              updateAutoplayState();
          }, 50);
      } else {
          updateAutoplayState();
      }
    };

    carousel.addEventListener("pointerup", endInteraction);
    carousel.addEventListener("pointercancel", endInteraction);

    // -----------------------------
    // 5) RECENTRAGE & AUTOPLAY
    // -----------------------------
    const ensureInfiniteRange = () => {
      if (segmentWidth <= 0) return;
      const current = carousel.scrollLeft;
      const min = segmentWidth * 0.5;
      const max = segmentWidth * 1.5;

      if (current < min) {
        carousel.scrollLeft = current + segmentWidth;
      } else if (current > max) {
        carousel.scrollLeft = current - segmentWidth;
      }
    };

    let autoRunning = false;
    let lastTimestamp: number | null = null;
    let isHover = false;
    const mediaQuery = window.matchMedia(`(min-width: ${minDesktopWidth}px)`);
    let isDesktop = mediaQuery.matches;

    mediaQuery.addEventListener("change", (e) => {
      isDesktop = e.matches;
      updateAutoplayState();
    });

    const autoStep = (timestamp: number) => {
      if (!autoRunning) {
        lastTimestamp = null;
        return;
      }
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const deltaPx = (speedPxPerSecond * deltaMs) / 1000;
      carousel.scrollLeft += deltaPx;
      ensureInfiniteRange();
      requestAnimationFrame(autoStep);
    };

    const startAutoplay = () => {
      if (!isDesktop || autoRunning) return;
      autoRunning = true;
      requestAnimationFrame(autoStep);
    };

    const stopAutoplay = () => {
      autoRunning = false;
    };

    const updateAutoplayState = () => {
      if (isDesktop && !isDown && !isHover) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    };

    carousel.addEventListener("mouseenter", () => {
      isHover = true;
      updateAutoplayState();
    });
    carousel.addEventListener("mouseleave", () => {
      isHover = false;
      updateAutoplayState();
    });

    updateAutoplayState();
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}