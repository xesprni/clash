import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
