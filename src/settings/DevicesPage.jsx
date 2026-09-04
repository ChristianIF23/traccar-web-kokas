import { useCallback, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  TableFooter,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useTheme } from '@mui/material/styles';
import { useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader from './components/SearchHeader';
import { formatAddress, formatStatus, formatTime } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import { usePreference } from '../common/util/preferences';
import useSettingsStyles from './common/useSettingsStyles';
import DeviceUsersValue from './components/DeviceUsersValue';
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import AddressValue from '../common/components/AddressValue';
import exportExcel from '../common/util/exportExcel';

const DevicesPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();
  const coordinateFormat = usePreference('coordinateFormat');

  const positions = useSelector((state) => state.session.positions);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [hasMore, setHasMore] = useState(true);

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ all: showAll, limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/devices?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
    },
    [searchKeyword, showAll],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  const handleExport = async () => {
    const data = items.map((item) => ({
      [t('sharedName')]: item.name,
      [t('deviceIdentifier')]: item.uniqueId,
      [t('groupParent')]: item.groupId ? groups[item.groupId]?.name : null,
      [t('sharedPhone')]: item.phone,
      [t('deviceModel')]: item.model,
      [t('deviceContact')]: item.contact,
      [t('userExpirationTime')]: formatTime(item.expirationTime, 'date'),
      [t('deviceStatus')]: formatStatus(item.status, t),
      [t('deviceLastUpdate')]: formatTime(item.lastUpdate, 'minutes'),
      [t('positionAddress')]: positions[item.id]
        ? formatAddress(positions[item.id], coordinateFormat)
        : '',
    }));
    const sheets = new Map();
    sheets.set(t('deviceTitle'), data);
    await exportExcel(t('deviceTitle'), 'devices.xlsx', sheets, theme);
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 2.5 }}>
            <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
          </Box>

          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              mb: 4,
              width: '100%',
            }}
          >
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table
                className={classes.table}
                sx={{
                  minWidth: 850,
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    },
                  },
                  '& .MuiTableBody-root .MuiTableCell-root': {
                    py: 1.8,
                    px: 2.5,
                    fontSize: '0.875rem',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>{t('sharedName')}</TableCell>
                    <TableCell>{t('deviceIdentifier')}</TableCell>
                    <TableCell>{t('groupParent')}</TableCell>
                    <TableCell>{t('sharedPhone')}</TableCell>
                    <TableCell>{t('deviceModel')}</TableCell>
                    <TableCell>{t('deviceContact')}</TableCell>
                    <TableCell>{t('userExpirationTime')}</TableCell>
                    <TableCell>{t('positionAddress')}</TableCell>
                    {manager && <TableCell>{t('settingsUsers')}</TableCell>}
                    <TableCell className={classes.columnAction} align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.82rem !important',
                          color: 'text.secondary',
                        }}
                      >
                        {item.uniqueId}
                      </TableCell>
                      <TableCell>{item.groupId ? groups[item.groupId]?.name : '—'}</TableCell>
                      <TableCell>{item.phone || '—'}</TableCell>
                      <TableCell>{item.model || '—'}</TableCell>
                      <TableCell>{item.contact || '—'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {formatTime(item.expirationTime, 'date') || '—'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260, color: 'text.secondary' }}>
                        {positions[item.id] ? (
                          <AddressValue
                            latitude={positions[item.id].latitude}
                            longitude={positions[item.id].longitude}
                            originalAddress={positions[item.id]?.address}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      {manager && (
                        <TableCell>
                          <DeviceUsersValue deviceId={item.id} />
                        </TableCell>
                      )}
                      <TableCell className={classes.columnAction} padding="none" align="right">
                        <CollectionActions
                          itemId={item.id}
                          editPath="/settings/device"
                          endpoint="devices"
                          onReload={reload}
                          customActions={[actionConnections]}
                          readonly={deviceReadonly}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {hasMore && (
                    <TableShimmer
                      ref={items.length > 0 ? sentinelRef : null}
                      columns={manager ? 9 : 8}
                      endAction
                    />
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow
                    sx={{
                      '& .MuiTableCell-root': {
                        py: 1.5,
                        px: 2.5,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <TableCell>
                      <Button
                        onClick={handleExport}
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadOutlinedIcon />}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: 'text.secondary',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'text.secondary',
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        {t('reportExport')}
                      </Button>
                    </TableCell>
                    <TableCell colSpan={manager ? 9 : 8} align="right">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showAll}
                            onChange={(e) => setShowAll(e.target.checked)}
                            size="small"
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {t('notificationAlways')}
                          </Typography>
                        }
                        labelPlacement="start"
                        disabled={!manager}
                      />
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Box>
          </Box>
        </Box>
      </Box>

      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
