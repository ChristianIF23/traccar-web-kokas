import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  IconButton,
  Toolbar,
  Paper,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Hls from 'hls.js/light';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatchCallback } from '../reactHelper';
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
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  playerContainer: {
    width: '100%',
    maxWidth: 960,
    aspectRatio: '16 / 9',
    backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#0f172a',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  player: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
}));

const StreamPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const videoRef = useRef(null);

  const [channel, setChannel] = useState(1);
  const [activeChannel, setActiveChannel] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');
  const device = useSelector((state) => state.devices.items[deviceId]);

  const playing = activeChannel !== null;

  const sendCommand = useCatchCallback(
    async (type, attributes) => {
      await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, type, attributes }),
      });
    },
    [deviceId],
  );

  useEffect(() => {
    let hls;
    const currentChannel = activeChannel;

    if (currentChannel !== null && deviceId) {
      setLoading(true);
      setError(false);
      sendCommand('videoStart', { index: currentChannel });

      const streamUrl = `/api/stream/${deviceId}/${currentChannel}/live.m3u8`;

      if (Hls.isSupported()) {
        hls = new Hls({
          liveSyncDurationCount: 3,
          enableWorker: true,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setLoading(false);
            setError(true);
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS fallback (Safari / iOS)
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });
        videoRef.current.addEventListener('error', () => {
          setLoading(false);
          setError(true);
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (currentChannel !== null && deviceId) {
        sendCommand('videoStop', { index: currentChannel });
      }
    };
  }, [deviceId, activeChannel, sendCommand]);

  return (
    <div className={classes.root}>
      <Paper elevation={0} square className={classes.toolbar}>
        <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
          <IconButton
            edge="start"
            sx={{
              mr: 2,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
            }}
            onClick={() => navigate(-1)}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.05rem' }}>
            {device?.name || t('linkLiveVideo')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              type="number"
              value={channel}
              onChange={(event) => setChannel(Number(event.target.value) || 1)}
              label={t('commandIndex')}
              disabled={playing}
              sx={{ width: 90 }}
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
            />
            <IconButton
              color={playing ? 'error' : 'primary'}
              onClick={() => {
                setError(false);
                setActiveChannel(playing ? null : channel);
              }}
              sx={{
                backgroundColor: playing ? 'rgba(239, 68, 68, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  backgroundColor: playing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                },
                p: 1,
              }}
            >
              {playing ? <StopIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Paper>

      <div className={classes.content}>
        <Box className={classes.playerContainer}>
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#fff' },
              }}
            >
              {t('errorConnection')}
            </Alert>
          )}

          {loading && !error && <CircularProgress sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}

          {!playing && !error && (
            <Box sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
              <VideocamOffIcon sx={{ fontSize: 56, mb: 1, opacity: 0.6 }} />
              <Typography variant="body2">{t('sharedNoData')}</Typography>
            </Box>
          )}

          <video
            ref={videoRef}
            className={classes.player}
            style={{ display: playing && !error ? 'block' : 'none' }}
            autoPlay
            muted
            controls
            playsInline
          />
        </Box>
      </div>
    </div>
  );
};

export default StreamPage;
