import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'; // Tambahkan Icon Logout
import { useCatch, useAsyncTask } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import PageLayout from '../../common/components/PageLayout';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const EditItemView = ({
  children,
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { id } = useParams();

  useAsyncTask(
    async ({ signal }) => {
      if (!item) {
        if (id) {
          const response = await fetchOrThrow(`/api/${endpoint}/${id}`, { signal });
          setItem(await response.json());
        } else {
          setItem(defaultItem || {});
        }
      }
    },
    [id, item, defaultItem, endpoint, setItem],
  );

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }

    const response = await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (onItemSaved) {
      onItemSaved(await response.json());
    }
    navigate(-1);
  });

  // Fungsi Logout Handler
  const handleLogout = useCatch(async () => {
    await fetchOrThrow('/api/session', { method: 'DELETE' });
    navigate('/login');
  });

  const skeletonAccordionStyle = {
    borderRadius: '16px !important',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    overflow: 'hidden',
    mb: 2.5,
    boxShadow: isDark
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
      : '0 8px 24px -4px rgba(15, 23, 42, 0.04)',
    '&:before': { display: 'none' },
  };

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {item ? (
          children
        ) : (
          <Accordion defaultExpanded disableGutters elevation={0} sx={skeletonAccordionStyle}>
            <AccordionSummary sx={{ px: 3, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                <Skeleton width="10em" height={28} />
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                p: { xs: 2.5, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                backgroundColor: isDark ? alpha('#0f172a', 0.4) : '#f8fafc',
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={-i}
                  variant="rounded"
                  width="100%"
                  height={44}
                  sx={{ borderRadius: '12px' }}
                >
                  <TextField fullWidth size="small" />
                </Skeleton>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Footer Tombol Aksi Bawah */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1.5,
            pb: 2,
          }}
        >
          {/* Tombol Logout langsung diletakkan di sini tanpa syarat IF */}
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.dark,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            Logout
          </Button>

          {/* Group Tombol Cancel & Save */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={!item}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.16)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: '#1d4ed8',
                  color: '#1d4ed8',
                  backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                },
              }}
            >
              {t('sharedCancel')}
            </Button>

            <Button
              type="button"
              variant="contained"
              onClick={handleSave}
              disabled={!item || (validate && !validate())}
              startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3.5,
                py: 1,
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#1e40af',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
                },
                '&.Mui-disabled': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                  color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.3)',
                },
              }}
            >
              {t('sharedSave')}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default EditItemView;
