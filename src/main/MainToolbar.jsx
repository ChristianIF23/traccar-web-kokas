import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  OutlinedInput,
  InputAdornment,
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
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import MapIcon from '@mui/icons-material/Map';
import DnsIcon from '@mui/icons-material/Dns';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    minHeight: '64px !important',
    backgroundColor: theme.palette.background.paper,
  },
  searchInput: {
    borderRadius: theme.spacing(1.2),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  actionButton: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.8),
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    },
  },
  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.8),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark || '#0f172a',
    },
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2.5),
    gap: theme.spacing(2.5),
    width: theme.dimensions.drawerWidthTablet,
  },
  popoverPaper: {
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 32px rgba(0,0,0,0.5)'
      : '0 12px 32px rgba(15,23,42,0.12)',
  },
}));

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
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) =>
    Object.values(devices).filter((d) => d.status === status).length;

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      <IconButton
        edge="start"
        className={classes.actionButton}
        onClick={() => setDevicesOpen(!devicesOpen)}
        title={devicesOpen ? 'Show Map' : 'Show Devices'}
      >
        {devicesOpen ? <MapIcon fontSize="small" /> : <DnsIcon fontSize="small" />}
      </IconButton>

      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setDevicesAnchorEl(null)}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary', ml: 0.5 }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton size="small" edge="end" onClick={() => setFilterAnchorEl(inputRef.current)}>
              <Badge
                color="secondary"
                variant="dot"
                invisible={
                  !filter.statuses.length && !filter.groups.length && !filter.geofences.length
                }
              >
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </InputAdornment>
        }
        size="small"
        fullWidth
        className={classes.searchInput}
      />

      <Popover
        open={!!devicesAnchorEl && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: Number(theme.spacing(2).slice(0, -2)),
        }}
        marginThreshold={0}
        slotProps={{
          paper: {
            className: classes.popoverPaper,
            style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
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
            <ListItemText primary={t('notificationAlways')} style={{ textAlign: 'center' }} />
          </ListItemButton>
        )}
      </Popover>

      <Popover
        open={!!filterAnchorEl}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            className: classes.popoverPaper,
          },
        }}
        elevation={0}
      >
        <div className={classes.filterPanel}>
          <FormControl fullWidth>
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

          <FormControl fullWidth>
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

          <FormControl fullWidth>
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

          <FormControl fullWidth>
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
                <Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />
              }
              label={t('sharedFilterMap')}
            />
          </FormGroup>
        </div>
      </Popover>

      <IconButton
        edge="end"
        className={classes.addButton}
        onClick={() => navigate('/settings/device')}
        disabled={deviceReadonly}
      >
        <Tooltip
          open={!deviceReadonly && devicesLoaded && Object.keys(devices).length === 0}
          title={t('deviceRegisterFirst')}
          arrow
        >
          <AddIcon fontSize="small" />
        </Tooltip>
      </IconButton>
    </Toolbar>
  );
};

export default MainToolbar;
