import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
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
import {
  formatAddress,
  formatDistance,
  formatVolume,
  formatTime,
  formatNumericHours,
} from '../common/util/formatter';
import ReportFilter from './components/ReportFilter';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ColumnSelect from './components/ColumnSelect';
import ResizeHandle from './components/ResizeHandle';
import usePersistedState from '../common/util/usePersistedState';
import { useCatch, useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import MapMarkers from '../map/MapMarkers';
import MapView from '../map/core/MapView';
import MapCamera from '../map/MapCamera';
import AddressValue from '../common/components/AddressValue';
import TableShimmer from '../common/components/TableShimmer';
import MapGeofence from '../map/MapGeofence';
import { mapIconKey } from '../map/core/preloadImages';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';
import { deviceEquality } from '../common/util/deviceEquality';

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'positionOdometer'],
  ['address', 'positionAddress'],
  ['endTime', 'reportEndTime'],
  ['duration', 'reportDuration'],
  ['engineHours', 'reportEngineHours'],
  ['spentFuel', 'reportSpentFuel'],
];
const columnsMap = new Map(columnsArray);

const StopReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));

  const distanceUnit = useAttributePreference('distanceUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const [columns, setColumns] = usePersistedState('stopColumns', [
    'startTime',
    'endTime',
    'startOdometer',
    'address',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onShow = useCatchCallback(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setSelectedItem(null);
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reports/stops?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const onExport = useCatch(async () => {
    const sheets = new Map();
    items.forEach((item) => {
      const deviceName = devices[item.deviceId]?.name || item.deviceId;
      if (!sheets.has(deviceName)) {
        sheets.set(deviceName, []);
      }
      const row = {};
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        if (key === 'address') {
          row[header] = formatAddress(item, coordinateFormat);
        } else {
          row[header] = formatValue(item, key);
        }
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('reportStops'), 'stops.xlsx', sheets, theme);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'stops';
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value]?.name;
      case 'startTime':
      case 'endTime':
        return formatTime(value, 'minutes');
      case 'startOdometer':
        return formatDistance(value, distanceUnit, t);
      case 'duration':
        return formatNumericHours(value, t);
      case 'engineHours':
        return value > 0 ? formatNumericHours(value, t) : null;
      case 'spentFuel':
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      case 'address':
        return (
          <AddressValue
            latitude={item.latitude}
            longitude={item.longitude}
            originalAddress={value}
          />
        );
      default:
        return value;
    }
  };

  const selectedMarker = selectedItem && {
    latitude: selectedItem.latitude,
    longitude: selectedItem.longitude,
    image: `${mapIconKey(devices[selectedItem.deviceId]?.category)}-neutral`,
    title: formatTime(selectedItem.startTime, 'seconds'),
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportStops']}>
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
                m: { xs: 1, sm: 1.5 },
                mb: 0,
              }}
            >
              <MapView>
                <MapGeofence />
                <MapMarkers markers={[selectedMarker]} showTitles />
              </MapView>
              <MapScale />
              <MapCamera latitude={selectedItem.latitude} longitude={selectedItem.longitude} />
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
                      items.map((item) => {
                        const isSelected = selectedItem === item;
                        return (
                          <TableRow
                            key={item.positionId}
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
                              {isSelected ? (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => setSelectedItem(null)}
                                >
                                  <GpsFixedIcon fontSize="small" />
                                </IconButton>
                              ) : (
                                <IconButton
                                  size="small"
                                  onClick={() => setSelectedItem(item)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <LocationSearchingIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {devices[item.deviceId]?.name || item.deviceId}
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
                                {formatValue(item, key)}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
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

export default StopReportPage;
