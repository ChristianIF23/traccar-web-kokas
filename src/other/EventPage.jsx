import { useCallback, useState } from 'react';
import { Typography, AppBar, Toolbar, IconButton, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import MapView from '../map/core/MapView';
import MapCamera from '../map/MapCamera';
import MapPositionMarkers from '../map/MapPositionMarkers';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import { formatNotificationTitle } from '../common/util/formatter';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
  },
  toolbar: {
    zIndex: 2,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  mapContainer: {
    flexGrow: 1,
    position: 'relative',
    height: '100%',
  },
}));

const EventPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [position, setPosition] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const formatType = (eventItem) =>
    formatNotificationTitle(t, {
      type: eventItem.type,
      attributes: {
        alarm: eventItem.attributes?.alarm,
      },
    });

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(Boolean(positionId));
  }, []);

  useAsyncTask(
    async ({ signal }) => {
      if (id) {
        try {
          const response = await fetchOrThrow(`/api/events/${id}`, { signal });
          const data = await response.json();
          setEvent(data);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Gagal mengambil data event:', error);
          }
        }
      }
    },
    [id],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (event?.positionId) {
        try {
          const response = await fetchOrThrow(`/api/positions?id=${event.positionId}`, { signal });
          const positions = await response.json();
          if (positions && positions.length > 0) {
            setPosition(positions[0]);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Gagal mengambil data posisi:', error);
          }
        }
      }
    },
    [event],
  );

  return (
    <div className={classes.root}>
      <AppBar color="inherit" position="static" elevation={0} className={classes.toolbar}>
        <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
          <IconButton
            edge="start"
            sx={{
              mr: 2,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
            }}
            onClick={() => navigate('/')}
          >
            <BackIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.05rem',
              color: 'text.primary',
              noWrap: true,
            }}
          >
            {event ? formatType(event) : t('sharedLoading')}
          </Typography>
        </Toolbar>
      </AppBar>

      <div className={classes.mapContainer}>
        <MapView>
          <MapGeofence />
          {position && (
            <MapPositionMarkers
              positions={[position]}
              onMarkerClick={onMarkerClick}
              titleField="fixTime"
            />
          )}
        </MapView>
        <MapScale />
        {position && <MapCamera latitude={position.latitude} longitude={position.longitude} />}
        {position && showCard && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              zIndex: 3,
              maxWidth: { xs: 'calc(100% - 48px)', sm: 380 },
              filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.12))',
            }}
          >
            <StatusCard
              deviceId={position.deviceId}
              position={position}
              onClose={() => setShowCard(false)}
              disableActions
            />
          </Box>
        )}
      </div>
    </div>
  );
};

export default EventPage;
