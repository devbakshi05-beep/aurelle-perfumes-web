import { ORDER_STAGES } from "@/lib/types";

export default function Stepper({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <p className="rounded-xl border border-red-500/60 px-4 py-2 text-red-600 dark:text-red-400">
        Order cancelled
      </p>
    );
  }
  const idx = ORDER_STAGES.indexOf(status);
  return (
    <ol className="flex flex-wrap gap-2">
      {ORDER_STAGES.map((s, i) => (
        <li
          key={s}
          aria-current={i === idx ? "step" : undefined}
          className={`flex-1 basis-24 rounded-xl border px-3 py-2 text-center text-sm ${
            i <= idx ? "border-gold bg-gold text-on-gold" : "border-line text-mut"
          }`}
        >
          {s}
        </li>
      ))}
    </ol>
  );
}
