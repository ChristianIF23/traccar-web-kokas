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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const NotificationPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

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
    item &&
    item.type &&
    item.notificators &&
    (!item.notificators?.includes('command') || item.commandId);

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
      endpoint="notifications"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotification']}
    >
      {item && (
        <>
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  alignSelf: 'flex-start',
                  px: 2.5,
                }}
              >
                {t('sharedTestNotificators')}
              </Button>
              <FormGroup sx={{ pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={item.always}
                      onChange={(e) => setItem({ ...item, always: e.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('notificationAlways')}</Typography>}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                  multiple
                  size="small"
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
                      checked={item.attributes && item.attributes.priority}
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
        </>
      )}
    </EditItemView>
  );
};

export default NotificationPage;
