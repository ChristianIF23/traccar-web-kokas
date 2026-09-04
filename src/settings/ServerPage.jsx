import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  TextField,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FileInput from '../common/components/FileInput';
import { sessionActions } from '../store';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useCatch } from '../reactHelper';
import useServerAttributes from '../common/attributes/useServerAttributes';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const ServerPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const serverAttributes = useServerAttributes(t);

  const original = useSelector((state) => state.session.server);
  const [item, setItem] = useState({ ...original });

  const handleFileChange = useCatch(async (newFile) => {
    if (newFile) {
      await fetchOrThrow(`/api/server/file/${newFile.name}`, {
        method: 'POST',
        body: newFile,
      });
    }
  });

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow('/api/server', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    dispatch(sessionActions.updateServer(await response.json()));
    navigate(-1);
  });

  const accordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    mb: 2.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsServer']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          {item && (
            <>
              <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('sharedPreferences')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.details}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={item.mapUrl || ''}
                    onChange={(event) => setItem({ ...item, mapUrl: event.target.value })}
                    label={t('mapCustomLabel')}
                    sx={inputStyle}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={item.overlayUrl || ''}
                    onChange={(event) => setItem({ ...item, overlayUrl: event.target.value })}
                    label={t('mapOverlayCustom')}
                    sx={inputStyle}
                  />
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('mapDefault')}</InputLabel>
                    <Select
                      label={t('mapDefault')}
                      value={item.map || 'locationIqStreets'}
                      onChange={(e) => setItem({ ...item, map: e.target.value })}
                    >
                      {mapStyles
                        .filter((style) => style.available)
                        .map((style) => (
                          <MenuItem key={style.id} value={style.id}>
                            <Typography component="span">{style.title}</Typography>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
                    <Select
                      label={t('settingsCoordinateFormat')}
                      value={item.coordinateFormat || 'dd'}
                      onChange={(event) => setItem({ ...item, coordinateFormat: event.target.value })}
                    >
                      <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                      <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                      <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('settingsSpeedUnit')}</InputLabel>
                    <Select
                      label={t('settingsSpeedUnit')}
                      value={item.attributes.speedUnit || 'kn'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, speedUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="kn">{t('sharedKn')}</MenuItem>
                      <MenuItem value="kmh">{t('sharedKmh')}</MenuItem>
                      <MenuItem value="mph">{t('sharedMph')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('settingsDistanceUnit')}</InputLabel>
                    <Select
                      label={t('settingsDistanceUnit')}
                      value={item.attributes.distanceUnit || 'km'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, distanceUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="km">{t('sharedKm')}</MenuItem>
                      <MenuItem value="mi">{t('sharedMi')}</MenuItem>
                      <MenuItem value="nmi">{t('sharedNmi')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('settingsAltitudeUnit')}</InputLabel>
                    <Select
                      label={t('settingsAltitudeUnit')}
                      value={item.attributes.altitudeUnit || 'm'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, altitudeUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="m">{t('sharedMeters')}</MenuItem>
                      <MenuItem value="ft">{t('sharedFeet')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('settingsVolumeUnit')}</InputLabel>
                    <Select
                      label={t('settingsVolumeUnit')}
                      value={item.attributes.volumeUnit || 'ltr'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, volumeUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="ltr">{t('sharedLiter')}</MenuItem>
                      <MenuItem value="usGal">{t('sharedUsGallon')}</MenuItem>
                      <MenuItem value="impGal">{t('sharedImpGallon')}</MenuItem>
                    </Select>
                  </FormControl>
                  <SelectField
                    fullWidth
                    size="small"
                    value={item.attributes.timezone}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        attributes: { ...item.attributes, timezone: e.target.value },
                      })
                    }
                    endpoint="/api/server/timezones"
                    keyGetter={(it) => it}
                    titleGetter={(it) => it}
                    label={t('sharedTimezone')}
                    sx={inputStyle}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={item.poiLayer || ''}
                    onChange={(event) => setItem({ ...item, poiLayer: event.target.value })}
                    label={t('mapPoiLayer')}
                    sx={inputStyle}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={item.announcement || ''}
                    onChange={(event) => setItem({ ...item, announcement: event.target.value })}
                    label={t('serverAnnouncement')}
                    sx={inputStyle}
                  />
                  <FormGroup sx={{ pt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.forceSettings}
                          onChange={(event) =>
                            setItem({ ...item, forceSettings: event.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">{t('serverForceSettings')}</Typography>}
                    />
                  </FormGroup>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} disableGutters sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('sharedLocation')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.details}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.latitude || 0}
                    onChange={(event) => setItem({ ...item, latitude: Number(event.target.value) })}
                    label={t('positionLatitude')}
                    sx={inputStyle}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.longitude || 0}
                    onChange={(event) => setItem({ ...item, longitude: Number(event.target.value) })}
                    label={t('positionLongitude')}
                    sx={inputStyle}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.zoom || 0}
                    onChange={(event) => setItem({ ...item, zoom: Number(event.target.value) })}
                    label={t('serverZoom')}
                    sx={inputStyle}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      alignSelf: 'flex-start',
                      px: 2.5,
                    }}
                    onClick={() => {
                      const { lng, lat } = map.getCenter();
                      setItem({
                        ...item,
                        latitude: Number(lat.toFixed(6)),
                        longitude: Number(lng.toFixed(6)),
                        zoom: Number(map.getZoom().toFixed(1)),
                      });
                    }}
                  >
                    {t('mapCurrentLocation')}
                  </Button>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} disableGutters sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('sharedPermissions')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.details}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <FormGroup sx={{ pt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.registration}
                          onChange={(event) =>
                            setItem({ ...item, registration: event.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">{t('serverRegistration')}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.readonly}
                          onChange={(event) => setItem({ ...item, readonly: event.target.checked })}
                        />
                      }
                      label={<Typography variant="body2">{t('serverReadonly')}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.deviceReadonly}
                          onChange={(event) =>
                            setItem({ ...item, deviceReadonly: event.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">{t('userDeviceReadonly')}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.limitCommands}
                          onChange={(event) =>
                            setItem({ ...item, limitCommands: event.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">{t('userLimitCommands')}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.disableReports}
                          onChange={(event) =>
                            setItem({ ...item, disableReports: event.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">{t('userDisableReports')}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={item.fixedEmail}
                          onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })}
                        />
                      }
                      label={<Typography variant="body2">{t('userFixedEmail')}</Typography>}
                    />
                  </FormGroup>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} disableGutters sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('sharedFile')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.details}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                  <FileInput
                    placeholder={t('sharedSelectFile')}
                    value={null}
                    onChange={handleFileChange}
                  />
                </AccordionDetails>
              </Accordion>

              <EditAttributesAccordion
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={{
                  ...commonUserAttributes,
                  ...commonDeviceAttributes,
                  ...serverAttributes,
                }}
              />
            </>
          )}

          <Box
            className={classes.buttons}
            sx={{
              display: 'flex',
              gap: 1.5,
              justifyContent: 'flex-end',
              mt: 3,
              pt: 2,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {t('sharedCancel')}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="contained"
              onClick={handleSave}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {t('sharedSave')}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ServerPage;
