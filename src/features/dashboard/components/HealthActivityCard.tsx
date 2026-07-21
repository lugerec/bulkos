import { useEffect, useState } from "react";
import { Flame, Footprints, MapPin } from "lucide-react";

import { StatTile } from "@/shared/components";
import { C, T } from "@/shared/ui";
import {
  checkHealthAuthorization,
  isHealthAvailable,
  readTodayTotal,
} from "@/services/healthService";

type Activity = {
  steps: number;
  calories: number;
  distanceMeters: number;
};

/**
 * Compact "today from Apple Health" strip: steps, active calories, distance.
 * Renders nothing unless Health is available, authorized, and returns data —
 * so it never shows an empty shell on web or for users who didn't connect.
 */
export default function HealthActivityCard() {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!(await isHealthAvailable())) return;
      if (!(await checkHealthAuthorization())) return;

      const [steps, calories, distanceMeters] = await Promise.all([
        readTodayTotal("steps"),
        readTodayTotal("calories"),
        readTodayTotal("distance"),
      ]);

      // Only show the card if there's something worth showing.
      if (!cancelled && (steps > 0 || calories > 0 || distanceMeters > 0)) {
        setActivity({ steps, calories, distanceMeters });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!activity) return null;

  const km = activity.distanceMeters / 1000;

  return (
    <div className="mb-4">
      <p className="mb-2 px-1" style={{ ...T.eyebrow, color: C.fg3 }}>
        Today · Apple Health
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<Footprints size={16} />}
          value={Math.round(activity.steps).toLocaleString()}
          label="Steps"
        />
        <StatTile
          icon={<Flame size={16} />}
          value={`${Math.round(activity.calories)}`}
          label="Active kcal"
        />
        <StatTile
          icon={<MapPin size={16} />}
          value={km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`}
          label="Distance"
        />
      </div>
    </div>
  );
}
