import {
  Snackbar,
  Alert,
  Button,
  Link,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { usePrevious } from '../../reactHelper';
import { errorsActions } from '../../store';
import { useTranslation } from './LocalizationProvider';

const ErrorHandler = () => {
  const dispatch = useDispatch();
  const t = useTranslation();

  const error = useSelector((state) => state.errors.errors.find(() => true));
  const cachedError = usePrevious(error);

  const message = error || cachedError;
  const multiline = message?.includes('\n');
  const displayMessage = multiline
    ? message.split('\n')[0].replace(/^(?:(?:[\w$]+\.)*[\w$]+(?:Exception|Error)?:\s*)+/i, '')
    : message;

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Toast Notifikasi Error */}
      <Snackbar
        open={Boolean(error) && !expanded}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 8, md: 3 } }}
      >
        <Alert
          elevation={0}
          onClose={() => dispatch(errorsActions.pop())}
          severity="error"
          sx={{
            borderRadius: '14px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.86rem',
            alignItems: 'center',
            boxShadow:
              '0 10px 25px -5px rgba(239, 68, 68, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
            '& .MuiAlert-action': {
              color: '#ffffff',
            },
          }}
        >
          {displayMessage}
          {multiline && (
            <>
              {' • '}
              <Link
                color="inherit"
                href="#"
                underline="always"
                onClick={(e) => {
                  e.preventDefault();
                  setExpanded(true);
                }}
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                {t('sharedShowDetails')}
              </Link>
            </>
          )}
        </Alert>
      </Snackbar>

      {/* Pop-up Dialog Detail Error */}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '20px',
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(15, 23, 42, 0.08)'
              }`,
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#162447' : '#ffffff'),
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.35)',
            p: 1,
          },
        }}
      >
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: 'error.main' }}>
            Detail Pesan Galat
          </Typography>
          <DialogContentText component="div">
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#f1f5f9',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(15, 23, 42, 0.06)'
                  }`,
                overflowX: 'auto',
                maxHeight: '50vh',
              }}
            >
              <Typography
                component="pre"
                variant="caption"
                sx={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  color: 'text.primary',
                  m: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message}
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setExpanded(false)}
            variant="contained"
            autoFocus
            sx={{
              borderRadius: '10px',
              backgroundColor: '#1d4ed8',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1e40af',
                boxShadow: 'none',
              },
            }}
          >
            {t('sharedHide')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ErrorHandler;
