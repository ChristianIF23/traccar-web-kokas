import { useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  Box,
  Link,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { useTranslation } from './LocalizationProvider';

const TermsDialog = ({ open, onCancel, onAccept }) => {
  const t = useTranslation();

  const termsUrl = useSelector((state) => state.session.server.attributes?.termsUrl);
  const privacyUrl = useSelector((state) => state.session.server.attributes?.privacyUrl);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '16px',
          border: (theme) => `1px solid ${theme.palette.divider}`,
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
            width: 36,
            height: 36,
            borderRadius: '10px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.16)' : 'rgba(25, 118, 210, 0.08)',
            color: 'primary.main',
          }}
        >
          <GavelOutlinedIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          {t('userTerms')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
          {t('userTermsPrompt')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {termsUrl && (
            <Link
              href={termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: '10px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DescriptionOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {t('userTerms')}
                </Typography>
              </Box>
              <LaunchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Link>
          )}

          {privacyUrl && (
            <Link
              href={privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: '10px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SecurityOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {t('userPrivacy')}
                </Typography>
              </Box>
              <LaunchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Link>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: (theme) => theme.palette.divider,
          }}
        >
          {t('sharedCancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onAccept}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            px: 2.5,
          }}
        >
          {t('sharedAccept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsDialog;
