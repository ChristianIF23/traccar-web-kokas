import { useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Autocomplete,
  TextField,
  createFilterOptions,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import useMapStyles from '../map/core/useMapStyles';
import useMapOverlays from '../map/overlay/useMapOverlays';
import { useCatch } from '../reactHelper';
import { sessionActions } from '../store';
import { useAdministrator, useRestriction } from '../common/util/permissions';
import fetchOrThrow from '../common/util/fetchOrThrow';

const deviceFields = [
  { id: 'name', name: 'sharedName' },
  { id: 'uniqueId', name: 'deviceIdentifier' },
  { id: 'phone', name: 'sharedPhone' },
  { id: 'model', name: 'deviceModel' },
  { id: 'contact', name: 'deviceContact' },
  { id: 'geofenceIds', name: 'sharedGeofence' },
  { id: 'driverUniqueId', name: 'sharedDriver' },
  { id: 'motion', name: 'positionMotion' },
];

const PreferencesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const user = useSelector((state) => state.session.user);
  const [attributes, setAttributes] = useState(user.attributes || {});

  const versionApp = import.meta.env.VITE_APP_VERSION;
  const versionServer = useSelector((state) => state.session.server.version);
  const socket = useSelector((state) => state.session.socket);

  const [token, setToken] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [tokenExpiration, setTokenExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DD'),
  );

  const mapStyles = useMapStyles();
  const mapOverlays = useMapOverlays();

  const positionAttributes = usePositionAttributes(t);

  const filter = createFilterOptions();

  const generateToken = useCatch(async () => {
    const expiration = dayjs(tokenExpiration, 'YYYY-MM-DD').toISOString();
    const response = await fetchOrThrow('/api/session/token', {
      method: 'POST',
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    setToken(await response.text());
  });

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard?.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
    navigate(-1);
  });

  const handleReboot = useCatch(async () => {
    const response = await fetch('/api/server/reboot', { method: 'POST' });
    throw Error(response.statusText);
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedPreferences']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {!readonly && (
          <>
            {/* 1. Pengaturan Peta */}
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
                  {t('mapTitle')}
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
                <FormControl size="small" fullWidth sx={inputStyle}>
                  <InputLabel>{t('mapActive')}</InputLabel>
                  <Select
                    label={t('mapActive')}
                    value={
                      attributes.activeMapStyles?.split(',') || [
                        'locationIqStreets',
                        'locationIqDark',
                        'openFreeMap',
                      ]
                    }
                    onChange={(e, child) => {
                      const clicked = mapStyles.find((s) => s.id === child.props.value);
                      if (clicked.available) {
                        setAttributes({
                          ...attributes,
                          activeMapStyles: e.target.value.join(','),
                        });
                      } else if (clicked.id !== 'custom') {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                    multiple
                  >
                    {mapStyles.map((style) => (
                      <MenuItem key={style.id} value={style.id}>
                        <Typography
                          component="span"
                          color={style.available ? 'textPrimary' : 'error'}
                        >
                          {style.title}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={inputStyle}>
                  <InputLabel>{t('mapOverlay')}</InputLabel>
                  <Select
                    label={t('mapOverlay')}
                    value={attributes.selectedMapOverlay?.split(',') || []}
                    onChange={(e, child) => {
                      const clicked = mapOverlays.find((o) => o.id === child.props.value);
                      if (clicked.available) {
                        setAttributes({
                          ...attributes,
                          selectedMapOverlay: e.target.value.join(','),
                        });
                      } else if (clicked.id !== 'custom') {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                    multiple
                  >
                    {mapOverlays.map((overlay) => (
                      <MenuItem key={overlay.id} value={overlay.id}>
                        <Typography
                          component="span"
                          color={overlay.available ? 'textPrimary' : 'error'}
                        >
                          {overlay.title}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  fullWidth
                  options={Object.keys(positionAttributes)}
                  getOptionLabel={(option) => {
                    if (typeof option === 'object' && option.inputValue) {
                      return option.inputValue;
                    }
                    return positionAttributes[option]?.name || option;
                  }}
                  value={
                    attributes.positionItems?.split(',') || [
                      'fixTime',
                      'address',
                      'speed',
                      'totalDistance',
                    ]
                  }
                  onChange={(_, newValue) => {
                    setAttributes({
                      ...attributes,
                      positionItems: newValue
                        .map((x) => (typeof x === 'string' ? x : x.inputValue))
                        .join(','),
                    });
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (params.inputValue && !options.includes(params.inputValue)) {
                      filtered.push({
                        inputValue: params.inputValue,
                        name: `${t('sharedAdd')} "${params.inputValue}"`,
                      });
                    }
                    return filtered;
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      {option.name ? option.name : positionAttributes[option]?.name || option}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={t('attributePopupInfo')} sx={inputStyle} />
                  )}
                />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
                  <FormControl size="small" fullWidth sx={inputStyle}>
                    <InputLabel>{t('mapLiveRoutes')}</InputLabel>
                    <Select
                      label={t('mapLiveRoutes')}
                      value={attributes.mapLiveRoutes || 'none'}
                      onChange={(e) =>
                        setAttributes({ ...attributes, mapLiveRoutes: e.target.value })
                      }
                    >
                      <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                      <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                      <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth sx={inputStyle}>
                    <InputLabel>{t('mapDirection')}</InputLabel>
                    <Select
                      label={t('mapDirection')}
                      value={attributes.mapDirection || 'selected'}
                      onChange={(e) =>
                        setAttributes({ ...attributes, mapDirection: e.target.value })
                      }
                    >
                      <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                      <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                      <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <FormGroup sx={{ pt: 0.5, gap: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          Object.prototype.hasOwnProperty.call(attributes, 'mapFollow')
                            ? attributes.mapFollow
                            : false
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapFollow: e.target.checked })
                        }
                      />
                    }
                    label={<Typography variant="body2">{t('deviceFollow')}</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          Object.prototype.hasOwnProperty.call(attributes, 'mapCluster')
                            ? attributes.mapCluster
                            : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapCluster: e.target.checked })
                        }
                      />
                    }
                    label={<Typography variant="body2">{t('mapClustering')}</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          Object.prototype.hasOwnProperty.call(attributes, 'mapOnSelect')
                            ? attributes.mapOnSelect
                            : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapOnSelect: e.target.checked })
                        }
                      />
                    }
                    label={<Typography variant="body2">{t('mapOnSelect')}</Typography>}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* 2. Informasi Perangkat */}
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
                  {t('deviceTitle')}
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
                <SelectField
                  fullWidth
                  singleLine
                  value={attributes.devicePrimary || 'name'}
                  onChange={(e) => setAttributes({ ...attributes, devicePrimary: e.target.value })}
                  data={deviceFields}
                  titleGetter={(it) => t(it.name)}
                  label={t('devicePrimaryInfo')}
                  sx={inputStyle}
                />
                <SelectField
                  fullWidth
                  singleLine
                  value={attributes.deviceSecondary}
                  onChange={(e) =>
                    setAttributes({ ...attributes, deviceSecondary: e.target.value })
                  }
                  data={deviceFields}
                  titleGetter={(it) => t(it.name)}
                  label={t('deviceSecondaryInfo')}
                  sx={inputStyle}
                />
              </AccordionDetails>
            </Accordion>

            {/* 3. Notifikasi Suara */}
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
                  {t('sharedSound')}
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
                <SelectField
                  fullWidth
                  multiple
                  value={attributes.soundEvents?.split(',') || []}
                  onChange={(e) =>
                    setAttributes({ ...attributes, soundEvents: e.target.value.join(',') })
                  }
                  endpoint="/api/notifications/types"
                  keyGetter={(it) => it.type}
                  titleGetter={(it) => t(prefixString('event', it.type))}
                  label={t('eventsSoundEvents')}
                  sx={inputStyle}
                />
                <SelectField
                  fullWidth
                  multiple
                  value={attributes.soundAlarms?.split(',') || ['sos']}
                  onChange={(e) =>
                    setAttributes({ ...attributes, soundAlarms: e.target.value.join(',') })
                  }
                  data={alarms}
                  keyGetter={(it) => it.key}
                  label={t('eventsSoundAlarms')}
                  sx={inputStyle}
                />
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* 4. Token Pengguna */}
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
              {t('userToken')}
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
              size="small"
              fullWidth
              label={t('userExpirationTime')}
              type="date"
              value={tokenExpiration}
              onChange={(e) => {
                setTokenExpiration(e.target.value);
                setToken(null);
              }}
              sx={inputStyle}
            />
            <FormControl fullWidth size="small">
              <OutlinedInput
                multiline
                rows={3}
                readOnly
                type="text"
                value={token || ''}
                placeholder="Token akan muncul di sini setelah dibuat..."
                sx={{
                  borderRadius: '12px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.84rem',
                  backgroundColor: isDark ? alpha('#0f172a', 0.8) : '#ffffff',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                  },
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Tooltip title="Buat Token">
                        <span>
                          <IconButton
                            size="small"
                            onClick={generateToken}
                            disabled={Boolean(token)}
                            sx={{ color: '#1d4ed8' }}
                          >
                            <CachedRoundedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={copiedToken ? 'Tersalin!' : 'Salin Token'}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={handleCopyToken}
                            disabled={!token}
                            sx={{ color: copiedToken ? '#10b981' : '#1d4ed8' }}
                          >
                            {copiedToken ? (
                              <CheckRoundedIcon fontSize="small" />
                            ) : (
                              <ContentCopyRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </InputAdornment>
                }
              />
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {!readonly && (
          <>
            {/* 5. Informasi Sistem */}
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
                  {t('sharedInfoTitle')}
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
                  value={versionApp || '-'}
                  label={t('settingsAppVersion')}
                  disabled
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={versionServer || '-'}
                  label={t('settingsServerVersion')}
                  disabled
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={socket ? t('deviceStatusOnline') : t('deviceStatusOffline')}
                  label={t('settingsConnection')}
                  disabled
                  sx={inputStyle}
                />
                <Box sx={{ display: 'flex', gap: 1.5, pt: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/emulator')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      borderColor: '#1d4ed8',
                      color: '#1d4ed8',
                      '&:hover': {
                        borderColor: '#1e40af',
                        backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                      },
                    }}
                  >
                    {t('sharedEmulator')}
                  </Button>
                  {admin && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleReboot}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                      }}
                    >
                      {t('serverReboot')}
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

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
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default PreferencesPage;
