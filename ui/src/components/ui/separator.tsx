import * as React from "react";
import { cn } from "../../lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Separator({ className, ...props }: Props) {
  return <div className={cn("h-px w-full bg-border", className)} {...props} />;
}
