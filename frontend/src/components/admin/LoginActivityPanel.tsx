import { useCallback, useEffect, useState } from 'react';
import {
  KeyRound,
  LogIn,
  Monitor,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Tablet,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatusPill } from '@/components/ui/status-pill';
import { Heading } from '@/components/ui/typography';
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { TablePagination } from '@/components/admin/TablePagination';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { securityApi } from '@/lib/api';
import { ADMIN_PAGE_SIZE } from '@/lib/pagination';
import { parseUserAgent, type DeviceKind } from '@/lib/userAgent';
import { formatRelativeTime } from '@/lib/utils';
import type { LoginAttempt, LoginAttemptStats, LoginFailureReason, LoginRange } from '@/types/api';

const RANGES: { value: LoginRange; label: string; shortLabel: string }[] = [
  { value: '24h', label: '24 hours', shortLabel: '24H' },
  { value: '7d', label: '7 days', shortLabel: '7D' },
  { value: '30d', label: '30 days', shortLabel: '30D' },
];

const RESULTS = [
  { value: ALL, label: 'All results' },
  { value: 'success', label: 'Signed in' },
  { value: 'failed', label: 'Failed' },
];

const REASONS: Record<LoginFailureReason, string> = {
  WRONG_PASSWORD: 'Wrong password',
  UNKNOWN_EMAIL: 'No account with this email',
  SUSPENDED: 'Account suspended',
};

const DEVICE_ICONS: Record<DeviceKind, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  unknown: Monitor,
};

const COLUMNS = [
  { key: 'when', label: 'When' },
  { key: 'account', label: 'Account' },
  { key: 'result', label: 'Result' },
  { key: 'ip', label: 'IP address' },
  { key: 'device', label: 'Device' },
] as const;

const KEEP_PARAMS = ['tab', 'range'];
const LOCAL_IPS = new Set(['::1', '127.0.0.1']);

const isRange = (value: string): value is LoginRange => RANGES.some((r) => r.value === value);

function accountName(attempt: LoginAttempt) {
  const user = attempt.user;
  if (!user) return null;
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
}

