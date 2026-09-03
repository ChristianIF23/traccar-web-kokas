import { Divider, List } from '@mui/material';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useManager, useRestriction } from '../../common/util/permissions';
import useFeatures from '../../common/util/useFeatures';
import MenuItem from '../../common/components/MenuItem';

const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector((state) => state.session.server.attributes.support);
  const billingLink = useSelector((state) => state.session.user.attributes.billingLink);

  const features = useFeatures();

  return (
    <>
      <List sx={{ py: 1 }}>
        <MenuItem
          title={t('sharedPreferences')}
          link="/settings/preferences"
          icon={<TuneOutlinedIcon />}
          selected={location.pathname === '/settings/preferences'}
        />
        {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link="/settings/notifications"
              icon={<NotificationsNoneOutlinedIcon />}
              selected={location.pathname.startsWith('/settings/notification')}
            />
            <MenuItem
              title={t('settingsUser')}
              link={`/settings/user/${userId}`}
              icon={<PersonOutlineOutlinedIcon />}
              selected={location.pathname === `/settings/user/${userId}`}
            />
            <MenuItem
              title={t('deviceTitle')}
              link="/settings/devices"
              icon={<DevicesOutlinedIcon />}
              selected={location.pathname.startsWith('/settings/device')}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link="/geofences"
              icon={<EditLocationAltOutlinedIcon />}
              selected={location.pathname.startsWith('/settings/geofence')}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t('settingsGroups')}
                link="/settings/groups"
                icon={<FolderOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/group')}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t('sharedDrivers')}
                link="/settings/drivers"
                icon={<PersonOutlineOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/driver')}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t('sharedCalendars')}
                link="/settings/calendars"
                icon={<CalendarTodayOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/calendar')}
              />
            )}
            {!features.disableComputedAttributes && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link="/settings/attributes"
                icon={<CalculateOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/attribute')}
              />
            )}
            {!features.disableMaintenance && (
              <MenuItem
                title={t('sharedMaintenance')}
                link="/settings/maintenances"
                icon={<BuildOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/maintenance')}
              />
            )}
            {!features.disableSavedCommands && (
              <MenuItem
                title={t('sharedSavedCommands')}
                link="/settings/commands"
                icon={<SendOutlinedIcon />}
                selected={location.pathname.startsWith('/settings/command')}
              />
            )}
          </>
        )}
        {billingLink && (
          <MenuItem title={t('userBilling')} link={billingLink} icon={<PaymentOutlinedIcon />} />
        )}
        {supportLink && (
          <MenuItem title={t('settingsSupport')} link={supportLink} icon={<HelpOutlineOutlinedIcon />} />
        )}
      </List>
      {manager && (
        <>
          <Divider sx={{ my: 1, mx: 2 }} />
          <List sx={{ py: 1 }}>
            <MenuItem
              title={t('serverAnnouncement')}
              link="/settings/announcement"
              icon={<CampaignOutlinedIcon />}
              selected={location.pathname === '/settings/announcement'}
            />
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link="/settings/server"
                icon={<SettingsOutlinedIcon />}
                selected={location.pathname === '/settings/server'}
              />
            )}
            <MenuItem
              title={t('settingsUsers')}
              link="/settings/users"
              icon={<PeopleAltOutlinedIcon />}
              selected={
                location.pathname.startsWith('/settings/user') &&
                location.pathname !== `/settings/user/${userId}`
              }
            />
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
