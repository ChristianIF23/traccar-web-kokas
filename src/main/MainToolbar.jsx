import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  InputBase,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  ListItemButton,
  ListItemText,
  Tooltip,
  Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme, alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles()((theme) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px 8px 10px !important',
      minHeight: '56px !important',
      height: 56,
      backgroundColor: 'transparent',
      boxSizing: 'border-box',
    },
    menuButton: {
      width: 38,
      height: 38,
      minWidth: 38,
      borderRadius: 14,
      padding: 0,
      marginLeft: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1d4ed8',
      backgroundColor: isDark ? 'rgba(29, 78, 216, 0.15)' : 'rgba(29, 78, 216, 0.08)',
      border: `1px solid ${isDark ? 'rgba(29, 78, 216, 0.3)' : 'rgba(29, 78, 216, 0.14)'}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(29, 78, 216, 0.25)' : 'rgba(29, 78, 216, 0.14)',
        borderColor: '#1d4ed8',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    searchContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      height: 38,
      padding: '0 10px',
      borderRadius: 14,
      backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'}`,
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
    },
    searchInput: {
      flex: 1,
      fontSize: '0.84rem',
      fontWeight: 500,
      color: theme.palette.text.primary,
      marginLeft: 6,
    },
    filterIconBtn: {
      padding: 4,
      color: isDark ? '#94a3b8' : '#64748b',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: '#1d4ed8',
      },
    },
    addButton: {
      backgroundColor: '#1d4ed8',
      color: '#ffffff',
      borderRadius: 14,
      width: 38,
      height: 38,
      minWidth: 38,
      padding: 0,
      marginRight: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#1e40af',
        boxShadow: '0 6px 16px rgba(29, 78, 216, 0.45)',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      '&.Mui-disabled': {
        backgroundColor: isDark ? alpha(theme.palette.common.white, 0.1) : '#e2e8f0',
        color: isDark ? '#475569' : '#94a3b8',
        boxShadow: 'none',
      },
    },
    filterPanel: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2.5),
      gap: theme.spacing(2),
      width: 320,
    },
    popoverPaper: {
      borderRadius: 16,
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: isDark
        ? '0 16px 36px -4px rgba(0, 0, 0, 0.7)'
        : '0 16px 36px -4px rgba(15, 23, 42, 0.12)',
      marginTop: theme.spacing(1),
    },
  };
});

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);
  const devicesLoaded = useSelector((state) => state.devices.loaded);
  const geofences = useSelector((state) => state.geofences.items);

  const toolbarRef = useRef();
  const searchContainerRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) =>
    Object.values(devices).filter((d) => d.status === status).length;

  const hasActiveFilter =
    Boolean(filter.statuses?.length) ||
    Boolean(filter.groups?.length) ||
    Boolean(filter.geofences?.length);

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      {/* Tombol Garis Tiga (Sudut dan ukuran sama dengan tombol +) */}
      <IconButton
        edge="start"
        className={classes.menuButton}
        onClick={() => setDevicesOpen(!devicesOpen)}
        title={devicesOpen ? 'Sembunyikan Daftar Unit' : 'Tampilkan Daftar Unit'}
      >
        <MenuRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {/* Kolom Pencarian */}
      <Box
        ref={searchContainerRef}
        className={classes.searchContainer}
        sx={{
          '&:focus-within': {
            borderColor: '#1d4ed8',
            boxShadow: '0 0 0 2.5px rgba(29, 78, 216, 0.12)',
          },
        }}
      >
        <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <InputBase
          placeholder={t('sharedSearchDevices') || 'Search Devices'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
          onBlur={() => setDevicesAnchorEl(null)}
          className={classes.searchInput}
          inputProps={{
            style: { padding: 0 },
          }}
        />
        <IconButton
          size="small"
          onClick={() => setFilterAnchorEl(searchContainerRef.current)}
          className={classes.filterIconBtn}
          title="Filter"
        >
          <Badge color="primary" variant="dot" invisible={!hasActiveFilter}>
            <FilterListRoundedIcon sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
      </Box>

      {/* Tombol Tambah (+) Biru KOKAS */}
      <IconButton
        className={classes.addButton}
        onClick={() => navigate('/settings/device')}
        disabled={deviceReadonly}
        title="Tambah Unit"
      >
        <Tooltip
          open={!deviceReadonly && devicesLoaded && Object.keys(devices).length === 0}
          title={t('deviceRegisterFirst')}
          arrow
        >
          <AddRoundedIcon sx={{ fontSize: 20 }} />
        </Tooltip>
      </IconButton>

      {/* Quick Search Popover */}
      <Popover
        open={Boolean(devicesAnchorEl) && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        marginThreshold={0}
        slotProps={{
          paper: {
            className: classes.popoverPaper,
            style: {
              width: toolbarRef.current ? `${toolbarRef.current.clientWidth - 16}px` : 320,
            },
          },
        }}
        elevation={0}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <DeviceRow key={filteredDevices[index].id} devices={filteredDevices} index={index} />
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
            <ListItemText
              primary={t('notificationAlways')}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: 'primary.main' }}
              style={{ textAlign: 'center' }}
            />
          </ListItemButton>
        )}
      </Popover>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { className: classes.popoverPaper },
        }}
        elevation={0}
      >
        <div className={classes.filterPanel}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('deviceStatus')}</InputLabel>
            <Select
              label={t('deviceStatus')}
              value={filter.statuses}
              onChange={(e) => setFilter({ ...filter, statuses: e.target.value })}
              multiple
            >
              <MenuItem value="online">{`${t('deviceStatusOnline')} (${deviceStatusCount('online')})`}</MenuItem>
              <MenuItem value="offline">{`${t('deviceStatusOffline')} (${deviceStatusCount('offline')})`}</MenuItem>
              <MenuItem value="unknown">{`${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})`}</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>{t('settingsGroups')}</InputLabel>
            <Select
              label={t('settingsGroups')}
              value={filter.groups}
              onChange={(e) => setFilter({ ...filter, groups: e.target.value })}
              multiple
            >
              {Object.values(groups)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>{t('sharedGeofences')}</InputLabel>
            <Select
              label={t('sharedGeofences')}
              value={filter.geofences}
              onChange={(e) => setFilter({ ...filter, geofences: e.target.value })}
              multiple
            >
              {Object.values(geofences)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((geofence) => (
                  <MenuItem key={geofence.id} value={geofence.id}>
                    {geofence.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>{t('sharedSortBy')}</InputLabel>
            <Select
              label={t('sharedSortBy')}
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
            >
              <MenuItem value="">{'\u00a0'}</MenuItem>
              <MenuItem value="name">{t('sharedName')}</MenuItem>
              <MenuItem value="lastUpdate">{t('deviceLastUpdate')}</MenuItem>
            </Select>
          </FormControl>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filterMap}
                  onChange={(e) => setFilterMap(e.target.checked)}
                />
              }
              label={t('sharedFilterMap')}
            />
          </FormGroup>
        </div>
      </Popover>
    </Toolbar>
  );
};

export default MainToolbar;
