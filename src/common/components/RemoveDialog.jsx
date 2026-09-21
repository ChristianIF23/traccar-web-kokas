import Button from '@mui/material/Button';
import { Snackbar, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { snackBarDurationLongMs } from '../util/duration';
import fetchOrThrow from '../util/fetchOrThrow';

const RemoveDialog = ({ open, endpoint, itemId, onResult }) => {
  const t = useTranslation();

  const handleRemove = useCatch(async () => {
    await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    onResult(true);
  });

  return (
    <Snackbar
      open={open}
      autoHideDuration={snackBarDurationLongMs}
      onClose={() => onResult(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        bottom: {
          xs: (theme) => `calc(${theme.dimensions?.bottomBarHeight || 56}px + 16px)`,
          md: 28,
        },
      }}
      slotProps={{
        content: {
          sx: {
            borderRadius: '16px',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#162447' : '#0f172a'),
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.5)',
            px: 2.5,
            py: 1.25,
            fontSize: '0.88rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          },
        },
      }}
      message={t('sharedRemoveConfirm')}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={() => onResult(false)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: '#94a3b8',
              px: 1.5,
              py: 0.5,
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            {t('sharedCancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleRemove}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
              px: 1.75,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#dc2626',
              },
            }}
          >
            {t('sharedRemove')}
          </Button>
        </Box>
      }
    />
  );
};

export default RemoveDialog;
