import { Ban, Cable, CircleX } from "lucide-react";
import useSWR from "swr";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatBytes } from "../lib/utils";
import { useClash } from "../hooks/use-clash";
import { toast } from "sonner";

type Connection = {
  id: string;
  metadata: {
    host: string;
    dstIP: string;
    dstPort: number;
    srcIP: string;
    srcPort: number;
    netWork: string;
    type: string;
    processPath?: string;
  };
  upload: number;
  download: number;
  start: string;
  chains: string[];
  rule: string;
  rulePayload: string;
};

type Snapshot = {
  uploadTotal: number;
  downloadTotal: number;
  connections: Connection[];
};

function ConnectionsPage() {
  const { fetcher, request } = useClash();
  const { data, mutate, isLoading } = useSWR<Snapshot>("/connections", fetcher, {
    refreshInterval: 2000,
  });

  const closeOne = async (id: string) => {
    try {
      await request(`/connections/${id}`, { method: "DELETE" });
      toast.success(`连接 ${id} 已关闭`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "关闭失败");
    }
  };

  const closeAll = async () => {
    try {
      await request("/connections", { method: "DELETE" });
      toast.success("所有连接已关闭");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "关闭失败");
    }
  };

  const conns = data?.connections || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Cable className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Active Connections</p>
          <h1 className="text-2xl font-bold">连接管理</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge>上传总计 {formatBytes(data?.uploadTotal)}</Badge>
          <Badge>下载总计 {formatBytes(data?.downloadTotal)}</Badge>
          <Button size="sm" variant="destructive" onClick={closeAll} disabled={isLoading}>
            <Ban className="h-4 w-4" />
            全部关闭
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>连接列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>目标</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>规则/链</TableHead>
                <TableHead>流量</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {conns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">
                      {c.metadata?.host || c.metadata?.dstIP}:{c.metadata?.dstPort}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.metadata?.type} / {c.metadata?.netWork}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.metadata?.srcIP}:{c.metadata?.srcPort}
                    {c.metadata?.processPath && <div className="text-xs">{c.metadata.processPath}</div>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      <Badge>{c.rule || "-"}</Badge>
                      {c.rulePayload && <Badge variant="warning">{c.rulePayload}</Badge>}
                      {c.chains && c.chains.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {c.chains.join(" → ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    ↑ {formatBytes(c.upload)} / ↓ {formatBytes(c.download)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => closeOne(c.id)}>
                      <CircleX className="h-4 w-4 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {conns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    暂无连接。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConnectionsPage;
