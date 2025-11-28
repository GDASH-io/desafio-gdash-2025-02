import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';

const Command = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--card)] text-[var(--text)] ${className ?? ''}`}
        {...props}
    />
));
Command.displayName = CommandPrimitive.displayName;

const CommandList = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.List
        ref={ref}
        className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className ?? ''}`}
        {...props}
    />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Empty ref={ref} className={`py-6 text-center text-sm ${className ?? ''}`} {...props} />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={`overflow-hidden py-3 px-2 text-[var(--text)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--muted)] ${className ?? ''}`}
        {...props}
    />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator ref={ref} className={`-mx-1 h-px bg-[var(--border)] ${className ?? ''}`} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b border-[var(--border)] px-3" cmdk-input-wrapper="">
        <CommandPrimitive.Input
            ref={ref}
            className={`flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:[var(--muted)] ${className ?? ''}`}
            {...props}
        />
    </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={`relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-[var(--table-row-hover)] aria-selected:text-[var(--text)] ${className ?? ''}`}
        {...props}
    />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator };