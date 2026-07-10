import { DESIGN_TEMPLATES } from '../../utils/templates'

interface DesignTemplatesProps {
  onApply: (templateId: string) => void
}

/** Quick-start templates for new designs. */
export function DesignTemplates({ onApply }: DesignTemplatesProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-stitch-700 dark:text-stitch-300">
        Start from template
      </p>
      <div className="flex flex-wrap gap-2">
        {DESIGN_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApply(template.id)}
            title={template.description}
            className="min-h-11 rounded-xl border border-stitch-200 px-3 text-sm font-medium text-stitch-700 transition-colors hover:border-stitch-400 hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-200 dark:hover:border-stitch-600 dark:hover:bg-stitch-800"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  )
}
