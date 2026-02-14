'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import {
  IoLeaf,
  IoAnalytics,
  IoSettings,
  IoFlag,
  IoCheckmarkCircle,
  IoWarning,
  IoAlertCircle,
  IoTrendingUp,
  IoTrendingDown,
  IoStar,
  IoStarOutline,
  IoRefresh,
  IoDocumentText,
  IoChevronDown,
  IoChevronUp,
  IoPeople,
  IoSchool,
  IoEye,
  IoStatsChart,
  IoShieldCheckmark,
  IoRemove,
  IoSave,
  IoPlay,
  IoTime,
  IoGrid,
  IoLinkOutline,
  IoAdd,
  IoTrashOutline,
  IoLayersOutline
} from 'react-icons/io5'

// ===== CONSTANTS =====
const AGENT_ID = '6990d68ac0b1a6844486b48c'

// ===== TYPES =====
interface Categories {
  scheduled_refund?: string
  not_required?: string
  not_available?: string
  texted?: string
  group_not_created?: string
}

interface OnboardingMetric {
  source_sheet?: string
  course_name?: string
  cohort_name?: string
  eligible?: string
  done?: string
  pending?: string
  completion_percentage?: string
  status?: string
  categories?: Categories
}

interface DashboardAccessMetric {
  source_sheet?: string
  cohort_name?: string
  enrollments?: string
  access_removed?: string
  deferrals?: string
  current_access?: string
  access_percentage?: string
  status?: string
}

interface AttendanceMetric {
  source_sheet?: string
  cohort_name?: string
  active_learners?: string
  total_enrollment?: string
  attendance_percentage?: string
  trend?: string
  status?: string
}

interface SessionRatingMetric {
  source_sheet?: string
  cohort_name?: string
  average_rating?: string
  rating_count?: string
  trend?: string
  status?: string
}

interface FlaggedIssue {
  severity?: string
  metric_category?: string
  cohort_name?: string
  source_sheet?: string
  issue_description?: string
  recommended_action?: string
}

interface ExecutiveSummary {
  overall_health_score?: string
  total_cohorts?: string
  healthy_count?: string
  at_risk_count?: string
  critical_count?: string
  sheets_analyzed?: string
  top_priority_actions?: string[]
}

interface ReportData {
  executive_summary?: ExecutiveSummary
  onboarding_metrics?: OnboardingMetric[]
  dashboard_access_metrics?: DashboardAccessMetric[]
  attendance_metrics?: AttendanceMetric[]
  session_ratings_metrics?: SessionRatingMetric[]
  flagged_issues?: FlaggedIssue[]
}

interface SheetConfig {
  name: string
  sheetName: string
  dataRange: string
  metricType: string
}

interface Settings {
  sheetUrl: string
  sheetId: string
  sheets: SheetConfig[]
  onboardingThreshold: number
  accessThreshold: number
  attendanceThreshold: number
  ratingThreshold: number
}

