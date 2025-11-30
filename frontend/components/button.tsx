// components/ui/Button.tsx - Enterprise Design System with Micro-interactions
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center relative overflow-hidden group'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity',
    secondary: 'bg-[#1a1f29] text-white border border-[rgba(255,255,255,0.08)] hover:bg-[#2a3142] hover:border-[rgba(255,255,255,0.12)] hover:scale-[1.01] active:scale-[0.99]',
    outline: 'border border-[rgba(255,255,255,0.12)] text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.04)] hover:text-white hover:border-[rgba(99,102,241,0.3)]',
    ghost: 'text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.04)] hover:text-white',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-6 py-2.5 text-base h-10',
    lg: 'px-8 py-4 text-lg h-12',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </span>
      ) : (
        <>
          {children}
          {variant === 'primary' && (
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></span>
          )}
        </>
      )}
    </button>
  )
}

// components/ui/Card.tsx - Enhanced with micro-interactions
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[#1a1f29] backdrop-blur-xl rounded-xl p-4 md:p-6 border border-[rgba(255,255,255,0.08)]
        transition-all duration-300
        ${hover ? 'hover:bg-[#1f2533] hover:border-[rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// components/ui/Input.tsx - Enhanced focus states
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2 transition-colors">
          {label}
          {props.required && <span className="text-[#f43f5e] ml-1 inline-block animate-pulse">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-[#0f1318] border rounded-lg text-white 
          placeholder-[#64748b] focus:ring-2 focus:ring-[#6366f1] 
          focus:border-transparent transition-all duration-200
          hover:border-[rgba(255,255,255,0.12)]
          ${error ? 'border-[#f43f5e] focus:ring-[#f43f5e]' : 'border-[rgba(255,255,255,0.08)]'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#f43f5e] mt-1 flex items-center animate-slideIn">
          <span className="mr-1">⚠</span>{error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#64748b] mt-1 transition-colors">{helperText}</p>
      )}
    </div>
  )
}

// components/ui/Badge.tsx - Subtle pulse animation
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
  pulse?: boolean
}

export function Badge({ children, variant = 'info', pulse = false }: BadgeProps) {
  const variants = {
    success: 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border-[rgba(16,185,129,0.3)]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    error: 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e] border-[rgba(244,63,94,0.3)]',
    info: 'bg-[rgba(99,102,241,0.1)] text-[#a5b4fc] border-[rgba(99,102,241,0.3)]',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${variants[variant]} ${pulse ? 'animate-pulse' : ''}`}>
      {children}
    </span>
  )
}

// components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[rgba(255,255,255,0.05)] rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </Card>
  )
}

// components/ui/Alert.tsx - Enhanced with slide-in animation
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  const colors = {
    success: 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981]',
    error: 'bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.3)] text-[#f43f5e]',
    warning: 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]',
    info: 'bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.3)] text-[#a5b4fc]',
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[type]} flex items-start gap-3 animate-slideIn`}>
      <span className="text-xl font-bold">{icons[type]}</span>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity hover:scale-110 transition-transform duration-200"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// components/ui/Modal.tsx - Enhanced backdrop blur
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f29] rounded-2xl p-6 max-w-lg w-full border border-[rgba(255,255,255,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-white text-2xl transition-all hover:scale-110 hover:rotate-90 duration-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 md:py-20 bg-[rgba(255,255,255,0.02)] backdrop-blur-lg rounded-2xl border border-[rgba(255,255,255,0.04)] animate-fadeIn">
      <div className="text-5xl md:text-6xl mb-4 animate-pulse">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#cbd5e1] mb-6 max-w-md mx-auto px-4">{description}</p>
      {action}
    </div>
  )
}