import { useState } from 'react';
import { Link, Chip, CircularProgress, Box, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const DeviceUsersValue = ({ deviceId }) => {
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(false);

  const loadUsers = useCatch(async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const query = new URLSearchParams({ deviceId });
      const response = await fetchOrThrow(`/api/users?${query.toString()}`);
      setUsers(await response.json());
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', py: 0.25 }}>
        <CircularProgress size={16} thickness={4.5} sx={{ color: '#1d4ed8' }} />
      </Box>
    );
  }

  if (users) {
    if (!users.length) {
      return (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5 }}>
        {users.map((user) => (
          <Chip
            key={user.id}
            icon={<PersonOutlineIcon sx={{ '&&': { fontSize: 14 } }} />}
            label={user.name}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
              backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
              color: 'text.primary',
              '& .MuiChip-icon': {
                color: 'text.secondary',
              },
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Link
      component="button"
      type="button"
      onClick={loadUsers}
      disabled={loading}
      underline="none"
      sx={{
        color: '#1d4ed8',
        fontWeight: 600,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        p: '2px 6px',
        borderRadius: '6px',
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          backgroundColor: isDark ? alpha('#1d4ed8', 0.15) : alpha('#1d4ed8', 0.08),
        },
      }}
    >
      {t('reportShow')}
    </Link>
  );
};

export default DeviceUsersValue;
