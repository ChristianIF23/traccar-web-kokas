import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { Paper, Box, Avatar, Typography, Drawer, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';

import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import { useAttributePreference } from '../common/util/preferences';
import UserPage from '../settings/UserPage';

const MainMap = lazy(() => import('./MainMap'));

const useStyles = makeStyles()((theme) => {
  const isDark = theme.palette.mode === 'dark';

  const cardSurface = {
    pointerEvents: 'auto',
    borderRadius: 22,
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
    backgroundColor: isDark ? alpha('#162447', 0.92) : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    boxShadow: isDark
      ? '0 16px 36px -6px rgba(0, 0, 0, 0.65)'
      : '0 12px 32px -4px rgba(22, 36, 71, 0.08)',
    overflow: 'hidden',
    transition: 'all 0.25s ease',
  };

  return {
    root: {
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    // Panel mengambang kiri atas
    sidebar: {
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        position: 'fixed',
        left: 28,
        top: 24,
        width: 400,
        maxHeight: 'calc(100vh - 120px)',
        zIndex: 10,
        gap: 14,
      },
      [theme.breakpoints.down('md')]: {
        height: '100%',
        width: '100%',
      },
    },
    header: {
      ...cardSurface,
      borderRadius: 24,
      zIndex: 12,
    },
    middle: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      position: 'relative',
    },
    contentMap: {
      pointerEvents: 'auto',
      height: '100%',
      width: '100%',
    },
    contentList: {
      ...cardSurface,
      borderRadius: 22,
      zIndex: 11,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 200px)',
      height: 'auto',
      transition: theme.transitions.create(['opacity', 'transform', 'visibility'], {
        duration: theme.transitions.duration.standard,
        easing: theme.transitions.easing.easeInOut,
      }),
    },
    contentListHidden: {
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateY(-10px)',
      pointerEvents: 'none',
    },

    // Kapsul profil kanan atas: ditaruh di sebelah kiri tombol layer/zoom peta
    userProfilePill: {
      ...cardSurface,
      position: 'fixed',
      top: 24,
      right: 76,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 14px 6px 8px',
      borderRadius: 40,
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: '#1d4ed8',
        boxShadow: isDark
          ? '0 12px 28px rgba(0, 0, 0, 0.8)'
          : '0 12px 28px rgba(29, 78, 216, 0.15)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
    userAvatar: {
      width: 34,
      height: 34,
      backgroundColor: '#1d4ed8',
      fontSize: '0.85rem',
      fontWeight: 700,
      color: '#ffffff',
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: '#10b981',
      boxShadow: '0 0 6px #10b981',
      marginLeft: 2,
    },

    // Container pill menu mengambang di bawah tengah
    bottomPillContainer: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1200,
      pointerEvents: 'auto',
      [theme.breakpoints.down('md')]: {
        bottom: 12,
        width: 'max-content',
      },
    },
  };
});

const MainPage = () => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const user = useSelector((state) => state.session.user);

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('deviceFilter', {
    statuses: [],
    groups: [],
    geofences: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  const userInitial = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className={classes.root}>
      {desktop && (
        <Suspense fallback={null}>
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        </Suspense>
      )}

      {/* Panel Daftar Unit Kiri Atas */}
      <div className={classes.sidebar}>
        <Paper elevation={0} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>

        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <Suspense fallback={null}>
                <MainMap
                  filteredPositions={filteredPositions}
                  selectedPosition={selectedPosition}
                  onEventsClick={onEventsClick}
                />
              </Suspense>
            </div>
          )}
          <Paper
            elevation={0}
            className={cx(classes.contentList, {
              [classes.contentListHidden]: !devicesOpen,
            })}
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
      </div>

      {/* Widget Profil Kanan Atas */}
      {desktop && user && (
        <Paper
          elevation={0}
          className={classes.userProfilePill}
          onClick={() => setAccountOpen(true)}
          title="Buka Akun & Profil Pengguna"
        >
          <Avatar className={classes.userAvatar}>{userInitial}</Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', pr: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {user.name || 'Pengguna'}
              </Typography>
              <div className={classes.statusDot} />
            </Box>
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              {user.email || 'operator'}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Floating Pill Menu Bawah Tengah */}
      <div className={classes.bottomPillContainer}>
        <BottomMenu />
      </div>

      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />

      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={400}
        />
      )}

      {/* Side Sheet Drawer Akun & Profil Pengguna (Meluncur dari KANAN) */}
      <Drawer
        anchor="right"
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 480 },
            maxWidth: '100vw',
            height: '100%',
            backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
            borderLeft: (th) =>
              `1px solid ${
                th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
              }`,
            boxShadow: (th) =>
              th.palette.mode === 'dark'
                ? '-16px 0 40px rgba(0, 0, 0, 0.8)'
                : '-16px 0 40px rgba(15, 23, 42, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header Drawer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: (th) =>
              `1px solid ${
                th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
              }`,
            backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : alpha('#1d4ed8', 0.08),
                color: '#1d4ed8',
              }}
            >
              <PersonOutlineRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                Akun & Profil Pengguna
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
                Kredensial dan preferensi akun Anda
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setAccountOpen(false)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              color: (th) => (th.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
              '&:hover': {
                backgroundColor: alpha('#ef4444', 0.1),
                color: '#ef4444',
              },
            }}
            title="Tutup"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Form Akun Murni (Menggunakan UserPage Standalone) */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <UserPage standalone onClose={() => setAccountOpen(false)} />
        </Box>
      </Drawer>
    </div>
  );
};

export default MainPage;
