import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Dialog,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
  const feedUrl =
    camera === 'cabin'
      ? device?.attributes?.cabinCameraUrl || DEMO_CABIN_FEED
      : device?.attributes?.roadCameraUrl || DEMO_ROAD_FEED;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        bgcolor: '#111827',
      }}
    >
      <video
        key={feedUrl}
        autoPlay
        muted
        loop
        playsInline
        aria-label={label}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: infrared ? 'grayscale(1) contrast(1.3) brightness(0.8)' : 'none',
        }}
      >
        <source src={feedUrl} type="video/mp4" />
      </video>
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'rgba(15, 23, 42, 0.78)',
          color: '#f8fafc',
          fontSize: compact ? '0.62rem' : '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        UI SIMULASI · {label}
      </Box>
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
          FACE OK
        </Box>
      )}
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
          Jarak aman: 24 m · Kecepatan: {speed}
        </Box>
      )}
      {camera === 'cabin' && !compact && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'rgba(245, 158, 11, 0.92)',
              color: '#111827',
              fontSize: '0.65rem',
              fontWeight: 900,
            }}
          >
            ⚠ DETEKSI SIMULASI: Pengemudi Menguap
          </Box>
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
            STATUS PENGEMUDI: WASPADA · SIMULASI
          </Box>
        </>
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
          ● 4G STABLE · SIMULASI UI
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
            status="1080P HD · DEMO"
            speed={speed}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CameraCard
            device={device}
            title="CAM 02 · IN-CABIN (DMS)"
            camera="cabin"
            infrared
            status="INFRARED · DEMO"
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

  const visibleDevices = useMemo(() => {
    if (!selectedGroupId) return devices;
    const inSelectedGroup = (device) => {
      let groupId = device.groupId;
      while (groupId) {
        if (String(groupId) === selectedGroupId) return true;
        groupId = groups[groupId]?.groupId;
      }
      return false;
    };
    return devices.filter(inSelectedGroup);
  }, [devices, groups, selectedGroupId]);

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
        <Select
          size="small"
          value={selectedGroupId}
          onChange={(event) => setSelectedGroupId(event.target.value)}
          aria-label="Filter grup armada"
          sx={{
            minWidth: 190,
            color: 'text.primary',
            fontSize: '0.78rem',
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
            Tidak ada unit pada grup ini.
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
