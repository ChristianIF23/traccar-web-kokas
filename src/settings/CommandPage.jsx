import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import BaseCommandView from './components/BaseCommandView';
import SettingsMenu from './components/SettingsMenu';

const CommandPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [item, setItem] = useState();

  const validate = () => Boolean(item && item.type);

  const accordionCardStyle = {
    borderRadius: '18px !important',
    border: (th) =>
      `1px solid ${
        th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
      }`,
    backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
    boxShadow: (th) =>
      th.palette.mode === 'dark'
        ? '0 12px 30px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(15, 23, 42, 0.04)',
    overflow: 'hidden',
    mb: 2,
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: (th) => (th.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#ffffff'),
      '& fieldset': {
        borderColor: (th) =>
          th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
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
    <EditItemView
      endpoint="commands"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedSavedCommand']}
    >
      {item && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionCardStyle}>
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
                fullWidth
                size="small"
                value={item.description || ''}
                onChange={(event) => setItem({ ...item, description: event.target.value })}
                label={t('sharedDescription')}
                sx={inputStyle}
              />
              <BaseCommandView item={item} setItem={setItem} />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </EditItemView>
  );
};

export default CommandPage;
