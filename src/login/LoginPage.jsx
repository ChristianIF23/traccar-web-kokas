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
import LogoImage from './LogoImage';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import PasswordField from '../common/components/PasswordField';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    zIndex: 10,
  },
  languageSelect: {
    '& .MuiSelect-select': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      fontSize: '0.875rem',
    },
    borderRadius: theme.spacing(1),
  },
  headerBox: {
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  title: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    width: '100%',
    maxWidth: 380,
    margin: '0 auto',
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1.2),
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  submitButton: {
    borderRadius: theme.spacing(1.2),
    paddingTop: theme.spacing(1.4),
    paddingBottom: theme.spacing(1.4),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    },
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  link: {
    cursor: 'pointer',
    fontWeight: 500,
    color: theme.palette.primary.main,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.8,
    },
  },
  flag: {
    marginRight: theme.spacing(1),
    display: 'inline-flex',
    alignItems: 'center',
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

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
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
          <IconButton color="primary" onClick={() => navigate('/change-server')}>
            <Tooltip
              title={`${t('settingsServer')}: ${window.location.hostname}`}
              open={showServerTooltip}
              arrow
            >
              <VpnLockIcon />
            </Tooltip>
          </IconButton>
        )}
        {!nativeEnvironment && (
          <IconButton color="primary" onClick={() => setShowQr(true)}>
            <QrCode2Icon />
          </IconButton>
        )}
        {languageEnabled && (
          <FormControl size="small">
            <Select
              className={classes.languageSelect}
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value)}
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

      <div className={classes.container}>
        {useMediaQuery(theme.breakpoints.down('lg')) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <LogoImage color={theme.palette.primary.main} />
          </Box>
        )}

        <Box className={classes.headerBox}>
          <Typography variant="h5" className={classes.title}>
            {t('loginLogin')}
          </Typography>
          <Typography variant="body2" className={classes.subtitle}>
            Selamat datang kembali, silakan masuk ke akun Anda
          </Typography>
        </Box>

        {!openIdForced && (
          <>
            <TextField
              required
              fullWidth
              className={classes.inputField}
              error={failed}
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={failed && 'Invalid username or password'}
            />
            <PasswordField
              required
              fullWidth
              className={classes.inputField}
              error={failed}
              label={t('userPassword')}
              name="password"
              value={password}
              autoComplete="current-password"
              autoFocus={!!email}
              onChange={(e) => setPassword(e.target.value)}
            />
            {codeEnabled && (
              <TextField
                required
                fullWidth
                className={classes.inputField}
                error={failed}
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                onChange={(e) => setCode(e.target.value)}
              />
            )}
            <Button
              onClick={handlePasswordLogin}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submitButton}
              disabled={!email || !password || (codeEnabled && !code)}
            >
              {t('loginLogin')}
            </Button>
          </>
        )}

        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="outlined"
            color="primary"
            className={classes.submitButton}
          >
            {t('loginOpenId')}
          </Button>
        )}

        {!openIdForced && (
          <div className={classes.extraContainer}>
            {registrationEnabled ? (
              <Link
                onClick={() => navigate('/register')}
                className={classes.link}
                underline="hover"
                variant="body2"
              >
                {t('loginRegister')}
              </Link>
            ) : <span />}

            {emailEnabled && (
              <Link
                onClick={() => navigate('/reset-password')}
                className={classes.link}
                underline="hover"
                variant="body2"
              >
                {t('loginReset')}
              </Link>
            )}
          </div>
        )}
      </div>

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
