import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import Skeleton from '../Skeleton'

interface DropdownItem {
  id: string
  name: string
  desc?: string
}

interface GroupedSkeletonDropdownProps {
  label: string
  placeholder: string
  items: DropdownItem[]
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  isLoading?: boolean
  isLoadingItems?: boolean
  className?: string
  wrapperClassName?: string
}

export default function GroupedSkeletonDropdown({
  label,
  placeholder,
  items,
  selectedIds,
  onAdd,
  onRemove,
  isLoading = false,
  isLoadingItems = false,
  className = '',
  wrapperClassName = 'w-[400px]',
}: GroupedSkeletonDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Get selected item objects
  const selectedItems = items.filter((item) => selectedIds.includes(item.id))

  // Get available items (not yet selected)
  const availableItems = items.filter((item) => !selectedIds.includes(item.id))

  // Group items by parent name (before first ":")
  const groupedItems = availableItems.reduce((acc, item) => {
    const groupName = item.name.split(':')[0] || 'other'
    if (!acc[groupName]) {
      acc[groupName] = []
    }
    acc[groupName].push(item)
    return acc
  }, {} as Record<string, DropdownItem[]>)

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedItems).sort()

  const handleAdd = (id: string) => {
    onAdd(id)
    setIsDropdownOpen(false)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-black mb-2">
        {label}
      </label>
      <div className="relative">
        <div className={`${wrapperClassName} px-3 py-2 text-sm border border-gray-300 bg-white flex items-center justify-between`}>
          {isLoading ? (
            <Skeleton width="100%" height={20} borderRadius={0} />
          ) : (
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent flex items-center justify-between"
            >
              <span className={selectedIds.length === 0 ? 'text-gray-400' : 'text-black'}>
                {placeholder}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {!isLoading && isDropdownOpen && (
          <div className={`absolute z-10 ${wrapperClassName} mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto`}>
            {isLoadingItems ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            ) : sortedGroups.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Tidak ada item tersedia</div>
            ) : (
              sortedGroups.map((groupName) => (
                <div key={groupName}>
                  {/* Group Header */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                    {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                  </div>
                  {/* Group Items */}
                  {groupedItems[groupName].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAdd(item.id)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
                    >
                      {item.name} {item.desc ? `- ${item.desc}` : ''}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Items Tags */}
      {isLoading ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-tag-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
            >
              <Skeleton width={80} height={16} borderRadius={0} />
              <Skeleton width={16} height={16} circle />
            </div>
          ))}
        </div>
      ) : selectedItems.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-sm"
            >
              <span className="text-black">{item.name}</span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

