import { useEffect, useRef, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Hls from 'hls.js';
import fetchOrThrow from '../common/util/fetchOrThrow';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

const DEMO_ROAD_FEED =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEMO_CABIN_FEED =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

const getDriverName = (device, position, drivers) => {
  const driverUniqueId =
    position?.attributes?.driverUniqueId || device?.attributes?.driverUniqueId;
  const driver = driverUniqueId ? drivers[driverUniqueId] : null;
  return (
    device?.attributes?.driverName ||
    position?.attributes?.driverName ||
    driver?.name ||
    'Pengemudi belum ditetapkan'
  );
};

const getPlateNumber = (device) =>
  device?.attributes?.plateNumber ||
  device?.attributes?.registration ||
  device?.name ||
  'Plat belum tersedia';

const getSpeed = (position) =>
  position?.speed == null ? '—' : `${Math.round(position.speed * 1.852)} km/h`;

const getLocation = (position) => {
  if (!position) return 'Lokasi GPS belum tersedia';
  if (position.address) return position.address;
  if (position.latitude == null || position.longitude == null) {
    return 'Lokasi GPS belum tersedia';
  }
  return `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`;
};

const VideoFeed = ({
  device,
  camera,
  label,
  speed,
  infrared = false,
  compact = false,
}) => {
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // JC181 / JT1078 standard channel index:
  // Channel 1: Front / Road Camera
  // Channel 2: Cabin / In-Vehicle DMS Camera
  const channel = camera === 'cabin' ? 2 : 1;
  const deviceId = device?.id;

  const fallbackFeedUrl =
    camera === 'cabin'
      ? device?.attributes?.cabinCameraUrl || DEMO_CABIN_FEED
      : device?.attributes?.roadCameraUrl || DEMO_ROAD_FEED;

  useEffect(() => {
    let hlsInstance = null;
    let isCancelled = false;

    if (!deviceId) return undefined;

    setConnecting(true);
    setStreamError(false);
    setStreamActive(false);

    // Kirim perintah videoStart ke perangkat GPS dashcam via Traccar backend
    fetchOrThrow('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        type: 'videoStart',
        attributes: { index: channel },
      }),
    }).catch(() => {
      // Abaikan jika device sedang offline / belum ada channel aktif
    });

    const streamUrl = `/api/stream/${deviceId}/${channel}/live.m3u8`;

    if (videoRef.current) {
      videoRef.current.muted = true;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        enableWorker: true,
        manifestLoadingMaxRetry: 10,
        manifestLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 5,
        fragLoadingRetryDelay: 1000,
      });

      hlsInstance.loadSource(streamUrl);
      if (videoRef.current) {
        hlsInstance.attachMedia(videoRef.current);
      }

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isCancelled) {
          setConnecting(false);
          setStreamActive(true);
          setStreamError(false);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        }
      });

      hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
        if (!isCancelled && videoRef.current) {
          setConnecting(false);
          setStreamActive(true);
          if (videoRef.current.paused) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        }
      });

      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (!isCancelled) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hlsInstance.recoverMediaError();
                break;
              default:
                setConnecting(false);
                setStreamError(true);
                break;
            }
          }
        }
      });
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari / iOS Native HLS
      videoRef.current.src = streamUrl;
      videoRef.current.muted = true;
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (!isCancelled) {
          setConnecting(false);
          setStreamActive(true);
          videoRef.current?.play().catch(() => {});
        }
      });
      videoRef.current.addEventListener('error', () => {
        if (!isCancelled) {
          setConnecting(false);
          setStreamError(true);
        }
      });
    }

    return () => {
      isCancelled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      // Hentikan transmisi video saat modal ditutup untuk menghemat bandwidth 4G
      fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'videoStop',
          attributes: { index: channel },
        }),
      }).catch(() => {});
    };
  }, [deviceId, channel]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        bgcolor: '#0f172a',
      }}
    >
      {/* Video Player Utama - KUNCI STABIL: Tanpa re-mounting key */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label={label}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: infrared ? 'grayscale(1) contrast(1.3) brightness(0.8)' : 'none',
        }}
      />

      {/* Overlay Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: streamActive ? 'rgba(220, 38, 38, 0.88)' : 'rgba(15, 23, 42, 0.82)',
          color: '#ffffff',
          fontSize: compact ? '0.62rem' : '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
        }}
      >
        {connecting ? (
          <>
            <CircularProgress size={10} color="inherit" />
            <span>MENGHUBUNGKAN...</span>
          </>
        ) : streamActive ? (
          <>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#fff',
                animation: 'pulse 1.2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
            <span>LIVE CH 0{channel}</span>
          </>
        ) : (
          <span>SIAP KONEK · {label}</span>
        )}
      </Box>

      {/* Indikator Driver / Face DMS */}
      {camera === 'cabin' && !compact && (
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '34%',
            width: '30%',
            height: '48%',
            border: '2px solid #4ade80',
            borderRadius: 1,
            color: '#4ade80',
            fontSize: '0.65rem',
            fontWeight: 800,
            pt: 0.5,
            pl: 0.5,
            textShadow: '0 1px 3px rgba(15, 23, 42, 0.9)',
          }}
        >
          FACE DETECT OK
        </Box>
      )}

      {/* Indikator ADAS / Road Cam */}
      {camera === 'road' && !compact && (
        <Box
          sx={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            px: 1.25,
            py: 0.75,
            borderRadius: 1,
            bgcolor: 'rgba(15, 23, 42, 0.82)',
            color: '#a7f3d0',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          Kecepatan: {speed}
        </Box>
      )}

      {camera === 'cabin' && !compact && (
        <Box
          sx={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            px: 1.25,
            py: 0.75,
            borderRadius: 1,
            bgcolor: 'rgba(6, 78, 59, 0.9)',
            color: '#a7f3d0',
            fontSize: '0.7rem',
            fontWeight: 800,
          }}
        >
          STATUS PENGEMUDI: AKTIF
        </Box>
      )}
    </Box>
  );
};

