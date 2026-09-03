import { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List } from 'react-window';
import { Box, Typography } from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import { devicesActions } from '../store';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  list: {
    height: '100%',
    direction: theme.direction,
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
      borderRadius: 4,
    },
  },
}));

const DeviceList = ({ devices }) => {
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          gap: 1.5,
          textAlign: 'center',
        }}
      >
        <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {t('sharedNoData')}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Tidak ada perangkat yang sesuai dengan filter atau kata kunci.
        </Typography>
      </Box>
    );
  }

  return (
    <List
      className={classes.list}
      rowComponent={DeviceRow}
      rowCount={devices.length}
      rowHeight={78}
      rowProps={{ devices }}
      overscanCount={5}
    />
  );
};

export default DeviceList;
