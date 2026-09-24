import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Box } from '@mui/material';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0b1120 0%, #162447 58%, #1e3a5f 100%)'
        : 'linear-gradient(135deg, #eaf1f8 0%, #f8fafc 58%, #e5edf7 100%)',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: theme.palette.mode === 'dark' ? 0.3 : 0.45,
      backgroundImage: `radial-gradient(${theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.16)'} 1px, transparent 1px)`,
      backgroundSize: '28px 28px',
    },
    [theme.breakpoints.down('md')]: {
      overflow: 'auto',
    },
  },
  glowBg: {
    position: 'absolute',
    right: '-22%',
    bottom: '-28%',
    width: '620px',
    height: '620px',
    borderRadius: '45%',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transform: 'rotate(-18deg)',
    pointerEvents: 'none',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 28,
      borderRadius: '45%',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
  },
  logoLeft: {
    display: 'block',
    height: 'clamp(180px, 22vh, 240px)',
    maxWidth: 'min(330px, 82vw)',
    width: 'auto',
    objectFit: 'contain',
    margin: '0 auto',
    filter:
      theme.palette.mode === 'dark'
        ? 'drop-shadow(0px 10px 22px rgba(0, 0, 0, 0.5))'
        : 'drop-shadow(0px 10px 22px rgba(15, 23, 42, 0.2))',
  },
  mapVisual: {
    position: 'relative',
    width: 'min(100%, 420px)',
    height: 142,
    marginTop: theme.spacing(2.5),
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    backgroundColor: 'rgba(6, 20, 39, 0.26)',
    backgroundImage:
      'linear-gradient(24deg, transparent 0 28%, rgba(255,255,255,0.09) 28.2% 29%, transparent 29.2%), linear-gradient(112deg, transparent 0 54%, rgba(255,255,255,0.08) 54.2% 55%, transparent 55.2%), linear-gradient(160deg, transparent 0 72%, rgba(255,255,255,0.07) 72.2% 73%, transparent 73.2%), linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    boxShadow: '0 18px 40px rgba(4, 13, 28, 0.18)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-12%',
      bottom: '-32%',
      width: '58%',
      height: '75%',
      borderRadius: '48% 52% 38% 62%',
      backgroundColor: `${theme.palette.geometry.main}18`,
      transform: 'rotate(18deg)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-8%',
      top: '42%',
      width: '55%',
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.11)',
      transform: 'rotate(-28deg)',
    },
  },
  mapRoute: {
    position: 'absolute',
    left: '12%',
    top: '55%',
    width: '72%',
    height: 3,
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.geometry.main}, #8ec5ff)`,
    transform: 'rotate(-12deg) skewX(-18deg)',
    boxShadow: `0 0 14px ${theme.palette.geometry.main}99`,
  },
  mapPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: `3px solid ${theme.palette.geometry.main}`,
    boxShadow: `0 0 0 5px ${theme.palette.geometry.main}33`,
  },
  mapPointStart: {
    left: '11%',
    top: '64%',
  },
  mapPointEnd: {
    right: '15%',
    top: '36%',
  },
  mapLabel: {
    position: 'static',
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  mapIcon: {
    color: '#ffffff',
    fontSize: 19,
  },
  trackingHeader: {
    position: 'absolute',
    top: 13,
    left: 15,
    right: 15,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.2),
  },
  trackingBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: theme.palette.geometry.main,
    boxShadow: `0 6px 18px ${theme.palette.geometry.main}66`,
  },
  trackingCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  trackingStatus: {
    color: '#8ec5ff',
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  trackingStats: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 13,
    display: 'flex',
    gap: theme.spacing(3),
  },
  trackingStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  trackingStatValue: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  trackingStatLabel: {
    color: 'rgba(255, 255, 255, 0.58)',
    fontSize: '0.58rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  formPanel: {
    flex: '1 1 auto',
    width: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2, 3, 5),
    background: 'transparent',
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 2, 4),
      minHeight: 0,
    },
  },
  loginWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '380px',
    zIndex: 2,
    position: 'relative',
  },
  formContainer: {
    width: '100%',
  },
  logoContainer: {
    marginBottom: theme.spacing(1.5),
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();

  return (
    <main className={classes.root}>
      <div className={classes.formPanel}>
        <div className={classes.loginWrapper}>
          <Box className={classes.logoContainer}>
            <img src="/kokas.png" alt="Logo KOKAS" className={classes.logoLeft} />
          </Box>
          <Box className={classes.formContainer}>{children}</Box>
        </div>
      </div>
    </main>
  );
};

export default LoginLayout;
