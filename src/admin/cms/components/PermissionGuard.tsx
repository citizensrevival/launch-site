// Permission Guard Components
// This file contains components for protecting UI elements based on permissions

import React from 'react';
import { usePermission, useConditionalRender } from '../../../lib/cms/permissionsHooks';
import { Permission } from '../../../lib/cms/types';

// Permission Guard Component
interface PermissionGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, fallback, children }: PermissionGuardProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Multiple Permissions Guard Component
interface MultiplePermissionsGuardProps {
  permissions: Permission[];
  mode: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function MultiplePermissionsGuard({ permissions, mode, fallback, children }: MultiplePermissionsGuardProps) {
  const { shouldRender, loading } = useConditionalRender(permissions, mode);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// CMS Operation Guard Component
interface CmsOperationGuardProps {
  operation: 'create' | 'read' | 'update' | 'delete' | 'publish';
  entityType: 'page' | 'block' | 'menu' | 'asset';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function CmsOperationGuard({ operation, entityType, fallback, children }: CmsOperationGuardProps) {
  const permission = `cms.${entityType}s.${operation}` as Permission;
  
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// Admin Access Guard Component
interface AdminAccessGuardProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminAccessGuard({ fallback, children }: AdminAccessGuardProps) {
  const permissions: Permission[] = [
    'cms.pages.read',
    'cms.blocks.read',
    'cms.menus.read',
    'cms.assets.read',
    'analytics.read',
    'leads.read',
    'users.manage',
    'system.admin'
  ];

  return (
    <MultiplePermissionsGuard permissions={permissions} mode="any" fallback={fallback}>
      {children}
    </MultiplePermissionsGuard>
  );
}

// Permission-based Button Component
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionButton({ permission, fallback, children, ...props }: PermissionButtonProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <button {...props}>{children}</button>;
}

// Permission-based Link Component
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionLink({ permission, fallback, children, ...props }: PermissionLinkProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <a {...props}>{children}</a>;
}

// Permission-based Form Component
interface PermissionFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionForm({ permission, fallback, children, ...props }: PermissionFormProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <form {...props}>{children}</form>;
}

// Permission-based Table Component
interface PermissionTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionTable({ permission, fallback, children, ...props }: PermissionTableProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <table {...props}>{children}</table>;
}

// Permission-based Card Component
interface PermissionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionCard({ permission, fallback, children, ...props }: PermissionCardProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <div {...props}>{children}</div>;
}

// Permission-based Navigation Component
interface PermissionNavProps {
  permissions: Permission[];
  mode: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionNav({ permissions, mode, fallback, children }: PermissionNavProps) {
  const { shouldRender, loading } = useConditionalRender(permissions, mode);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>;
  }

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Permission-based Section Component
interface PermissionSectionProps extends React.HTMLAttributes<HTMLElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionSection({ permission, fallback, children, ...props }: PermissionSectionProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <section {...props}>{children}</section>;
}

// Permission-based Div Component
interface PermissionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionDiv({ permission, fallback, children, ...props }: PermissionDivProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <div {...props}>{children}</div>;
}

// Permission-based Span Component
interface PermissionSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionSpan({ permission, fallback, children, ...props }: PermissionSpanProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <span className="animate-pulse bg-gray-200 h-4 w-16 rounded"></span>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <span {...props}>{children}</span>;
}

// Permission-based Input Component
interface PermissionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionInput({ permission, fallback, ...props }: PermissionInputProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <input {...props} />;
}

// Permission-based Textarea Component
interface PermissionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionTextarea({ permission, fallback, ...props }: PermissionTextareaProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <textarea {...props} />;
}

// Permission-based Select Component
interface PermissionSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionSelect({ permission, fallback, children, ...props }: PermissionSelectProps) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <select {...props}>{children}</select>;
}
