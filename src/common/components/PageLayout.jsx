import { useState } from 'react';
import {
  AppBar,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from './LocalizationProvider';
import BackIcon from './BackIcon';

const useStyles = makeStyles()((theme, { miniVariant }) => ({
  root: {
    height: '100%',
    display: 'flex',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f8fafc',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  desktopDrawer: {
    width: miniVariant ? theme.spacing(8) : theme.dimensions.drawerWidthDesktop,
    overflowX: 'hidden',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    ...(miniVariant && {
      '& .MuiListItemButton-root': {
        minHeight: 48,
        justifyContent: 'center',
        paddingLeft: 0,
        paddingRight: 0,
      },
      '& .MuiListItemIcon-root': {
        minWidth: 0,
        margin: '0 auto',
      },
      '& .MuiListItemText-root': {
        display: 'none',
      },
    }),
    '@media print': {
      display: 'none',
    },
  },
  mobileDrawer: {
    width: theme.dimensions.drawerWidthTablet,
    borderRight: `1px solid ${theme.palette.divider}`,
    '@media print': {
      display: 'none',
    },
  },
  toolbar: {
    padding: theme.spacing(1, 2),
    minHeight: '64px !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: miniVariant ? 'center' : 'space-between',
  },
  iconButton: {
    borderRadius: '10px',
    padding: theme.spacing(1),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
    },
  },
  mobileToolbar: {
    zIndex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
    '@media print': {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}));

const PageTitle = ({ breadcrumbs }) => {
  const theme = useTheme();
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  if (desktop) {
    return (
      <Typography variant="h6" fontWeight={700} noWrap sx={{ letterSpacing: '-0.01em', fontSize: '1.15rem' }}>
        {t(breadcrumbs[0])}
      </Typography>
    );
  }
  return (
    <Breadcrumbs>
      {breadcrumbs.slice(0, -1).map((breadcrumb) => (
        <Typography variant="h6" color="inherit" key={breadcrumb} fontWeight={600}>
          {t(breadcrumb)}
        </Typography>
      ))}
      <Typography variant="h6" color="primary" fontWeight={700}>
        {t(breadcrumbs[breadcrumbs.length - 1])}
      </Typography>
    </Breadcrumbs>
  );
};

const PageLayout = ({ menu, breadcrumbs, children }) => {
  const [miniVariant, setMiniVariant] = useState(false);
  const { classes } = useStyles({ miniVariant });
  const theme = useTheme();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [searchParams] = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(!desktop && searchParams.has('menu'));

  const toggleDrawer = () => setMiniVariant(!miniVariant);

  return (
    <div className={classes.root}>
      {desktop ? (
        <Drawer
          variant="permanent"
          className={classes.desktopDrawer}
          slotProps={{ paper: { className: classes.desktopDrawer } }}
        >
          <Toolbar className={classes.toolbar}>
            {!miniVariant && (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  className={classes.iconButton}
                  sx={{ mr: 1 }}
                  onClick={() => navigate('/')}
                >
                  <BackIcon />
                </IconButton>
                <PageTitle breadcrumbs={breadcrumbs} />
              </>
            )}
            <IconButton
              color="inherit"
              edge="start"
              className={classes.iconButton}
              sx={{ ml: miniVariant ? 0 : 'auto' }}
              onClick={toggleDrawer}
            >
              {miniVariant !== (theme.direction === 'rtl') ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </Toolbar>
          <Divider sx={{ opacity: 0.7 }} />
          {menu}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          slotProps={{ paper: { className: classes.mobileDrawer } }}
        >
          {menu}
        </Drawer>
      )}
      {!desktop && (
        <AppBar className={classes.mobileToolbar} position="static" color="inherit">
          <Toolbar className={classes.toolbar}>
            <IconButton
              color="inherit"
              edge="start"
              className={classes.iconButton}
              sx={{ mr: 2 }}
              onClick={() => setOpenDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <PageTitle breadcrumbs={breadcrumbs} />
          </Toolbar>
        </AppBar>
      )}
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PageLayout;
