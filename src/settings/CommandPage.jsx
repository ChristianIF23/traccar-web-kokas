import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import BaseCommandView from './components/BaseCommandView';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';

const CommandPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.type;

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
    <EditItemView
      endpoint="commands"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedSavedCommand']}
    >
      {item && (
        <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            className={classes.details}
            sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
      )}
    </EditItemView>
  );
};

export default CommandPage;
