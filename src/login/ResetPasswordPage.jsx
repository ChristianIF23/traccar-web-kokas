import { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  IconButton,
  Box,
  Paper,
  alpha,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationShortMs } from '../common/util/duration';
import { useCatch } from '../reactHelper';
import BackIcon from '../common/components/BackIcon';
import PasswordField from '../common/components/PasswordField';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  cardWrapper: {
    width: '100%',
    maxWidth: 360,
    margin: '0 auto',
    padding: theme.spacing(2.5, 3.25),
    borderRadius: '22px',
    backgroundColor:
      theme.palette.mode === 'dark' ? alpha(theme.palette.primary.dark, 0.82) : '#ffffff',
    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 16px 34px -12px rgba(0, 0, 0, 0.5)'
        : '0 12px 30px -12px rgba(15, 23, 42, 0.12)',
  },
  headerBox: {
    marginBottom: theme.spacing(1.5),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: '10px',
    border: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'
    }`,
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.geometry.main,
      borderColor: theme.palette.geometry.main,
      backgroundColor: alpha(theme.palette.geometry.main, 0.08),
      transform: 'translateX(-2px)',
    },
  },
  title: {
    fontSize: '1.65rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
  },
  subtitle: {
    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: '0.875rem',
    lineHeight: 1.45,
    fontWeight: 400,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.35),
    width: '100%',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.4),
  },
  fieldLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#334155',
    marginLeft: theme.spacing(0.2),
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.default, 0.7)
          : alpha(theme.palette.geometry.main, 0.025),
      fontSize: '0.9rem',
      fontWeight: 500,
      '& fieldset': {
        borderColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.light, 0.45)
            : alpha(theme.palette.primary.main, 0.2),
      },
      '&:hover fieldset': {
        borderColor: theme.palette.geometry.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.geometry.main,
        borderWidth: '1.5px',
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.geometry.main, 0.14)}`,
      },
    },
  },
  submitButton: {
    borderRadius: '10px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
    transition: 'all 0.2s ease',
    marginTop: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&.Mui-disabled': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.action.disabledBackground, 0.2)
          : '#e2e8f0',
      color: theme.palette.mode === 'dark' ? '#475569' : '#94a3b8',
      boxShadow: 'none',
    },
  },
}));

const ResetPasswordPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('passwordReset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!token) {
        await fetchOrThrow('/api/password/reset', {
          method: 'POST',
          body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
        });
      } else {
        await fetchOrThrow('/api/password/update', {
          method: 'POST',
          body: new URLSearchParams(
            `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
          ),
        });
      }
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  });

  return (
    <LoginLayout>
      <Paper elevation={0} className={classes.cardWrapper}>
        <Box className={classes.headerBox}>
          <div className={classes.header}>
            <IconButton
              className={classes.backButton}
              onClick={() => navigate('/login')}
              size="small"
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h5" className={classes.title}>
              {t('loginReset')}
            </Typography>
          </div>

          <Typography variant="body2" className={classes.subtitle}>
            {!token
              ? 'Masukkan email terdaftar untuk menerima instruksi pemulihan kata sandi'
              : 'Masukkan sandi baru untuk memperbarui kredensial akun Anda'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} className={classes.formContainer}>
          {!token ? (
            <div className={classes.fieldGroup}>
              <Typography className={classes.fieldLabel}>{t('userEmail')}</Typography>
              <TextField
                required
                fullWidth
                type="email"
                className={classes.inputField}
                name="email"
                value={email}
                placeholder="nama@kokas.id"
                autoComplete="email"
                autoFocus
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          ) : (
            <div className={classes.fieldGroup}>
              <Typography className={classes.fieldLabel}>{t('userPassword')}</Typography>
              <PasswordField
                required
                fullWidth
                className={classes.inputField}
                name="password"
                value={password}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}

          <Button
            variant="contained"
            type="submit"
            disabled={
              (!token && !/(.+)@(.+)\.(.{2,})/.test(email)) || (token && !password) || loading
            }
            fullWidth
            className={classes.submitButton}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : token ? (
              'Perbarui Sandi'
            ) : (
              t('loginReset')
            )}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate('/login')}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t('loginResetSuccess') : t('loginUpdateSuccess')}
      />
    </LoginLayout>
  );
};

export default ResetPasswordPage;