const CameraCard = ({ device, title, camera, infrared, status, speed }) => (
  <Card
    elevation={0}
    sx={{
      overflow: 'hidden',
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      color: 'text.primary',
    }}
  >
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.65rem',
          color: infrared ? 'warning.main' : 'secondary.main',
          fontWeight: 700,
        }}
      >
        {status}
      </Typography>
    </Box>
    <VideoFeed
      device={device}
      camera={camera}
      label={title}
      speed={speed}
      infrared={infrared}
    />
  </Card>
);

const DialogHeader = ({ title, titleId, subtitle, onClose }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      px: { xs: 2, sm: 3 },
      py: 2,
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        id={titleId}
        sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '0.04em' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <IconButton
      aria-label="Tutup pemantauan video"
      onClick={onClose}
      sx={{ color: 'text.secondary', flexShrink: 0 }}
    >
      <CloseRoundedIcon />
    </IconButton>
  </Box>
);

const SingleVehicleDialog = ({ open, device, position, drivers, onClose }) => {
  const driverName = getDriverName(device, position, drivers);
  const speed = getSpeed(position);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="single-video-title"
      slotProps={{
        paper: {
          sx: {
            maxWidth: 960,
            maxHeight: 'calc(100% - 32px)',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.78)' : 'rgba(15, 23, 42, 0.38)',
            backdropFilter: 'blur(5px)',
          },
        },
      }}
    >
      <DialogHeader
        title={`PEMANTAUAN LIVE DASHCAM — ${getPlateNumber(device)}`}
        titleId="single-video-title"
        subtitle={`Supir: ${driverName} · Kecepatan: ${speed} · GPS: ${getLocation(position)}`}
        onClose={onClose}
      />
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
          bgcolor: 'background.default',
        }}
      >
        <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
          Unit: {device?.name || 'Unit tidak dipilih'}
        </Typography>
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            border: 1,
            borderColor: (theme) => alpha(theme.palette.secondary.main, 0.35),
            borderRadius: 10,
            color: 'secondary.main',
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        >
          ● 4G DASHCAM READY · JC181
        </Box>
      </Box>
      <Grid
        container
        spacing={2}
        sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <CameraCard
            device={device}
            title="CAM 01 · ROAD-FACING (DASHCAM DEPAN)"
            camera="road"
            status="1080P HD · CHANNEL 1"
            speed={speed}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CameraCard
            device={device}
            title="CAM 02 · IN-CABIN (DMS)"
            camera="cabin"
            infrared
            status="INFRARED · CHANNEL 2"
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 0.5 }}>
            Indikator AI pada tampilan ini hanya simulasi UI.
          </Typography>
        </Box>
        <Button onClick={onClose} variant="contained" size="small">
          Tutup Stream
        </Button>
      </Box>
    </Dialog>
  );
};

