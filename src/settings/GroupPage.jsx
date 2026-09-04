import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useGroupAttributes from '../common/attributes/useGroupAttributes';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const GroupPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const groupAttributes = useGroupAttributes(t);

  const [item, setItem] = useState();

  const onItemSaved = useCatch(async () => {
    const response = await fetchOrThrow('/api/groups');
    dispatch(groupsActions.refresh(await response.json()));
  });

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
      endpoint="groups"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'groupDialog']}
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
              <SelectField
                fullWidth
                size="small"
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
                sx={inputStyle}
              />
            </AccordionDetails>
          </Accordion>

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...groupAttributes }}
          />
        </>
      )}
    </EditItemView>
  );
};

export default GroupPage;
