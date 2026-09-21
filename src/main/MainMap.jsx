import { useCallback, useState, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import MapAccuracy from '../map/main/MapAccuracy';
import MapGeofence from '../map/MapGeofence';
import MapCurrentLocation from '../map/MapCurrentLocation';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapPositionMarkers from '../map/MapPositionMarkers';
import MapOverlay from '../map/overlay/MapOverlay';
import MapGeocoder from '../map/control/MapGeocoder';
import MapScale from '../map/MapScale';
import MapRuler from '../map/control/MapRuler';
import MapNotification from '../map/control/MapNotification';
import useFeatures from '../common/util/useFeatures';

const MainMap = ({ filteredPositions = [], selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const eventsAvailable = useSelector((state) => !!state.events?.items?.length);
  const features = useFeatures();

  const [rulerActive, setRulerActive] = useState(false);

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.selectId(deviceId));
    },
    [dispatch],
  );

  const deviceIds = useMemo(() => filteredPositions.map((p) => p.deviceId), [filteredPositions]);

  // Padding kamera peta disesuaikan agar armada fokus di viewport tengah tanpa tertabrak card mengambang
  const mapStartPadding = useMemo(() => (desktop ? 120 : 0), [desktop]);
  const mapBottomPadding = useMemo(() => (desktop ? 90 : 80), [desktop]);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes deviceIds={deviceIds} />
        <MapPositionMarkers
          positions={filteredPositions}
          onMarkerClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
          disabled={rulerActive}
        />
        <MapDefaultCamera filteredPositions={filteredPositions} />
        <MapSelectedDevice />
        <PoiMap />
        <MapRuler positions={filteredPositions} onActiveChange={setRulerActive} />
        {!features.disableEvents && (
          <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
        )}
      </MapView>

      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />

      {/* Menjaga kamera terpusat dengan kompensasi card melayang */}
      <MapPadding start={mapStartPadding} bottom={mapBottomPadding} />
    </>
  );
};

export default MainMap;
