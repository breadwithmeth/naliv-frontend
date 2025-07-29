interface ItemOption {
  option_id: number
  name: string
  required: number
  selection: "SINGLE" | "MULTIPLE"
}

interface Props {
  options: ItemOption[]
  variant?: 'compact' | 'detailed'
}

export default function OptionsIndicator({ options, variant = 'compact' }: Props) {
  if (!options || options.length === 0) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
        <span className="text-blue-500">⚙️</span>
        <span className="font-medium">
          {options.length} опци{options.length === 1 ? 'я' : options.length < 5 ? 'и' : 'й'}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <span className="text-blue-500">⚙️</span>
        Доступные опции
      </h4>
      <div className="text-sm text-blue-700 space-y-1">
        <div className="mb-2">
          У этого товара есть {options.length} опци{options.length === 1 ? 'я' : options.length < 5 ? 'и' : 'й'} для выбора:
        </div>
        {options.map((option) => (
          <div key={option.option_id} className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            <span className="font-medium">{option.name}</span>
            <span className="text-xs text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">
              {option.selection === 'SINGLE' ? 'Одиночный' : 'Множественный'}
            </span>
            {option.required === 1 && (
              <span className="text-xs text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                Обязательно
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
