import { Coin } from "./bond-mark";
import { Pill } from "./ui/pill";
import { formatLC } from "@/lib/utils";

export function WalletCard({
  personalLc,
  commonLc,
  partnerName,
  streak,
}: {
  personalLc: number;
  commonLc: number;
  partnerName?: string;
  streak?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-ink p-5 text-white shadow-card">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full" style={{ background: "var(--accent)", filter: "blur(50px)", opacity: 0.55 }} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/50">Твой кошелёк</div>
          <div className="mt-1 flex items-center gap-2">
            <Coin size={20} />
            <span className="text-[34px] font-bold tracking-tight">{formatLC(personalLc)}</span>
            <span className="mb-1 text-[12px] text-white/50">LC</span>
          </div>
        </div>
        {typeof streak === "number" && (
          <Pill variant="accent" size="sm">
            🔥 {streak} дн
          </Pill>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md bg-white/6 px-4 py-3 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/50">
            Общий кошелёк{partnerName ? ` · с ${partnerName}` : ""}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[18px] font-semibold">
            <Coin size={14} />
            {formatLC(commonLc)} LC
          </div>
        </div>
      </div>
    </div>
  );
}
