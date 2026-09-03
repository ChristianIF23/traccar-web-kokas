import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';

const DriverPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.name && item.uniqueId;

  const accordionStyle = {
    borderRadius: '14px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    mb: 2,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    '&:before': { display: 'none' },
  };

  return (
    <EditItemView
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDriver']}
    >
      {item && (
        <>
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
              />
            </AccordionDetails>
          </Accordion>

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DriverPage;
