import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from './LocalizationProvider';

const PageTitle = ({ breadcrumbs }) => {
  const t = useTranslation();
  const location = useLocation();
  const isReports = location.pathname.startsWith('/reports');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : alpha('#1d4ed8', 0.1),
          color: '#1d4ed8',
        }}
      >
        {isReports ? (
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
        ) : (
          <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: '0.92rem',
            color: 'text.primary',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {breadcrumbs.map((b) => t(b)).join(' / ')}
        </Typography>
      </Box>
    </Box>
  );
};

const PageLayout = ({ menu, breadcrumbs, children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth="lg" // Standar MUI kaku agar ukuran bingkai dialog terkunci stabil
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (th) =>
              th.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(15, 23, 42, 0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          // Kunci ukuran fisik modal: tidak bisa molor atau ciut semaunya
          width: { xs: '95vw', sm: '92vw', md: '1020px' },
          minWidth: { md: '1020px' },
          maxWidth: '1020px !important',
          height: { xs: '90vh', sm: '82vh', md: '78vh' },
          minHeight: { md: '640px' },
          maxHeight: '760px',
          borderRadius: '24px',
          backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
          border: (th) =>
            `1px solid ${
              th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }`,
          boxShadow: (th) =>
            th.palette.mode === 'dark'
              ? '0 24px 60px -12px rgba(0, 0, 0, 0.75), 0 8px 24px rgba(0, 0, 0, 0.4)'
              : '0 20px 50px -10px rgba(15, 23, 42, 0.12), 0 6px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          m: 'auto',
        },
      }}
    >
      {/* Header Dialog */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.75,
          flexShrink: 0,
          borderBottom: (th) =>
            `1px solid ${
              th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
            }`,
          backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!desktop && menu && (
            <IconButton
              size="small"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ mr: 1, borderRadius: '10px' }}
            >
              <MenuRoundedIcon fontSize="small" />
            </IconButton>
          )}
          <PageTitle breadcrumbs={breadcrumbs} />
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            color: (th) => (th.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#ef4444',
              backgroundColor: alpha('#ef4444', 0.1),
            },
          }}
          title="Tutup"
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Konten Utama Dialog */}
      <DialogContent
        sx={{
          display: 'flex',
          p: 0,
          flexGrow: 1,
          overflow: 'hidden',
          backgroundColor: (th) => (th.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'),
          position: 'relative',
        }}
      >
        {/* Sidebar Menu Samping (Terkunci 230px, tidak bisa diperas atau membesar) */}
        {menu && (desktop || mobileMenuOpen) && (
          <Box
            sx={{
              width: 230,
              minWidth: 230,
              maxWidth: 230,
              flexShrink: 0,
              borderRight: (th) =>
                `1px solid ${
                  th.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(15, 23, 42, 0.06)'
                }`,
              backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              py: 1.5,
              ...(!desktop && {
                position: 'absolute',
                zIndex: 20,
                height: '100%',
                width: '100%',
                maxWidth: '100%',
              }),
            }}
          >
            {menu}
          </Box>
        )}

        {/* Kolom Konten Kanan (Terkunci minWidth: 0 agar tabel tidak mendesak modal) */}
        <Box
          sx={{
            flexGrow: 1,
            width: 0, // KUNCI FLEXBOX: Mencegah tabel anak memaksa container melebar
            minWidth: 0, // KUNCI FLEXBOX: Mengisolasi scroll horizontal hanya di dalam tabel
            overflowY: 'auto',
            p: { xs: 2, sm: 2.5, md: 3 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PageLayout;
