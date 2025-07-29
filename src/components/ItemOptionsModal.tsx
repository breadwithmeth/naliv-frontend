import { useState, useEffect } from 'react'

interface OptionVariant {
  relation_id: number
  item_id: number
  price_type: "ADD" | "REPLACE"
  price: number
  parent_item_amount: number
}

interface ItemOption {
  option_id: number
  name: string
  required: number
  selection: "SINGLE" | "MULTIPLE"
  variants: OptionVariant[]
}

interface SelectedOption {
  option_id: number
  variant: OptionVariant
}

interface Props {
  isOpen: boolean
  onClose: () => void
  options: ItemOption[]
  basePrice: number
  onConfirm: (selectedOptions: SelectedOption[]) => void
  itemName: string
}

export default function ItemOptionsModal({ isOpen, onClose, options, basePrice, onConfirm, itemName }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Проверяем, выбраны ли все обязательные опции
    const requiredOptions = options.filter(option => option.required === 1)
    const selectedOptionIds = selectedOptions.map(so => so.option_id)
    const allRequiredSelected = requiredOptions.every(option => 
      selectedOptionIds.includes(option.option_id)
    )
    setIsValid(allRequiredSelected)
  }, [selectedOptions, options])

  const handleOptionSelect = (option: ItemOption, variant: OptionVariant) => {
    setSelectedOptions(prev => {
      if (option.selection === "SINGLE") {
        // Для единичного выбора заменяем существующий выбор
        return [
          ...prev.filter(so => so.option_id !== option.option_id),
          { option_id: option.option_id, variant }
        ]
      } else {
        // Для множественного выбора переключаем состояние
        const exists = prev.find(so => 
          so.option_id === option.option_id && so.variant.relation_id === variant.relation_id
        )
        if (exists) {
          return prev.filter(so => 
            !(so.option_id === option.option_id && so.variant.relation_id === variant.relation_id)
          )
        } else {
          return [...prev, { option_id: option.option_id, variant }]
        }
      }
    })
  }

  const calculateTotalPrice = () => {
    return selectedOptions.reduce((total, selectedOption) => {
      if (selectedOption.variant.price_type === "ADD") {
        return total + selectedOption.variant.price
      } else {
        // Для REPLACE нужно заменить базовую цену
        return selectedOption.variant.price
      }
    }, basePrice)
  }

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(selectedOptions)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Выберите опции
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">{itemName}</h3>
            <p className="text-sm text-gray-600">
              Выберите необходимые опции для добавления в корзину
            </p>
            
            {/* Информация о количестве */}
            {selectedOptions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {(() => {
                    const maxQuantity = Math.max(...selectedOptions.map(so => so.variant.parent_item_amount))
                    return maxQuantity > 1 
                      ? `Будет добавлено ${maxQuantity} шт. товара в корзину`
                      : 'Будет добавлен 1 шт. товара в корзину'
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Options */}
          {options.map((option) => (
            <div key={option.option_id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{option.name}</h4>
                {option.required === 1 && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Обязательно
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {option.variants.map((variant) => {
                  const isSelected = selectedOptions.some(so => 
                    so.option_id === option.option_id && so.variant.relation_id === variant.relation_id
                  )

                  return (
                    <button
                      key={variant.relation_id}
                      onClick={() => handleOptionSelect(option, variant)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {variant.parent_item_amount} шт. товара
                          </p>
                          <p className="text-xs text-gray-500">
                            Количество: {variant.parent_item_amount}
                          </p>
                          {variant.price > 0 && (
                            <p className="text-sm text-gray-600">
                              {variant.price_type === "ADD" ? "+" : ""}{variant.price.toFixed(2)} ₸
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="text-primary-600">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">
              Итого: {calculateTotalPrice().toFixed(2)} ₸
            </span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isValid 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
