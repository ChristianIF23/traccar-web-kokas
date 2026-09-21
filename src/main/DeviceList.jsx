import { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { Box, Typography, Chip, List } from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import { devicesActions } from '../store';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px 10px 16px',
    borderBottom: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'
    }`,
    flexShrink: 0,
  },
  title: {
    fontWeight: 800,
    fontSize: '0.78rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#334155',
  },
  countChip: {
    height: 22,
    fontSize: '0.72rem',
    fontWeight: 700,
    borderRadius: 8,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(29, 78, 216, 0.2)' : 'rgba(29, 78, 216, 0.08)',
    color: '#1d4ed8',
    border: 'none',
  },
  listContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 250px)', // Batas tinggi maksimal saat unit banyak
    padding: '4px 0',
    '&::-webkit-scrollbar': {
      width: 5,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)',
      borderRadius: 4,
    },
  },
}));

const DeviceList = ({ devices = [] }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useAsyncTask(
    async ({ signal }) => {
      const response = await fetchOrThrow('/api/devices', { signal });
      dispatch(devicesActions.refresh(await response.json()));
    },
    [dispatch],
  );

  if (!devices.length) {
    return (
      <Box className={classes.root}>
        <div className={classes.header}>
          <Typography className={classes.title}>Daftar Unit</Typography>
          <Chip label="0 Unit" size="small" className={classes.countChip} />
        </div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            gap: 1.5,
            textAlign: 'center',
          }}
        >
          <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 38, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {t('sharedNoData')}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Tidak ada armada yang sesuai.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header "DAFTAR UNIT" + Counter Chip */}
      <div className={classes.header}>
        <Typography className={classes.title}>Daftar Unit</Typography>
        <Chip label={`${devices.length} Unit`} size="small" className={classes.countChip} />
      </div>

      {/* List adaptif: pendek jika sedikit, scroll jika banyak */}
      <Box className={classes.listContainer}>
        <List disablePadding>
          {devices.map((_, index) => (
            <DeviceRow key={devices[index].id} devices={devices} index={index} />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DeviceList;
