import { C } from "@/shared/ui";

type Props = {
  name: string;
  date: string;
};

export default function GreetingCard({ name, date }: Props) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold mb-1" style={{ color: C.accent }}>
        Good morning
      </p>

      <h1
        className="text-[32px] font-extrabold leading-none tracking-tight"
        style={{ color: C.fg }}
      >
        {name}
      </h1>

      <p className="text-sm mt-1.5" style={{ color: C.fg3 }}>
        {date}
      </p>
    </div>
  );
}