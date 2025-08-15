import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DayPickerSingleProps } from "react-day-picker";

interface MiniCalendarProps extends DayPickerSingleProps {
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selected, onSelect, className, ...props }) => {
  return (
    <Calendar
      selected={selected}
      onSelect={onSelect}
      className={cn(
        "mx-auto", // Center on all screens
        "w-full", // Take full width of parent (sidebar)
        "max-w-[315px]", // Max width for desktop
        className // Removed aspect-[315/476] and overflow-hidden
      )}
      classNames={{
        // Adjust internal calendar elements to fit better within the constrained aspect ratio
        caption: "flex justify-center pt-1 relative items-center text-sm",
        caption_label: "text-sm font-medium",
        nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full h-full border-collapse space-y-1",
        head_row: "flex gap-x-2", // Increased gap-x
        head_cell: "text-muted-foreground rounded-md w-full font-normal text-xs uppercase",
        row: "flex w-full mt-1 gap-x-2", // Reduced mt and increased gap-x
        cell: "w-full text-center p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "w-full aspect-square flex items-center justify-center p-1 font-normal aria-selected:opacity-100 text-sm rounded-full",
          "hover:bg-accent hover:text-accent-foreground"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...props.classNames,
      }}
      {...props}
    />
  );
};

export default MiniCalendar;