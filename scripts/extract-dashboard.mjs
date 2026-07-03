import fs from "fs";

const appPath = "src/app/App.tsx";
const dashboardPath = "src/features/dashboard/DashboardScreen.tsx";

let app = fs.readFileSync(appPath, "utf8");

const startMarker = "// ─── Dashboard";
const endMarker = "// ─── Nutrition";

const start = app.indexOf(startMarker);
const end = app.indexOf(endMarker);

if (start === -1 || end === -1) {
  throw new Error("Dashboard markers not found.");
}

let dashboardBlock = app.slice(start, end);

dashboardBlock = dashboardBlock.replace(
  "function DashboardScreen",
  "export default function DashboardScreen"
);

const dashboardFile = `import { ArrowUpRight, Target, Play, Check, Droplets } from "lucide-react";
import { XAxis, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { C, type Screen } from "../../shared/ui";
import { ProgressRing, Badge, SectionHeader } from "../../shared/components";

${dashboardBlock}
`;

fs.mkdirSync("src/features/dashboard", { recursive: true });
fs.writeFileSync(dashboardPath, dashboardFile);

app = app.slice(0, start) + app.slice(end);

if (!app.includes("../features/dashboard/DashboardScreen")) {
  app = app.replace(
    `import {
  ProgressRing,
  MacroBar,
  Badge,
  Pill,
  SectionHeader,
  SubScreenHeader,
} from "../shared/components";`,
    `import {
  ProgressRing,
  MacroBar,
  Badge,
  Pill,
  SectionHeader,
  SubScreenHeader,
} from "../shared/components";
import DashboardScreen from "../features/dashboard/DashboardScreen";`
  );
}

fs.writeFileSync(appPath, app);

console.log("DashboardScreen extracted successfully.");