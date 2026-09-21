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
import { alpha } from '@mui/material/styles';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
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
          borderRadius: '22px',
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }`,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#162447' : '#ffffff'),
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
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
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : alpha('#1d4ed8', 0.08),
            color: '#1d4ed8',
          }}
        >
          <GavelRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          sx={{ letterSpacing: '-0.01em' }}
        >
          {t('userTerms')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2.5, lineHeight: 1.6, fontSize: '0.86rem' }}
        >
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
                p: 1.75,
                borderRadius: '14px',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(15, 23, 42, 0.08)'
                  }`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#0f172a', 0.5) : '#f8fafc',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#1d4ed8',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.12) : alpha('#1d4ed8', 0.04),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 20, color: '#1d4ed8' }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ fontSize: '0.86rem' }}
                >
                  {t('userTerms')}
                </Typography>
              </Box>
              <LaunchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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
                p: 1.75,
                borderRadius: '14px',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(15, 23, 42, 0.08)'
                  }`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#0f172a', 0.5) : '#f8fafc',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#1d4ed8',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.12) : alpha('#1d4ed8', 0.04),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SecurityOutlinedIcon sx={{ fontSize: 20, color: '#1d4ed8' }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ fontSize: '0.86rem' }}
                >
                  {t('userPrivacy')}
                </Typography>
              </Box>
              <LaunchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Link>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.86rem',
            px: 2,
            py: 0.9,
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(15, 23, 42, 0.14)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#1d4ed8',
              color: '#1d4ed8',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
            },
          }}
        >
          {t('sharedCancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onAccept}
          sx={{
            borderRadius: '12px',
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.86rem',
            boxShadow: 'none',
            px: 2.75,
            py: 0.9,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#1e40af',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
            },
          }}
        >
          {t('sharedAccept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsDialog;
