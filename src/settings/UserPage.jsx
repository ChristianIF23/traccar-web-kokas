import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { useDispatch, useSelector } from 'react-redux';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useUserAttributes from '../common/attributes/useUserAttributes';
import { sessionActions } from '../store';
import PasswordField from '../common/components/PasswordField';
import SettingsMenu from './components/SettingsMenu';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useAdministrator, useRestriction, useManager } from '../common/util/permissions';
import { useCatch } from '../reactHelper';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import SelectField from '../common/components/SelectField';
import fetchOrThrow from '../common/util/fetchOrThrow';

const UserPage = ({ standalone = false, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction('fixedEmail');

  const currentUser = useSelector((state) => state.session.user);
  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const openIdForced = useSelector((state) => state.session.server.openIdForce);
  const totpEnable = useSelector((state) => state.session.server.attributes.totpEnable);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const userAttributes = useUserAttributes(t);

  const { id } = useParams();
  const targetId = standalone ? currentUser?.id?.toString() : id || currentUser?.id?.toString();
  const [item, setItem] = useState(targetId === currentUser?.id?.toString() ? currentUser : null);

  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item && targetId) {
      fetchOrThrow(`/api/users/${targetId}`)
        .then((response) => response.json())
        .then((data) => setItem(data));
    }
  }, [item, targetId]);

  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      await fetchOrThrow(`/api/users/${currentUser.id}`, { method: 'DELETE' });
      navigate('/login');
      dispatch(sessionActions.updateUser(null));
    } else {
      setDeleteFailed(true);
    }
  });

  const handleGenerateTotp = useCatch(async () => {
    const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
    setItem({ ...item, totpKey: await response.text() });
  });

  const closeRevokeDialog = () => {
    setRevokeDialogOpen(false);
    setRevokeToken('');
  };

  const handleRevokeToken = useCatch(async () => {
    await fetchOrThrow('/api/session/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: revokeToken }).toString(),
    });
    closeRevokeDialog();
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const attribute = searchParams.get('attribute');

  useEffect(() => {
    if (item && attribute) {
      if (!Object.prototype.hasOwnProperty.call(item.attributes || {}, attribute)) {
        setItem({ ...item, attributes: { ...item.attributes, [attribute]: '' } });

        const newParams = new URLSearchParams(searchParams);
        newParams.delete('attribute');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [item, searchParams, setSearchParams, attribute]);

  const onItemSaved = (result) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result));
    }
    if (onClose) onClose();
  };

  const handleStandaloneSave = useCatch(async () => {
    setSaving(true);
    try {
      const response = await fetchOrThrow(`/api/users/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const updated = await response.json();
      onItemSaved(updated);
    } finally {
      setSaving(false);
    }
  });

  const validate = () =>
    Boolean(
      item &&
      item.name &&
      item.email &&
      (item.id || item.password || openIdForced) &&
      (admin || !totpForce || item.totpKey),
    );

  const accordionCardStyle = {
    borderRadius: '18px !important',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
    backgroundColor: isDark ? '#162447' : '#ffffff',
    boxShadow: isDark ? '0 12px 30px rgba(0, 0, 0, 0.45)' : '0 8px 24px rgba(15, 23, 42, 0.04)',
    overflow: 'hidden',
    mb: 2,
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? alpha('#0f172a', 0.8) : '#ffffff',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
      },
      '&:hover fieldset': {
        borderColor: '#1d4ed8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d4ed8',
      },
    },
  };

  const formContent = item && (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Pengaturan Wajib Akun */}
      <Accordion defaultExpanded={!attribute} elevation={0} disableGutters sx={accordionCardStyle}>
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
            {t('sharedRequired')}
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
            value={item.name || ''}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            label={t('sharedName')}
            sx={inputStyle}
          />
          <TextField
            fullWidth
            size="small"
            value={item.email || ''}
            onChange={(e) => setItem({ ...item, email: e.target.value })}
            label={t('userEmail')}
            disabled={Boolean(fixedEmail && item.id === currentUser.id)}
            sx={inputStyle}
          />
          {!openIdForced && (
            <PasswordField
              fullWidth
              size="small"
              onChange={(e) => setItem({ ...item, password: e.target.value })}
              label={t('userPassword')}
              sx={inputStyle}
            />
          )}
          {totpEnable && (
            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel>{t('loginTotpKey')}</InputLabel>
              <OutlinedInput
                readOnly
                label={t('loginTotpKey')}
                value={item.totpKey || ''}
                sx={{
                  borderRadius: '12px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.86rem',
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={handleGenerateTotp}
                      title="Generate Key"
                      sx={{ color: '#1d4ed8' }}
                    >
                      <CachedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setItem({ ...item, totpKey: null })}
                      title="Clear Key"
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          )}
        </AccordionDetails>
      </Accordion>

      {/* 2. Preferensi Akun & Format Satuan */}
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
            value={item.phone || ''}
            onChange={(e) => setItem({ ...item, phone: e.target.value })}
            label={t('sharedPhone')}
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
                  .filter((s) => s.available)
                  .map((style) => (
                    <MenuItem key={style.id} value={style.id}>
                      {style.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
              <Select
                label={t('settingsCoordinateFormat')}
                value={item.coordinateFormat || 'dd'}
                onChange={(e) => setItem({ ...item, coordinateFormat: e.target.value })}
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
                value={(item.attributes && item.attributes.speedUnit) || 'kn'}
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
                value={(item.attributes && item.attributes.distanceUnit) || 'km'}
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
                value={(item.attributes && item.attributes.altitudeUnit) || 'm'}
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
                value={(item.attributes && item.attributes.volumeUnit) || 'ltr'}
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
            value={item.attributes && item.attributes.timezone}
            onChange={(e) =>
              setItem({ ...item, attributes: { ...item.attributes, timezone: e.target.value } })
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
            onChange={(e) => setItem({ ...item, poiLayer: e.target.value })}
            label={t('mapPoiLayer')}
            sx={inputStyle}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3. Koordinat Lokasi Default Peta */}
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
              onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
              label={t('positionLatitude')}
              sx={inputStyle}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              value={item.longitude || 0}
              onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
              label={t('positionLongitude')}
              sx={inputStyle}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              value={item.zoom || 0}
              onChange={(e) => setItem({ ...item, zoom: Number(e.target.value) })}
              label={t('serverZoom')}
              sx={inputStyle}
            />
          </Box>

          <Button
            variant="outlined"
            size="small"
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
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              alignSelf: 'flex-start',
              borderColor: '#1d4ed8',
              color: '#1d4ed8',
              '&:hover': {
                borderColor: '#1e40af',
                backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
              },
            }}
          >
            {t('mapCurrentLocation')}
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* 4. Hak Akses & Kewenangan Pengguna */}
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
            gap: 2.5,
            backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
          }}
        >
          <TextField
            fullWidth
            size="small"
            label={t('userExpirationTime')}
            type="date"
            value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
            onChange={(e) => {
              if (e.target.value) {
                setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
              }
            }}
            disabled={!manager}
            sx={inputStyle}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              size="small"
              type="number"
              value={item.deviceLimit || 0}
              onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
              label={t('userDeviceLimit')}
              disabled={!admin}
              sx={inputStyle}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              value={item.userLimit || 0}
              onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
              label={t('userUserLimit')}
              disabled={!admin}
              sx={inputStyle}
            />
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<KeyRoundedIcon />}
            onClick={() => setRevokeDialogOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              alignSelf: 'flex-start',
              borderColor: '#1d4ed8',
              color: '#1d4ed8',
              '&:hover': {
                borderColor: '#1e40af',
                backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
              },
            }}
          >
            {t('userRevokeToken')}
          </Button>

          <FormGroup
            sx={{
              pt: 0.5,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 0.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.disabled)}
                  onChange={(e) => setItem({ ...item, disabled: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('sharedDisabled')}</Typography>}
              disabled={!manager}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.administrator)}
                  onChange={(e) => setItem({ ...item, administrator: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('userAdmin')}</Typography>}
              disabled={!admin}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.readonly)}
                  onChange={(e) => setItem({ ...item, readonly: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('serverReadonly')}</Typography>}
              disabled={!manager}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.deviceReadonly)}
                  onChange={(e) => setItem({ ...item, deviceReadonly: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('userDeviceReadonly')}</Typography>}
              disabled={!manager}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.limitCommands)}
                  onChange={(e) => setItem({ ...item, limitCommands: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('userLimitCommands')}</Typography>}
              disabled={!manager}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.disableReports)}
                  onChange={(e) => setItem({ ...item, disableReports: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{t('userDisableReports')}</Typography>}
              disabled={!manager}
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
              disabled={!manager}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* 5. Atribut Kustom Akun */}
      <EditAttributesAccordion
        attribute={attribute}
        attributes={item.attributes}
        setAttributes={(attributes) => setItem({ ...item, attributes })}
        definitions={{ ...commonUserAttributes, ...userAttributes }}
        focusAttribute={attribute}
      />

      {/* 6. Hapus Akun */}
      {registrationEnabled && item.id === currentUser.id && !manager && (
        <Accordion
          elevation={0}
          disableGutters
          sx={{
            ...accordionCardStyle,
            border: (th) => `1px solid ${alpha(th.palette.error.main, 0.25)}`,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'error.main' }} />}
            sx={{ px: 3, py: 1 }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="error.main">
              {t('userDeleteAccount')}
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
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              label={t('userEmail')}
              error={deleteFailed}
              helperText={deleteFailed ? 'Email verification failed' : null}
              sx={inputStyle}
            />
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleDelete}
              startIcon={<DeleteForeverIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              {t('userDeleteAccount')}
            </Button>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );

  // Render jika dipanggil di dalam Laci Sisi Kiri (Standalone Mode)
  if (standalone) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>{formContent}</Box>

        <Box
          sx={{
            p: 2,
            px: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            borderTop: `1px solid ${
              isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }`,
            backgroundColor: isDark ? '#162447' : '#ffffff',
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              px: 2.5,
            }}
          >
            {t('sharedCancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!validate() || saving}
            onClick={handleStandaloneSave}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1e40af',
              },
            }}
          >
            {t('sharedSave')}
          </Button>
        </Box>
      </Box>
    );
  }

  // Render jika dibuka lewat rute halaman modal (/settings/user atau /settings/user/:id)
  return (
    <EditItemView
      endpoint="users"
      item={item}
      setItem={setItem}
      defaultItem={admin ? { deviceLimit: -1 } : {}}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser']}
    >
      {formContent}

      {/* Modal Dialog Cabut Token */}
      <Dialog
        open={revokeDialogOpen}
        onClose={closeRevokeDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '18px',
            p: 1,
            backgroundColor: isDark ? '#162447' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
          },
        }}
      >
        <DialogContent sx={{ p: 2.5 }}>
          <TextField
            size="small"
            value={revokeToken}
            onChange={(e) => setRevokeToken(e.target.value)}
            label={t('userToken')}
            autoFocus
            fullWidth
            sx={{
              ...inputStyle,
              '& .MuiInputBase-input': {
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.86rem',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button
            onClick={closeRevokeDialog}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {t('sharedCancel')}
          </Button>
          <Button
            onClick={handleRevokeToken}
            disabled={!revokeToken}
            variant="contained"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#1d4ed8',
              '&:hover': { backgroundColor: '#1e40af' },
            }}
          >
            {t('userRevokeToken')}
          </Button>
        </DialogActions>
      </Dialog>
    </EditItemView>
  );
};

export default UserPage;