const GroupVehicleCard = ({ device, position, driverName, onSelect }) => {
  const hasWarning = Boolean(
    device.attributes?.videoWarning ||
      position?.attributes?.driverWarning ||
      position?.attributes?.driverDrowsy,
  );

  return (
    <Card
      elevation={0}
      sx={{
        overflow: 'hidden',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 2,
        border: 1,
        borderColor: hasWarning ? 'error.main' : 'divider',
        boxShadow: hasWarning ? '0 0 18px rgba(239, 68, 68, 0.16)' : 'none',
        animation: hasWarning ? 'video-warning-pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes video-warning-pulse': {
          '0%, 100%': { borderColor: 'error.main' },
          '50%': { borderColor: 'rgba(239, 68, 68, 0.35)' },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          bgcolor: hasWarning
            ? (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(127, 29, 29, 0.42)'
                  : 'rgba(254, 226, 226, 0.8)'
            : 'background.default',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 800, color: 'text.primary' }}>
            {device.name}
          </Typography>
          <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            {getPlateNumber(device)}
          </Typography>
        </Box>
        {hasWarning ? (
          <Typography
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: 'error.main',
              color: 'error.contrastText',
              fontSize: '0.6rem',
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            ⚠ WARNING
          </Typography>
        ) : (
          <VideocamOutlinedIcon sx={{ color: 'secondary.main', fontSize: 19 }} />
        )}
      </Box>
      <Box onClick={onSelect} sx={{ cursor: 'pointer' }}>
        <VideoFeed device={device} camera="road" label="CAM 01 · DEPAN" compact />
      </Box>
      <Box sx={{ px: 1.5, py: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            Supir: {driverName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.62rem', mt: 0.25 }}>
            {hasWarning ? 'Peringatan: status perlu ditinjau' : 'Status kecepatan'}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: 'secondary.main',
            fontSize: '0.75rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
        >
          {getSpeed(position)}
        </Typography>
      </Box>
    </Card>
  );
};

const GroupVehicleDialog = ({ open, devices, positions, groups, drivers, onClose, onOpenSingle }) => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [columns, setColumns] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleDevices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return devices.filter((device) => {
      if (selectedGroupId) {
        let groupId = device.groupId;
        let belongsToGroup = false;
        while (groupId) {
          if (String(groupId) === selectedGroupId) {
            belongsToGroup = true;
            break;
          }
          groupId = groups[groupId]?.groupId;
        }
        if (!belongsToGroup) return false;
      }

      if (!normalizedQuery) return true;

      const position = positions[device.id];
      const searchableValues = [
        device.name,
        device.uniqueId,
        device.attributes?.plateNumber,
        device.attributes?.registration,
        device.attributes?.driverName,
        position?.attributes?.driverName,
        getDriverName(device, position, drivers),
      ];

      return searchableValues.some((value) =>
        String(value || '')
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [devices, drivers, groups, positions, searchQuery, selectedGroupId]);

  const groupOptions = Object.values(groups).filter((group) =>
    devices.some((device) => {
      let groupId = device.groupId;
      while (groupId) {
        if (groupId === group.id) return true;
        groupId = groups[groupId]?.groupId;
      }
      return false;
    }),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      aria-labelledby="group-video-title"
      slotProps={{
        paper: {
          sx: {
            maxWidth: 1240,
            height: 'min(80vh, 900px)',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.78)' : 'rgba(15, 23, 42, 0.38)',
            backdropFilter: 'blur(5px)',
          },
        },
      }}
    >
      <DialogHeader
        title="PEMANTAUAN MULTI-ARMADA GRUP"
        titleId="group-video-title"
        subtitle="Feed contoh untuk antarmuka; belum terhubung ke stream kamera."
        onClose={onClose}
      />
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <Select
            size="small"
            value={selectedGroupId}
            onChange={(event) => setSelectedGroupId(event.target.value)}
            displayEmpty
            renderValue={(value) =>
              value ? groups[value]?.name || 'Grup tidak ditemukan' : 'Semua grup'
            }
            aria-label="Filter grup armada"
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: 2 },
              },
            }}
            sx={{
              width: { xs: '100%', sm: 190 },
              flexShrink: 0,
              height: 42,
              color: 'text.primary',
              fontSize: '0.78rem',
              borderRadius: 2,
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '.MuiSvgIcon-root': { color: 'text.secondary' },
            }}
          >
            <MenuItem value="">Semua grup</MenuItem>
            {groupOptions.map((group) => (
              <MenuItem key={group.id} value={String(group.id)}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            size="small"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari unit, plat, atau supir"
            aria-label="Cari unit berdasarkan nama, plat, atau pengemudi"
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 260 },
              maxWidth: 420,
              '& .MuiOutlinedInput-root': {
                height: 42,
                bgcolor: 'background.paper',
                borderRadius: 2,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 2,
              },
              '& fieldset': { borderColor: 'divider' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <ButtonGroup size="small" aria-label="Pilih layout grid">
          {[2, 3].map((count) => (
            <Button
              key={count}
              onClick={() => setColumns(count)}
              variant={columns === count ? 'contained' : 'outlined'}
              sx={{
                color: columns === count ? 'primary.contrastText' : 'text.primary',
                borderColor: 'divider',
              }}
            >
              {count}×{count}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2, sm: 3 },
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'text.disabled',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'background.default' },
        }}
      >
        {visibleDevices.length ? (
          <Grid container spacing={2}>
            {visibleDevices.map((device) => (
              <Grid key={device.id} size={{ xs: 12, sm: 6, lg: columns === 3 ? 4 : 6 }}>
                <GroupVehicleCard
                  device={device}
                  position={positions[device.id]}
                  driverName={getDriverName(device, positions[device.id], drivers)}
                  onSelect={() => onOpenSingle(device)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            {searchQuery.trim()
              ? `Tidak ada unit yang cocok dengan "${searchQuery.trim()}".`
              : 'Tidak ada unit pada grup ini.'}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
          {visibleDevices.length} unit · Feed simulasi
        </Typography>
        <Button onClick={onClose} variant="outlined" size="small">
          Tutup Grid
        </Button>
      </Box>
    </Dialog>
  );
};

const LiveVideoMonitoring = ({
  isSingleModalOpen,
  isGroupModalOpen,
  selectedDevice,
  devices,
  onCloseSingle,
  onCloseGroup,
  onOpenSingle,
}) => {
  const positions = useSelector((state) => state.session.positions);
  const groups = useSelector((state) => state.groups.items);
  const drivers = useSelector((state) => state.drivers.items);
  const position = selectedDevice ? positions[selectedDevice.id] : null;

  return (
    <>
      <SingleVehicleDialog
        open={isSingleModalOpen}
        device={selectedDevice}
        position={position}
        drivers={drivers}
        onClose={onCloseSingle}
      />
      <GroupVehicleDialog
        open={isGroupModalOpen}
        devices={devices}
        positions={positions}
        groups={groups}
        drivers={drivers}
        onClose={onCloseGroup}
        onOpenSingle={onOpenSingle}
      />
    </>
  );
};

export default LiveVideoMonitoring;
