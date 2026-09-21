import { useMediaQuery } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    // Warna Navy Solid Bersih & Elegan
    backgroundColor: '#162447',
    padding: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  logoHolder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      width: 'auto',
      maxHeight: 56,
    },
    '& img': {
      width: 'auto',
      maxHeight: 56,
      objectFit: 'contain',
    },
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
    position: 'relative',
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <main className={classes.root}>
      {/* Kolom Kiri: Navy Elegan Polos dengan Logo Traccar */}
      {!isMobile && (
        <aside className={classes.sidebar}>
          <div className={classes.logoHolder}>
            <LogoImage color="#ffffff" />
          </div>
        </aside>
      )}

      {/* Kolom Kanan: Card Login Bersih Presisi */}
      <section className={classes.contentArea}>{children}</section>
    </main>
  );
};

export default LoginLayout;
