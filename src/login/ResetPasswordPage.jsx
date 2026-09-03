import { useState } from 'react';
import { Button, TextField, Typography, Snackbar, IconButton } from '@mui/material';
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    width: '100%',
    maxWidth: 380,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  backButton: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.5),
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(-1.5),
    marginBottom: theme.spacing(1),
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1.2),
      transition: 'all 0.2s ease-in-out',
    },
  },
  submitButton: {
    borderRadius: theme.spacing(1.2),
    paddingTop: theme.spacing(1.4),
    paddingBottom: theme.spacing(1.4),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    marginTop: theme.spacing(1),
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
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
  });

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconButton className={classes.backButton} color="primary" onClick={() => navigate('/login')}>
            <BackIcon />
          </IconButton>
          <Typography className={classes.title}>
            {t('loginReset')}
          </Typography>
        </div>

        <Typography className={classes.subtitle}>
          {!token
            ? 'Masukkan email yang terdaftar untuk menerima instruksi reset'
            : 'Masukkan sandi baru untuk memperbarui akun Anda'}
        </Typography>

        {!token ? (
          <TextField
            required
            fullWidth
            type="email"
            className={classes.inputField}
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            autoFocus
            onChange={(event) => setEmail(event.target.value)}
          />
        ) : (
          <PasswordField
            required
            fullWidth
            className={classes.inputField}
            label={t('userPassword')}
            name="password"
            value={password}
            autoComplete="current-password"
            autoFocus
            onChange={(event) => setPassword(event.target.value)}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleSubmit}
          disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
          fullWidth
          className={classes.submitButton}
        >
          {t('loginReset')}
        </Button>
      </div>

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
