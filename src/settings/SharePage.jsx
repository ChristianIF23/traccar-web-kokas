import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatchCallback } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

const SharePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  const { type, id } = useParams();

  const item = useSelector((state) =>
    type === 'group' ? state.groups.items[id] : state.devices.items[id],
  );

  const [expiration, setExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [link, setLink] = useState();
  const [copied, setCopied] = useState(false);

  const handleShare = useCatchCallback(async () => {
    const expirationTime = dayjs(expiration).toISOString();
    const response = await fetchOrThrow(`/api/share/${type}`, {
      method: 'POST',
      body: new URLSearchParams(`${type}Id=${id}&expiration=${expirationTime}`),
    });
    const token = await response.text();
    setLink(`${window.location.origin}?token=${token}`);
  }, [id, expiration, type, setLink]);

  const handleCopy = () => {
    if (link) {
      navigator.clipboard?.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? alpha('#0f172a', 0.8) : '#ffffff',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
      },
      '&:hover fieldset': {
        borderColor: '#1d4ed8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d4ed8',
      },
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedShare']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '18px !important',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            backgroundColor: isDark ? '#162447' : '#ffffff',
            boxShadow: isDark
              ? '0 12px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 24px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            mb: 2.5,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
            sx={{
              px: 3,
              py: 1,
              borderBottom: `1px solid ${
                isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
              }`,
              '& .MuiAccordionSummary-content': { my: 1 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
            }}
          >
            <TextField
              size="small"
              value={item?.name || ''}
              label={t(type === 'group' ? 'groupDialog' : 'sharedDevice')}
              disabled
              fullWidth
              sx={inputStyle}
            />

            <TextField
              size="small"
              label={t('userExpirationTime')}
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              fullWidth
              sx={inputStyle}
            />

            <Button
              variant="contained"
              onClick={handleShare}
              startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.1,
                px: 3,
                alignSelf: 'flex-start',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
                '&:hover': {
                  backgroundColor: '#1e40af',
                  boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
                },
              }}
            >
              {t('reportShow')}
            </Button>

            {link && (
              <TextField
                size="small"
                value={link}
                label={t('sharedLink')}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={copied ? 'Tersalin!' : t('sharedCopy')}>
                          <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{
                              color: copied ? '#10b981' : '#1d4ed8',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {copied ? (
                              <CheckRoundedIcon fontSize="small" />
                            ) : (
                              <ContentCopyRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  ...inputStyle,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.84rem',
                    color: isDark ? '#38bdf8' : '#0369a1',
                  },
                }}
              />
            )}
          </AccordionDetails>
        </Accordion>

        {/* Footer Tombol Aksi Bawah */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: 'flex-end',
            pt: 1,
            pb: 2,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.14)',
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
            onClick={handleCopy}
            disabled={!link}
            startIcon={
              copied ? (
                <CheckRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              py: 1,
              backgroundColor: copied ? '#10b981' : '#1d4ed8',
              color: '#ffffff',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: copied ? '#059669' : '#1e40af',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
              },
              '&.Mui-disabled': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
              },
            }}
          >
            {copied ? 'Tersalin' : t('sharedCopy')}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SharePage;
