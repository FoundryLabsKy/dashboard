import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import TabBar, { type Tab } from "./components/TabBar";
import Onboarding from "./components/Onboarding";
import Home from "./components/Home";
import Stats from "./components/Stats";
import Timeline from "./components/Timeline";
import Settings from "./components/Settings";

function Shell() {
  const { settings } = useApp();
  const [tab, setTab] = useState<Tab>("home");

  if (!settings.onboarded) return <Onboarding />;

  return (
    <div className="min-h-dvh">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          {tab === "home" && <Home />}
          {tab === "stats" && <Stats />}
          {tab === "timeline" && <Timeline />}
          {tab === "settings" && <Settings />}
        </motion.main>
      </AnimatePresence>
      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