function formatExact(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function LoginActivityPanel() {
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters } = useUrlFilters({
    keep: KEEP_PARAMS,
  });
  const requestedRange = get('range');
  const range: LoginRange = isRange(requestedRange) ? requestedRange : '7d';
  const result = get('result');

  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [stats, setStats] = useState<LoginAttemptStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadAttempts = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await securityApi.getLoginAttempts({
        page,
        limit: ADMIN_PAGE_SIZE,
        range,
        status: result === 'success' || result === 'failed' ? result : undefined,
        search: query || undefined,
      });
      setAttempts(data.attempts);
      setTotal(data.pagination.total);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, range, result, query]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await securityApi.getLoginStats(range));
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = () => {
    loadAttempts();
    loadStats();
  };

  const filtered = !!query || result !== ALL;
  const successRate =
    stats && stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;

  const renderRows = () =>
    attempts.map((attempt) => {
      const device = parseUserAgent(attempt.userAgent);
      const DeviceIcon = DEVICE_ICONS[device.kind];
      const name = accountName(attempt);
      const isStaff = attempt.user && attempt.user.role !== 'CUSTOMER';
      return (
        <DataRow key={attempt.id}>
          <DataCell>
            <CellTitle>{formatRelativeTime(attempt.createdAt)}</CellTitle>
            <CellMeta>{formatExact(attempt.createdAt)}</CellMeta>
          </DataCell>
          <DataCell>
            <div className="flex items-center gap-2">
              <CellTitle className="max-w-56">{attempt.email}</CellTitle>
              {isStaff && <StatusPill tone="violet">Staff</StatusPill>}
            </div>
            <CellMeta className="max-w-56">
              {name ?? (attempt.user ? '—' : 'Not registered')}
            </CellMeta>
          </DataCell>
          <DataCell>
            <StatusPill tone={attempt.success ? 'green' : 'red'}>
              {attempt.success ? 'Signed in' : 'Failed'}
            </StatusPill>
            {attempt.reason && <CellMeta className="mt-1">{REASONS[attempt.reason]}</CellMeta>}
          </DataCell>
          <DataCell>
            {attempt.ipAddress ? (
              <button
                type="button"
                onClick={() => setSearch(attempt.ipAddress ?? '')}
                title="Show all attempts from this IP"
                className="rounded font-mono text-xs text-foreground/80 outline-none hover:text-accent-rose hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40"
              >
                {LOCAL_IPS.has(attempt.ipAddress) ? 'Localhost' : attempt.ipAddress}
              </button>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </DataCell>
          <DataCell>
            <div className="flex items-center gap-2.5">
              <DeviceIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <CellTitle className="max-w-44 font-normal">{device.browser}</CellTitle>
                <CellMeta className="max-w-44">{device.os}</CellMeta>
              </div>
            </div>
          </DataCell>
        </DataRow>
      );
    });

  const renderTable = () => {
    if (failed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load login activity"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={loadAttempts}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && attempts.length === 0) {
      return (
        <EmptyState
          icon={KeyRound}
          title={filtered ? 'No attempts match these filters' : 'No sign-in attempts yet'}
          description={
            filtered
              ? 'Try a different email or IP address, or clear the filters.'
              : 'Every sign-in to the store, successful or not, will be listed here.'
          }
          action={
            filtered && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      );
    }
    return (
      <DataTable columns={COLUMNS} label="Login attempts" loading={loading} minWidth="min-w-224">
        {renderRows()}
      </DataTable>
    );
  };

  return (
    <section aria-labelledby="login-activity-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Heading as="h2" size="sm" id="login-activity-title">
            Login activity
          </Heading>
          <p className="mt-1 text-sm text-muted-foreground">
            Every sign-in attempt across the store. Records are kept for 90 days.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Time range"
            value={range}
            onValueChange={(value) => setFilter('range', value === '7d' ? '' : value)}
            options={RANGES}
          />
          <Button variant="outline" onClick={refresh} className="gap-2 bg-background">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <StatGrid columns={4} loading={statsLoading} className="mb-0">
        <StatCard
          title="Attempts"
          value={(stats?.total ?? 0).toLocaleString()}
          icon={LogIn}
          tone="blue"
          hint={`Last ${RANGES.find((r) => r.value === range)?.label}`}
        />
        <StatCard
          title="Successful"
          value={(stats?.successful ?? 0).toLocaleString()}
          icon={ShieldCheck}
          tone="green"
          hint={stats?.total ? `${successRate}% success rate` : undefined}
        />
        <StatCard
          title="Failed"
          value={(stats?.failed ?? 0).toLocaleString()}
          icon={ShieldX}
          tone={stats?.failed ? 'red' : 'neutral'}
          hint="Show failed only"
          href="/admin/settings?tab=login-activity&result=failed"
        />
        <StatCard
          title="Accounts signed in"
          value={(stats?.uniqueAccounts ?? 0).toLocaleString()}
          icon={UserCheck}
          tone="violet"
        />
      </StatGrid>

      {stats && stats.flagged.length > 0 && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/30"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <Heading as="h3" size="xs">
                Repeated failed sign-ins
              </Heading>
              <p className="mt-0.5 text-sm text-muted-foreground">
                These sources failed {stats.flagThreshold} or more times in this period. Select one
                to review its attempts.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {stats.flagged.map((source) => (
                  <li key={`${source.kind}-${source.value}`}>
                    <button
                      type="button"
                      onClick={() => setSearch(source.value)}
                      className="inline-flex max-w-full items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-left text-sm outline-none transition-colors hover:border-amber-400 focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                    >
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {source.kind === 'ip' ? 'IP' : 'Email'}
                      </span>
                      <span className="truncate font-mono text-xs">{source.value}</span>
                      <StatusPill tone="red" className="tabular-nums">
                        {source.failures} failed
                      </StatusPill>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            label="Search login attempts"
            placeholder="Search by email or IP address"
            value={search}
            onValueChange={setSearch}
          />
          <Select value={result} onValueChange={(value) => setFilter('result', value)}>
            <SelectTrigger
              className="h-10 w-full bg-background sm:w-44"
              aria-label="Filter by result"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderTable()}

        {!loading && !failed && (
          <TablePagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            noun={['attempt', 'attempts']}
          />
        )}
      </div>
    </section>
  );
}
