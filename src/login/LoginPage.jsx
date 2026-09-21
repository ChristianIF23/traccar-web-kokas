import { useEffect, useRef, useState } from 'react';
import {
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Paper,
  alpha,
  CircularProgress,
} from '@mui/material';
import CountryFlag from 'react-country-flag';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken,
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from '../common/components/NativeInterface';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import PasswordField from '../common/components/PasswordField';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2.5),
    right: theme.spacing(2.5),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    zIndex: 20,
    backgroundColor:
      theme.palette.mode === 'dark' ? alpha('#1e293b', 0.85) : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: theme.spacing(0.5, 1),
    borderRadius: '30px',
    border: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'
    }`,
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
  },
  optionButton: {
    color: theme.palette.text.secondary,
    width: 34,
    height: 34,
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#162447',
      backgroundColor: alpha('#162447', 0.08),
    },
  },
  languageSelect: {
    '& .MuiSelect-select': {
      paddingTop: theme.spacing(0.6),
      paddingBottom: theme.spacing(0.6),
      paddingLeft: theme.spacing(1),
      paddingRight: `${theme.spacing(3)} !important`,
      fontSize: '0.82rem',
      fontWeight: 600,
      color: theme.palette.text.primary,
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    borderRadius: '16px',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 390,
    margin: '0 auto',
    padding: theme.spacing(4.5, 4),
    borderRadius: '28px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
    }`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 20px 45px -10px rgba(0, 0, 0, 0.5)'
        : '0 16px 40px -10px rgba(15, 23, 42, 0.07)',
  },
  headerBox: {
    marginBottom: theme.spacing(3.5),
    textAlign: 'center',
  },
  title: {
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: '1.65rem',
    marginBottom: theme.spacing(0.5),
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
    gap: theme.spacing(2.2),
    width: '100%',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.6),
  },
  fieldLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#334155',
    marginLeft: theme.spacing(0.2),
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
      fontSize: '0.9rem',
      fontWeight: 500,
      '& fieldset': {
        borderColor:
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.16)',
      },
      '&:hover fieldset': {
        borderColor: '#162447',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#162447',
        borderWidth: '1.5px',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 3px rgba(22, 36, 71, 0.14)',
      },
    },
  },
  submitButton: {
    borderRadius: '12px',
    paddingTop: theme.spacing(1.3),
    paddingBottom: theme.spacing(1.3),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
    transition: 'all 0.2s ease',
    marginTop: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#1e40af',
      boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
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
  openIdButton: {
    borderRadius: '12px',
    paddingTop: theme.spacing(1.2),
    paddingBottom: theme.spacing(1.2),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.9rem',
    borderColor:
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.15)',
    color: theme.palette.text.primary,
    '&:hover': {
      borderColor: '#162447',
      backgroundColor: alpha('#162447', 0.04),
    },
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    padding: theme.spacing(0, 0.5),
  },
  link: {
    cursor: 'pointer',
    fontWeight: 600,
    color: '#1d4ed8',
    textDecoration: 'none',
    fontSize: '0.84rem',
    '&:hover': {
      textDecoration: 'underline',
      color: '#1e40af',
    },
  },
  flag: {
    marginRight: theme.spacing(1),
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '2px',
    overflow: 'hidden',
  },
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector(
    (state) => state.session.server.openIdEnabled && state.session.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    setLoading(true);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate('/');
    } else if (response.status === 401) {
      nativePostMessage('logout');
    }
  });

  const handleTokenLoginRef = useRef(handleTokenLogin);
  handleTokenLoginRef.current = handleTokenLogin;

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLoginRef.current(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <IconButton
            className={classes.optionButton}
            size="small"
            onClick={() => navigate('/change-server')}
          >
            <Tooltip
              title={`${t('settingsServer')}: ${window.location.hostname}`}
              open={showServerTooltip}
              arrow
            >
              <VpnLockIcon fontSize="small" />
            </Tooltip>
          </IconButton>
        )}
        {!nativeEnvironment && (
          <IconButton
            className={classes.optionButton}
            size="small"
            onClick={() => setShowQr(true)}
            title="Scan QR Code"
          >
            <QrCode2Icon fontSize="small" />
          </IconButton>
        )}
        {languageEnabled && (
          <FormControl size="small">
            <Select
              className={classes.languageSelect}
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value)}
              displayEmpty
            >
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  <span className={classes.flag}>
                    <CountryFlag countryCode={it.country} svg />
                  </span>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      <Paper elevation={0} className={classes.cardWrapper}>
        <Box className={classes.headerBox}>
          <Typography variant="h5" className={classes.title}>
            Login
          </Typography>
          <Typography variant="body2" className={classes.subtitle}>
            Silakan masuk ke akun Anda
          </Typography>
        </Box>

        <form onSubmit={handlePasswordLogin} className={classes.formContainer}>
          {!openIdForced && (
            <>
              {/* Field Email */}
              <div className={classes.fieldGroup}>
                <Typography className={classes.fieldLabel}>Email</Typography>
                <TextField
                  required
                  fullWidth
                  className={classes.inputField}
                  error={failed}
                  name="email"
                  value={email}
                  placeholder="nama@kokas.id"
                  autoComplete="email"
                  autoFocus={!email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText={failed && 'Email atau sandi tidak sesuai'}
                />
              </div>

              {/* Field Password */}
              <div className={classes.fieldGroup}>
                <Typography className={classes.fieldLabel}>Password</Typography>
                <PasswordField
                  required
                  fullWidth
                  className={classes.inputField}
                  error={failed}
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus={!!email}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {codeEnabled && (
                <div className={classes.fieldGroup}>
                  <Typography className={classes.fieldLabel}>Kode TOTP</Typography>
                  <TextField
                    required
                    fullWidth
                    className={classes.inputField}
                    error={failed}
                    name="code"
                    value={code}
                    type="number"
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="contained"
                className={classes.submitButton}
                disabled={!email || !password || (codeEnabled && !code) || loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
              </Button>
            </>
          )}

          {openIdEnabled && (
            <Button
              onClick={() => handleOpenIdLogin()}
              variant="outlined"
              className={classes.openIdButton}
            >
              {t('loginOpenId')}
            </Button>
          )}

          {/* Bagian Bawah: Reset Password saja (Rata Kanan) */}
          {!openIdForced && emailEnabled && (
            <div className={classes.extraContainer}>
              <Link
                onClick={() => navigate('/reset-password')}
                className={classes.link}
                underline="none"
              >
                Reset Password
              </Link>
            </div>
          )}
        </form>
      </Paper>

      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LoginLayout>
  );
};

export default LoginPage;
