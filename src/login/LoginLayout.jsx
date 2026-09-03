import { useMediaQuery, Paper, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#1b2a4a', // Biru dongker khas Traccar (solid & profesional)
    width: '40%',
    padding: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
    backgroundColor: '#f1f5f9', // Background abu-abu terang agar kartu form menonjol
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: theme.spacing(4.5),
    borderRadius: theme.spacing(2),
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
    border: '1px solid #e2e8f0',
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <main className={classes.root}>
      {!isMobile && (
        <div className={classes.sidebar}>
          <LogoImage color="#ffffff" />
        </div>
      )}
      <div className={classes.contentArea}>
        <Paper elevation={0} className={classes.card}>
          {children}
        </Paper>
      </div>
    </main>
  );
};

export default LoginLayout;
