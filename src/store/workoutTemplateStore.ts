import { create } from "zustand";

import type { WorkoutTemplate } from "@/types/workout";

type State = {
  templates: WorkoutTemplate[];
  selected?: WorkoutTemplate;

  setTemplates: (templates: WorkoutTemplate[]) => void;
  selectTemplate: (id: string) => void;
};

export const useWorkoutTemplateStore = create<State>((set, get) => ({
  templates: [],
  selected: undefined,

  setTemplates: (templates) =>
    set({
      templates,
      selected: templates[0],
    }),

  selectTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);

    if (template) {
      set({ selected: template });
    }
  },
}));