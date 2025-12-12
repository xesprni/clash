import { HashRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/layout/shell";
import OverviewPage from "./pages/overview";
import ProxiesPage from "./pages/proxies";
import ProvidersPage from "./pages/providers";
import RulesPage from "./pages/rules";
import ConnectionsPage from "./pages/connections";
import DNSPage from "./pages/dns";
import SettingsPage from "./pages/settings";

function App() {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/proxies" element={<ProxiesPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/dns" element={<DNSPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}

export default App;
