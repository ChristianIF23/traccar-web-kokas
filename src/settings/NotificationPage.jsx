import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendToMobileRoundedIcon from '@mui/icons-material/SendToMobileRounded';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

const NotificationPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [item, setItem] = useState();

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const testNotificators = useCatch(async () => {
    await Promise.all(
      item.notificators.split(/[, ]+/).map(async (notificator) => {
        await fetchOrThrow(`/api/notifications/test/${notificator}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }),
    );
  });

  const validate = () =>
    Boolean(
      item &&
      item.type &&
      item.notificators &&
      (!item.notificators?.includes('command') || item.commandId),
    );

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
    <EditItemView
      endpoint="notifications"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotification']}
    >
      {item && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* 1. Pengaturan Wajib Notifikasi */}
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
              <SelectField
                fullWidth
                size="small"
                value={item.type}
                onChange={(e) => setItem({ ...item, type: e.target.value })}
                endpoint="/api/notifications/types"
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('event', it.type))}
                label={t('sharedType')}
                helperText={
                  ['geofenceEnter', 'geofenceExit', 'geofenceCrossed'].includes(item.type)
                    ? t('notificationGeofenceLabel')
                    : null
                }
                sx={inputStyle}
              />

              {item.type === 'alarm' && (
                <SelectField
                  fullWidth
                  multiple
                  size="small"
                  value={
                    item.attributes && item.attributes.alarms
                      ? item.attributes.alarms.split(/[, ]+/)
                      : []
                  }
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: { ...item.attributes, alarms: e.target.value.join() },
                    })
                  }
                  data={alarms}
                  keyGetter={(it) => it.key}
                  label={t('sharedAlarms')}
                  sx={inputStyle}
                />
              )}

              <SelectField
                fullWidth
                multiple
                size="small"
                value={item.notificators ? item.notificators.split(/[, ]+/) : []}
                onChange={(e) => setItem({ ...item, notificators: e.target.value.join() })}
                endpoint="/api/notifications/notificators"
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('notificator', it.type))}
                label={t('notificationNotificators')}
                sx={inputStyle}
              />

              {item.notificators?.includes('command') && (
                <SelectField
                  fullWidth
                  size="small"
                  value={item.commandId}
                  onChange={(e) => setItem({ ...item, commandId: Number(e.target.value) })}
                  endpoint="/api/commands"
                  titleGetter={(it) => it.description}
                  label={t('sharedSavedCommand')}
                  sx={inputStyle}
                />
              )}

              <Button
                variant="outlined"
                color="primary"
                onClick={testNotificators}
                disabled={!item.notificators}
                startIcon={<SendToMobileRoundedIcon sx={{ fontSize: 18 }} />}
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
              >
                {t('sharedTestNotificators')}
              </Button>

              <FormGroup sx={{ pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(item.always)}
                      onChange={(e) => setItem({ ...item, always: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('notificationAlways')}</Typography>}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* 2. Pengaturan Tambahan */}
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
                {t('sharedExtra')}
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
                value={item.description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                label={t('sharedDescription')}
                sx={inputStyle}
              />

              <SelectField
                fullWidth
                size="small"
                value={item.calendarId}
                onChange={(e) => setItem({ ...item, calendarId: Number(e.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
                sx={inputStyle}
              />

              {['geofenceEnter', 'geofenceExit', 'geofenceCrossed'].includes(item.type) && (
                <SelectField
                  fullWidth
                  size="small"
                  multiple
                  value={item.attributes?.geofenceIds ? item.attributes.geofenceIds.split(',') : []}
                  onChange={(e) => {
                    const geofenceIds = e.target.value.join();
                    const attributes = { ...item.attributes };
                    if (geofenceIds) {
                      attributes.geofenceIds = geofenceIds;
                    } else {
                      delete attributes.geofenceIds;
                    }
                    setItem({ ...item, attributes });
                  }}
                  endpoint="/api/geofences"
                  keyGetter={(it) => String(it.id)}
                  label={t('sharedGeofences')}
                  sx={inputStyle}
                />
              )}

              <FormGroup sx={{ pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(item.attributes && item.attributes.priority)}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, priority: e.target.checked },
                        })
                      }
                    />
                  }
                  label={<Typography variant="body2">{t('sharedPriority')}</Typography>}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </EditItemView>
  );
};

export default NotificationPage;
