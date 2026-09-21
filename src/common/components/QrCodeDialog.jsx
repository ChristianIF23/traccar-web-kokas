import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import { QRCode } from 'react-qr-code';
import { useTranslation } from './LocalizationProvider';

const QrCodeDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const t = useTranslation();

  const [serverUrl, setServerUrl] = useState(window.location.origin);
  const [queryParams, setQueryParams] = useState('');

  const fullUrl = queryParams ? `${serverUrl}?${queryParams}` : serverUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '22px',
          border: (th) =>
            `1px solid ${
              th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }`,
          backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
          boxShadow: (th) =>
            th.palette.mode === 'dark'
              ? '0 24px 48px -12px rgba(0, 0, 0, 0.75)'
              : '0 20px 44px -8px rgba(15, 23, 42, 0.14)',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: '14px',
            backgroundColor: (th) =>
              th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : alpha('#1d4ed8', 0.08),
            color: '#1d4ed8',
          }}
        >
          <QrCode2RoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            color="text.primary"
            sx={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            QR Code Setup
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Scan untuk menghubungkan Traccar Client
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}
      >
        {/* Frame QR Code: Background tetap putih bersih agar kontras scanner tajam */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: (th) =>
              `1px solid ${
                th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)'
              }`,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
            alignSelf: 'center',
          }}
        >
          <QRCode
            value={fullUrl}
            size={theme.dimensions?.qrCodeSize || 180}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          />
        </Box>

        <TextField
          label={t('settingsServer')}
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              backgroundColor: (th) =>
                th.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: (th) =>
                  th.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(15, 23, 42, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: '#1d4ed8',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.12)',
                '& fieldset': {
                  borderColor: '#1d4ed8',
                  borderWidth: 1.5,
                },
              },
            },
          }}
        />

        <TextField
          label={t('commandConfiguration')}
          value={queryParams}
          onChange={(e) => setQueryParams(e.target.value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              backgroundColor: (th) =>
                th.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: (th) =>
                  th.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(15, 23, 42, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: '#1d4ed8',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.12)',
                '& fieldset': {
                  borderColor: '#1d4ed8',
                  borderWidth: 1.5,
                },
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            px: 3,
            py: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#1e40af',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
            },
          }}
        >
          {t('sharedClose') || t('sharedCancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeDialog;
