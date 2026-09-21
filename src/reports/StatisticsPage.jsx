import { useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatch, useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';

const columnsArray = [
  ['captureTime', 'statisticsCaptureTime'],
  ['activeUsers', 'statisticsActiveUsers'],
  ['activeDevices', 'statisticsActiveDevices'],
  ['requests', 'statisticsRequests'],
  ['messagesReceived', 'statisticsMessagesReceived'],
  ['messagesStored', 'statisticsMessagesStored'],
  ['mailSent', 'notificatorMail'],
  ['smsSent', 'notificatorSms'],
  ['geocoderRequests', 'statisticsGeocoder'],
  ['geolocationRequests', 'statisticsGeolocation'],
];
const columnsMap = new Map(columnsArray);

const StatisticsPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const [columns, setColumns] = usePersistedState('statisticsColumns', [
    'captureTime',
    'activeUsers',
    'activeDevices',
    'messagesStored',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetchOrThrow(`/api/statistics?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const formatValue = useCallback((item, key) => {
    const value = item[key];
    if (value === undefined || value === null) return '-';

    if (key === 'captureTime') {
      return formatTime(value, 'date');
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return value;
  }, []);

  const onExport = useCatch(async () => {
    const rowData = items.map((item) => {
      const row = {};
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        row[header] = formatValue(item, key);
      });
      return row;
    });

    const sheets = new Map([[t('statisticsTitle'), rowData]]);
    await exportExcel(t('statisticsTitle'), 'statistics.xlsx', sheets, theme);
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'statisticsTitle']}>
      <div className={classes.header}>
        <ReportFilter
          onShow={onShow}
          onExport={onExport}
          deviceType="none"
          loading={loading}
          formats={['xlsx']}
        >
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>

      <Box sx={{ p: { xs: 1.5, sm: 3 }, pt: 0, width: '100%', boxSizing: 'border-box' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: (th) => `1px solid ${th.palette.divider}`,
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
                    backgroundColor: (th) =>
                      th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: (th) => `1px solid ${th.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.length > 0 ? (
                  items.map((item, index) => (
                    <TableRow
                      key={item.id || item.captureTime || index}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '& .MuiTableCell-root': {
                          py: 1.5,
                          px: 2.5,
                          fontSize: '0.875rem',
                          borderBottom: (th) => `1px solid ${th.palette.divider}`,
                        },
                      }}
                    >
                      {columns.map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            color: 'text.primary',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatValue(item, key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
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
                        <BarChartOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('sharedNoData')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Tentukan rentang tanggal di atas untuk memuat statistik server.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableShimmer columns={columns.length} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageLayout>
  );
};

export default StatisticsPage;
