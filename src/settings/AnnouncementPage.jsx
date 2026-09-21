import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatchCallback } from '../reactHelper';
import SelectField from '../common/components/SelectField';
import { prefixString } from '../common/util/stringUtils';
import fetchOrThrow from '../common/util/fetchOrThrow';

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [users, setUsers] = useState([]);
  const [notificator, setNotificator] = useState();
  const [message, setMessage] = useState({});

  const handleSend = useCatchCallback(async () => {
    const query = new URLSearchParams();
    users.forEach((userId) => query.append('userId', userId));
    await fetchOrThrow(`/api/notifications/send/${notificator}?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    navigate(-1);
  }, [users, notificator, message, navigate]);

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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['serverAnnouncement']}>
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
            <SelectField
              multiple
              fullWidth
              size="small"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              endpoint="/api/users"
              label={t('settingsUsers')}
              sx={inputStyle}
            />
            <SelectField
              fullWidth
              size="small"
              value={notificator}
              onChange={(e) => setNotificator(e.target.value)}
              endpoint="/api/notifications/notificators?announcement=true"
              keyGetter={(it) => it.type}
              titleGetter={(it) => t(prefixString('notificator', it.type))}
              label={t('notificationNotificators')}
              sx={inputStyle}
            />
            <TextField
              fullWidth
              size="small"
              value={message.subject || ''}
              onChange={(e) => setMessage({ ...message, subject: e.target.value })}
              label={t('sharedSubject')}
              sx={inputStyle}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={4}
              value={message.body || ''}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              label={t('commandMessage')}
              sx={inputStyle}
            />
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
            disabled={!notificator || !message.subject || !message.body}
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

export default AnnouncementPage;
