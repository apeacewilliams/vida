import Link from "next/link";

function SuggestionsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="7" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="12" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-[#1a2e2a] flex flex-col h-full">
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 1C4 1 2 3.5 2 6c0 2 1 3.5 3 4.5V12h4v-1.5c2-1 3-2.5 3-4.5 0-2.5-2-5-5-5z"
                fill="#34d399"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-wide">
            VIDA
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Manage
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 text-white text-sm font-medium"
        >
          <SuggestionsIcon />
          Suggestions
        </Link>
      </nav>
    </aside>
  );
}
