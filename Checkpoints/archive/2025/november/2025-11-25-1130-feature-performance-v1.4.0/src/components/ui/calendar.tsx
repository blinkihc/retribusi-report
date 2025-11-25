import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

import { cn } from '../../lib/utils/cn'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-bold uppercase tracking-wide',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-2 border-transparent hover:border-black hover:bg-yellow-50 transition-all flex items-center justify-center'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-slate-500 rounded-none w-9 font-bold text-[0.8rem] uppercase',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:bg-slate-100 [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-none last:[&:has([aria-selected])]:rounded-r-none focus-within:relative focus-within:z-20',
        day: cn(
          'h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-black hover:text-white hover:font-bold border-2 border-transparent hover:border-black transition-all'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white font-bold border-2 border-black',
        day_today: 'bg-slate-100 text-slate-900 font-bold border-2 border-slate-300',
        day_outside:
          'day-outside text-slate-500 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30',
        day_disabled: 'text-slate-500 opacity-50',
        day_range_middle:
          'aria-selected:bg-slate-100 aria-selected:text-slate-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      modifiers={{
        weekend: { dayOfWeek: [0, 6] },
      }}
      modifiersClassNames={{
        weekend: 'text-red-600 font-bold',
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
