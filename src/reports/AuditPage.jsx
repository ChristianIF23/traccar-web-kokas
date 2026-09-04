import { useState } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import fetchOrThrow from '../common/util/fetchOrThrow';

const columnsArray = [
  ['actionTime', 'positionServerTime'],
  ['address', 'positionAddress'],
  ['userId', 'settingsUser'],
  ['actionType', 'sharedActionType'],
  ['objectType', 'sharedObjectType'],
  ['objectId', 'deviceIdentifier'],
];
const columnsMap = new Map(columnsArray);

const AuditPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const [columns, setColumns] = usePersistedState('auditColumns', [
    'actionTime',
    'userId',
    'actionType',
    'objectType',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetchOrThrow(`/api/audit?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportAudit']}>
      <div className={classes.header}>
        <ReportFilter onShow={onShow} deviceType="none" loading={loading}>
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
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.length > 0 ? (
                  items.map((item) => (
                    <TableRow
                      key={item.id}
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
                      {columns.map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            color: 'text.primary',
                            ...(key === 'actionTime' && { fontVariantNumeric: 'tabular-nums' }),
                          }}
                        >
                          {key === 'actionTime' ? formatTime(item[key], 'minutes') : item[key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <HistoryEduOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('sharedNoData')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Tentukan rentang tanggal di atas untuk memuat log audit aktivitas.
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

export default AuditPage;