// ===== SAMPLE DATA =====
const SAMPLE_DATA: ReportData = {
  executive_summary: {
    overall_health_score: '72%',
    total_cohorts: '12',
    healthy_count: '6',
    at_risk_count: '4',
    critical_count: '2',
    sheets_analyzed: '4',
    top_priority_actions: [
      'Investigate low attendance in Cohort Alpha-3 (below 55%)',
      'Follow up on 15 pending onboarding cases in Data Analytics Batch 7',
      'Address dashboard access issues for Product Management Cohort 5',
      'Review session ratings decline in UX Design Cohort 2'
    ]
  },
  onboarding_metrics: [
    {
      source_sheet: 'Data Analytics Sheet',
      course_name: 'Data Analytics',
      cohort_name: 'DA Batch 7',
      eligible: '45',
      done: '30',
      pending: '15',
      completion_percentage: '67%',
      status: 'At-Risk',
      categories: { scheduled_refund: '3', not_required: '2', not_available: '4', texted: '5', group_not_created: '1' }
    },
    {
      source_sheet: 'Product Mgmt Sheet',
      course_name: 'Product Management',
      cohort_name: 'PM Cohort 5',
      eligible: '38',
      done: '35',
      pending: '3',
      completion_percentage: '92%',
      status: 'Healthy',
      categories: { scheduled_refund: '1', not_required: '1', not_available: '0', texted: '1', group_not_created: '0' }
    },
    {
      source_sheet: 'UX Design Sheet',
      course_name: 'UX Design',
      cohort_name: 'UXD Cohort 2',
      eligible: '30',
      done: '12',
      pending: '18',
      completion_percentage: '40%',
      status: 'Critical',
      categories: { scheduled_refund: '5', not_required: '2', not_available: '6', texted: '3', group_not_created: '2' }
    },
    {
      source_sheet: 'Full Stack Sheet',
      course_name: 'Full Stack Dev',
      cohort_name: 'FSD Batch 9',
      eligible: '52',
      done: '48',
      pending: '4',
      completion_percentage: '92%',
      status: 'Healthy',
      categories: { scheduled_refund: '1', not_required: '2', not_available: '0', texted: '1', group_not_created: '0' }
    }
  ],
  dashboard_access_metrics: [
    { source_sheet: 'Data Analytics Sheet', cohort_name: 'DA Batch 7', enrollments: '45', access_removed: '3', deferrals: '2', current_access: '40', access_percentage: '89%', status: 'Healthy' },
    { source_sheet: 'Product Mgmt Sheet', cohort_name: 'PM Cohort 5', enrollments: '38', access_removed: '8', deferrals: '4', current_access: '26', access_percentage: '68%', status: 'At-Risk' },
    { source_sheet: 'UX Design Sheet', cohort_name: 'UXD Cohort 2', enrollments: '30', access_removed: '2', deferrals: '1', current_access: '27', access_percentage: '90%', status: 'Healthy' },
    { source_sheet: 'Full Stack Sheet', cohort_name: 'FSD Batch 9', enrollments: '52', access_removed: '12', deferrals: '5', current_access: '35', access_percentage: '67%', status: 'Critical' }
  ],
  attendance_metrics: [
    { source_sheet: 'Data Analytics Sheet', cohort_name: 'DA Batch 7', active_learners: '32', total_enrollment: '45', attendance_percentage: '71%', trend: 'Up', status: 'Healthy' },
    { source_sheet: 'Product Mgmt Sheet', cohort_name: 'PM Cohort 5', active_learners: '28', total_enrollment: '38', attendance_percentage: '74%', trend: 'Stable', status: 'Healthy' },
    { source_sheet: 'UX Design Sheet', cohort_name: 'UXD Cohort 2', active_learners: '15', total_enrollment: '30', attendance_percentage: '50%', trend: 'Down', status: 'Critical' },
    { source_sheet: 'Full Stack Sheet', cohort_name: 'FSD Batch 9', active_learners: '36', total_enrollment: '52', attendance_percentage: '69%', trend: 'Down', status: 'At-Risk' }
  ],
  session_ratings_metrics: [
    { source_sheet: 'Data Analytics Sheet', cohort_name: 'DA Batch 7', average_rating: '4.3', rating_count: '128', trend: 'Up', status: 'Healthy' },
    { source_sheet: 'Product Mgmt Sheet', cohort_name: 'PM Cohort 5', average_rating: '4.6', rating_count: '95', trend: 'Stable', status: 'Healthy' },
    { source_sheet: 'UX Design Sheet', cohort_name: 'UXD Cohort 2', average_rating: '3.2', rating_count: '72', trend: 'Down', status: 'Critical' },
    { source_sheet: 'Full Stack Sheet', cohort_name: 'FSD Batch 9', average_rating: '3.9', rating_count: '156', trend: 'Up', status: 'At-Risk' }
  ],
  flagged_issues: [
    { severity: 'Critical', metric_category: 'Onboarding', cohort_name: 'UXD Cohort 2', source_sheet: 'UX Design Sheet', issue_description: 'Only 40% onboarding completion with 18 pending learners.', recommended_action: 'Assign dedicated onboarding coordinator and send targeted reminders.' },
    { severity: 'Critical', metric_category: 'Attendance', cohort_name: 'UXD Cohort 2', source_sheet: 'UX Design Sheet', issue_description: 'Attendance dropped to 50% with a downward trend.', recommended_action: 'Conduct 1:1 check-ins with disengaged learners and review session timing.' },
    { severity: 'Warning', metric_category: 'Dashboard Access', cohort_name: 'PM Cohort 5', source_sheet: 'Product Mgmt Sheet', issue_description: '32% of enrolled learners have lost dashboard access.', recommended_action: 'Audit access removal reasons and restore where applicable.' },
    { severity: 'Warning', metric_category: 'Dashboard Access', cohort_name: 'FSD Batch 9', source_sheet: 'Full Stack Sheet', issue_description: 'High access removal rate (23%) impacting learning continuity.', recommended_action: 'Review access removal policy and set up automatic alerts.' },
    { severity: 'Warning', metric_category: 'Session Ratings', cohort_name: 'UXD Cohort 2', source_sheet: 'UX Design Sheet', issue_description: 'Average session rating of 3.2 is below threshold.', recommended_action: 'Gather qualitative feedback and review instructor delivery methods.' }
  ]
}

const METRIC_TYPE_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'ratings', label: 'Ratings' },
  { value: 'mixed', label: 'Mixed' },
]

// ===== HELPERS =====
function getStatusBadge(status?: string) {
  const s = (status ?? '').toLowerCase()
  if (s.includes('critical') || s.includes('red')) return { className: 'bg-red-100 text-red-700 border-red-200', label: 'Critical', icon: IoAlertCircle }
  if (s.includes('risk') || s.includes('yellow') || s.includes('warning') || s.includes('at-risk') || s.includes('at_risk')) return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'At-Risk', icon: IoWarning }
  return { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Healthy', icon: IoCheckmarkCircle }
}

function getSeverityBadge(severity?: string) {
  const s = (severity ?? '').toLowerCase()
  if (s.includes('critical') || s.includes('high')) return { className: 'bg-red-100 text-red-700 border-red-200', label: severity ?? 'Critical' }
  if (s.includes('warning') || s.includes('medium')) return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: severity ?? 'Warning' }
  return { className: 'bg-blue-100 text-blue-700 border-blue-200', label: severity ?? 'Info' }
}

function getTrendIcon(trend?: string) {
  const t = (trend ?? '').toLowerCase()
  if (t.includes('up')) return { icon: IoTrendingUp, className: 'text-emerald-600', label: 'Trending Up' }
  if (t.includes('down')) return { icon: IoTrendingDown, className: 'text-red-500', label: 'Trending Down' }
  return { icon: IoRemove, className: 'text-muted-foreground', label: 'Stable' }
}

