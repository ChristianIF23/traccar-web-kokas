import { useCallback, useReducer, useState, useRef } from 'react';
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
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { alpha, useTheme } from '@mui/material/styles';
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
import DeviceUsersValue from './components/DeviceUsersValue';
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import AddressValue from '../common/components/AddressValue';
import exportExcel from '../common/util/exportExcel';

const DevicesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();
  const isDark = theme.palette.mode === 'dark';

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
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const loadItems = useCallback(
    async (offset, signal) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ all: showAll, limit: pageSize, offset });
        if (searchKeyword) {
          query.append('keyword', searchKeyword);
        }
        const response = await fetchOrThrow(`/api/devices?${query.toString()}`, { signal });
        const data = await response.json();
        setItems((previous) => (offset ? [...previous, ...data] : data));
        setHasMore(data.length >= pageSize);
      } finally {
        setLoading(false);
      }
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

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) return;

      const headers = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 2) {
          row.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value;
          });
        }
      });

      const data = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) {
          const item = {};
          row.eachCell((cell, colNumber) => {
            if (headers[colNumber]) {
              item[headers[colNumber]] = cell.value;
            }
          });
          data.push(item);
        }
      });

      for (const item of data) {
        const uniqueId = item[t('deviceIdentifier')]?.toString();
        const name = item[t('sharedName')]?.toString();
        if (uniqueId && name) {
          const groupName = item[t('groupParent')];
          let groupId = 0;
          if (groupName) {
            const group = Object.values(groups).find((g) => g.name === groupName);
            if (group) {
              groupId = group.id;
            }
          }

          const device = {
            name,
            uniqueId,
            phone: item[t('sharedPhone')]?.toString() || '',
            model: item[t('deviceModel')]?.toString() || '',
            contact: item[t('deviceContact')]?.toString() || '',
            groupId: groupId || null,
          };

          try {
            await fetchOrThrow('/api/devices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(device),
            });
          } catch (e) {
            console.error('Failed to import device:', e);
          }
        }
      }
      reload();
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box
          sx={{
            backgroundColor: isDark ? '#162447' : '#ffffff',
            borderRadius: '18px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 12px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 24px rgba(15, 23, 42, 0.04)',
            width: '100%',
          }}
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table
              sx={{
                minWidth: 850,
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& .MuiTableHead-root .MuiTableCell-root': {
                  backgroundColor: isDark ? alpha('#0f172a', 0.6) : alpha('#f8fafc', 0.9),
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  py: 1.5,
                  px: 2,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  whiteSpace: 'nowrap',
                },
                '& .MuiTableBody-root .MuiTableRow-root': {
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.08) : alpha('#1d4ed8', 0.03),
                  },
                  '&:last-child .MuiTableCell-root': {
                    borderBottom: hasMore ? undefined : 'none',
                  },
                },
                '& .MuiTableBody-root .MuiTableCell-root': {
                  py: 1.4,
                  px: 2,
                  fontSize: '0.86rem',
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'
                  }`,
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
                  <TableCell align="right" sx={{ width: 90, pr: 2 }} />
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
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '0.84rem !important',
                        color: 'text.secondary',
                      }}
                    >
                      {item.uniqueId}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {item.groupId ? groups[item.groupId]?.name : '—'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.phone || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.model || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.contact || '—'}</TableCell>
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
                    <TableCell padding="none" align="right" sx={{ pr: 2 }}>
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

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={manager ? 10 : 9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

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
                      py: 1.25,
                      px: 2,
                      borderTop: `1px solid ${
                        isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
                      }`,
                      borderBottom: 'none',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={handleExport}
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadOutlinedIcon />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: 'text.secondary',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.14)'
                            : 'rgba(15, 23, 42, 0.14)',
                          '&:hover': {
                            borderColor: '#1d4ed8',
                            backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                            color: '#1d4ed8',
                          },
                        }}
                      >
                        {t('reportExport')}
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outlined"
                        size="small"
                        startIcon={<FileUploadOutlinedIcon />}
                        disabled={loading}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: 'text.secondary',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.14)'
                            : 'rgba(15, 23, 42, 0.14)',
                          '&:hover': {
                            borderColor: '#1d4ed8',
                            backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                            color: '#1d4ed8',
                          },
                        }}
                      >
                        Import
                      </Button>
                      <input
                        type="file"
                        accept=".xlsx"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImport}
                      />
                    </Box>
                  </TableCell>
                  <TableCell colSpan={manager ? 9 : 8} align="right">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAll}
                          onChange={(e) => setShowAll(e.target.checked)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#1d4ed8',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#1d4ed8',
                              },
                            },
                          }}
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

      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
