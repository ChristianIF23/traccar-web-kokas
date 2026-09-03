import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ setOpenDrawer, title }) => (
  <AppBar
    position="sticky"
    color="inherit"
    elevation={0}
    sx={{
      backgroundColor: (theme) => theme.palette.background.paper,
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Toolbar
      sx={{
        minHeight: { xs: 56, sm: 60 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <IconButton
        edge="start"
        onClick={() => setOpenDrawer(true)}
        sx={{
          mr: 2,
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 600,
          fontSize: '1.125rem',
          color: 'text.primary',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;
