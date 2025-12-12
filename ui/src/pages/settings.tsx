import { useEffect, useState } from "react";
import useSWR from "swr";
import { KeyRound, Save, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useClash } from "../hooks/use-clash";
import { toast } from "sonner";

type Configs = {
  mode: string;
  "log-level": string;
  ipv6: boolean;
  "allow-lan": boolean;
};

const modes = ["rule", "global", "direct"];
const logLevels = ["debug", "info", "warning", "error", "silent"];

function SettingsPage() {
  const { baseURL, setBaseURL, token, setToken, fetcher, request } = useClash();
  const { data: configs, mutate } = useSWR<Configs>("/configs", fetcher);
  const [mode, setMode] = useState("rule");
  const [logLevel, setLogLevel] = useState("info");
  const [allowLan, setAllowLan] = useState(false);
  const [ipv6, setIPv6] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (configs) {
      setMode(configs.mode);
      setLogLevel(configs["log-level"]);
      setAllowLan(Boolean(configs["allow-lan"]));
      setIPv6(Boolean(configs.ipv6));
    }
  }, [configs]);

  const saveGeneral = async () => {
    try {
      await request("/configs", {
        method: "PATCH",
        body: JSON.stringify({
          mode,
          "log-level": logLevel,
          "allow-lan": allowLan,
          ipv6,
        }),
      });
      toast.success("配置已更新");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "更新失败");
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const res = await request("/version");
      toast.success(`连接成功，版本 ${res.version}`);
    } catch (err: any) {
      toast.error(err.message || "连接失败");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Auth & Config</p>
          <h1 className="text-2xl font-bold">设置</h1>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>连接信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>External Controller 地址</Label>
              <Input
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="http://127.0.0.1:9090"
              />
            </div>
            <div className="space-y-2">
              <Label>Secret / Token</Label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="与配置文件中的 secret 保持一致"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={token ? "success" : "warning"}>
                Token {token ? "已填写" : "未填写"}
              </Badge>
              <Badge variant="success">Base {baseURL}</Badge>
            </div>
            <Button onClick={testConnection} disabled={testing}>
              <Wifi className="h-4 w-4" />
              连通性测试
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>运行配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>模式</Label>
                <Select value={mode} onValueChange={(v) => setMode(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模式" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>日志级别</Label>
                <Select value={logLevel} onValueChange={(v) => setLogLevel(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择日志级别" />
                  </SelectTrigger>
                  <SelectContent>
                    {logLevels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">允许局域网</p>
                <p className="text-xs text-muted-foreground">启用后可被局域网访问</p>
              </div>
              <Switch checked={allowLan} onCheckedChange={(v) => setAllowLan(!!v)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">IPv6</p>
                <p className="text-xs text-muted-foreground">控制 DNS 解析 IPv6</p>
              </div>
              <Switch checked={ipv6} onCheckedChange={(v) => setIPv6(!!v)} />
            </div>
            <Button onClick={saveGeneral}>
              <Save className="h-4 w-4" />
              保存配置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
