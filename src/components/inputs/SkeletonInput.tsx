import React from 'react'
import Skeleton from '../Skeleton'

interface SkeletonInputProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  wrapperClassName?: string
}

export default function SkeletonInput({
  label,
  value,
  onChange,
  isLoading = false,
  placeholder,
  className = '',
  inputClassName = '',
  wrapperClassName = '',
}: SkeletonInputProps) {
  const defaultWrapperClass = wrapperClassName || 'w-full max-w-md';
  
  return (
    <div className={className}>
      <label className="block text-sm font-bold text-black mb-3">
        {label}
      </label>
      <div className={`relative border border-gray-300 focus-within:border-gray-900 ${defaultWrapperClass}`}>
        {isLoading ? (
          <div className="px-3 py-2">
            <Skeleton width="100%" height={20} borderRadius={0} />
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 focus:outline-none text-sm bg-transparent ${inputClassName}`}
          />
        )}
      </div>
    </div>
  )
}

