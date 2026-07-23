import "@testing-library/jest-dom/vitest";
import { MotionGlobalConfig } from "framer-motion";

// Complete Framer Motion animations instantly under jsdom so AnimatePresence
// exit transitions don't block tab content from mounting.
MotionGlobalConfig.skipAnimations = true;
