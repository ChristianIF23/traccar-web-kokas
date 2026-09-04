import { useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableContainer,
  Paper,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import RemoveDialog from '../common/components/RemoveDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const ScheduledPage = () => {
  const t = useTranslation();

  const calendars = useSelector((state) => state.calendars.items);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState();

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setLoading(true);
      try {
        const response = await fetchOrThrow('/api/reports', { signal });
        setItems(await response.json());
      } finally {
        setLoading(false);
      }
    },
    [reloadKey],
  );

  const formatType = (type) => {
    switch (type) {
      case 'events':
        return t('reportEvents');
      case 'route':
        return t('reportPositions');
      case 'summary':
        return t('reportSummary');
      case 'trips':
        return t('reportTrips');
      case 'stops':
        return t('reportStops');
      default:
        return type;
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportScheduled']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
              mb: 4,
              width: '100%',
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 600,
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
                  <TableCell>{t('sharedType')}</TableCell>
                  <TableCell>{t('sharedDescription')}</TableCell>
                  <TableCell>{t('sharedCalendar')}</TableCell>
                  <TableCell sx={{ width: 48, paddingRight: 2 }} align="right" />
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
                            py: 1.6,
                            px: 2.5,
                            fontSize: '0.875rem',
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatType(item.type)}
                        </TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>
                          {item.description || '—'}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {calendars[item.calendarId]?.name || item.calendarId}
                        </TableCell>
                        <TableCell sx={{ width: 48, paddingRight: 2 }} padding="none" align="right">
                          <Tooltip title={t('sharedRemove')} arrow>
                            <IconButton
                              size="small"
                              onClick={() => setRemovingId(item.id)}
                              sx={{
                                color: 'text.secondary',
                                borderRadius: '8px',
                                p: 0.75,
                                '&:hover': {
                                  color: 'error.main',
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                      ? 'rgba(211, 47, 47, 0.15)'
                                      : 'rgba(211, 47, 47, 0.08)',
                                },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <EventRepeatIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            {t('sharedNoData')}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Belum ada jadwal laporan otomatis yang dikonfigurasi.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableShimmer columns={4} endAction />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <RemoveDialog
        style={{ transform: 'none' }}
        open={Boolean(removingId)}
        endpoint="reports"
        itemId={removingId}
        onResult={(removed) => {
          setRemovingId(null);
          if (removed) {
            reload();
          }
        }}
      />
    </PageLayout>
  );
};

export default ScheduledPage;
