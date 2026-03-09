
import { DartboardIcon } from "./dartboard-icon";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <DartboardIcon className="h-8 w-8 text-primary" />
      <span className="text-3xl font-headline">DartBrig Pro</span>
    </div>
  );
}
