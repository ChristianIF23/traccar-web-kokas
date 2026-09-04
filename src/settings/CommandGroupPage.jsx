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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const CommandDevicePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

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

  const accordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
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
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 0.5,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                sx={inputStyle}
              />
              {textEnabled && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={!!item.textChannel}
                      onChange={(event) => setItem({ ...item, textChannel: event.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('commandSendSms')}</Typography>}
                  sx={{ pt: 0.5 }}
                />
              )}
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
              disabled={!item.attributes.data}
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

export default CommandDevicePage;
