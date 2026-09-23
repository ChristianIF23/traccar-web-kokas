import { useMediaQuery } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';

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
    width: '100%',
  },
  kokasLogo: {
    maxHeight: 260, // Ukuran logo diperbesar agar menonjol di tengah
    width: 'auto',
    maxWidth: '80%',
    objectFit: 'contain',
    backgroundColor: 'transparent',
    filter: 'drop-shadow(0px 6px 16px rgba(0, 0, 0, 0.35))', // Bayangan halus mengikuti bentuk logo
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
      {/* Kolom Kiri: Hanya Logo KOKAS Besar */}
      {!isMobile && (
        <aside className={classes.sidebar}>
          <div className={classes.logoHolder}>
            <img src="/kokas.png" alt="Logo KOKAS" className={classes.kokasLogo} />
          </div>
        </aside>
      )}

      {/* Kolom Kanan: Card Login */}
      <section className={classes.contentArea}>{children}</section>
    </main>
  );
};

export default LoginLayout;
