import { useCallback, useReducer, useState } from 'react';
import dayjs from 'dayjs';
import { Table, TableRow, TableCell, TableHead, TableBody, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { formatDistance, formatSpeed } from '../common/util/formatter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';

const MaintenancesPage = () => {
  const theme = useTheme();
  const t = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  const positionAttributes = usePositionAttributes(t);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');

  const loadItems = useCallback(
    async (offset, signal) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ limit: pageSize, offset });
        if (searchKeyword) {
          query.append('keyword', searchKeyword);
        }
        const response = await fetchOrThrow(`/api/maintenance?${query.toString()}`, { signal });
        const data = await response.json();
        setItems((previous) => (offset ? [...previous, ...data] : data));
        setHasMore(data.length >= pageSize);
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  const convertAttribute = (key, start, value) => {
    const attribute = positionAttributes[key];
    if (key.endsWith('Time')) {
      if (start) {
        return dayjs(value).locale('en').format('YYYY-MM-DD');
      }
      return `${value / 86400000} ${t('sharedDays')}`;
    }
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return formatSpeed(value, speedUnit, t);
        case 'distance':
          return formatDistance(value, distanceUnit, t);
        case 'hours':
          return `${value / 3600000} ${t('sharedHours')}`;
        default:
          return value;
      }
    }

    return value;
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedMaintenance']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box
          sx={{
            backgroundColor: isDark ? '#162447' : '#ffffff',
            borderRadius: '18px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 12px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 24px rgba(15, 23, 42, 0.04)',
            width: '100%',
          }}
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table
              sx={{
                minWidth: 700,
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& .MuiTableHead-root .MuiTableCell-root': {
                  backgroundColor: isDark ? alpha('#0f172a', 0.6) : alpha('#f8fafc', 0.9),
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  py: 1.5,
                  px: 2.5,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  whiteSpace: 'nowrap',
                },
                '& .MuiTableBody-root .MuiTableRow-root': {
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.08) : alpha('#1d4ed8', 0.03),
                  },
                  '&:last-child .MuiTableCell-root': {
                    borderBottom: hasMore ? undefined : 'none',
                  },
                },
                '& .MuiTableBody-root .MuiTableCell-root': {
                  py: 1.4,
                  px: 2.5,
                  fontSize: '0.86rem',
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'
                  }`,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('sharedType')}</TableCell>
                  <TableCell>{t('maintenanceStart')}</TableCell>
                  <TableCell>{t('maintenancePeriod')}</TableCell>
                  <TableCell align="right" sx={{ width: 90, pr: 2 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {positionAttributes[item.type]?.name || item.type}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {convertAttribute(item.type, true, item.start) || '—'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {convertAttribute(item.type, false, item.period) || '—'}
                    </TableCell>
                    <TableCell padding="none" align="right" sx={{ pr: 2 }}>
                      <CollectionActions
                        itemId={item.id}
                        editPath="/settings/maintenance"
                        endpoint="maintenance"
                        onReload={reload}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {hasMore && (
                  <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={5} endAction />
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>

      <CollectionFab editPath="/settings/maintenance" />
    </PageLayout>
  );
};

export default MaintenancesPage;
