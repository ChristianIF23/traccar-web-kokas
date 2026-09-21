import { useCallback } from 'react';
import { Divider, List, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PlaceIcon from '@mui/icons-material/Place';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import RouteIcon from '@mui/icons-material/Route';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import NotesIcon from '@mui/icons-material/Notes';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useRestriction } from '../../common/util/permissions';
import MenuItem from '../../common/components/MenuItem';

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const buildLink = useCallback(
    (path) => {
      const sourceParams = new URLSearchParams(location.search);
      const deviceIds = sourceParams.getAll('deviceId');
      const groupIds = sourceParams.getAll('groupId');

      if (!deviceIds.length && !groupIds.length) {
        return path;
      }

      const params = new URLSearchParams();

      // Rute-rute ini hanya menerima 1 deviceId utama
      if (path === '/reports/chart' || path === '/reports/route' || path === '/replay') {
        const [firstDeviceId] = deviceIds;
        if (firstDeviceId != null) {
          params.append('deviceId', firstDeviceId);
        }
      } else {
        deviceIds.forEach((deviceId) => params.append('deviceId', deviceId));
        groupIds.forEach((groupId) => params.append('groupId', groupId));
      }

      const search = params.toString();
      return search ? `${path}?${search}` : path;
    },
    [location.search],
  );

  return (
    <Box sx={{ py: 1 }}>
      <List sx={{ px: 1, py: 0 }}>
        <MenuItem
          title={t('reportCombined')}
          link={buildLink('/reports/combined')}
          icon={<StarIcon fontSize="small" />}
          selected={location.pathname === '/reports/combined'}
        />
        <MenuItem
          title={t('reportEvents')}
          link={buildLink('/reports/events')}
          icon={<NotificationsActiveIcon fontSize="small" />}
          selected={location.pathname === '/reports/events'}
        />
        <MenuItem
          title={t('sharedGeofences')}
          link={buildLink('/reports/geofences')}
          icon={<PlaceIcon fontSize="small" />}
          selected={location.pathname === '/reports/geofences'}
        />
        <MenuItem
          title={t('reportTrips')}
          link={buildLink('/reports/trips')}
          icon={<PlayCircleFilledIcon fontSize="small" />}
          selected={location.pathname === '/reports/trips'}
        />
        <MenuItem
          title={t('reportStops')}
          link={buildLink('/reports/stops')}
          icon={<PauseCircleFilledIcon fontSize="small" />}
          selected={location.pathname === '/reports/stops'}
        />
        <MenuItem
          title={t('reportSummary')}
          link={buildLink('/reports/summary')}
          icon={<FormatListBulletedIcon fontSize="small" />}
          selected={location.pathname === '/reports/summary'}
        />
        <MenuItem
          title={t('reportChart')}
          link={buildLink('/reports/chart')}
          icon={<TrendingUpIcon fontSize="small" />}
          selected={location.pathname === '/reports/chart'}
        />
        <MenuItem
          title={t('reportReplay')}
          link={buildLink('/replay')}
          icon={<RouteIcon fontSize="small" />}
          selected={location.pathname === '/replay'}
        />
        <MenuItem
          title={t('reportPositions')}
          link={buildLink('/reports/route')}
          icon={<TimelineIcon fontSize="small" />}
          selected={location.pathname === '/reports/route'}
        />
      </List>

      <Divider sx={{ my: 1.5, mx: 1.5, opacity: 0.6 }} />

      <List sx={{ px: 1, py: 0 }}>
        <MenuItem
          title={t('sharedLogs')}
          link="/reports/logs"
          icon={<NotesIcon fontSize="small" />}
          selected={location.pathname === '/reports/logs'}
        />
        {!readonly && (
          <MenuItem
            title={t('reportScheduled')}
            link="/reports/scheduled"
            icon={<EventRepeatIcon fontSize="small" />}
            selected={location.pathname === '/reports/scheduled'}
          />
        )}
        {admin && (
          <MenuItem
            title={t('statisticsTitle')}
            link="/reports/statistics"
            icon={<BarChartIcon fontSize="small" />}
            selected={location.pathname === '/reports/statistics'}
          />
        )}
        {admin && (
          <MenuItem
            title={t('reportAudit')}
            link="/reports/audit"
            icon={<VerifiedUserIcon fontSize="small" />}
            selected={location.pathname === '/reports/audit'}
          />
        )}
      </List>
    </Box>
  );
};

export default ReportsMenu;
