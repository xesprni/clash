import { RefreshCw, ShieldCheck } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import { useClash } from "../hooks/use-clash";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

type Provider = {
  name: string;
  type: string;
  vehicleType: string;
  proxies: any[];
  updatedAt?: string;
};

function ProvidersPage() {
  const { fetcher, request } = useClash();
  const { data, mutate } = useSWR("/providers/proxies", fetcher);
  const [busy, setBusy] = useState<string | null>(null);

  const providers: Record<string, Provider> = data?.providers || {};

  const trigger = async (name: string, action: "update" | "healthcheck") => {
    try {
      setBusy(name);
      const path =
        action === "update"
          ? `/providers/proxies/${encodeURIComponent(name)}`
          : `/providers/proxies/${encodeURIComponent(name)}/healthcheck`;
      await request(path, { method: action === "update" ? "PUT" : "GET" });
      toast.success(`${name} ${action === "update" ? "已更新" : "健康检查已触发"}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "操作失败");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Providers</p>
        <h1 className="text-2xl font-bold">代理提供者</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(providers).map((provider) => (
          <Card key={provider.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {provider.name}
                <Badge variant="success">{provider.vehicleType}</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-success" />
                {provider.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">节点数: {provider.proxies?.length || 0}</p>
              {provider.updatedAt && (
                <p className="text-muted-foreground">更新时间: {provider.updatedAt}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === provider.name}
                  onClick={() => trigger(provider.name, "update")}
                >
                  <RefreshCw className="h-4 w-4" />
                  更新
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy === provider.name}
                  onClick={() => trigger(provider.name, "healthcheck")}
                >
                  健康检查
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(providers).length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">暂无提供者。</CardContent>
          </Card>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-4 w-4" />
        数据来自 /providers/proxies。
      </div>
    </div>
  );
}

export default ProvidersPage;
