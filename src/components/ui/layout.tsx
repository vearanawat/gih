import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface LayoutSidebarProps extends LayoutProps {
  collapsed?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex min-h-screen flex-col', className)} {...props}>
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout';

export const LayoutHeader = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex h-14 items-center border-b px-4', className)} {...props}>
        {children}
      </div>
    );
  }
);
LayoutHeader.displayName = 'LayoutHeader';

export const LayoutSidebar = React.forwardRef<HTMLDivElement, LayoutSidebarProps>(
  ({ children, className, collapsed, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LayoutSidebar.displayName = 'LayoutSidebar';

export const LayoutContent = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex-1', className)} {...props}>
        {children}
      </div>
    );
  }
);
LayoutContent.displayName = 'LayoutContent';