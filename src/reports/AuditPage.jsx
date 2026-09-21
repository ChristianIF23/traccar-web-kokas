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
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'; // <-- PERBAIKAN DI SINI
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

const columnsMap = Object.fromEntries(columnsArray);

const AuditPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

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

  // Helper render nilai sel khusus agar estetik & dinamis mengikuti warna tema
  const renderCellValue = (item, key) => {
    const value = item[key];
    if (value === null || value === undefined || value === '') return '-';

    // Format Waktu dengan Aksesibilitas Ikon Halus
    if (key === 'actionTime') {
      return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            fontFamily: 'monospace',
            fontWeight: 500,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          {formatTime(value, 'minutes')}
        </Box>
      );
    }

    // Badge Khusus Action Type (Mengikuti Warna Tema Primary)
    if (key === 'actionType') {
      return (
        <Chip
          label={String(value)}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.2)'
                : `${theme.palette.primary.main}15`,
            color: 'primary.main',
            borderRadius: '6px',
            border: `1px solid ${theme.palette.primary.main}30`,
            textTransform: 'capitalize',
          }}
        />
      );
    }

    // Chip Pengguna dengan Avatar
    if (key === 'userId') {
      return (
        <Chip
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 20, height: 20 }}>
              <PersonOutlineIcon sx={{ fontSize: 14 }} />
            </Avatar>
          }
          label={typeof value === 'object' ? value.name || value.id : String(value)}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 500,
            borderColor: theme.palette.divider,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      );
    }

    if (typeof value === 'object') {
      return value.name || value.id || JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportAudit']}>
      {/* Header Filter */}
      <div className={classes.header}>
        <ReportFilter onShow={onShow} deviceType="none" loading={loading}>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>

      {/* Kontainer Utama Tabel */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0, width: '100%', boxSizing: 'border-box' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0px 2px 12px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          <Table
            size="medium"
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
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.04)'
                        : theme.palette.action.hover,
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap[key])}</TableCell>
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
                        transition: 'background-color 0.2s ease',
                        '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
                        '& .MuiTableCell-root': {
                          py: 1.6,
                          px: 2.5,
                          fontSize: '0.875rem',
                          borderBottom: `1px solid ${theme.palette.divider}`,
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
                          {renderCellValue(item, key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  /* Empty State Cantik & Rapih */
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{ py: 8, borderBottom: 'none' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1.5,
                          maxWidth: 360,
                          mx: 'auto',
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: `${theme.palette.primary.main}10`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 0.5,
                          }}
                        >
                          <HistoryEduOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                          {t('sharedNoData')}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ lineHeight: 1.5 }}
                        >
                          Tentukan rentang tanggal pada filter di atas untuk memuat log aktivitas
                          audit.
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
