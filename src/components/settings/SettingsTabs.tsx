export type SettingsTabId =
  | "overview"
  | "profile"
  | "security"
  | "verification"
  | "preferences";

interface SettingsTabsProps {
  active: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
}

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "verification", label: "Verification" },
  { id: "preferences", label: "Preferences" },
];

export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <div className="mb-7 flex gap-0 overflow-x-auto border-b border-white/[0.06] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative whitespace-nowrap px-5 py-[13px] text-[0.82rem] transition-colors ${
              isActive
                ? "font-semibold text-[#00dfa2]"
                : "font-medium text-[#4a5468] hover:text-[#eef2f7]"
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute -bottom-px left-0 right-0 h-[2px] rounded-t-[2px] bg-[#00dfa2]"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
