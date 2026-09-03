import { useMemo, useState } from 'react';
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
} from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
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

  const itemsCoordinates = useMemo(() => items.flatMap((item) => item.route), [items]);

  const selectedPosition = selected && eventPosition(selected.item, selected.event);

  const markers = items.flatMap((item) =>
    item.events
      .map((event) => ({ event, position: eventPosition(item, event) }))
      .filter(({ position }) => position != null)
      .map(({ event, position }) => ({
        latitude: position.latitude,
        longitude: position.longitude,
        image: eventIconKey(event.type),
      })),
  );

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

  const formatValue = (item, event, key) => {
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
          deviceUniqueId: devices[item.deviceId]?.uniqueId,
          speedUnit,
          t,
        });
      default:
        return value;
    }
  };

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
                m: { xs: 1, sm: 1.5 },
                mb: 0,
              }}
            >
              <MapView>
                <MapGeofence />
                {items.map((item) => (
                  <MapRouteCoordinates
                    key={item.deviceId}
                    name={devices[item.deviceId]?.name}
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

          <Box sx={{ p: { xs: 1.5, sm: 2.5 }, pt: 0, width: '100%' }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    }}
                  >
                    <TableCell className={classes.columnAction} sx={{ width: 44 }} />
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: 'text.secondary',
                        py: 1.5,
                      }}
                    >
                      {t('sharedDevice')}
                    </TableCell>
                    {columns.map((key) => (
                      <TableCell
                        key={key}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'text.secondary',
                          py: 1.5,
                        }}
                      >
                        {t(columnsMap.get(key))}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading ? (
                    items.length > 0 ? (
                      items.flatMap((item) =>
                        item.events.map((event, index) => {
                          const isSelected = selected?.event === event;
                          return (
                            <TableRow
                              key={event.id}
                              hover
                              selected={isSelected}
                              sx={{
                                transition: 'background-color 0.15s ease',
                                ...(isSelected && {
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                      ? 'rgba(25, 118, 210, 0.16) !important'
                                      : 'rgba(25, 118, 210, 0.08) !important',
                                }),
                              }}
                            >
                              <TableCell className={classes.columnAction} padding="none" sx={{ pl: 1 }}>
                                {event.positionId ? (
                                  isSelected ? (
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => setSelected(null)}
                                    >
                                      <GpsFixedIcon fontSize="small" />
                                    </IconButton>
                                  ) : (
                                    <IconButton
                                      size="small"
                                      onClick={() => setSelected({ item, event })}
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      <LocationSearchingIcon fontSize="small" />
                                    </IconButton>
                                  )
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                {index ? '' : devices[item.deviceId]?.name}
                              </TableCell>
                              {columns.map((key) => (
                                <TableCell
                                  key={key}
                                  sx={{
                                    fontSize: '0.85rem',
                                    color: 'text.primary',
                                    py: 1.25,
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
                        <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('sharedNoData')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableShimmer columns={columns.length + 2} />
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
