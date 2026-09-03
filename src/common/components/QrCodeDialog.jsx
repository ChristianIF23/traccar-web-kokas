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
          borderRadius: '16px',
          border: (th) => `1px solid ${th.palette.divider}`,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
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
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: (th) =>
              th.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.16)' : 'rgba(25, 118, 210, 0.08)',
            color: 'primary.main',
          }}
        >
          <QrCode2RoundedIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            QR Code Setup
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Scan untuk menghubungkan Traccar Client
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {/* QR Code Card Frame (selalu putih agar kontras terbaca di dark mode) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2.5,
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: (th) => `1px solid ${th.palette.divider}`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
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
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />

        <TextField
          label={t('commandConfiguration')}
          value={queryParams}
          onChange={(e) => setQueryParams(e.target.value)}
          size="small"
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            px: 2.5,
          }}
        >
          {t('sharedClose') || t('sharedCancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeDialog;
