import { useEffect, useRef, useState } from "react";

export const MOTION = {
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  fast: 400,
  base: 700,
  slow: 1000
};

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useRevealSystem(reduced) {
  useEffect(() => {
    const root = document.documentElement;
    const nodes = [...document.querySelectorAll("[data-reveal]")];
    const showAll = () => {
      nodes.forEach((node) => {
        node.dataset.revealState = "shown";
      });
    };

    if (reduced || !("IntersectionObserver" in window)) {
      root.classList.remove("motion-ready");
      showAll();
      return undefined;
    }

    let observer;
    let fallbackTimer;

    try {
      nodes.forEach((node) => {
        node.dataset.revealState = "pending";
      });
      root.classList.add("motion-ready");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.revealState = "shown";
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8%" }
      );

      nodes.forEach((node) => observer.observe(node));
      fallbackTimer = window.setTimeout(showAll, 8000);
    } catch {
      root.classList.remove("motion-ready");
      showAll();
    }

    return () => {
      observer?.disconnect();
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      root.classList.remove("motion-ready");
    };
  }, [reduced]);
}

export function useHeroParallax(ref, reduced) {
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !("IntersectionObserver" in window)) return undefined;

    let active = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!active) return;

      const rect = node.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(rect.height * 0.86, 1), 0, 1);
      node.style.setProperty("--hero-split", Math.round(progress * 36) + "px");
      node.style.setProperty("--hero-image-y", Math.round(progress * -28) + "px");
    };

    const requestUpdate = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        active = entries[0]?.isIntersecting ?? false;
        if (active) requestUpdate();
      },
      { rootMargin: "24% 0px 18%" }
    );

    observer.observe(node);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      node.style.removeProperty("--hero-split");
      node.style.removeProperty("--hero-image-y");
    };
  }, [ref, reduced]);
}

export function useGalleryParallax(ref, reduced) {
  useEffect(() => {
    const grid = ref.current;
    if (!grid || reduced || !("IntersectionObserver" in window)) return undefined;

    const cards = [...grid.querySelectorAll("[data-parallax]")];
    let active = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!active) return;

      const viewportCenter = window.innerHeight / 2;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const factor = Number(card.dataset.parallax || 0);
        const progress = clamp(
          (viewportCenter - (rect.top + rect.height / 2)) / (window.innerHeight + rect.height),
          -1,
          1
        );
        card.style.setProperty("--parallax-y", Math.round(progress * factor) + "px");
      });
    };

    const requestUpdate = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        active = entries[0]?.isIntersecting ?? false;
        grid.classList.toggle("is-parallaxing", active);
        if (active) requestUpdate();
      },
      { rootMargin: "35% 0px 30%" }
    );

    observer.observe(grid);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      cards.forEach((card) => card.style.removeProperty("--parallax-y"));
      grid.classList.remove("is-parallaxing");
    };
  }, [ref, reduced]);
}

export function useViewportActive(ref, reduced, threshold = 0.25) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !("IntersectionObserver" in window)) {
      setActive(!reduced);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, reduced, threshold]);

  return active;
}

export function useInViewOnce(ref, reduced, threshold = 0.35) {
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, reduced, threshold]);

  return visible;
}

export function useMagnetic(ref, reduced, strength = 0.16) {
  useEffect(() => {
    const node = ref.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!node || reduced || !finePointer.matches) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;

    const render = () => {
      frame = 0;
      node.style.setProperty("--magnetic-x", x + "px");
      node.style.setProperty("--magnetic-y", y + "px");
    };

    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      x = (event.clientX - (rect.left + rect.width / 2)) * strength;
      y = (event.clientY - (rect.top + rect.height / 2)) * strength;
      node.classList.add("is-magnetized");
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      node.classList.remove("is-magnetized");
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      node.style.removeProperty("--magnetic-x");
      node.style.removeProperty("--magnetic-y");
      node.classList.remove("is-magnetized");
    };
  }, [ref, reduced, strength]);
}

export function useNavigationMotion(sectionIds, reduced) {
  const [activeSection, setActiveSection] = useState("");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-22% 0px -62%", threshold: [0.05, 0.2, 0.45] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    if (reduced) {
      setHidden(false);
      return undefined;
    }

    let lastScroll = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScroll;
      if (Math.abs(delta) > 8) {
        setHidden(currentScroll > 110 && delta > 0);
        lastScroll = currentScroll;
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return { activeSection, hidden };
}
