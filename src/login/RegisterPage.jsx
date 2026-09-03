import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextField, Typography, Snackbar, IconButton, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationShortMs } from '../common/util/duration';
import { useCatch, useAsyncTask } from '../reactHelper';
import { sessionActions } from '../store';
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
    marginBottom: theme.spacing(1),
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

const RegisterPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpKey, setTotpKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useAsyncTask(
    async ({ signal }) => {
      if (totpForce) {
        const response = await fetchOrThrow('/api/users/totp', { method: 'POST', signal });
        setTotpKey(await response.text());
      }
    },
    [totpForce, setTotpKey],
  );

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    await fetchOrThrow('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, totpKey }),
    });
    setSnackbarOpen(true);
  });

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          {!server.newServer && (
            <IconButton className={classes.backButton} color="primary" onClick={() => navigate('/login')}>
              <BackIcon />
            </IconButton>
          )}
          <Typography className={classes.title}>
            {t('loginRegister')}
          </Typography>
        </div>

        <Typography className={classes.subtitle}>
          Buat akun baru untuk mulai memantau unit
        </Typography>

        <TextField
          required
          fullWidth
          className={classes.inputField}
          label={t('sharedName')}
          name="name"
          value={name}
          autoComplete="name"
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          required
          fullWidth
          type="email"
          className={classes.inputField}
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          required
          fullWidth
          className={classes.inputField}
          label={t('userPassword')}
          name="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        {totpForce && (
          <TextField
            required
            fullWidth
            className={classes.inputField}
            label={t('loginTotpKey')}
            name="totpKey"
            value={totpKey || ''}
            slotProps={{
              input: { readOnly: true },
            }}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          type="submit"
          disabled={!name || !password || !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))}
          fullWidth
          className={classes.submitButton}
        >
          {t('loginRegister')}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(sessionActions.updateServer({ ...server, newServer: false }));
          navigate('/login');
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t('loginCreated')}
      />
    </LoginLayout>
  );
};

export default RegisterPage;
