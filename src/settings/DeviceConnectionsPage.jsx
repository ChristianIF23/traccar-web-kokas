import { useParams } from 'react-router-dom';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import useFeatures from '../common/util/useFeatures';

const DeviceConnectionsPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { id } = useParams();
  const features = useFeatures();

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice', 'sharedConnections']}
    >
      <Box sx={{ width: '100%', maxWidth: 860, mx: 'auto' }}>
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '18px !important',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            backgroundColor: isDark ? '#162447' : '#ffffff',
            boxShadow: isDark
              ? '0 12px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 24px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            mb: 2,
            '&:before': { display: 'none' },
          }}
        >
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
              {t('sharedConnections')}
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
            <LinkField
              endpointAll="/api/devices"
              endpointLinked={`/api/devices?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="linkedDeviceId"
              label={t('deviceTitle')}
            />
            <LinkField
              endpointAll="/api/geofences"
              endpointLinked={`/api/geofences?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="geofenceId"
              label={t('sharedGeofences')}
            />
            <LinkField
              endpointAll="/api/notifications"
              endpointLinked={`/api/notifications?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="notificationId"
              titleGetter={(it) => formatNotificationTitle(t, it)}
              label={t('sharedNotifications')}
            />
            {!features.disableDrivers && (
              <LinkField
                endpointAll="/api/drivers"
                endpointLinked={`/api/drivers?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="driverId"
                titleGetter={(it) => `${it.name} (${it.uniqueId})`}
                label={t('sharedDrivers')}
              />
            )}
            {!features.disableComputedAttributes && (
              <LinkField
                endpointAll="/api/attributes/computed"
                endpointLinked={`/api/attributes/computed?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="attributeId"
                titleGetter={(it) => it.description}
                label={t('sharedComputedAttributes')}
              />
            )}
            {!features.disableSavedCommands && (
              <LinkField
                endpointAll="/api/commands"
                endpointLinked={`/api/commands?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="commandId"
                titleGetter={(it) => it.description}
                label={t('sharedSavedCommands')}
              />
            )}
            {!features.disableMaintenance && (
              <LinkField
                endpointAll="/api/maintenance"
                endpointLinked={`/api/maintenance?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="maintenanceId"
                label={t('sharedMaintenance')}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </PageLayout>
  );
};

export default DeviceConnectionsPage;
