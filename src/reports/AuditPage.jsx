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
  ['objectType', 'sharedQbjectType'],
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

      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, pt: 0, width: '100%' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                }}
              >
                {columns.map((key) => (
                  <TableCell
                    key={key}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      py: 1.5,
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {t(columnsMap.get(key))}
                  </TableCell>
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
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {columns.map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontSize: '0.85rem',
                            color: 'text.primary',
                            py: 1.25,
                          }}
                        >
                          {key === 'actionTime' ? formatTime(item[key], 'minutes') : item[key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
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
