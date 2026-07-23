// Compact inline icon set (24px grid, stroke-based) so the app ships zero
// icon dependencies. All icons inherit currentColor.

interface IconProps {
  className?: string;
}

function base(className?: string) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export const IconGrid = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconChecklist = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 6l1.5 1.5L8 5" />
    <path d="M4 12.5l1.5 1.5L8 11.5" />
    <path d="M4 19l1.5 1.5L8 18" />
    <path d="M11 6.5h9M11 13h9M11 19.5h9" />
  </svg>
);

export const IconHammer = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14.5 4.5l5 5-2 2-5-5z" />
    <path d="M12.5 6.5L4 15l3 3 8.5-8.5" />
    <path d="M17.5 9.5L21 13" />
  </svg>
);

export const IconDollar = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 2v20" />
    <path d="M17 6.5c0-1.5-2-2.5-5-2.5s-5 1-5 3 1.5 2.7 5 3.5 5 1.6 5 3.5-2 3-5 3-5-1-5-2.5" />
  </svg>
);

export const IconArchive = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9" />
    <path d="M10 13h4" />
  </svg>
);

export const IconPlus = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconX = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconExternal = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6" />
  </svg>
);

export const IconUpload = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
  </svg>
);

export const IconFile = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14 3H7a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const IconTrash = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
    <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconPencil = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M17 3l4 4L8 20l-5 1 1-5z" />
  </svg>
);

export const IconLock = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export const IconGlobe = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z" />
  </svg>
);

export const IconArrowLeft = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </svg>
);

export const IconCheck = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const IconRestore = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 12a9 9 0 109-9" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconChevronDown = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconChat = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M21 12a8 8 0 01-8 8H4l2.3-2.9A8 8 0 1121 12z" />
    <path d="M8.5 10.5h7M8.5 14h4.5" />
  </svg>
);

export const IconSpark = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
  </svg>
);

export const IconSliders = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
);
