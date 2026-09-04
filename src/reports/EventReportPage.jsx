import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
  Paper,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { formatAddress, formatTime } from '../common/util/formatter';
import ReportFilter, { updateReportParams } from './components/ReportFilter';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import ResizeHandle from './components/ResizeHandle';
import { useCatch, useCatchCallback, useAsyncTask } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import MapView from '../map/core/MapView';
import MapGeofence from '../map/MapGeofence';
import MapMarkers from '../map/MapMarkers';
import MapCamera from '../map/MapCamera';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';
import SelectField from '../common/components/SelectField';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';
import AddressValue from '../common/components/AddressValue';
import formatEventData from './common/formatEventData';
import { eventIconKey } from '../map/core/preloadImages';
import { deviceEquality } from '../common/util/deviceEquality';

const columnsArray = [
  ['eventTime', 'positionFixTime'],
  ['type', 'sharedType'],
  ['geofenceId', 'sharedGeofence'],
  ['maintenanceId', 'sharedMaintenance'],
  ['address', 'positionAddress'],
  ['attributes', 'commandData'],
];
const columnsMap = new Map(columnsArray);

const EventReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();

  const devices = useSelector(
    (state) => state.devices.items,
    deviceEquality(['id', 'name', 'uniqueId']),
  );
  const geofences = useSelector((state) => state.geofences.items);
  const maintenances = useSelector((state) => state.maintenances.items);

  const speedUnit = useAttributePreference('speedUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const [allEventTypes, setAllEventTypes] = useState([{ id: 'allEvents', label: 'eventAll' }]);

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const [columns, setColumns] = usePersistedState('eventColumns', [
    'eventTime',
    'type',
    'address',
    'attributes',
  ]);
  const eventTypes = useMemo(() => searchParams.getAll('eventType'), [searchParams]);
  const alarmTypes = useMemo(() => searchParams.getAll('alarmType'), [searchParams]);
  const [items, setItems] = useState([]);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!eventTypes.length) {
      updateReportParams(searchParams, setSearchParams, 'eventType', ['allEvents']);
    }
  }, [searchParams, setSearchParams, eventTypes]);

  useEffect(() => {
    if (selectedItem?.positionId) {
      setPosition(positions[selectedItem.positionId] || null);
    } else {
      setPosition(null);
    }
  }, [selectedItem, positions]);

  useAsyncTask(async ({ signal }) => {
    const response = await fetchOrThrow('/api/notifications/types', { signal });
    const types = await response.json();
    setAllEventTypes((previous) => [
      ...previous,
      ...types.map((it) => ({ id: it.type, label: prefixString('event', it.type) })),
    ]);
  }, []);

  const onShow = useCatchCallback(
    async ({ deviceIds, groupIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      groupIds.forEach((groupId) => query.append('groupId', groupId));
      eventTypes.forEach((it) => query.append('type', it));
      if (eventTypes[0] !== 'allEvents' && eventTypes.includes('alarm')) {
        alarmTypes.forEach((it) => query.append('alarm', it));
      }
      setSelectedItem(null);
      setPosition(null);
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/reports/events?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        const events = await response.json();
        setItems(events);
        const positionIds = Array.from(
          new Set(events.map((event) => event.positionId).filter((id) => id)),
        );
        const positionsMap = {};
        if (positionIds.length > 0) {
          const positionsQuery = new URLSearchParams();
          positionIds.slice(0, 128).forEach((id) => positionsQuery.append('id', id));
          const positionsResponse = await fetchOrThrow(
            `/api/positions?${positionsQuery.toString()}`,
          );
          const positionsArray = await positionsResponse.json();
          positionsArray.forEach((p) => (positionsMap[p.id] = p));
        }
        setPositions(positionsMap);
      } finally {
        setLoading(false);
      }
    },
    [eventTypes, alarmTypes],
  );

  const onExport = useCatch(async () => {
    const sheets = new Map();
    items.forEach((item) => {
      const deviceName = devices[item.deviceId].name;
      if (!sheets.has(deviceName)) {
        sheets.set(deviceName, []);
      }
      const row = {};
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        if (key === 'attributes' && item.type === 'media') {
          row[header] = item.attributes.file;
        } else if (key === 'address') {
          const pos = positions[item.positionId];
          row[header] = pos ? formatAddress(pos, coordinateFormat) : '';
        } else {
          row[header] = formatValue(item, key);
        }
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('reportEvents'), 'events.xlsx', sheets, theme);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'events';
    if (eventTypes[0] !== 'allEvents') {
      report.attributes.types = eventTypes.join(',');
    }
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value]?.name;
      case 'eventTime':
        return formatTime(value, 'seconds');
      case 'type':
        return t(prefixString('event', value));
      case 'geofenceId':
        if (value > 0) {
          const geofence = geofences[value];
          return geofence && geofence.name;
        }
        return null;
      case 'maintenanceId':
        if (value > 0) {
          const maintenance = maintenances[value];
          return maintenance && maintenance.name;
        }
        return null;
      case 'address': {
        const pos = positions[item.positionId];
        if (pos) {
          return (
            <AddressValue
              latitude={pos.latitude}
              longitude={pos.longitude}
              originalAddress={pos.address}
            />
          );
        }
        return '';
      }
      case 'attributes':
        return formatEventData(item, {
          deviceUniqueId: devices[item.deviceId]?.uniqueId,
          speedUnit,
          t,
        });
      default:
        return value;
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportEvents']}>
      <div className={classes.container}>
        {selectedItem && (
          <>
            <Box
              className={classes.containerMap}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                m: { xs: 1, sm: 2 },
                mb: 0,
              }}
            >
              <MapView>
                <MapGeofence />
                {position && selectedItem && (
                  <MapMarkers
                    markers={[
                      {
                        latitude: position.latitude,
                        longitude: position.longitude,
                        image: eventIconKey(selectedItem.type),
                        title: formatTime(position.fixTime, 'seconds'),
                      },
                    ]}
                    showTitles
                  />
                )}
              </MapView>
              <MapScale />
              {position && (
                <MapCamera latitude={position.latitude} longitude={position.longitude} />
              )}
            </Box>
            <ResizeHandle />
          </>
        )}

        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              onShow={onShow}
              onExport={onExport}
              onSchedule={onSchedule}
              deviceType="multiple"
              loading={loading}
              formats={['xlsx']}
            >
              <div className={classes.filterItem}>
                <SelectField
                  multiple
                  singleLine
                  data={allEventTypes}
                  value={eventTypes}
                  allValue="allEvents"
                  titleGetter={(it) => t(it.label)}
                  onChange={(e) =>
                    updateReportParams(searchParams, setSearchParams, 'eventType', e.target.value)
                  }
                  label={t('reportEventTypes')}
                  fullWidth
                />
              </div>
              {eventTypes[0] !== 'allEvents' && eventTypes.includes('alarm') && (
                <div className={classes.filterItem}>
                  <SelectField
                    multiple
                    singleLine
                    value={alarmTypes}
                    onChange={(e) =>
                      updateReportParams(searchParams, setSearchParams, 'alarmType', e.target.value)
                    }
                    data={alarms}
                    keyGetter={(it) => it.key}
                    label={t('sharedAlarms')}
                    fullWidth
                  />
                </div>
              )}
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>

          <Box sx={{ p: { xs: 1.5, sm: 3 }, pt: 0, width: '100%', boxSizing: 'border-box' }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                overflow: 'hidden',
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 700,
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      '& .MuiTableCell-root': {
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        py: 1.8,
                        px: 2.5,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <TableCell className={classes.columnAction} sx={{ width: 48, px: 1.5 }} />
                    <TableCell>{t('sharedDevice')}</TableCell>
                    {columns.map((key) => (
                      <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading ? (
                    items.length > 0 ? (
                      items.map((item) => {
                        const isSelected = selectedItem === item;
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={isSelected}
                            sx={{
                              transition: 'background-color 0.15s ease',
                              '& .MuiTableCell-root': {
                                py: 1.5,
                                px: 2.5,
                                fontSize: '0.875rem',
                                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                              },
                              ...(isSelected && {
                                backgroundColor: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.16) !important'
                                    : 'rgba(25, 118, 210, 0.08) !important',
                              }),
                            }}
                          >
                            <TableCell className={classes.columnAction} padding="none" sx={{ pl: 1.5 }}>
                              {item.positionId ? (
                                isSelected ? (
                                  <Tooltip title={t('sharedHideOnMap')} arrow>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => setSelectedItem(null)}
                                      sx={{ borderRadius: '8px', p: 0.75 }}
                                    >
                                      <GpsFixedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title={t('sharedShowOnMap')} arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => setSelectedItem(item)}
                                      sx={{
                                        color: 'text.secondary',
                                        borderRadius: '8px',
                                        p: 0.75,
                                        '&:hover': { color: 'primary.main' },
                                      }}
                                    >
                                      <LocationSearchingIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )
                              ) : (
                                ''
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {devices[item.deviceId]?.name}
                            </TableCell>
                            {columns.map((key) => (
                              <TableCell
                                key={key}
                                sx={{
                                  color: 'text.primary',
                                  ...(key === 'eventTime' && { fontVariantNumeric: 'tabular-nums' }),
                                }}
                              >
                                {formatValue(item, key)}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <NotificationsActiveOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                            <Typography variant="body2" color="text.secondary">
                              {t('sharedNoData')}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Pilih perangkat dan tipe event untuk memuat riwayat log event.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableShimmer columns={columns.length + 2} startAction />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventReportPage;
