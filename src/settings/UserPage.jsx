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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useUserAttributes from '../common/attributes/useUserAttributes';
import { sessionActions } from '../store';
import SelectField from '../common/components/SelectField';
import PasswordField from '../common/components/PasswordField';
import SettingsMenu from './components/SettingsMenu';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useAdministrator, useRestriction, useManager } from '../common/util/permissions';
import { useCatch } from '../reactHelper';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const UserPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

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
  const [item, setItem] = useState(id === currentUser.id.toString() ? currentUser : null);

  const [deleteEmail, setDeleteEmail] = useState();
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState('');

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
      if (!item.attributes.hasOwnProperty(attribute)) {
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
  };

  const validate = () =>
    item &&
    item.name &&
    item.email &&
    (item.id || item.password || openIdForced) &&
    (admin || !totpForce || item.totpKey);

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
      {item && (
        <>
          <Accordion defaultExpanded={!attribute} elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                disabled={fixedEmail && item.id === currentUser.id}
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
                    sx={{ borderRadius: '10px' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end" onClick={handleGenerateTotp}>
                          <CachedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setItem({ ...item, totpKey: null })}
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

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedPreferences')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <TextField
                fullWidth
                size="small"
                value={item.phone || ''}
                onChange={(e) => setItem({ ...item, phone: e.target.value })}
                label={t('sharedPhone')}
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

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedLocation')}</Typography>
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
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedPermissions')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                onClick={() => setRevokeDialogOpen(true)}
              >
                {t('userRevokeToken')}
              </Button>
              <FormGroup sx={{ pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={item.disabled}
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
                      checked={item.administrator}
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
                      checked={item.readonly}
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
                      checked={item.deviceReadonly}
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
                      checked={item.limitCommands}
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
                      checked={item.disableReports}
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
                      checked={item.fixedEmail}
                      onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('userFixedEmail')}</Typography>}
                  disabled={!manager}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          <EditAttributesAccordion
            attribute={attribute}
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonUserAttributes, ...userAttributes }}
            focusAttribute={attribute}
          />

          {registrationEnabled && item.id === currentUser.id && !manager && (
            <Accordion elevation={0} disableGutters sx={{ ...accordionStyle, borderColor: 'error.light' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600} color="error">
                  {t('userDeleteAccount')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                className={classes.details}
                sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  label={t('userEmail')}
                  error={deleteFailed}
                  sx={inputStyle}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1,
                    alignSelf: 'flex-start',
                    px: 2.5,
                  }}
                >
                  {t('userDeleteAccount')}
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}

      <Dialog
        open={revokeDialogOpen}
        onClose={closeRevokeDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
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
            sx={inputStyle}
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
