'use client'

import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * 表单字段类型
 */
export type FieldType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'switch' | 'file'

/**
 * 选择项
 */
export interface SelectOption {
  value: string
  label: string
}

/**
 * 表单字段定义
 */
export interface FormField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: SelectOption[]  // for select type
  min?: number              // for number type
  max?: number              // for number type
  rows?: number             // for textarea type
  accept?: string           // for file type
  helpText?: string
  validate?: (value: unknown) => string | null
}

/**
 * 表单值类型
 */
export type FormValues = Record<string, unknown>

/**
 * 表单错误类型
 */
export type FormErrors = Record<string, string>

/**
 * 表单构建器属性
 */
export interface FormBuilderProps {
  fields: FormField[]
  initialValues?: FormValues
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  className?: string
  disabled?: boolean
}

/**
 * 通用表单构建器组件
 */
export function FormBuilder({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = '提交',
  cancelLabel = '取消',
  className = '',
  disabled = false
}: FormBuilderProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // 更新字段值
  const handleChange = useCallback((key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }))
    // 清除该字段的错误
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }, [errors])

  // 验证表单
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    for (const field of fields) {
      const value = values[field.key]

      // 必填验证
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          newErrors[field.key] = `${field.label}不能为空`
          continue
        }
      }

      // 自定义验证
      if (field.validate && value !== undefined && value !== null && value !== '') {
        const error = field.validate(value)
        if (error) {
          newErrors[field.key] = error
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fields, values])

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  // 渲染字段
  const renderField = (field: FormField) => {
    const value = values[field.key]
    const error = errors[field.key]
    const isDisabled = disabled || submitting || field.disabled

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            type={field.type}
            value={String(value ?? '')}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value !== undefined ? String(value) : ''}
            onChange={e => handleChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            disabled={isDisabled}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={String(value ?? '')}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            disabled={isDisabled}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'select':
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={v => handleChange(field.key, v)}
            disabled={isDisabled}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={field.placeholder || '请选择'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={v => handleChange(field.key, v)}
            disabled={isDisabled}
          />
        )

      case 'file':
        return (
          <Input
            type="file"
            accept={field.accept}
            onChange={e => handleChange(field.key, e.target.files?.[0])}
            disabled={isDisabled}
            className={error ? 'border-destructive' : ''}
          />
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.key} className={field.type === 'switch' ? 'cursor-pointer' : ''}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'switch' && renderField(field)}
            </div>
            
            {field.type !== 'switch' && renderField(field)}
            
            {field.helpText && !errors[field.key] && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            
            {errors[field.key] && (
              <p className="text-xs text-destructive">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={disabled || submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default FormBuilder
