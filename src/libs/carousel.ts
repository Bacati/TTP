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
      const moveIndicator = document.querySelector<HTMLElement>(moveIndicatorSelector);
  
      if (!carousel || !track) {
        if ((import.meta as any).env?.DEV) {
          console.warn("[infiniteCarousel] carousel or track not found");
        }
        return;
      }
  
      // -----------------------------
      // 1) DUPLICATION POUR L'INFINI
      // -----------------------------
      const originalItems = Array.from(track.children) as HTMLElement[];
      if (originalItems.length === 0) return;
  
      const beforeFrag = document.createDocumentFragment();
      const afterFrag = document.createDocumentFragment();
  
      originalItems.forEach((item) => {
        beforeFrag.appendChild(item.cloneNode(true));
        afterFrag.appendChild(item.cloneNode(true));
      });
  
      track.insertBefore(beforeFrag, track.firstChild);
      track.appendChild(afterFrag);
  
      // [clonesAvant][originaux][clonesApres] → 3 segments
      let segmentWidth = 0;
  
      const computeSegmentWidth = () => {
        const totalWidth = track.scrollWidth;
        segmentWidth = totalWidth / 3;
      };
  
      computeSegmentWidth();
  
      // On se place sur le bloc central (originaux)
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
      // 2) PARAM GÉNÉRAUX
      // -----------------------------
      const mediaQuery = window.matchMedia(`(min-width: ${minDesktopWidth}px)`);
      let isDesktop = mediaQuery.matches;
  
      mediaQuery.addEventListener("change", (event: MediaQueryListEvent) => {
        isDesktop = event.matches;
        updateAutoplayState();
      });
  
      // Pas de drag natif des images
      carousel.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        img.draggable = false;
      });
  
      carousel.addEventListener(
        "dragstart",
        (event) => {
          event.preventDefault();
        },
        { capture: true }
      );
  
      // Hint mobile une fois
      let hintShown = false;
      const hideHintOnce = () => {
        if (hintShown || !moveIndicator) return;
        hintShown = true;
        setTimeout(() => moveIndicator.classList.add("hidden"), 1000);
      };
  
      // -----------------------------
      // 3) INFINI : RECENTRAGE
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
  
      // -----------------------------
      // 4) AUTOPLAY (desktop only)
      // -----------------------------
      const speed = speedPxPerSecond; // px/s
      let autoRunning = false;
      let lastTimestamp: number | null = null;
  
      let pointerActive = false;
      let dragging = false;
      let isHover = false;
  
      const autoStep = (timestamp: number) => {
        if (!autoRunning) {
          lastTimestamp = null;
          return;
        }
  
        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
        }
  
        const deltaMs = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
  
        const deltaPx = (speed * deltaMs) / 1000;
        carousel.scrollLeft += deltaPx;
        ensureInfiniteRange();
  
        requestAnimationFrame(autoStep);
      };
  
      const startAutoplay = () => {
        if (!isDesktop) return;
        if (autoRunning) return;
        if (dragging || pointerActive || isHover) return;
  
        autoRunning = true;
        lastTimestamp = null;
        requestAnimationFrame(autoStep);
      };
  
      const stopAutoplay = () => {
        autoRunning = false;
      };
  
      const updateAutoplayState = () => {
        if (isDesktop && !dragging && !pointerActive && !isHover) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      };
  
      updateAutoplayState();
  
      // -----------------------------
      // 5) DRAG avec détection de mouvement réel
      // -----------------------------
      let startX = 0;
      let startScrollLeft = 0;
      let hasMoved = false; // Pour savoir si on a vraiment bougé
  
      const DRAG_THRESHOLD = 5; // Seuil de mouvement pour considérer un drag
  
      // Bloquer les clics UNIQUEMENT si on a dragué
      carousel.addEventListener("click", (event) => {
        if (hasMoved) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }, { capture: true });
  
      carousel.addEventListener(
        "pointerdown",
        (event: PointerEvent) => {
          pointerActive = true;
          dragging = false;
          hasMoved = false;
  
          hideHintOnce();
          stopAutoplay();
  
          startX = event.clientX;
          startScrollLeft = carousel.scrollLeft;
  
          if (carousel.setPointerCapture) {
            carousel.setPointerCapture(event.pointerId);
          }
        },
        { passive: true }
      );
  
      carousel.addEventListener(
        "pointermove",
        (event: PointerEvent) => {
          if (!pointerActive) return;

          const dx = event.clientX - startX;
          const absDx = Math.abs(dx);

          // Détecter si on a vraiment bougé
          if (absDx > DRAG_THRESHOLD) {
            hasMoved = true;
            
            if (!dragging) {
              dragging = true;
              carousel.classList.add("cursor-grabbing", "select-none");
            }
          }

          if (!dragging) return;

          event.preventDefault();

          const deltaFromStart = event.clientX - startX;
          carousel.scrollLeft = startScrollLeft - deltaFromStart;
          ensureInfiniteRange();
        },
        { passive: false }
      );
  
      const endPointer = (event: PointerEvent) => {
        if (!pointerActive) return;
        
        pointerActive = false;

        try {
          if (carousel.releasePointerCapture) {
            carousel.releasePointerCapture(event.pointerId);
          }
        } catch {
          // ignore
        }

        if (dragging) {
          dragging = false;
          carousel.classList.remove("cursor-grabbing", "select-none");
        }

        // Réinitialiser hasMoved après un court délai pour laisser l'événement click se traiter
        setTimeout(() => {
          hasMoved = false;
        }, 50);

        updateAutoplayState();
      };
  
      carousel.addEventListener("pointerup", endPointer);
      carousel.addEventListener("pointercancel", endPointer);
  
      // Sortie de la zone pendant un drag
      carousel.addEventListener("mouseleave", () => {
        if (pointerActive || dragging) {
          pointerActive = false;
          dragging = false;
          carousel.classList.remove("cursor-grabbing", "select-none");
        }
        updateAutoplayState();
      });
  
      // Hover desktop = pause autoplay
      carousel.addEventListener("mouseenter", () => {
        isHover = true;
        updateAutoplayState();
      });
  
      carousel.addEventListener("mouseleave", () => {
        isHover = false;
        updateAutoplayState();
      });
    };
  
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
      setup();
    }
  }