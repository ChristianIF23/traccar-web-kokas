import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useGeofenceAttributes from '../common/attributes/useGeofenceAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { geofencesActions } from '../store';
import useSettingsStyles from './common/useSettingsStyles';

const GeofencePage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const geofenceAttributes = useGeofenceAttributes(t);

  const [item, setItem] = useState();

  const onItemSaved = (result) => {
    dispatch(geofencesActions.update([result]));
  };

  const validate = () => item && item.name;

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
      endpoint="geofences"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedGeofence']}
    >
      {item && (
        <>
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <TextField
                fullWidth
                size="small"
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
                sx={inputStyle}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>{t('sharedExtra')}</Typography>
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
              <SelectField
                fullWidth
                size="small"
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
                sx={inputStyle}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={item.attributes.hide}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        attributes: { ...item.attributes, hide: e.target.checked },
                      })
                    }
                  />
                }
                label={<Typography variant="body2">{t('sharedFilterMap')}</Typography>}
                sx={{ pt: 0.5 }}
              />
            </AccordionDetails>
          </Accordion>

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={geofenceAttributes}
          />
        </>
      )}
    </EditItemView>
  );
};

export default GeofencePage;
