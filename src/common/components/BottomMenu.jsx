import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, Box, ButtonBase, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useSelector } from 'react-redux';
import { useRestriction, useManager } from '../util/permissions';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const manager = useManager();
  const user = useSelector((state) => state.session.user);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'map';
    if (path.startsWith('/replay')) return 'replay';
    if (path.startsWith('/settings/user')) return 'users';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/settings')) return 'settings';
    return '';
  };

  const activeTab = getActiveTab();

  const menuItems = [
    {
      id: 'map',
      label: 'Live Peta',
      icon: <MapOutlinedIcon sx={{ fontSize: 18 }} />,
      action: () => navigate('/'),
    },
    {
      id: 'replay',
      label: 'Putar Riwayat',
      icon: <PlayCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />,
      action: () => navigate('/replay'),
      hide: readonly,
    },
    {
      id: 'users',
      label: 'Pengguna',
      icon: <GroupOutlinedIcon sx={{ fontSize: 18 }} />,
      action: () => navigate(manager ? '/settings/users' : `/settings/user/${user?.id}`),
      hide: readonly,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />,
      action: () => navigate('/reports/combined'),
      hide: readonly,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '50px',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? alpha('#162447', 0.94) : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: (theme) =>
          `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 16px 36px -6px rgba(0, 0, 0, 0.75)'
            : '0 12px 32px -4px rgba(22, 36, 71, 0.12)',
        gap: 0.5,
        userSelect: 'none',
      }}
    >
      {menuItems
        .filter((item) => !item.hide)
        .map((item) => {
          const isActive = activeTab === item.id;
          return (
            <ButtonBase
              key={item.id}
              onClick={item.action}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: '8px 16px',
                borderRadius: '30px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: isActive ? '#1d4ed8' : 'transparent',
                color: isActive
                  ? '#ffffff'
                  : (theme) => (theme.palette.mode === 'dark' ? '#94a3b8' : '#475569'),
                boxShadow: isActive ? '0 4px 14px rgba(29, 78, 216, 0.35)' : 'none',
                '&:hover': {
                  backgroundColor: isActive
                    ? '#1e40af'
                    : (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(15, 23, 42, 0.04)',
                  color: isActive ? '#ffffff' : '#1d4ed8',
                },
              }}
            >
              {item.icon}
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </Typography>
            </ButtonBase>
          );
        })}

      {/* Garis Pemisah menuju Pengaturan */}
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          mx: 0.75,
          my: 0.5,
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
        }}
      />

      {/* Menu Pengaturan */}
      <ButtonBase
        onClick={() => navigate('/settings/preferences')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 16px',
          borderRadius: '30px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: activeTab === 'settings' ? '#1d4ed8' : 'transparent',
          color:
            activeTab === 'settings'
              ? '#ffffff'
              : (theme) => (theme.palette.mode === 'dark' ? '#94a3b8' : '#475569'),
          boxShadow: activeTab === 'settings' ? '0 4px 14px rgba(29, 78, 216, 0.35)' : 'none',
          '&:hover': {
            backgroundColor:
              activeTab === 'settings'
                ? '#1e40af'
                : (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(15, 23, 42, 0.04)',
            color: activeTab === 'settings' ? '#ffffff' : '#1d4ed8',
          },
        }}
      >
        <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        <Typography
          sx={{
            fontSize: '0.82rem',
            fontWeight: activeTab === 'settings' ? 700 : 600,
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          Pengaturan
        </Typography>
      </ButtonBase>
    </Paper>
  );
};

export default BottomMenu;
