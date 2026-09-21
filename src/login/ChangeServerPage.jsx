import { useState } from 'react';
import { useDispatch } from 'react-redux';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { makeStyles } from 'tss-react/mui';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useTranslation } from '../common/components/LocalizationProvider';
import Loader from '../common/components/Loader';
import { errorsActions } from '../store';

const currentServer = `${window.location.protocol}//${window.location.host}`;

const officialServers = [
  currentServer,
  'https://demo.traccar.org',
  'https://demo2.traccar.org',
  'https://demo3.traccar.org',
  'https://demo4.traccar.org',
  'https://server.traccar.org',
  'http://localhost:8082',
  'http://localhost:3000',
].filter((value, index, self) => self.indexOf(value) === index);

const useStyles = makeStyles()((theme) => ({
  pageWrapper: {
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: theme.spacing(3),
  },
  card: {
    position: 'relative',
    zIndex: 5,
    width: '100%',
    maxWidth: 420,
    padding: theme.spacing(4.5, 4),
    borderRadius: '28px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
    }`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 20px 45px -10px rgba(0, 0, 0, 0.6)'
        : '0 16px 40px -10px rgba(15, 23, 42, 0.08)',
    textAlign: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    margin: '0 auto',
    marginBottom: theme.spacing(2),
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: alpha('#162447', 0.08),
    color: '#162447',
    border: '1px solid rgba(22, 36, 71, 0.12)',
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    fontWeight: 800,
    fontSize: '1.5rem',
    letterSpacing: '-0.03em',
    color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
    marginBottom: theme.spacing(0.75),
  },
  subtitle: {
    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: '0.86rem',
    lineHeight: 1.5,
    fontWeight: 400,
    marginBottom: theme.spacing(3),
  },
  field: {
    marginBottom: theme.spacing(3),
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
        borderColor: '#1d4ed8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d4ed8',
        borderWidth: '1.5px',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.14)',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.86rem',
      color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
      '&.Mui-focused': {
        color: '#1d4ed8',
        fontWeight: 600,
      },
    },
  },
  buttons: {
    display: 'flex',
    gap: theme.spacing(1.2),
    justifyContent: 'center',
    marginTop: theme.spacing(1),
  },
  actionButton: {
    flex: 1,
    borderRadius: '12px',
    paddingTop: theme.spacing(1.2),
    paddingBottom: theme.spacing(1.2),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.88rem',
    letterSpacing: '0.01em',
  },
  cancelBtn: {
    borderColor:
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.16)',
    color: theme.palette.text.secondary,
    '&:hover': {
      borderColor: '#ef4444',
      backgroundColor: alpha('#ef4444', 0.06),
      color: '#ef4444',
    },
  },
  qrBtn: {
    borderColor: 'rgba(22, 36, 71, 0.2)',
    color: '#162447',
    backgroundColor: alpha('#162447', 0.04),
    '&:hover': {
      borderColor: '#162447',
      backgroundColor: alpha('#162447', 0.08),
    },
  },
  submitButton: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
    transition: 'all 0.2s ease',
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
  dialogPaper: {
    borderRadius: '24px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'
    }`,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    overflow: 'hidden',
  },
  scannerVideo: {
    width: '100%',
    maxWidth: '380px',
    height: 'auto',
    borderRadius: '16px',
    overflow: 'hidden',
  },
}));

const ChangeServerPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const filter = createFilterOptions();
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [inputValue, setInputValue] = useState(currentServer);
  const [scannerOpen, setScannerOpen] = useState(false);

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (url) => {
    const normalized = new URL(url).toString();
    setLoading(true);
    if (window.webkit && window.webkit.messageHandlers?.appInterface) {
      window.webkit.messageHandlers.appInterface.postMessage(`server|${normalized}`);
    } else if (window.appInterface) {
      window.appInterface.postMessage(`server|${normalized}`);
    } else {
      window.location.replace(normalized);
    }
  };

  const handleScanResult = (codes) => {
    if (codes && codes.length) {
      const value = codes[0].rawValue || codes[0].value || '';
      if (value) {
        setInputValue(value);
        setInvalid(!validateUrl(value));
        setScannerOpen(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={classes.pageWrapper}>
      <Paper elevation={0} className={classes.card}>
        <div className={classes.iconWrapper}>
          <VpnLockIcon className={classes.icon} />
        </div>

        <Typography className={classes.title}>{t('settingsServer')}</Typography>
        <Typography className={classes.subtitle}>
          Pilih atau masukkan alamat URL server yang ingin Anda hubungkan
        </Typography>

        <Autocomplete
          freeSolo
          className={classes.field}
          options={officialServers}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('settingsServer')}
              error={invalid}
              helperText={
                invalid ? 'URL server tidak valid (harus diawali http:// atau https://)' : ''
              }
            />
          )}
          value={currentServer}
          onChange={(_, value) =>
            value && validateUrl(value) ? handleSubmit(value) : setInvalid(true)
          }
          inputValue={inputValue}
          onInputChange={(_, value) => {
            setInputValue(value);
            setInvalid(false);
          }}
          filterOptions={filter}
        />

        <div className={classes.buttons}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            className={`${classes.actionButton} ${classes.cancelBtn}`}
          >
            {t('sharedCancel')}
          </Button>

          {Boolean(navigator?.mediaDevices?.getUserMedia) && (
            <Button
              variant="outlined"
              onClick={() => setScannerOpen(true)}
              className={`${classes.actionButton} ${classes.qrBtn}`}
              startIcon={<QrCodeScannerIcon />}
            >
              Scan QR
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() =>
              inputValue && validateUrl(inputValue) ? handleSubmit(inputValue) : setInvalid(true)
            }
            disabled={!inputValue || invalid}
            className={`${classes.actionButton} ${classes.submitButton}`}
          >
            {t('sharedSave')}
          </Button>
        </div>
      </Paper>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        PaperProps={{ className: classes.dialogPaper }}
      >
        <DialogTitle
          sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', pt: 3, pb: 1 }}
        >
          Pindai QR Server Traccar
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Scanner
            constraints={{ facingMode: 'environment' }}
            onScan={handleScanResult}
            onError={(error) => dispatch(errorsActions.push(String(error)))}
            className={classes.scannerVideo}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setScannerOpen(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3, fontWeight: 600 }}
          >
            {t('sharedCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChangeServerPage;
