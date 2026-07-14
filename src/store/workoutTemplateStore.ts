import { create } from "zustand";

import type { WorkoutTemplate } from "@/types/workout";
import {
  deleteWorkoutTemplate,
  loadWorkoutTemplates,
  saveWorkoutTemplate,
} from "@/services/workoutTemplateService";

type State = {
  templates: WorkoutTemplate[];
  selected?: WorkoutTemplate;
  loading: boolean;
  error: string | null;

  load: (uid: string) => Promise<void>;
  setTemplates: (templates: WorkoutTemplate[]) => void;
  selectTemplate: (id: string) => void;
  /** Select a coach-generated template without persisting it. */
  selectGenerated: (template: WorkoutTemplate) => void;
  save: (uid: string, template: WorkoutTemplate) => Promise<void>;
  remove: (uid: string, templateId: string) => Promise<void>;
};

export const useWorkoutTemplateStore = create<State>((set, get) => ({
  templates: [],
  selected: undefined,
  loading: false,
  error: null,

  async load(uid) {
    try {
      set({ loading: true, error: null });

      const templates = await loadWorkoutTemplates(uid);

      set({
        templates,
        selected: get().selected ?? templates[0],
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load workout templates",
      });
    } finally {
      set({ loading: false });
    }
  },

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

  selectGenerated: (template) => {
    set({ selected: template });
  },

  async save(uid, template) {
    try {
      set({ loading: true, error: null });

      await saveWorkoutTemplate(uid, template);

      const templates = get().templates;
      const exists = templates.some((t) => t.id === template.id);

      const nextTemplates = exists
        ? templates.map((t) => (t.id === template.id ? template : t))
        : [...templates, template];

      set({
        templates: nextTemplates,
        selected: template,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to save workout template",
      });
    } finally {
      set({ loading: false });
    }
  },

  async remove(uid, templateId) {
    try {
      set({ loading: true, error: null });

      await deleteWorkoutTemplate(uid, templateId);

      const nextTemplates = get().templates.filter((t) => t.id !== templateId);

      set({
        templates: nextTemplates,
        selected: nextTemplates[0],
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete workout template",
      });
    } finally {
      set({ loading: false });
    }
  },
}));