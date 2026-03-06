import { useEffect, useRef, useCallback } from "react";
import styles from "../components/Antigravity.module.css";

export function useAntigravity(active) {
  const activeRef = useRef(false);
  const elementsRef = useRef([]);

  const triggerZeroG = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;

    const query = document.querySelectorAll("[data-antigravity]");
    elementsRef.current = [];

    query.forEach((el) => {
      // Create placeholder to preserve layout
      const rect = el.getBoundingClientRect();
      const placeholder = document.createElement("div");
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.margin = window.getComputedStyle(el).margin;
      placeholder.style.display = window.getComputedStyle(el).display;
      placeholder.className = "antigravity-placeholder";

      el.parentNode.insertBefore(placeholder, el);

      // Save original inline styles
      const originalStyles = {
        position: el.style.position,
        left: el.style.left,
        top: el.style.top,
        width: el.style.width,
        height: el.style.height,
        margin: el.style.margin,
        transform: el.style.transform,
      };

      elementsRef.current.push({ el, placeholder, originalStyles });

      // Apply initial fixed positioning
      el.style.position = "fixed";
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = "0";

      // Randomize drift variables
      el.style.setProperty("--drift-x1", `${(Math.random() - 0.5) * 100}px`);
      el.style.setProperty("--drift-y1", `${-(Math.random() * 50 + 20)}px`);
      el.style.setProperty("--rot1", `${(Math.random() - 0.5) * 15}deg`);

      el.style.setProperty("--drift-x2", `${(Math.random() - 0.5) * 150}px`);
      el.style.setProperty("--drift-y2", `${-(Math.random() * 100 + 50)}px`);
      el.style.setProperty("--rot2", `${(Math.random() - 0.5) * 25}deg`);

      el.style.setProperty("--drift-x3", `${(Math.random() - 0.5) * 200}px`);
      el.style.setProperty("--drift-y3", `${-(Math.random() * 150 + 100)}px`);
      el.style.setProperty("--rot3", `${(Math.random() - 0.5) * 35}deg`);

      el.style.setProperty("--float-duration", `${Math.random() * 10 + 10}s`);

      // Add CSS module class
      el.classList.add(styles.zeroGravity);
    });
  }, []);

  const restoreGravity = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;

    elementsRef.current.forEach(({ el, placeholder, originalStyles }) => {
      // Get current bounding rect before removing classes
      const rect = el.getBoundingClientRect();

      // We want to force it to jump back to its placeholder's spot smoothly
      const targetRect = placeholder.getBoundingClientRect();

      el.classList.remove(styles.zeroGravity);

      // To animate the return, we need to artificially position it via transform from its fixed state,
      // or easier: keep it fixed, animate top/left to targetRect, then snap to original.

      el.style.transition = "none";
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.transform = "none";

      // Trigger reflow
      void el.offsetHeight;

      el.classList.add(styles.restoreSpring);

      el.style.left = `${targetRect.left}px`;
      el.style.top = `${targetRect.top}px`;

      setTimeout(() => {
        el.classList.remove(styles.restoreSpring);

        // Restore original flow
        Object.assign(el.style, originalStyles);

        if (placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder);
        }
      }, 800); // match transition duration
    });

    elementsRef.current = [];
  }, []);

  useEffect(() => {
    if (active) {
      triggerZeroG();
    } else {
      restoreGravity();
    }
  }, [active, triggerZeroG, restoreGravity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => restoreGravity();
  }, [restoreGravity]);
}
