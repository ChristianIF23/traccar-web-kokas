import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import ReportFilter, { updateReportParams } from './components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import PositionValue from '../common/components/PositionValue';
import ColumnSelect from './components/ColumnSelect';
import ResizeHandle from './components/ResizeHandle';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch, useCatchCallback } from '../reactHelper';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositionMarkers from '../map/MapPositionMarkers';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import scheduleReport from './common/scheduleReport';
import MapScale from '../map/MapScale';
import { useRestriction } from '../common/util/permissions';
import CollectionActions from '../settings/components/CollectionActions';
import fetchOrThrow from '../common/util/fetchOrThrow';
import SelectField from '../common/components/SelectField';

const PositionsReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const positionAttributes = usePositionAttributes(t);

  const readonly = useRestriction('readonly');

  const [available, setAvailable] = useState([]);
  const [columns, setColumns] = useState(['fixTime', 'latitude', 'longitude', 'speed', 'address']);
  const [items, setItems] = useState([]);
  const geofenceId = searchParams.has('geofenceId')
    ? parseInt(searchParams.get('geofenceId'), 10)
    : null;
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const selectedRef = useRef();

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [selectedItem]);

  const onMapPointClick = useCallback(
    (positionId) => {
      setSelectedItem(items.find((it) => it.id === positionId));
    },
    [items, setSelectedItem],
  );

  const onShow = useCatchCallback(
    async ({ deviceIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      if (geofenceId) {
        query.append('geofenceId', geofenceId);
      }
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/positions?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        const keySet = new Set();
        const keyList = [];
        data.forEach((position) => {
          Object.keys(position).forEach((it) => keySet.add(it));
          Object.keys(position.attributes).forEach((it) => keySet.add(it));
        });
        ['id', 'deviceId', 'outdated', 'network', 'attributes'].forEach((key) =>
          keySet.delete(key),
        );
        Object.keys(positionAttributes).forEach((key) => {
          if (keySet.has(key)) {
            keyList.push(key);
            keySet.delete(key);
          }
        });
        setAvailable(
          [...keyList, ...keySet].map((key) => [key, positionAttributes[key]?.name || key]),
        );
        setItems(data);
      } finally {
        setLoading(false);
      }
    },
    [geofenceId, positionAttributes],
  );

  const onExport = useCatch(async ({ deviceIds, from, to, format }) => {
    const query = new URLSearchParams({ from, to });
    if (geofenceId) {
      query.append('geofenceId', geofenceId);
    }
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    window.location.assign(`/api/positions/${format}?${query.toString()}`);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'route';
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportPositions']}>
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
                {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                  const positions = items.filter((pos) => pos.deviceId === deviceId);
                  return (
                    <Fragment key={deviceId}>
                      <MapRoutePath positions={positions} />
                      <MapRoutePoints positions={positions} onClick={onMapPointClick} />
                    </Fragment>
                  );
                })}
                <MapPositionMarkers positions={[selectedItem]} titleField="fixTime" />
              </MapView>
              <MapScale />
              <MapCamera positions={items} />
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
              deviceType="single"
              loading={loading}
              formats={['csv', 'gpx', 'kml', 'kmz']}
            >
              <div className={classes.filterItem}>
                <SelectField
                  value={geofenceId}
                  onChange={(e) => {
                    const values = e.target.value ? [e.target.value] : [];
                    updateReportParams(searchParams, setSearchParams, 'geofenceId', values);
                  }}
                  endpoint="/api/geofences"
                  label={t('sharedGeofence')}
                  fullWidth
                />
              </div>
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={available}
                rawValues
                disabled={!items.length}
              />
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
                        {positionAttributes[key]?.name || key}
                      </TableCell>
                    ))}
                    <TableCell className={classes.columnAction} sx={{ width: 48 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading ? (
                    items.length > 0 ? (
                      items.slice(0, 4000).map((item) => {
                        const isSelected = selectedItem === item;
                        return (
                          <TableRow
                            key={item.id}
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
                                  ref={selectedRef}
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
                            {columns.map((key) => (
                              <TableCell
                                key={key}
                                sx={{
                                  fontSize: '0.85rem',
                                  color: 'text.primary',
                                  py: 1.25,
                                }}
                              >
                                <PositionValue
                                  position={item}
                                  property={Object.prototype.hasOwnProperty.call(item, key) ? key : null}
                                  attribute={Object.prototype.hasOwnProperty.call(item, key) ? null : key}
                                />
                              </TableCell>
                            ))}
                            <TableCell className={classes.actionCellPadding}>
                              <CollectionActions
                                itemId={item.id}
                                endpoint="positions"
                                readonly={readonly}
                                onReload={() => {
                                  setItems(items.filter((pos) => pos.id !== item.id));
                                }}
                              />
                            </TableCell>
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
                    <TableShimmer columns={columns.length + 1} startAction />
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

export default PositionsReportPage;
