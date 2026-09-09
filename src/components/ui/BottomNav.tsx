import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/feed", label: "Feed" },
  { to: "/jobs/mine/client", label: "My Jobs" },
  { to: "/wallet", label: "Wallet" },
  { to: "/profile", label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#1a1c1a] border-t border-border-light dark:border-border-dark flex justify-around py-2 z-40">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isActive ? "text-teal" : "text-text-light-secondary dark:text-text-dark-secondary"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
