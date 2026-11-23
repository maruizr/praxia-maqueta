import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  UserCircle,
  ShieldCheck,
  KeyRound,
  MonitorSmartphone,
  FileKey2,
  Users,
  UserCog,
  Contact,
  ScrollText,
  Settings,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** Marks modules that are planned but not yet built. */
  upcoming?: boolean
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

/**
 * Navigation foundation for the portal. Only "Applications" is active in this
 * proposal; the remaining entries reserve space for future modules so the
 * information architecture never has to be redesigned to grow.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [{ id: 'applications', label: 'Applications', icon: LayoutGrid }],
  },
  {
    id: 'account',
    label: 'My Account',
    items: [
      { id: 'profile', label: 'Profile', icon: UserCircle, upcoming: true },
      { id: 'security', label: 'Security', icon: ShieldCheck, upcoming: true },
      { id: 'mfa', label: 'MFA', icon: KeyRound, upcoming: true },
      {
        id: 'sessions',
        label: 'Active Sessions',
        icon: MonitorSmartphone,
        upcoming: true,
      },
      {
        id: 'requests',
        label: 'Access Requests',
        icon: FileKey2,
        upcoming: true,
      },
    ],
  },
  {
    id: 'administration',
    label: 'IAM Administration',
    items: [
      { id: 'users', label: 'User Management', icon: UserCog, upcoming: true },
      { id: 'people', label: 'People', icon: Contact, upcoming: true },
      { id: 'roles', label: 'Roles', icon: Users, upcoming: true },
      { id: 'audit', label: 'Audit', icon: ScrollText, upcoming: true },
      { id: 'settings', label: 'Settings', icon: Settings, upcoming: true },
    ],
  },
]
