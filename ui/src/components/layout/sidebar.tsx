import { Gauge, Cable, ListChecks, Network, Server, Globe2, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const nav = [
  { label: "概览", to: "/", icon: Gauge },
  { label: "代理", to: "/proxies", icon: Network },
  { label: "提供者", to: "/providers", icon: Server },
  { label: "规则", to: "/rules", icon: ListChecks },
  { label: "连接", to: "/connections", icon: Cable },
  { label: "DNS", to: "/dns", icon: Globe2 },
  { label: "设置", to: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border/80 p-5 lg:flex">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-semibold">
            CL
          </div>
          <div>
            <p className="text-base font-semibold">Clash Dashboard</p>
            <p className="text-xs text-muted-foreground">React + shadcn</p>
          </div>
        </div>
      </div>
      <nav className="space-y-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-white shadow-soft"
                  : "text-foreground/80 hover:bg-muted"
              )
            }
            end={item.to === "/"}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 text-xs text-muted-foreground">
        外部控制器必须启用 <code>external-controller</code>。
      </div>
    </aside>
  );
}
