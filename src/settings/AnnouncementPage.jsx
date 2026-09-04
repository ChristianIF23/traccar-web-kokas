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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatchCallback } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import SelectField from '../common/components/SelectField';
import { prefixString } from '../common/util/stringUtils';
import fetchOrThrow from '../common/util/fetchOrThrow';

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

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

  const accordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    mb: 2.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['serverAnnouncement']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={accordionStyle}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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

          <Box
            className={classes.buttons}
            sx={{
              display: 'flex',
              gap: 1.5,
              justifyContent: 'flex-end',
              mt: 3,
              pt: 2,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {t('sharedCancel')}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="contained"
              onClick={handleSend}
              disabled={!notificator || !message.subject || !message.body}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {t('commandSend')}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default AnnouncementPage;
