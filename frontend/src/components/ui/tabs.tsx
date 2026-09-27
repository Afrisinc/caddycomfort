import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

type TabsVariant = 'pill' | 'underline';

const TabsVariantContext = React.createContext<TabsVariant>('pill');

function Tabs({
  className,
  variant = 'pill',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { variant?: TabsVariant }) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-variant={variant}
        className={cn('flex flex-col gap-2', className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

const listStyles: Record<TabsVariant, string> = {
  pill: 'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
  underline:
    'flex w-full items-center gap-6 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8',
};

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(listStyles[variant], className)}
      {...props}
    />
  );
}

const triggerStyles: Record<TabsVariant, string> = {
  pill: "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  underline:
    "group/tab relative -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent pb-3.5 pt-1 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:after:absolute focus-visible:after:inset-x-0 focus-visible:after:-top-0.5 focus-visible:after:bottom-2 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-accent-rose/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-accent-rose data-[state=active]:text-foreground sm:text-[15px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
};

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(triggerStyles[variant], className)}
      {...props}
    />
  );
}

function TabsCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] leading-5 font-semibold tabular-nums text-muted-foreground transition-colors group-data-[state=active]/tab:bg-accent-rose/10 group-data-[state=active]/tab:text-accent-rose',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        variant === 'underline' &&
          'animate-in fade-in-0 slide-in-from-bottom-1 pt-8 duration-300 focus-visible:ring-2 focus-visible:ring-accent-rose/30 focus-visible:rounded-lg',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsCount, TabsContent };
