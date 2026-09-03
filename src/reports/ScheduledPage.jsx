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
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import RemoveDialog from '../common/components/RemoveDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  columnAction: {
    width: 48,
    paddingRight: theme.spacing(1),
  },
}));

const ScheduledPage = () => {
  const { classes } = useStyles();
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
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, width: '100%' }}>
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
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('sharedType')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('sharedDescription')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('sharedCalendar')}
                </TableCell>
                <TableCell className={classes.columnAction} />
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
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'primary.main' }}>
                        {formatType(item.type)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
                        {item.description || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {calendars[item.calendarId]?.name || item.calendarId}
                      </TableCell>
                      <TableCell className={classes.columnAction} padding="none">
                        <IconButton
                          size="small"
                          onClick={() => setRemovingId(item.id)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <EventRepeatIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Belum ada jadwal laporan otomatis yang dikonfigurasi.
                      </Typography>
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

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
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
