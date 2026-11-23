import type { LucideIcon } from 'lucide-react'
import {
  Users,
  Building2,
  LineChart,
  FileText,
  Settings2,
  Boxes,
  CreditCard,
  Headphones,
} from 'lucide-react'

export interface Application {
  id: string
  name: string
  description?: string
  /** Key used to resolve a decorative icon. In a real integration this could be a logo URL. */
  icon?: string
  url: string
  /** Short category label shown as a chip on the card. */
  category?: string
  /** Accent hue used for the card's icon tile. */
  tone?: 'blue' | 'indigo' | 'teal' | 'sky' | 'slate'
}

export const APPLICATION_ICONS: Record<string, LucideIcon> = {
  people: Users,
  portal: Building2,
  commercial: LineChart,
  documents: FileText,
  operations: Boxes,
  finance: CreditCard,
  support: Headphones,
  settings: Settings2,
}

/**
 * Mock catalog used only to demonstrate the experience. A real portal would
 * resolve this list from the user's authorized applications after login.
 */
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'people',
    name: 'People Management',
    description: 'Employee records, org chart, time off and onboarding.',
    icon: 'people',
    url: '#',
    category: 'Human Resources',
    tone: 'blue',
  },
  {
    id: 'portal',
    name: 'Corporate Portal',
    description: 'Company news, announcements and internal resources.',
    icon: 'portal',
    url: '#',
    category: 'Communications',
    tone: 'indigo',
  },
  {
    id: 'commercial',
    name: 'Commercial Management',
    description: 'Pipeline, accounts and sales performance dashboards.',
    icon: 'commercial',
    url: '#',
    category: 'Sales',
    tone: 'teal',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Secure document library with versioning and sharing.',
    icon: 'documents',
    url: '#',
    category: 'Knowledge',
    tone: 'sky',
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Logistics, inventory and process orchestration.',
    icon: 'operations',
    url: '#',
    category: 'Operations',
    tone: 'slate',
  },
  {
    id: 'finance',
    name: 'Finance & Billing',
    description: 'Invoices, expenses and financial reporting.',
    icon: 'finance',
    url: '#',
    category: 'Finance',
    tone: 'blue',
  },
]
