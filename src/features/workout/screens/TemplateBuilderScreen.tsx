import { Plus, Trash2, ClipboardList } from "lucide-react";

import { C, type Screen } from "@/shared/ui";
import EmptyState from "@/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useWorkoutTemplateStore } from "@/store/workoutTemplateStore";

export default function TemplateBuilderScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  const user = useAuthStore((s) => s.user);

  const templates = useWorkoutTemplateStore((s) => s.templates);
  const saveTemplate = useWorkoutTemplateStore((s) => s.save);
  const removeTemplate = useWorkoutTemplateStore((s) => s.remove);
  const selectTemplate = useWorkoutTemplateStore((s) => s.selectTemplate);

  const handleCreate = async () => {
    if (!user) return;

    const id = crypto.randomUUID();

    await saveTemplate(user.uid, {
      id,
      // Numbered default so multiple new templates stay distinguishable
      // until the user names them properly in the editor.
      name: `Workout ${templates.length + 1}`,
      description: "",
      exercises: [],
    });

    selectTemplate(id);
    onNavigate("template-editor");
  };

  const handleOpen = (templateId: string) => {
    selectTemplate(templateId);
    onNavigate("template-editor");
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    templateId: string
  ) => {
    event.stopPropagation();
    if (!user) return;

    await removeTemplate(user.uid, templateId);
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: C.accent }}
          >
            Workout
          </p>
          <h2 className="text-[22px] font-extrabold" style={{ color: C.fg }}>
            Templates
          </h2>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-2 rounded-[14px] text-xs font-bold"
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            color: C.fg,
          }}
        >
          Back
        </button>
      </div>

      <button
        onClick={handleCreate}
        className="w-full py-4 rounded-[20px] font-bold text-base flex items-center justify-center gap-2 mb-4"
        style={{ background: C.accent, color: C.bg }}
      >
        <Plus size={18} />
        New Template
      </button>

      <div className="flex flex-col gap-3">
        {templates.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No templates yet"
            body="A template is a reusable workout — pick the exercises once, then start it any time."
            actionLabel="Create template"
            onAction={handleCreate}
          />
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleOpen(template.id)}
              className="rounded-[20px] p-4 flex items-center justify-between gap-3 text-left"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div>
                <p className="text-base font-bold" style={{ color: C.fg }}>
                  {template.name}
                </p>
                <p className="text-xs mt-1" style={{ color: C.fg3 }}>
                  {template.exercises.length} exercises
                </p>
              </div>

              <button
                onClick={(event) => handleDelete(event, template.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: C.card2,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Trash2 size={15} color={C.red} />
              </button>
            </button>
          ))
        )}
      </div>
    </div>
  );
}