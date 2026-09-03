import { useState } from 'react';
import { Link, Chip, CircularProgress, Box, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const DeviceUsersValue = ({ deviceId }) => {
  const t = useTranslation();

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
        <CircularProgress size={14} thickness={5} />
      </Box>
    );
  }

  if (users) {
    if (!users.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          -
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
            variant="outlined"
            sx={{
              height: 22,
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: (theme) => theme.palette.divider,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
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
      underline="hover"
      sx={{
        color: 'primary.main',
        fontWeight: 500,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        p: 0,
        verticalAlign: 'baseline',
        '&:hover': {
          color: 'primary.dark',
        },
      }}
    >
      {t('reportShow')}
    </Link>
  );
};

export default DeviceUsersValue;
