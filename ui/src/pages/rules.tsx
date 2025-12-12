import { List } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useClash } from "../hooks/use-clash";

type Rule = {
  type: string;
  payload: string;
  proxy: string;
};

function RulesPage() {
  const { fetcher } = useClash();
  const { data } = useSWR("/rules", fetcher);
  const rules: Rule[] = data?.rules || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <List className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Rule Engine</p>
          <h1 className="text-2xl font-bold">规则列表</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>匹配顺序</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>匹配</TableHead>
                <TableHead>策略</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, idx) => (
                <TableRow key={`${rule.type}-${idx}`}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Badge>{rule.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{rule.payload}</TableCell>
                  <TableCell>{rule.proxy}</TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    暂无规则。
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

export default RulesPage;
