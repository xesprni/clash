import { Globe2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { useClash } from "../hooks/use-clash";
import { toast } from "sonner";

const TYPES = ["A", "AAAA", "HTTPS", "CNAME", "TXT", "MX"];

function DNSPage() {
  const { request } = useClash();
  const [name, setName] = useState("");
  const [type, setType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const query = async () => {
    if (!name) {
      toast.error("请输入域名");
      return;
    }
    try {
      setLoading(true);
      const res = await request(
        `/dns/query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`
      );
      setResult(res);
    } catch (err: any) {
      toast.error(err.message || "查询失败");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">DNS Query</p>
          <h1 className="text-2xl font-bold">DNS 调试</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>查询</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.6fr_0.6fr_0.6fr]">
            <div className="space-y-2">
              <Label>域名</Label>
              <Input
                placeholder="example.com"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={query} disabled={loading}>
                <Search className="h-4 w-4" />
                查询
              </Button>
            </div>
          </div>
          {result && (
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl bg-black/90 p-4 text-xs text-green-100">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DNSPage;
