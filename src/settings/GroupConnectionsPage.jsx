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
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';

const GroupConnectionsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const features = useFeatures();

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
      breadcrumbs={['settingsTitle', 'groupDialog', 'sharedConnections']}
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
                endpointAll="/api/geofences"
                endpointLinked={`/api/geofences?groupId=${id}`}
                baseId={id}
                keyBase="groupId"
                keyLink="geofenceId"
                label={t('sharedGeofences')}
              />
              <LinkField
                endpointAll="/api/notifications"
                endpointLinked={`/api/notifications?groupId=${id}`}
                baseId={id}
                keyBase="groupId"
                keyLink="notificationId"
                titleGetter={(it) => formatNotificationTitle(t, it)}
                label={t('sharedNotifications')}
              />
              {!features.disableDrivers && (
                <LinkField
                  endpointAll="/api/drivers"
                  endpointLinked={`/api/drivers?groupId=${id}`}
                  baseId={id}
                  keyBase="groupId"
                  keyLink="driverId"
                  titleGetter={(it) => `${it.name} (${it.uniqueId})`}
                  label={t('sharedDrivers')}
                />
              )}
              {!features.disableComputedAttributes && (
                <LinkField
                  endpointAll="/api/attributes/computed"
                  endpointLinked={`/api/attributes/computed?groupId=${id}`}
                  baseId={id}
                  keyBase="groupId"
                  keyLink="attributeId"
                  titleGetter={(it) => it.description}
                  label={t('sharedComputedAttributes')}
                />
              )}
              {!features.disableSavedCommands && (
                <LinkField
                  endpointAll="/api/commands"
                  endpointLinked={`/api/commands?groupId=${id}`}
                  baseId={id}
                  keyBase="groupId"
                  keyLink="commandId"
                  titleGetter={(it) => it.description}
                  label={t('sharedSavedCommands')}
                />
              )}
              {!features.disableMaintenance && (
                <LinkField
                  endpointAll="/api/maintenance"
                  endpointLinked={`/api/maintenance?groupId=${id}`}
                  baseId={id}
                  keyBase="groupId"
                  keyLink="maintenanceId"
                  label={t('sharedMaintenance')}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default GroupConnectionsPage;
