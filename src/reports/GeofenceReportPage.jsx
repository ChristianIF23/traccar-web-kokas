import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import FenceOutlinedIcon from '@mui/icons-material/FenceOutlined';
import { formatNumericHours, formatTime } from '../common/util/formatter';
import ReportFilter, { updateReportParams } from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ColumnSelect from './components/ColumnSelect';
import usePersistedState from '../common/util/usePersistedState';
import { useCatch, useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import fetchOrThrow from '../common/util/fetchOrThrow';
import SelectField from '../common/components/SelectField';
import exportExcel from '../common/util/exportExcel';
import { deviceEquality } from '../common/util/deviceEquality';

const columnsArray = [
  ['geofenceId', 'sharedGeofence'],
  ['startTime', 'reportStartTime'],
  ['endTime', 'reportEndTime'],
  ['duration', 'reportDuration'],
];
const columnsMap = new Map(columnsArray);

const GeofenceReportPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const geofenceIds = useMemo(() => searchParams.getAll('geofenceId').map(Number), [searchParams]);

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));
  const geofences = useSelector((state) => state.geofences.items);

  const [columns, setColumns] = usePersistedState('geofenceColumns', [
    'geofenceId',
    'startTime',
    'endTime',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formatting nilai sel dengan useCallback untuk menjaga performa
  const formatValue = useCallback(
    (item, key) => {
      switch (key) {
        case 'geofenceId':
          return geofences[item.geofenceId]?.name || item.geofenceId;
        case 'startTime':
        case 'endTime':
          return item[key] ? formatTime(item[key], 'minutes') : '';
        case 'duration': {
          if (!item.startTime || !item.endTime) return '';
          const durationMs = Date.parse(item.endTime) - Date.parse(item.startTime);
          return !Number.isNaN(durationMs) ? formatNumericHours(durationMs, t) : '';
        }
        default:
          return item[key];
      }
    },
    [geofences, t],
  );

  const onShow = useCatchCallback(
    async ({ deviceIds, groupIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      groupIds.forEach((groupId) => query.append('groupId', groupId));
      geofenceIds.forEach((geofenceId) => query.append('geofenceId', geofenceId));
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/reports/geofences?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        setItems(await response.json());
      } finally {
        setLoading(false);
      }
    },
    [geofenceIds],
  );

  const onExport = useCatch(async () => {
    const sheets = new Map();
    items.forEach((item) => {
      const deviceName = devices[item.deviceId]?.name || item.deviceId;
      if (!sheets.has(deviceName)) {
        sheets.set(deviceName, []);
      }
      const row = {};
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        row[header] = formatValue(item, key);
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('sharedGeofences'), 'geofences.xlsx', sheets, theme);
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedGeofences']}>
      <div className={classes.header}>
        <ReportFilter
          onShow={onShow}
          onExport={onExport}
          deviceType="multiple"
          loading={loading}
          formats={['xlsx']}
        >
          <div className={classes.filterItem}>
            <SelectField
              label={t('sharedGeofences')}
              value={geofenceIds}
              onChange={(e) =>
                updateReportParams(searchParams, setSearchParams, 'geofenceId', e.target.value)
              }
              endpoint="/api/geofences"
              multiple
              singleLine
              fullWidth
            />
          </div>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>

      <Box sx={{ p: { xs: 1.5, sm: 3 }, pt: 0, width: '100%', boxSizing: 'border-box' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 700,
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <TableCell>{t('sharedDevice')}</TableCell>
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.length > 0 ? (
                  items.map((item, index) => {
                    const rowKey = `${item.deviceId}_${item.geofenceId}_${item.startTime}_${index}`;
                    return (
                      <TableRow
                        key={rowKey}
                        hover
                        sx={{
                          transition: 'background-color 0.15s ease',
                          '& .MuiTableCell-root': {
                            py: 1.5,
                            px: 2.5,
                            fontSize: '0.875rem',
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {devices[item.deviceId]?.name || item.deviceId}
                        </TableCell>
                        {columns.map((key) => (
                          <TableCell key={key} sx={{ color: 'text.primary' }}>
                            {formatValue(item, key)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      align="center"
                      sx={{ py: 6, borderBottom: 'none' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <FenceOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('sharedNoData')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Pilih perangkat serta geofence untuk memuat laporan riwayat geofence.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableShimmer columns={columns.length + 1} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageLayout>
  );
};

export default GeofenceReportPage;
