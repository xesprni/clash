import { Activity, Gauge, RadioTower, Shield, Wifi } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { formatBytes } from "../lib/utils";
import { useClash } from "../hooks/use-clash";
import { useTraffic } from "../hooks/use-traffic";

function OverviewPage() {
  const { fetcher } = useClash();
  const { data: version } = useSWR("/version", fetcher);
  const { data: configs } = useSWR("/configs", fetcher);
  const traffic = useTraffic();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">实时总览</p>
          <h1 className="text-2xl font-bold">Clash 控制台</h1>
        </div>
        {version?.version && <Badge variant="success">核心版本 {version.version}</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Activity}
          label="上传"
          value={formatBytes(traffic.up)}
          hint={traffic.connected ? "实时" : "等待流量"}
        />
        <StatCard
          icon={Gauge}
          label="下载"
          value={formatBytes(traffic.down)}
          hint={traffic.connected ? "实时" : "等待流量"}
        />
        <StatCard
          icon={Shield}
          label="运行模式"
          value={configs?.mode || "unknown"}
          hint="Rule / Global / Direct"
        />
        <StatCard
          icon={RadioTower}
          label="日志级别"
          value={configs?.["log-level"] || "-"}
          hint="debug/info/warning/error"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>实时流量</CardTitle>
            <Badge variant={traffic.connected ? "success" : "warning"}>
              {traffic.connected ? "WebSocket 已连接" : "等待连接"}
            </Badge>
          </CardHeader>
          <CardContent>
            <TrafficBars upSeries={traffic.series.up} downSeries={traffic.series.down} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>网络摘要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="IPv6" value={configs?.ipv6 ? "开启" : "关闭"} />
            <Row label="允许局域网" value={configs?.["allow-lan"] ? "是" : "否"} />
            <Row label="Mixed Port" value={configs?.["mixed-port"] ?? "-"} />
            <Row label="HTTP Port" value={configs?.port ?? "-"} />
            <Row label="SOCKS Port" value={configs?.["socks-port"] ?? "-"} />
            <Separator />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wifi className="h-4 w-4" />
              实时数据来自 /traffic WebSocket
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverviewPage;

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function TrafficBars({ upSeries, downSeries }: { upSeries: number[]; downSeries: number[] }) {
  const max = Math.max(1, ...upSeries, ...downSeries);
  const bars = Math.max(upSeries.length, downSeries.length);
  if (bars === 0) {
    return <p className="text-sm text-muted-foreground">等待流量数据...</p>;
  }
  return (
    <div className="flex h-48 items-end gap-1">
      {Array.from({ length: bars }).map((_, idx) => {
        const up = upSeries[idx] ?? 0;
        const down = downSeries[idx] ?? 0;
        return (
          <div key={idx} className="flex w-full flex-col gap-1">
            <div
              className="h-20 rounded-full bg-primary/70"
              style={{ height: `${(up / max) * 100}%` }}
              title={`↑ ${formatBytes(up)}`}
            />
            <div
              className="h-12 rounded-full bg-accent/70"
              style={{ height: `${(down / max) * 100}%` }}
              title={`↓ ${formatBytes(down)}`}
            />
          </div>
        );
      })}
    </div>
  );
}
