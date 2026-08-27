import { animate, stagger } from "animejs";
import { cubicBezier } from "animejs/easings/cubic-bezier";
import { prefersReducedMotion } from "./effects";

const slowRise = cubicBezier(0.7, 0.1, 0.5, 0.9);

function cardArt(card: HTMLElement): HTMLElement[] {
  return Array.from(card.querySelectorAll<HTMLElement>("[data-card-art]"));
}

function cardCopy(card: HTMLElement): HTMLElement[] {
  return Array.from(card.querySelectorAll<HTMLElement>("[data-card-copy]"));
}

function motifNodes(card: HTMLElement): HTMLElement[] {
  return Array.from(card.querySelectorAll<HTMLElement>("[data-motion]"));
}

function playMotif(nodes: HTMLElement[], active: boolean): void {
  nodes.forEach((node, index) => {
    const kind = node.dataset["motion"] ?? "float";
    const delay = 60 + index * 45 + (kind === "pulse" ? 16 : 0);
    const duration = active ? 560 : 360;

    animate(node, {
      opacity: active ? [0.6, 1] : [1, 0.72],
      filter: active
        ? ["blur(1.5px) brightness(0.9)", "blur(0px) brightness(1)"]
        : ["blur(0px) brightness(1)", "blur(1px) brightness(0.9)"],
      duration,
      delay,
      ease: slowRise,
    });
  });
}

export function playDirectionCardActive(card: HTMLElement): void {
  if (prefersReducedMotion.matches) return;

  const art = cardArt(card);
  const copy = cardCopy(card);
  const motif = motifNodes(card);

  animate(card, {
    opacity: [0.92, 1],
    translateY: [5, 0],
    scale: [0.998, 1],
    duration: 500,
    ease: slowRise,
  });

  if (art.length) {
    animate(art, {
      opacity: [0.78, 1],
      scale: [0.998, 1],
      duration: 500,
      delay: stagger(40, { start: 30 }),
      ease: slowRise,
    });
  }

  playMotif(motif, true);

  if (copy.length) {
    animate(copy, {
      opacity: [0.88, 1],
      translateY: [3, 0],
      duration: 440,
      delay: stagger(30, { start: 60 }),
      ease: slowRise,
    });
  }
}

export function playDirectionCardIdle(card: HTMLElement): void {
  if (prefersReducedMotion.matches) return;

  const art = cardArt(card);
  const copy = cardCopy(card);
  const motif = motifNodes(card);

  animate(card, {
    opacity: [1, 0.94],
    translateY: [0, 2],
    scale: [1, 0.999],
    duration: 320,
    ease: slowRise,
  });

  if (art.length) {
    animate(art, {
      opacity: [1, 0.88],
      scale: [1, 0.998],
      duration: 320,
      delay: stagger(15),
      ease: slowRise,
    });
  }

  playMotif(motif, false);

  if (copy.length) {
    animate(copy, {
      opacity: [1, 0.92],
      translateY: [0, 2],
      duration: 300,
      ease: slowRise,
    });
  }
}