import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Divider, Typography, IconButton, Toolbar, Paper, Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from 'tss-react/mui';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import MapView from '../map/core/MapView';
import MapCurrentLocation from '../map/MapCurrentLocation';
import MapGeofenceEdit from '../map/draw/MapGeofenceEdit';
import GeofencesList from './GeofencesList';
import { useTranslation } from '../common/components/LocalizationProvider';
import MapGeocoder from '../map/control/MapGeocoder';
import { errorsActions } from '../store';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    zIndex: 3,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    [theme.breakpoints.up('sm')]: {
      width: theme.dimensions.drawerWidthDesktop || 360,
      height: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      height: theme.dimensions.drawerHeightPhone || '45%',
      borderRight: 'none',
      borderTop: `1px solid ${theme.palette.divider}`,
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
    },
  },
  toolbar: {
    px: 2,
    py: 1,
    minHeight: '64px !important',
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  mapContainer: {
    flexGrow: 1,
    position: 'relative',
    height: '100%',
  },
  fileInput: {
    display: 'none',
  },
}));

const GeofencesPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const [selectedGeofenceId, setSelectedGeofenceId] = useState();

  const handleFile = (event) => {
    const files = Array.from(event.target.files);
    const [file] = files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const xml = new DOMParser().parseFromString(reader.result, 'text/xml');
      const segment = xml.getElementsByTagName('trkseg')[0];
      if (!segment) {
        dispatch(errorsActions.push(t('sharedInvalidFileFormat') || 'Format GPX tidak valid'));
        return;
      }
      const coordinates = Array.from(segment.getElementsByTagName('trkpt'))
        .map((point) => `${point.getAttribute('lat')} ${point.getAttribute('lon')}`)
        .join(', ');
      const area = `LINESTRING (${coordinates})`;
      const newItem = { name: t('sharedGeofence'), area };
      try {
        const response = await fetchOrThrow('/api/geofences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        const item = await response.json();
        navigate(`/settings/geofence/${item.id}`);
      } catch (error) {
        dispatch(errorsActions.push(error.message));
      }
    };
    reader.onerror = (e) => {
      dispatch(errorsActions.push(e.target.error));
    };
    reader.readAsText(file);
  };

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Paper elevation={0} className={classes.drawer} square={false}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              sx={{
                mr: 1.5,
                color: 'text.secondary',
                '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
              }}
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.05rem' }}>
              {t('sharedGeofences')}
            </Typography>
            <label htmlFor="upload-gpx">
              <input
                accept=".gpx"
                id="upload-gpx"
                type="file"
                className={classes.fileInput}
                onChange={handleFile}
              />
              <Tooltip title={t('sharedUpload')}>
                <IconButton
                  component="span"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' },
                  }}
                >
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>
            </label>
          </Toolbar>
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <GeofencesList onGeofenceSelected={setSelectedGeofenceId} />
          </Box>
        </Paper>

        <div className={classes.mapContainer}>
          <MapView>
            <MapGeofenceEdit selectedGeofenceId={selectedGeofenceId} />
          </MapView>
          <MapScale />
          <MapCurrentLocation />
          <MapGeocoder />
        </div>
      </div>
    </div>
  );
};

export default GeofencesPage;
