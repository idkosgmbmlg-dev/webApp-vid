import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "https://esm.sh/framer-motion@11.11.17?deps=react@18.3.1";

function MotionLayer() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const progressScale = useTransform(smoothProgress, (value) => value);
  const glowY = useTransform(smoothProgress, [0, 1], ["-12vh", "12vh"]);
  const glowRotate = useTransform(smoothProgress, [0, 1], [-8, 8]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(motion.div, {
      className: "motion-glow motion-glow-one",
      style: { y: reduceMotion ? 0 : glowY, rotate: reduceMotion ? 0 : glowRotate }
    }),
    React.createElement(motion.div, {
      className: "motion-glow motion-glow-two",
      style: { y: reduceMotion ? 0 : glowY, rotate: reduceMotion ? 0 : -glowRotate }
    }),
    React.createElement(
      motion.div,
      { className: "motion-progress", style: { scaleX: progressScale } }
    )
  );
}

const mount = document.querySelector("#motion-layer");
if (mount) createRoot(mount).render(React.createElement(MotionLayer));
