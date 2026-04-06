import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Strongest — filled inversion of the theme: foreground bg, background text.
        // Pairs with outline as the two ends of the visual hierarchy.
        default:
          'bg-foreground text-background shadow-xs transition-all duration-200 hover:opacity-85 hover:scale-[1.02] dark:bg-foreground dark:text-background data-[state=open]:opacity-85',

        // The reference — kept exactly as-is.
        outline:
          'border border-black bg-background shadow-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] dark:bg-input/30 dark:border-gray-200 dark:hover:bg-input/50 dark:border-white data-[state=open]:bg-accent dark:data-[state=open]:bg-accent',

        // Middle ground — muted text + muted border at rest; steps up to foreground on hover.
        // No fill, so it sits between outline and ghost in visual weight.
        secondary:
          'border border-muted-foreground/40 bg-background text-muted-foreground shadow-xs transition-all duration-200 hover:border-foreground hover:text-foreground hover:scale-[1.02] dark:bg-input/30 dark:border-muted-foreground/30 dark:hover:border-foreground data-[state=open]:border-foreground data-[state=open]:text-foreground',

        // Lightest interactive — no border, no fill; a subtle bg tint appears on hover.
        ghost:
          'text-foreground transition-all duration-200 hover:bg-foreground/8 hover:scale-[1.02] dark:hover:bg-foreground/10 data-[state=open]:bg-foreground/8 dark:data-[state=open]:bg-foreground/10',

        // Text-only — uses foreground colour and a clean underline on hover.
        link: 'text-foreground underline-offset-4 transition-all duration-200 hover:underline hover:text-muted-foreground',

        // Destructive — red fill at rest, darkens on hover. Works in both modes.
        destructive:
          'bg-red-600 text-white shadow-xs transition-all duration-200 hover:bg-red-700 hover:scale-[1.02] dark:bg-red-700 dark:hover:bg-red-800 data-[state=open]:bg-red-700',

        pagination:
          'text-accent hover:text-foreground bg-gray-200 border border-gray-300 transition-all duration-200 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-500 dark:hover:border-foreground/10 aria-current:bg-foreground aria-current:text-background aria-current:border-transparent aria-current:shadow-xs',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        md: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xl: 'h-11 rounded-md px-8 has-[>svg]:px-6',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
