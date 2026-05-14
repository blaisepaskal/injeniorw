import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-brand-500/15 text-brand-300 border border-brand-500/30',
        secondary:
          'bg-surface-hover text-[var(--color-text-secondary)] border border-surface-border',
        earth:
          'bg-earth-500/15 text-earth-300 border border-earth-500/30',
        destructive:
          'bg-red-500/15 text-red-300 border border-red-500/30',
        success:
          'bg-green-500/15 text-green-300 border border-green-500/30',
        available:
          'bg-brand-500/15 text-brand-300 border border-brand-500/30',
        busy:
          'bg-earth-500/15 text-earth-300 border border-earth-500/30',
        outline:
          'border border-surface-border text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
