import fs from "fs";

const appPath = "src/app/App.tsx";
const outPath = "src/features/nutrition/NutritionScreen.tsx";

let app = fs.readFileSync(appPath, "utf8");

const startMarker = "// ─── Nutrition";
const endMarker = "// ─── Food Database";

const start = app.indexOf(startMarker);
const end = app.indexOf(endMarker);

if (start === -1 || end === -1) {
  throw new Error("Nutrition markers not found.");
}

let block = app.slice(start, end);

block = block.replace(
  "function NutritionScreen",
  "export default function NutritionScreen"
);

const file = `import { mealData } from "../../data/meal";
import { C, type Screen } from "../../shared/ui";
import { ProgressRing, MacroBar, SectionHeader } from "../../shared/components";

${block}
`;

fs.mkdirSync("src/features/nutrition", { recursive: true });
fs.writeFileSync(outPath, file);

app = app.slice(0, start) + app.slice(end);

if (!app.includes("../features/nutrition/NutritionScreen")) {
  app = app.replace(
    `import DashboardScreen from "../features/dashboard/DashboardScreen";`,
    `import DashboardScreen from "../features/dashboard/DashboardScreen";
import NutritionScreen from "../features/nutrition/NutritionScreen";`
  );
}

fs.writeFileSync(appPath, app);

console.log("NutritionScreen extracted successfully.");