function parsePercent(val?: string): number {
  if (!val) return 0
  const n = parseFloat(val.replace('%', ''))
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n))
}

function parseNum(val?: string): number {
  if (!val) return 0
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

function renderStars(rating?: string) {
  const val = parseNum(rating)
  const full = Math.floor(val)
  const stars: React.ReactNode[] = []
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<IoStar key={i} className="text-amber-500" />)
    } else {
      stars.push(<IoStarOutline key={i} className="text-amber-300" />)
    }
  }
  return <span className="flex items-center gap-0.5">{stars}</span>
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

// ===== SUB-COMPONENTS =====

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/20 shadow-lg', className)} style={{ background: 'linear-gradient(135deg, hsl(120 25% 96% / 0.75) 0%, hsl(140 30% 94% / 0.75) 35%, hsl(160 25% 95% / 0.75) 70%, hsl(100 20% 96% / 0.75) 100%)', backdropFilter: 'blur(16px)' }}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, variant }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variantClasses: Record<string, string> = {
    default: 'from-primary/10 to-primary/5',
    success: 'from-emerald-100 to-emerald-50',
    warning: 'from-yellow-100 to-yellow-50',
    danger: 'from-red-100 to-red-50'
  }
  const iconClasses: Record<string, string> = {
    default: 'text-primary',
    success: 'text-emerald-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  }
  const v = variant ?? 'default'
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn('p-2.5 rounded-xl bg-gradient-to-br', variantClasses[v])}>
            <Icon className={cn('w-5 h-5', iconClasses[v])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryPills({ categories }: { categories?: Categories }) {
  if (!categories) return null
  const items = [
    { key: 'scheduled_refund', label: 'Refund', value: categories.scheduled_refund },
    { key: 'not_required', label: 'Not Req.', value: categories.not_required },
    { key: 'not_available', label: 'N/A', value: categories.not_available },
    { key: 'texted', label: 'Texted', value: categories.texted },
    { key: 'group_not_created', label: 'No Group', value: categories.group_not_created },
  ]
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map(item => (
        <span key={item.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border">
          {item.label}: {item.value ?? '0'}
        </span>
      ))}
    </div>
  )
}

function SourceSheetIndicator({ sourceSheet }: { sourceSheet?: string }) {
  if (!sourceSheet) return null
  return (
    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
      <IoDocumentText className="w-2.5 h-2.5" />{sourceSheet}
    </p>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-4" /><div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div></CardContent></Card>
    </div>
  )
}

function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-primary/10 mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  )
}

// ===== NAV ITEMS =====
type NavPage = 'dashboard' | 'report' | 'settings'

const NAV_ITEMS: { id: NavPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IoGrid },
  { id: 'report', label: 'Report Detail', icon: IoDocumentText },
  { id: 'settings', label: 'Settings', icon: IoSettings },
]

