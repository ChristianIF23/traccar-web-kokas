import { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import MergeTypeOutlinedIcon from '@mui/icons-material/MergeTypeOutlined';
import ReportFilter from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ResizeHandle from './components/ResizeHandle';
import { useCatchCallback } from '../reactHelper';
import MapView from '../map/core/MapView';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import { formatTime } from '../common/util/formatter';
import { prefixString } from '../common/util/stringUtils';
import { useAttributePreference } from '../common/util/preferences';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import MapMarkers from '../map/MapMarkers';
import MapRouteCoordinates from '../map/MapRouteCoordinates';
import MapScale from '../map/MapScale';
import AddressValue from '../common/components/AddressValue';
import formatEventData from './common/formatEventData';
import { eventIconKey } from '../map/core/preloadImages';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { deviceEquality } from '../common/util/deviceEquality';

const columnsArray = [
  ['eventTime', 'positionFixTime'],
  ['type', 'sharedType'],
  ['address', 'positionAddress'],
  ['attributes', 'commandData'],
];
const columnsMap = new Map(columnsArray);

const eventPosition = (item, event) => item.positions.find((p) => p.id === event.positionId);

const CombinedReportPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const devices = useSelector(
    (state) => state.devices.items,
    deviceEquality(['id', 'name', 'uniqueId']),
  );
  const speedUnit = useAttributePreference('speedUnit');

  const [columns, setColumns] = usePersistedState('combinedColumns', [
    'eventTime',
    'type',
    'attributes',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Lookup map untuk devices agar aman & efisien
  const deviceMap = useMemo(() => {
    if (Array.isArray(devices)) {
      return new Map(devices.map((d) => [d.id, d]));
    }
    return new Map(Object.entries(devices).map(([id, d]) => [Number(id), d]));
  }, [devices]);

  const itemsCoordinates = useMemo(() => items.flatMap((item) => item.route), [items]);

  const selectedPosition = selected && eventPosition(selected.item, selected.event);

  const markers = useMemo(() => {
    return items.flatMap((item) =>
      item.events
        .map((event) => ({ event, position: eventPosition(item, event) }))
        .filter(({ position }) => position != null)
        .map(({ event, position }) => ({
          latitude: position.latitude,
          longitude: position.longitude,
          image: eventIconKey(event.type),
        })),
    );
  }, [items]);

  const onShow = useCatchCallback(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setSelected(null);
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reports/combined?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const formatValue = useCallback(
    (item, event, key) => {
      const value = event[key];
      switch (key) {
        case 'eventTime':
          return formatTime(value, 'seconds');
        case 'type':
          return t(prefixString('event', value));
        case 'address': {
          const position = eventPosition(item, event);
          if (position) {
            return (
              <AddressValue
                latitude={position.latitude}
                longitude={position.longitude}
                originalAddress={position.address}
              />
            );
          }
          return '';
        }
        case 'attributes':
          return formatEventData(event, {
            deviceUniqueId: deviceMap.get(item.deviceId)?.uniqueId,
            speedUnit,
            t,
          });
        default:
          return value;
      }
    },
    [t, speedUnit, deviceMap],
  );

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportCombined']}>
      <div className={classes.container}>
        {Boolean(items.length) && (
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
                {items.map((item) => (
                  <MapRouteCoordinates
                    key={item.deviceId}
                    name={deviceMap.get(item.deviceId)?.name}
                    coordinates={item.route}
                    deviceId={item.deviceId}
                  />
                ))}
                <MapMarkers markers={markers} />
              </MapView>
              <MapScale />
              {selectedPosition ? (
                <MapCamera
                  latitude={selectedPosition.latitude}
                  longitude={selectedPosition.longitude}
                />
              ) : (
                <MapCamera coordinates={itemsCoordinates} />
              )}
            </Box>
            <ResizeHandle />
          </>
        )}

        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter onShow={onShow} deviceType="multiple" loading={loading}>
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
                      items.flatMap((item) =>
                        item.events.map((event, index) => {
                          const isSelected = selected?.event === event;
                          const deviceName = deviceMap.get(item.deviceId)?.name;
                          return (
                            <TableRow
                              key={event.id}
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
                                      ? 'rgba(25, 118, 210, 0.16) !important'
                                      : 'rgba(25, 118, 210, 0.08) !important',
                                }),
                              }}
                            >
                              <TableCell
                                className={classes.columnAction}
                                padding="none"
                                sx={{ pl: 1.5 }}
                              >
                                {event.positionId ? (
                                  isSelected ? (
                                    <Tooltip title={t('sharedHideOnMap')} arrow>
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => setSelected(null)}
                                        sx={{ borderRadius: '8px', p: 0.75 }}
                                      >
                                        <GpsFixedIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title={t('sharedShowOnMap')} arrow>
                                      <IconButton
                                        size="small"
                                        onClick={() => setSelected({ item, event })}
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
                                ) : null}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {index ? '' : deviceName}
                              </TableCell>
                              {columns.map((key) => (
                                <TableCell
                                  key={key}
                                  sx={{
                                    color: 'text.primary',
                                    ...(key === 'eventTime' && {
                                      fontVariantNumeric: 'tabular-nums',
                                    }),
                                  }}
                                >
                                  {formatValue(item, event, key)}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        }),
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 2}
                          align="center"
                          sx={{ py: 6, borderBottom: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <MergeTypeOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                            <Typography variant="body2" color="text.secondary">
                              {t('sharedNoData')}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Pilih perangkat untuk menampilkan laporan rute gabungan beserta
                              kejadiannya.
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

export default CombinedReportPage;
