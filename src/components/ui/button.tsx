import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Strongest — solid fill, foreground bg. Hero CTA.
        // Hover: opacity turun + shadow naik untuk kesan "lift yang nyata".
        default:
          'bg-foreground text-background shadow-xs transition-all duration-200 hover:bg-foreground/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:shadow-xs dark:bg-foreground dark:text-background dark:hover:bg-foreground/75 data-[state=open]:bg-foreground/80 data-[state=open]:shadow-md',

        // The reference — kept exactly as-is.
        outline:
          'border border-black bg-background shadow-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] dark:bg-input/30 dark:border-gray-300 dark:hover:bg-input/50 dark:border-white data-[state=open]:bg-accent dark:data-[state=open]:bg-accent',

        // Filled-muted — BUKAN border button. Pakai bg-muted sebagai identitasnya
        // sehingga jelas berbeda dari outline yang berbasis border.
        // Cocok untuk aksi tersier atau "soft secondary".
        secondary:
          'bg-muted text-foreground/65 transition-all duration-200 hover:bg-muted/60 hover:text-foreground hover:scale-[1.02] active:scale-[0.98] active:bg-muted/80 dark:bg-muted/40 dark:text-foreground/55 dark:hover:bg-muted/60 dark:hover:text-foreground data-[state=open]:bg-muted/60 data-[state=open]:text-foreground dark:data-[state=open]:bg-muted/60',

        // "Invisible button" — tidak terlihat sampai di-hover.
        // Hover memberikan bg fill (accent) — inilah yang membedakannya dari link.
        // Ideal untuk toolbar, icon button, dan aksi kontekstual.
        ghost:
          'text-foreground/65 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] active:bg-accent/70 dark:text-foreground/55 dark:hover:bg-accent/80 dark:hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground dark:data-[state=open]:bg-accent/80',

        // Pure teks — TIDAK PERNAH mendapat background, bahkan saat hover.
        // Hanya underline treatment. Cocok untuk link inline atau navigasi.
        link: 'text-foreground/70 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline active:opacity-50 dark:text-foreground/60 dark:hover:text-foreground',

        // Destructive — kept as-is.
        destructive:
          'bg-red-600 text-white shadow-xs transition-all duration-200 hover:bg-red-700 hover:scale-[1.02] dark:bg-red-700 dark:hover:bg-red-800 data-[state=open]:bg-red-700',

        // Pagination — kept as-is.
        pagination:
          'text-accent hover:text-foreground bg-gray-200 border border-gray-300 transition-all duration-200 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-500 dark:hover:border-foreground/10 aria-current:bg-foreground aria-current:text-background aria-current:border-transparent aria-current:shadow-xs',

        // High contrast — visible on both light and dark surfaces.
        // Light mode: blue-600 on white. Dark mode: blue-500 on dark.
        contrast:
          'bg-blue-600 text-white shadow-xs transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:shadow-xs dark:bg-blue-500 dark:hover:bg-blue-400 dark:hover:shadow-md data-[state=open]:bg-blue-700 dark:data-[state=open]:bg-blue-400',
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