// ===== MAIN PAGE =====
export default function Page() {
  const [activePage, setActivePage] = useState<NavPage>('dashboard')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeTab, setActiveTab] = useState('onboarding')
  const [flagsOpen, setFlagsOpen] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const [settings, setSettings] = useState<Settings>({
    sheetUrl: '',
    sheetId: '',
    sheets: [
      { name: 'Onboarding Data', sheetName: 'Onboarding', dataRange: 'A1:Z100', metricType: 'onboarding' },
      { name: 'Enrollment Data', sheetName: 'Enrollment', dataRange: 'A1:Z100', metricType: 'enrollment' },
      { name: 'Attendance Data', sheetName: 'Attendance', dataRange: 'A1:Z100', metricType: 'attendance' },
      { name: 'Ratings Data', sheetName: 'Ratings', dataRange: 'A1:Z100', metricType: 'ratings' },
    ],
    onboardingThreshold: 80,
    accessThreshold: 75,
    attendanceThreshold: 70,
    ratingThreshold: 4.0,
  })

  const [settingsSaved, setSettingsSaved] = useState(false)

  const displayData = useMemo<ReportData | null>(() => {
    if (showSampleData) return SAMPLE_DATA
    return reportData
  }, [showSampleData, reportData])

  const summary = displayData?.executive_summary
  const onboarding = useMemo(() => Array.isArray(displayData?.onboarding_metrics) ? displayData!.onboarding_metrics : [], [displayData])
  const dashboardAccess = useMemo(() => Array.isArray(displayData?.dashboard_access_metrics) ? displayData!.dashboard_access_metrics : [], [displayData])
  const attendance = useMemo(() => Array.isArray(displayData?.attendance_metrics) ? displayData!.attendance_metrics : [], [displayData])
  const ratings = useMemo(() => Array.isArray(displayData?.session_ratings_metrics) ? displayData!.session_ratings_metrics : [], [displayData])
  const flaggedIssues = useMemo(() => Array.isArray(displayData?.flagged_issues) ? displayData!.flagged_issues : [], [displayData])

  const handleAddSheet = useCallback(() => {
    if (settings.sheets.length >= 10) return
    setSettings(prev => ({
      ...prev,
      sheets: [...prev.sheets, { name: '', sheetName: '', dataRange: 'A1:Z100', metricType: 'mixed' }]
    }))
  }, [settings.sheets.length])

  const handleRemoveSheet = useCallback((index: number) => {
    setSettings(prev => ({
      ...prev,
      sheets: prev.sheets.filter((_, i) => i !== index)
    }))
  }, [])

  const handleUpdateSheet = useCallback((index: number, field: keyof SheetConfig, value: string) => {
    setSettings(prev => ({
      ...prev,
      sheets: prev.sheets.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }))
  }, [])

  const handleGenerateReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    setActiveAgentId(AGENT_ID)

    const sheetsInfo = settings.sheets.map((s, i) =>
      `Sheet ${i + 1}: Name="${s.name}", Tab="${s.sheetName}", Range="${s.dataRange}", Type="${s.metricType}"`
    ).join('. ')

    const message = `Generate a comprehensive health report for all cohorts. Google Sheet URL: ${settings.sheetUrl || 'default'}. Sheet ID: ${settings.sheetId || 'default'}. Number of sheets: ${settings.sheets.length}. ${sheetsInfo}. Thresholds: Onboarding ${settings.onboardingThreshold}%, Access ${settings.accessThreshold}%, Attendance ${settings.attendanceThreshold}%, Rating ${settings.ratingThreshold}/5`

    try {
      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result?.response?.result) {
        const data = result.response.result as ReportData
        setReportData(data)
        setLastUpdated(new Date().toLocaleString())
        setActivePage('dashboard')
      } else {
        const errMsg = (result as Record<string, unknown>)?.error as string | undefined
        setError(errMsg ?? 'Failed to generate report. Please check your settings and try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [settings])

  const handleSaveSettings = useCallback(() => {
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }, [])

  const hasData = displayData !== null

  return (
    <div className="flex h-screen bg-background font-sans" style={{ letterSpacing: '-0.01em', lineHeight: '1.55' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card/80 flex flex-col" style={{ backdropFilter: 'blur(16px)' }}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10">
              <IoLeaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">Cohort Health</h1>
              <p className="text-[11px] text-muted-foreground font-medium">Monitor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200', isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Agent Status */}
        <div className="p-3 border-t border-border">
          <div className="p-3 rounded-xl bg-secondary/50">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Agent Status</p>
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', activeAgentId ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
              <span className="text-xs font-medium text-foreground truncate">Cohort Health Analyst</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {activeAgentId ? 'Processing...' : 'Ready'}
            </p>
            <p className="text-[9px] text-muted-foreground mt-1 font-mono truncate">ID: {AGENT_ID}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50" style={{ backdropFilter: 'blur(16px)' }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {activePage === 'dashboard' && 'Dashboard'}
              {activePage === 'report' && 'Report Detail'}
              {activePage === 'settings' && 'Settings'}
            </h2>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <IoTime className="w-3 h-3" />
                Last synced: {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground font-medium cursor-pointer">Sample Data</Label>
              <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
            </div>
            <Button onClick={handleGenerateReport} disabled={loading} className="gap-2 shadow-md shadow-primary/20">
              {loading ? <IoRefresh className="w-4 h-4 animate-spin" /> : <IoPlay className="w-4 h-4" />}
              Generate Health Report
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <Card className="border-destructive/50 bg-red-50">
                <CardContent className="p-4 flex items-start gap-3">
                  <IoAlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error generating report</p>
                    <p className="text-xs text-red-600/80 mt-1">{error}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => setError(null)}>Dismiss</Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && <LoadingSkeleton />}

            {/* DASHBOARD PAGE */}
            {!loading && activePage === 'dashboard' && (
              <>
                {hasData && summary ? (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <StatCard icon={IoPeople} label="Total Cohorts" value={summary?.total_cohorts ?? '-'} variant="default" />
                      <StatCard icon={IoCheckmarkCircle} label="Healthy" value={summary?.healthy_count ?? '-'} sub="Meeting all thresholds" variant="success" />
                      <StatCard icon={IoWarning} label="At-Risk" value={summary?.at_risk_count ?? '-'} sub="Needs attention" variant="warning" />
                      <StatCard icon={IoAlertCircle} label="Critical" value={summary?.critical_count ?? '-'} sub="Immediate action required" variant="danger" />
                      <StatCard icon={IoLayersOutline} label="Sheets Analyzed" value={summary?.sheets_analyzed ?? '-'} sub="Data sources" variant="default" />
                    </div>

                    {/* Health Score */}
                    <GlassCard className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IoShieldCheckmark className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Overall Health Score</h3>
                            <p className="text-xs text-muted-foreground">Across all monitored cohorts</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-primary">{summary?.overall_health_score ?? '-'}</span>
                      </div>
                      <Progress value={parsePercent(summary?.overall_health_score)} className="h-2.5" />
                    </GlassCard>

                    {/* Metric Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                      <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                        <TabsTrigger value="onboarding" className="gap-1.5 text-xs"><IoSchool className="w-3.5 h-3.5" />Onboarding</TabsTrigger>
                        <TabsTrigger value="access" className="gap-1.5 text-xs"><IoEye className="w-3.5 h-3.5" />Access</TabsTrigger>
                        <TabsTrigger value="attendance" className="gap-1.5 text-xs"><IoPeople className="w-3.5 h-3.5" />Attendance</TabsTrigger>
                        <TabsTrigger value="ratings" className="gap-1.5 text-xs"><IoStar className="w-3.5 h-3.5" />Ratings</TabsTrigger>
                      </TabsList>

                      {/* Onboarding Tab */}
                      <TabsContent value="onboarding" className="space-y-4">
                        {onboarding.length === 0 ? (
                          <EmptyState icon={IoSchool} title="No Onboarding Data" description="Generate a report to see onboarding metrics." />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {onboarding.map((item, idx) => {
                              const statusInfo = getStatusBadge(item?.status)
                              const StatusIcon = statusInfo.icon
                              return (
                                <Card key={idx} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-sm font-semibold">{item?.cohort_name ?? 'Unknown'}</CardTitle>
                                        <CardDescription className="text-xs">{item?.course_name ?? ''}</CardDescription>
                                        <SourceSheetIndicator sourceSheet={item?.source_sheet} />
                                      </div>
                                      <Badge variant="outline" className={cn('text-[10px] gap-1', statusInfo.className)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                      <div className="text-center p-2 rounded-lg bg-secondary/50">
                                        <p className="text-lg font-bold">{item?.eligible ?? '-'}</p>
                                        <p className="text-[10px] text-muted-foreground">Eligible</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg bg-emerald-50">
                                        <p className="text-lg font-bold text-emerald-700">{item?.done ?? '-'}</p>
                                        <p className="text-[10px] text-muted-foreground">Done</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg bg-amber-50">
                                        <p className="text-lg font-bold text-amber-700">{item?.pending ?? '-'}</p>
                                        <p className="text-[10px] text-muted-foreground">Pending</p>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted-foreground">Completion</span>
                                        <span className="text-xs font-semibold">{item?.completion_percentage ?? '0%'}</span>
                                      </div>
                                      <Progress value={parsePercent(item?.completion_percentage)} className="h-2" />
                                    </div>
                                    <CategoryPills categories={item?.categories} />
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Dashboard Access Tab */}
                      <TabsContent value="access" className="space-y-4">
                        {dashboardAccess.length === 0 ? (
                          <EmptyState icon={IoEye} title="No Access Data" description="Generate a report to see dashboard access metrics." />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardAccess.map((item, idx) => {
                              const statusInfo = getStatusBadge(item?.status)
                              const StatusIcon = statusInfo.icon
                              return (
                                <Card key={idx} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-sm font-semibold">{item?.cohort_name ?? 'Unknown'}</CardTitle>
                                        <SourceSheetIndicator sourceSheet={item?.source_sheet} />
                                      </div>
                                      <Badge variant="outline" className={cn('text-[10px] gap-1', statusInfo.className)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-2 rounded-lg bg-secondary/50">
                                        <p className="text-lg font-bold">{item?.enrollments ?? '-'}</p>
                                        <p className="text-[10px] text-muted-foreground">Enrollments</p>
                                      </div>
                                      <div className="p-2 rounded-lg bg-primary/5">
                                        <p className="text-lg font-bold text-primary">{item?.current_access ?? '-'}</p>
                                        <p className="text-[10px] text-muted-foreground">Current Access</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1"><IoAlertCircle className="w-3 h-3 text-red-400" />Removed: {item?.access_removed ?? '0'}</span>
                                      <span className="flex items-center gap-1"><IoTime className="w-3 h-3 text-yellow-500" />Deferrals: {item?.deferrals ?? '0'}</span>
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted-foreground">Access Rate</span>
                                        <span className="text-xs font-semibold">{item?.access_percentage ?? '0%'}</span>
                                      </div>
                                      <Progress value={parsePercent(item?.access_percentage)} className="h-2" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono">Enrollments - Removed - Deferrals = {item?.current_access ?? '?'}</p>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Attendance Tab */}
                      <TabsContent value="attendance" className="space-y-4">
                        {attendance.length === 0 ? (
                          <EmptyState icon={IoPeople} title="No Attendance Data" description="Generate a report to see attendance metrics." />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attendance.map((item, idx) => {
                              const statusInfo = getStatusBadge(item?.status)
                              const StatusIcon = statusInfo.icon
                              const trendInfo = getTrendIcon(item?.trend)
                              const TrendIcon = trendInfo.icon
                              return (
                                <Card key={idx} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-sm font-semibold">{item?.cohort_name ?? 'Unknown'}</CardTitle>
                                        <SourceSheetIndicator sourceSheet={item?.source_sheet} />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={cn('flex items-center gap-1 text-xs font-medium', trendInfo.className)}>
                                          <TrendIcon className="w-3.5 h-3.5" />
                                          {trendInfo.label}
                                        </span>
                                        <Badge variant="outline" className={cn('text-[10px] gap-1', statusInfo.className)}>
                                          <StatusIcon className="w-3 h-3" />
                                          {statusInfo.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 space-y-3">
                                    <div className="flex items-end gap-4">
                                      <div>
                                        <p className="text-3xl font-bold text-foreground">{item?.attendance_percentage ?? '-'}</p>
                                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                                      </div>
                                      <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-primary/5">
                                          <p className="text-sm font-bold">{item?.active_learners ?? '-'}</p>
                                          <p className="text-[10px] text-muted-foreground">Active</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-secondary/50">
                                          <p className="text-sm font-bold">{item?.total_enrollment ?? '-'}</p>
                                          <p className="text-[10px] text-muted-foreground">Total</p>
                                        </div>
                                      </div>
                                    </div>
                                    <Progress value={parsePercent(item?.attendance_percentage)} className="h-2" />
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      {/* Session Ratings Tab */}
                      <TabsContent value="ratings" className="space-y-4">
                        {ratings.length === 0 ? (
                          <EmptyState icon={IoStar} title="No Ratings Data" description="Generate a report to see session ratings." />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ratings.map((item, idx) => {
                              const statusInfo = getStatusBadge(item?.status)
                              const StatusIcon = statusInfo.icon
                              const trendInfo = getTrendIcon(item?.trend)
                              const TrendIcon = trendInfo.icon
                              return (
                                <Card key={idx} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-sm font-semibold">{item?.cohort_name ?? 'Unknown'}</CardTitle>
                                        <SourceSheetIndicator sourceSheet={item?.source_sheet} />
                                      </div>
                                      <Badge variant="outline" className={cn('text-[10px] gap-1', statusInfo.className)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-3xl font-bold">{item?.average_rating ?? '-'}</span>
                                          <span className="text-sm text-muted-foreground">/5</span>
                                        </div>
                                        {renderStars(item?.average_rating)}
                                      </div>
                                      <div className="text-right">
                                        <span className={cn('flex items-center gap-1 text-sm font-medium', trendInfo.className)}>
                                          <TrendIcon className="w-4 h-4" />
                                          {trendInfo.label}
                                        </span>
                                        <p className="text-xs text-muted-foreground mt-1">{item?.rating_count ?? '0'} ratings</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Flagged Issues */}
                    {flaggedIssues.length > 0 && (
                      <Collapsible open={flagsOpen} onOpenChange={setFlagsOpen}>
                        <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IoFlag className="w-5 h-5 text-destructive" />
                                  <CardTitle className="text-sm font-semibold">Flagged Issues</CardTitle>
                                  <Badge variant="secondary" className="text-[10px]">{flaggedIssues.length}</Badge>
                                </div>
                                {flagsOpen ? <IoChevronUp className="w-4 h-4 text-muted-foreground" /> : <IoChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-3">
                              {flaggedIssues.map((issue, idx) => {
                                const sevInfo = getSeverityBadge(issue?.severity)
                                return (
                                  <div key={idx} className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className={cn('text-[10px]', sevInfo.className)}>{sevInfo.label}</Badge>
                                        <Badge variant="secondary" className="text-[10px]">{issue?.metric_category ?? 'General'}</Badge>
                                        <span className="text-xs font-medium text-foreground">{issue?.cohort_name ?? ''}</span>
                                        {issue?.source_sheet && (
                                          <Badge variant="secondary" className="text-[10px]">{issue.source_sheet}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-foreground">{issue?.issue_description ?? ''}</p>
                                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5">
                                      <IoCheckmarkCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                      <p className="text-xs text-foreground/80">{issue?.recommended_action ?? ''}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={IoAnalytics}
                    title="No Report Data Yet"
                    description="Click 'Generate Health Report' to fetch and analyze cohort data from your Google Sheets. You can also enable the 'Sample Data' toggle to preview the dashboard layout."
                  />
                )}
              </>
            )}

            {/* REPORT DETAIL PAGE */}
            {!loading && activePage === 'report' && (
              <>
                {!hasData ? (
                  <EmptyState
                    icon={IoDocumentText}
                    title="No Report Available"
                    description="Generate a health report first to view the detailed breakdown. Go to Dashboard and click 'Generate Health Report'."
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Executive Summary */}
                    {summary && (
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IoStatsChart className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-base font-bold">Executive Summary</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-5">
                          <div className="text-center p-3 rounded-xl bg-card border border-border">
                            <p className="text-2xl font-bold text-primary">{summary?.overall_health_score ?? '-'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Health Score</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-card border border-border">
                            <p className="text-2xl font-bold">{summary?.total_cohorts ?? '-'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Total Cohorts</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-2xl font-bold text-emerald-700">{summary?.healthy_count ?? '-'}</p>
                            <p className="text-[10px] text-emerald-600 mt-1">Healthy</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                            <p className="text-2xl font-bold text-yellow-700">{summary?.at_risk_count ?? '-'}</p>
                            <p className="text-[10px] text-yellow-600 mt-1">At-Risk</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-red-50 border border-red-200">
                            <p className="text-2xl font-bold text-red-700">{summary?.critical_count ?? '-'}</p>
                            <p className="text-[10px] text-red-600 mt-1">Critical</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-card border border-border">
                            <p className="text-2xl font-bold">{summary?.sheets_analyzed ?? '-'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Sheets Analyzed</p>
                          </div>
                        </div>
                        {Array.isArray(summary?.top_priority_actions) && summary.top_priority_actions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><IoFlag className="w-4 h-4 text-destructive" />Top Priority Actions</h4>
                            <ol className="space-y-2">
                              {summary.top_priority_actions.map((action, i) => (
                                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-card border border-border">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                  <p className="text-sm">{action}</p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* Onboarding Table */}
                    {onboarding.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoSchool className="w-4 h-4 text-primary" />Onboarding Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Course</TableHead>
                                  <TableHead className="text-xs">Cohort</TableHead>
                                  <TableHead className="text-xs">Source</TableHead>
                                  <TableHead className="text-xs text-center">Eligible</TableHead>
                                  <TableHead className="text-xs text-center">Done</TableHead>
                                  <TableHead className="text-xs text-center">Pending</TableHead>
                                  <TableHead className="text-xs">Categories</TableHead>
                                  <TableHead className="text-xs text-center">Completion</TableHead>
                                  <TableHead className="text-xs text-center">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {onboarding.map((item, idx) => {
                                  const statusInfo = getStatusBadge(item?.status)
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="text-xs font-medium">{item?.course_name ?? '-'}</TableCell>
                                      <TableCell className="text-xs">{item?.cohort_name ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{item?.source_sheet ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center">{item?.eligible ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-medium text-emerald-700">{item?.done ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-medium text-amber-700">{item?.pending ?? '-'}</TableCell>
                                      <TableCell className="text-xs">
                                        <div className="flex flex-wrap gap-1">
                                          {item?.categories?.scheduled_refund && <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary">RF:{item.categories.scheduled_refund}</span>}
                                          {item?.categories?.not_required && <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary">NR:{item.categories.not_required}</span>}
                                          {item?.categories?.not_available && <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary">NA:{item.categories.not_available}</span>}
                                          {item?.categories?.texted && <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary">TX:{item.categories.texted}</span>}
                                          {item?.categories?.group_not_created && <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary">GN:{item.categories.group_not_created}</span>}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs text-center font-semibold">{item?.completion_percentage ?? '-'}</TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className={cn('text-[9px]', statusInfo.className)}>{statusInfo.label}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Dashboard Access Table */}
                    {dashboardAccess.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoEye className="w-4 h-4 text-primary" />Dashboard Access Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Cohort</TableHead>
                                  <TableHead className="text-xs">Source</TableHead>
                                  <TableHead className="text-xs text-center">Enrollments</TableHead>
                                  <TableHead className="text-xs text-center">Removed</TableHead>
                                  <TableHead className="text-xs text-center">Deferrals</TableHead>
                                  <TableHead className="text-xs text-center">Current Access</TableHead>
                                  <TableHead className="text-xs text-center">Access %</TableHead>
                                  <TableHead className="text-xs text-center">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dashboardAccess.map((item, idx) => {
                                  const statusInfo = getStatusBadge(item?.status)
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="text-xs font-medium">{item?.cohort_name ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{item?.source_sheet ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center">{item?.enrollments ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center text-red-600">{item?.access_removed ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center text-yellow-600">{item?.deferrals ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-medium">{item?.current_access ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-semibold">{item?.access_percentage ?? '-'}</TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className={cn('text-[9px]', statusInfo.className)}>{statusInfo.label}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Attendance Table */}
                    {attendance.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoPeople className="w-4 h-4 text-primary" />Attendance Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Cohort</TableHead>
                                  <TableHead className="text-xs">Source</TableHead>
                                  <TableHead className="text-xs text-center">Active Learners</TableHead>
                                  <TableHead className="text-xs text-center">Total Enrolled</TableHead>
                                  <TableHead className="text-xs text-center">Attendance %</TableHead>
                                  <TableHead className="text-xs text-center">Trend</TableHead>
                                  <TableHead className="text-xs text-center">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {attendance.map((item, idx) => {
                                  const statusInfo = getStatusBadge(item?.status)
                                  const trendInfo = getTrendIcon(item?.trend)
                                  const TrendIcon = trendInfo.icon
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="text-xs font-medium">{item?.cohort_name ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{item?.source_sheet ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center">{item?.active_learners ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center">{item?.total_enrollment ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-semibold">{item?.attendance_percentage ?? '-'}</TableCell>
                                      <TableCell className="text-center">
                                        <span className={cn('inline-flex items-center gap-1 text-xs', trendInfo.className)}>
                                          <TrendIcon className="w-3.5 h-3.5" />
                                          {item?.trend ?? '-'}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className={cn('text-[9px]', statusInfo.className)}>{statusInfo.label}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Ratings Table */}
                    {ratings.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoStar className="w-4 h-4 text-primary" />Session Ratings Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Cohort</TableHead>
                                  <TableHead className="text-xs">Source</TableHead>
                                  <TableHead className="text-xs text-center">Avg Rating</TableHead>
                                  <TableHead className="text-xs text-center">Stars</TableHead>
                                  <TableHead className="text-xs text-center">Rating Count</TableHead>
                                  <TableHead className="text-xs text-center">Trend</TableHead>
                                  <TableHead className="text-xs text-center">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {ratings.map((item, idx) => {
                                  const statusInfo = getStatusBadge(item?.status)
                                  const trendInfo = getTrendIcon(item?.trend)
                                  const TrendIcon = trendInfo.icon
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="text-xs font-medium">{item?.cohort_name ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{item?.source_sheet ?? '-'}</TableCell>
                                      <TableCell className="text-xs text-center font-semibold">{item?.average_rating ?? '-'}</TableCell>
                                      <TableCell className="text-center"><div className="flex justify-center">{renderStars(item?.average_rating)}</div></TableCell>
                                      <TableCell className="text-xs text-center">{item?.rating_count ?? '-'}</TableCell>
                                      <TableCell className="text-center">
                                        <span className={cn('inline-flex items-center gap-1 text-xs', trendInfo.className)}>
                                          <TrendIcon className="w-3.5 h-3.5" />
                                          {item?.trend ?? '-'}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className={cn('text-[9px]', statusInfo.className)}>{statusInfo.label}</Badge>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Flagged Issues in Report */}
                    {flaggedIssues.length > 0 && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <IoFlag className="w-4 h-4 text-destructive" />
                            <CardTitle className="text-sm font-semibold">Flagged Issues</CardTitle>
                            <Badge variant="secondary" className="text-[10px]">{flaggedIssues.length}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {flaggedIssues.map((issue, idx) => {
                            const sevInfo = getSeverityBadge(issue?.severity)
                            return (
                              <div key={idx} className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={cn('text-[10px]', sevInfo.className)}>{sevInfo.label}</Badge>
                                    <Badge variant="secondary" className="text-[10px]">{issue?.metric_category ?? 'General'}</Badge>
                                    <span className="text-xs font-medium text-foreground">{issue?.cohort_name ?? ''}</span>
                                    {issue?.source_sheet && (
                                      <Badge variant="secondary" className="text-[10px]">{issue.source_sheet}</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-foreground">{issue?.issue_description ?? ''}</p>
                                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5">
                                  <IoCheckmarkCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-foreground/80">{issue?.recommended_action ?? ''}</p>
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}

            {/* SETTINGS PAGE */}
            {!loading && activePage === 'settings' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Google Sheet Connection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoLinkOutline className="w-4 h-4 text-primary" />Google Sheet Connection</CardTitle>
                    <CardDescription className="text-xs">Configure the data source for cohort metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sheet-url" className="text-xs font-medium">Sheet URL</Label>
                      <Input id="sheet-url" placeholder="https://docs.google.com/spreadsheets/d/..." value={settings.sheetUrl} onChange={(e) => setSettings(prev => ({ ...prev, sheetUrl: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sheet-id" className="text-xs font-medium">Sheet ID</Label>
                      <Input id="sheet-id" placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" value={settings.sheetId} onChange={(e) => setSettings(prev => ({ ...prev, sheetId: e.target.value }))} />
                    </div>
                  </CardContent>
                </Card>

                {/* Sheet Configurations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoLayersOutline className="w-4 h-4 text-primary" />Sheet Configurations</CardTitle>
                        <CardDescription className="text-xs mt-1">Configure up to 10 sheets for multi-source data analysis.</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">{settings.sheets.length} of 10 sheets configured</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.isArray(settings.sheets) && settings.sheets.map((sheet, index) => (
                      <div key={index} className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{index + 1}</span>
                            <span className="text-sm font-semibold text-foreground">{sheet.name || `Sheet ${index + 1}`}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveSheet(index)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                            <IoTrashOutline className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Name</Label>
                            <Input className="h-8 text-xs" placeholder="e.g., Onboarding Data" value={sheet.name} onChange={(e) => handleUpdateSheet(index, 'name', e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Tab Name</Label>
                            <Input className="h-8 text-xs" placeholder="e.g., Sheet1" value={sheet.sheetName} onChange={(e) => handleUpdateSheet(index, 'sheetName', e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Data Range</Label>
                            <Input className="h-8 text-xs" placeholder="e.g., A1:Z100" value={sheet.dataRange} onChange={(e) => handleUpdateSheet(index, 'dataRange', e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Metric Type</Label>
                            <select className="h-8 w-full text-xs rounded-lg border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" value={sheet.metricType} onChange={(e) => handleUpdateSheet(index, 'metricType', e.target.value)}>
                              {METRIC_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {settings.sheets.length < 10 && (
                      <Button variant="outline" onClick={handleAddSheet} className="w-full gap-2 border-dashed">
                        <IoAdd className="w-4 h-4" />
                        Add Sheet
                      </Button>
                    )}

                    {settings.sheets.length >= 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">Maximum of 10 sheets reached.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Threshold Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><IoStatsChart className="w-4 h-4 text-primary" />Threshold Configuration</CardTitle>
                    <CardDescription className="text-xs">Set minimum acceptable thresholds for each metric. Cohorts below these thresholds will be flagged.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2"><IoSchool className="w-3.5 h-3.5 text-primary" />Onboarding Completion</Label>
                        <span className="text-sm font-bold text-primary">{settings.onboardingThreshold}%</span>
                      </div>
                      <Slider value={[settings.onboardingThreshold]} onValueChange={(val) => setSettings(prev => ({ ...prev, onboardingThreshold: val[0] ?? 80 }))} max={100} min={0} step={5} className="w-full" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2"><IoEye className="w-3.5 h-3.5 text-primary" />Dashboard Access</Label>
                        <span className="text-sm font-bold text-primary">{settings.accessThreshold}%</span>
                      </div>
                      <Slider value={[settings.accessThreshold]} onValueChange={(val) => setSettings(prev => ({ ...prev, accessThreshold: val[0] ?? 75 }))} max={100} min={0} step={5} className="w-full" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2"><IoPeople className="w-3.5 h-3.5 text-primary" />Attendance</Label>
                        <span className="text-sm font-bold text-primary">{settings.attendanceThreshold}%</span>
                      </div>
                      <Slider value={[settings.attendanceThreshold]} onValueChange={(val) => setSettings(prev => ({ ...prev, attendanceThreshold: val[0] ?? 70 }))} max={100} min={0} step={5} className="w-full" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium flex items-center gap-2"><IoStar className="w-3.5 h-3.5 text-primary" />Session Rating</Label>
                        <span className="text-sm font-bold text-primary">{settings.ratingThreshold.toFixed(1)}/5</span>
                      </div>
                      <Slider value={[settings.ratingThreshold * 20]} onValueChange={(val) => setSettings(prev => ({ ...prev, ratingThreshold: (val[0] ?? 80) / 20 }))} max={100} min={0} step={5} className="w-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* Save */}
                <div className="flex items-center justify-between">
                  <div>
                    {settingsSaved && (
                      <p className="text-sm text-primary flex items-center gap-1.5"><IoCheckmarkCircle className="w-4 h-4" />Settings saved successfully</p>
                    )}
                  </div>
                  <Button onClick={handleSaveSettings} className="gap-2 shadow-md shadow-primary/20">
                    <IoSave className="w-4 h-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
