import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '../../lib/utils/cn'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pilih tanggal',
  disabled = false,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-medium rounded-none border-2 border-black px-4 py-3 text-sm focus:outline-none focus:bg-yellow-50 transition-colors flex items-center gap-2',
            !date && 'text-slate-500',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-300',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span className="font-bold text-slate-900 uppercase">
              {format(date, 'd MMMM yyyy', { locale: id })}
            </span>
          ) : (
            <span className="uppercase">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
