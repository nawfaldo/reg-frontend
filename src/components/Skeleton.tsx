import React from 'react'

interface SkeletonProps {
  className?: string
  width?: number | string
  height?: number | string
  circle?: boolean
  borderRadius?: number
}

export default function Skeleton({ 
  className = '', 
  width, 
  height, 
  circle = false,
  borderRadius = 4 
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    borderRadius: circle ? '50%' : `${borderRadius}px`,
  }

  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-[#EEEEEE] via-[#CBCBCB] to-[#EEEEEE] bg-[length:200%_100%] ${className}`}
      style={style}
    />
  )
}
