import { ShieldCheck, Signal } from "lucide-react";
import useSWR from "swr";
import { useClash } from "../../hooks/use-clash";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function Topbar() {
  const { baseURL, token, fetcher } = useClash();
  const { data: version, isLoading, mutate } = useSWR("/version", fetcher, {
    refreshInterval: 30000,
  });

  return (
    <header className="glass sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <Signal className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-semibold leading-tight">{baseURL}</p>
          <p className="text-xs text-muted-foreground">Token: {token ? "已配置" : "未配置"}</p>
        </div>
        <Separator className="mx-2 hidden h-6 w-px lg:block" />
        <Badge variant={version ? "success" : "warning"}>
          {isLoading ? "连接中..." : version ? `v ${version.version}` : "未连接"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          <ShieldCheck className="h-4 w-4" />
          检测连通
        </Button>
      </div>
    </header>
  );
}
