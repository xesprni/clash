import { CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import { useClash } from "../hooks/use-clash";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { formatDuration } from "../lib/utils";
import { toast } from "sonner";

type ProxyInfo = {
  name: string;
  type: string;
  now?: string;
  all?: string[];
  alive?: boolean;
  history?: { time: string; delay: number; meanDelay: number }[];
};

function ProxiesPage() {
  const { fetcher, request } = useClash();
  const { data, mutate, isLoading } = useSWR("/proxies", fetcher);
  const [busy, setBusy] = useState<string | null>(null);

  const proxies: Record<string, ProxyInfo> = data?.proxies || {};
  const entries = Object.entries(proxies);

  const updateSelector = async (name: string, target: string) => {
    try {
      setBusy(name);
      await request(`/proxies/${encodeURIComponent(name)}`, {
        method: "PUT",
        body: JSON.stringify({ name: target }),
      });
      toast.success(`已切换 ${name} -> ${target}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "切换失败");
    } finally {
      setBusy(null);
    }
  };

  const testDelay = async (name: string) => {
    try {
      setBusy(name);
      const res = await request(
        `/proxies/${encodeURIComponent(name)}/delay?timeout=3000&url=http://www.gstatic.com/generate_204`
      );
      toast.success(`${name} 延迟 ${res.delay} ms`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "测速失败");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Proxy & Group</p>
        <h1 className="text-2xl font-bold">代理与策略组</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(([name, proxy]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{name}</span>
                <Badge variant={proxy.alive ? "success" : "warning"}>{proxy.type}</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {proxy.now ? `当前: ${proxy.now}` : "单节点"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {proxy.all && proxy.all.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">选择出站节点</p>
                  <div className="flex gap-2">
                    <Select
                      value={proxy.now || proxy.all[0] || ""}
                      onValueChange={(v) => updateSelector(name, v)}
                      disabled={busy === name}
                    >
                      <SelectTrigger className="min-w-[180px]">
                        <SelectValue placeholder="选择节点" />
                      </SelectTrigger>
                      <SelectContent>
                        {proxy.all.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testDelay(name)}
                      disabled={busy === name}
                    >
                      <Clock3 className="h-4 w-4" />
                      延迟
                    </Button>
                  </div>
                </div>
              )}
              {proxy.history && proxy.history.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  最近延迟:{" "}
                  {formatDuration(proxy.history[proxy.history.length - 1]?.delay)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {!entries.length && !isLoading && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">暂无代理数据。</CardContent>
          </Card>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-4 w-4" />
        数据来自 /proxies 与 /proxies/:name/delay。
      </div>
    </div>
  );
}

export default ProxiesPage;
