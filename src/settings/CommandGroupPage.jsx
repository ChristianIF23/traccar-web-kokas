import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

const CommandGroupPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { id } = useParams();

  const textEnabled = useSelector((state) => state.session.server.textEnabled);

  const [item, setItem] = useState({ type: 'custom', attributes: {} });

  const handleSend = useCatch(async () => {
    const query = new URLSearchParams({ groupId: id });
    await fetchOrThrow(`/api/commands/send?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    navigate(-1);
  });

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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
      <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto' }}>
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
            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel>{t('sharedType')}</InputLabel>
              <Select label={t('sharedType')} value="custom" disabled>
                <MenuItem value="custom">{t('commandCustom')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              value={item.attributes.data || ''}
              onChange={(e) =>
                setItem({ ...item, attributes: { ...item.attributes, data: e.target.value } })
              }
              label={t('commandData')}
              fullWidth
              sx={{
                ...inputStyle,
                '& .MuiInputBase-input': {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.86rem',
                },
              }}
            />

            {textEnabled && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={Boolean(item.textChannel)}
                    onChange={(event) => setItem({ ...item, textChannel: event.target.checked })}
                  />
                }
                label={<Typography variant="body2">{t('commandSendSms')}</Typography>}
                sx={{ pt: 0.5 }}
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
            onClick={handleSend}
            disabled={!item.attributes.data}
            startIcon={<SendRoundedIcon sx={{ fontSize: 18 }} />}
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
                boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
              },
              '&.Mui-disabled': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
              },
            }}
          >
            {t('commandSend')}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default CommandGroupPage;
