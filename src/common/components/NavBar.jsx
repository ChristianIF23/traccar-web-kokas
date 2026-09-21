import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setOpenDrawer, title }) => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? alpha('#162447', 0.9) : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: (theme) =>
          `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
          }`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 58, sm: 62 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {setOpenDrawer && (
            <IconButton
              edge="start"
              onClick={() => setOpenDrawer(true)}
              sx={{
                mr: 2,
                width: 38,
                height: 38,
                borderRadius: '12px',
                color: 'text.secondary',
                '&:hover': {
                  color: '#1d4ed8',
                  backgroundColor: alpha('#1d4ed8', 0.1),
                },
              }}
            >
              <MenuRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Tombol Tutup Silang kembali ke peta */}
        <IconButton
          onClick={() => navigate('/')}
          size="small"
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#ef4444',
              backgroundColor: alpha('#ef4444', 0.1),
            },
          }}
          title="Tutup (Kembali ke Peta)"
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
