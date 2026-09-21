import { useState, useEffect, useRef, useCallback } from 'react';
import { IconButton, Paper, Slider, Toolbar, Typography, Box, Menu, MenuItem } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import SpeedIcon from '@mui/icons-material/Speed';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositionMarkers from '../map/MapPositionMarkers';
import { formatTime } from '../common/util/formatter';
import ReportFilter from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatchCallback } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';
import MapOverlay from '../map/overlay/MapOverlay';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(2),
    width: theme.dimensions.drawerWidthDesktop,
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
      gap: 0,
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  slider: {
    width: '100%',
    padding: '13px 0',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2.5),
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('md')]: {
      borderRadius: 0,
      borderLeft: 0,
      borderRight: 0,
      padding: theme.spacing(2),
    },
  },
}));

const ReplayPage = () => {
  const t = useTranslation();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const [searchParams] = useSearchParams();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // State untuk Kecepatan Playback (1x, 2x, 4x, 8x)
  const [speed, setSpeed] = useState(500);
  const [anchorElSpeed, setAnchorElSpeed] = useState(null);

  const loaded = Boolean(from && to && !loading && positions.length);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (!from && !to) {
      setPositions([]);
    }
  }, [from, to, setPositions]);

  // Handle animasi play / pause dengan interval dinamis sesuai speed
  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          if (prevIndex >= positions.length - 1) {
            setPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions, speed]);

  const onPointClick = useCallback(
    (_, clickedIndex) => {
      setIndex(clickedIndex);
    },
    [setIndex],
  );

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(!!positionId);
    },
    [setShowCard],
  );

  const onShow = useCatchCallback(
    async ({ deviceIds, from: f, to: tRange }) => {
      const deviceId = deviceIds.find(() => true);
      setLoading(true);
      setSelectedDeviceId(deviceId);
      const query = new URLSearchParams({ deviceId, from: f, to: tRange });
      try {
        const response = await fetchOrThrow(`/api/positions?${query.toString()}`);
        setIndex(0);
        const fetchedPositions = await response.json();
        setPositions(fetchedPositions);
        if (!fetchedPositions.length) {
          throw Error(t('sharedNoData'));
        }
        setFilterOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} showSpeedControl />
        {index < positions.length && (
          <MapPositionMarkers
            positions={[positions[index]]}
            onMarkerClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapScale />
      {/* Fokuskan kamera ke seluruh rute saat awal, atau ke titik aktif saat di-play */}
      <MapCamera positions={playing ? [positions[index]] : positions} />

      <div className={classes.sidebar}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 0, md: '16px' },
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <Toolbar sx={{ px: { xs: 1.5, sm: 2 } }}>
            <IconButton edge="start" sx={{ mr: 1.5 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t('reportReplay')}
            </Typography>
            {loaded && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton onClick={handleDownload} size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => setFilterOpen((open) => !open)} size="small">
                  <TuneIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Paper>

        <Paper
          elevation={0}
          className={classes.content}
          sx={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          {loaded && !filterOpen && (
            <>
              <Typography variant="subtitle1" align="center" fontWeight={600} color="text.primary">
                {deviceName}
              </Typography>
              <Box sx={{ px: 1, my: 1 }}>
                <Slider
                  className={classes.slider}
                  max={positions.length - 1}
                  step={1}
                  value={index}
                  onChange={(_, val) => setIndex(val)}
                />
              </Box>
              <div className={classes.controls}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, minWidth: 48 }}
                >
                  {`${index + 1}/${positions.length}`}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    onClick={(e) => setAnchorElSpeed(e.currentTarget)}
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    <SpeedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                    disabled={playing || index <= 0}
                    size="small"
                  >
                    <FastRewindRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      if (index >= positions.length - 1) {
                        setIndex(0);
                      }
                      setPlaying(!playing);
                    }}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      '&.Mui-disabled': {
                        opacity: 0.4,
                        backgroundColor: 'action.disabledBackground',
                      },
                      p: 1.25,
                    }}
                  >
                    {playing ? (
                      <PauseRoundedIcon sx={{ fontSize: 24 }} />
                    ) : (
                      <PlayArrowRoundedIcon sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={() => setIndex((prev) => Math.min(positions.length - 1, prev + 1))}
                    disabled={playing || index >= positions.length - 1}
                    size="small"
                  >
                    <FastForwardRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 64, textAlign: 'right' }}
                >
                  {formatTime(positions[index]?.fixTime, 'seconds')}
                </Typography>
              </div>

              {/* Menu Pemilihan Kecepatan Replay */}
              <Menu
                anchorEl={anchorElSpeed}
                open={Boolean(anchorElSpeed)}
                onClose={() => setAnchorElSpeed(null)}
              >
                <MenuItem
                  onClick={() => {
                    setSpeed(1000);
                    setAnchorElSpeed(null);
                  }}
                >
                  1x (Slow)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSpeed(500);
                    setAnchorElSpeed(null);
                  }}
                >
                  2x (Normal)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSpeed(200);
                    setAnchorElSpeed(null);
                  }}
                >
                  5x (Fast)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSpeed(50);
                    setAnchorElSpeed(null);
                  }}
                >
                  20x (Very Fast)
                </MenuItem>
              </Menu>
            </>
          )}
          <div style={{ display: loaded && !filterOpen ? 'none' : 'block' }}>
            <ReportFilter onShow={onShow} deviceType="single" loading={loading} />
          </div>
        </Paper>
      </div>

      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
