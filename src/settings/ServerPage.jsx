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
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
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
import fetchOrThrow from '../common/util/fetchOrThrow';

const ServerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const accordionCardStyle = {
    borderRadius: '18px !important',
    border: (th) =>
      `1px solid ${
        th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
      }`,
    backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
    boxShadow: (th) =>
      th.palette.mode === 'dark'
        ? '0 12px 30px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(15, 23, 42, 0.04)',
    overflow: 'hidden',
    mb: 2.5,
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: (th) => (th.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#ffffff'),
      '& fieldset': {
        borderColor: (th) =>
          th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
      },
      '&:hover fieldset': {
        borderColor: '#1d4ed8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d4ed8',
      },
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsServer']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {item && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* 1. Preferensi Server */}
            <Accordion defaultExpanded elevation={0} disableGutters sx={accordionCardStyle}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
                sx={{
                  px: 3,
                  py: 1,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {t('sharedPreferences')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
                }}
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

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
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
                      onChange={(event) =>
                        setItem({ ...item, coordinateFormat: event.target.value })
                      }
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
                      value={item.attributes?.speedUnit || 'kn'}
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
                      value={item.attributes?.distanceUnit || 'km'}
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
                      value={item.attributes?.altitudeUnit || 'm'}
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
                      value={item.attributes?.volumeUnit || 'ltr'}
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
                </Box>

                <SelectField
                  fullWidth
                  size="small"
                  value={item.attributes?.timezone}
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
                        checked={Boolean(item.forceSettings)}
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

            {/* 2. Lokasi Default */}
            <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
                sx={{
                  px: 3,
                  py: 1,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {t('sharedLocation')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                    gap: 2,
                  }}
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
                    onChange={(event) =>
                      setItem({ ...item, longitude: Number(event.target.value) })
                    }
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
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MyLocationRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 0.9,
                    px: 2.5,
                    alignSelf: 'flex-start',
                    borderColor: '#1d4ed8',
                    color: '#1d4ed8',
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                    },
                  }}
                  onClick={() => {
                    if (map) {
                      const { lng, lat } = map.getCenter();
                      setItem({
                        ...item,
                        latitude: Number(lat.toFixed(6)),
                        longitude: Number(lng.toFixed(6)),
                        zoom: Number(map.getZoom().toFixed(1)),
                      });
                    }
                  }}
                >
                  {t('mapCurrentLocation')}
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* 3. Kewenangan Server */}
            <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
                sx={{
                  px: 3,
                  py: 1,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {t('sharedPermissions')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
                }}
              >
                <FormGroup
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 0.5,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(item.registration)}
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
                        checked={Boolean(item.readonly)}
                        onChange={(event) => setItem({ ...item, readonly: event.target.checked })}
                      />
                    }
                    label={<Typography variant="body2">{t('serverReadonly')}</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(item.deviceReadonly)}
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
                        checked={Boolean(item.limitCommands)}
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
                        checked={Boolean(item.disableReports)}
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
                        checked={Boolean(item.fixedEmail)}
                        onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })}
                      />
                    }
                    label={<Typography variant="body2">{t('userFixedEmail')}</Typography>}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* 4. Berkas / File */}
            <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
                sx={{
                  px: 3,
                  py: 1,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {t('sharedFile')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
                }}
              >
                <FileInput
                  placeholder={t('sharedSelectFile')}
                  value={null}
                  onChange={handleFileChange}
                />
              </AccordionDetails>
            </Accordion>

            {/* 5. Atribut Server Tambahan */}
            <EditAttributesAccordion
              attributes={item.attributes}
              setAttributes={(attributes) => setItem({ ...item, attributes })}
              definitions={{
                ...commonUserAttributes,
                ...commonDeviceAttributes,
                ...serverAttributes,
              }}
            />

            {/* Footer Tombol Simpan & Batal */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: 'flex-end',
                pt: 1,
                pb: 2,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.14)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    color: '#1d4ed8',
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                  },
                }}
              >
                {t('sharedCancel')}
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#1e40af',
                    boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
                  },
                }}
              >
                {t('sharedSave')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

export default ServerPage;
