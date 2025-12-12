import { useEffect, useMemo, useState } from "react";
import { useClash } from "./use-clash";
import { normalizeBase } from "../lib/utils";

type TrafficPoint = { up: number; down: number; ts: number };
const MAX_POINTS = 40;

export function useTraffic() {
  const { baseURL, token } = useClash();
  const [points, setPoints] = useState<TrafficPoint[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const base = normalizeBase(baseURL);
    if (!base) return;
    const wsURL = base.replace(/^http/, "ws") + `/traffic${token ? `?token=${token}` : ""}`;

    const ws = new WebSocket(wsURL);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { up: number; down: number };
        setPoints((prev) => {
          const next = [...prev, { ...payload, ts: Date.now() }];
          if (next.length > MAX_POINTS) {
            next.shift();
          }
          return next;
        });
      } catch (err) {
        // ignore malformed payload
      }
    };

    return () => ws.close();
  }, [baseURL, token]);

  const latest = points[points.length - 1] || { up: 0, down: 0, ts: Date.now() };

  const series = useMemo(() => {
    if (points.length === 0) return { up: [] as number[], down: [] as number[] };
    return {
      up: points.map((p) => p.up),
      down: points.map((p) => p.down),
    };
  }, [points]);

  return { up: latest.up, down: latest.down, points, series, connected };
}

