import { useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import useSettingsStyles from './common/useSettingsStyles';

const UserConnectionsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const accordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser', 'sharedConnections']}
    >
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={accordionStyle}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 0.5,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedConnections')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              <LinkField
                endpointAll="/api/devices?all=true&excludeAttributes=true"
                endpointLinked={`/api/devices?userId=${id}&excludeAttributes=true`}
                baseId={id}
                keyBase="userId"
                keyLink="deviceId"
                titleGetter={(it) => `${it.name} (${it.uniqueId})`}
                label={t('deviceTitle')}
              />
              <LinkField
                endpointAll="/api/groups?all=true"
                endpointLinked={`/api/groups?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="groupId"
                label={t('settingsGroups')}
              />
              <LinkField
                endpointAll="/api/geofences?all=true"
                endpointLinked={`/api/geofences?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="geofenceId"
                label={t('sharedGeofences')}
              />
              <LinkField
                endpointAll="/api/notifications?all=true"
                endpointLinked={`/api/notifications?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="notificationId"
                titleGetter={(it) => formatNotificationTitle(t, it, true)}
                label={t('sharedNotifications')}
              />
              <LinkField
                endpointAll="/api/calendars?all=true"
                endpointLinked={`/api/calendars?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="calendarId"
                label={t('sharedCalendars')}
              />
              <LinkField
                endpointAll="/api/users?all=true&excludeAttributes=true"
                endpointLinked={`/api/users?userId=${id}&excludeAttributes=true`}
                baseId={id}
                keyBase="userId"
                keyLink="managedUserId"
                label={t('settingsUsers')}
              />
              <LinkField
                endpointAll="/api/attributes/computed?all=true"
                endpointLinked={`/api/attributes/computed?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="attributeId"
                titleGetter={(it) => it.description}
                label={t('sharedComputedAttributes')}
              />
              <LinkField
                endpointAll="/api/drivers?all=true"
                endpointLinked={`/api/drivers?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="driverId"
                titleGetter={(it) => `${it.name} (${it.uniqueId})`}
                label={t('sharedDrivers')}
              />
              <LinkField
                endpointAll="/api/commands?all=true"
                endpointLinked={`/api/commands?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="commandId"
                titleGetter={(it) => it.description}
                label={t('sharedSavedCommands')}
              />
              <LinkField
                endpointAll="/api/maintenance?all=true"
                endpointLinked={`/api/maintenance?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="maintenanceId"
                label={t('sharedMaintenance')}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default UserConnectionsPage;
