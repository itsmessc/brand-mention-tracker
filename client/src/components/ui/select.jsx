import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-md border border-border bg-white px-2 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
