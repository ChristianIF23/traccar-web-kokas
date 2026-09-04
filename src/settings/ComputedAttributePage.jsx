import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  createFilterOptions,
  Autocomplete,
  Button,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { useCatch } from '../reactHelper';
import { snackBarDurationLongMs } from '../common/util/duration';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const allowedProperties = [
  'valid',
  'latitude',
  'longitude',
  'altitude',
  'speed',
  'course',
  'address',
  'accuracy',
];

const ComputedAttributePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [item, setItem] = useState();
  const [deviceId, setDeviceId] = useState();
  const [result, setResult] = useState();

  const options = Object.entries(positionAttributes)
    .filter(([key, value]) => !value.property || allowedProperties.includes(key))
    .map(([key, value]) => ({
      key,
      name: value.name,
      type: value.type,
    }));

  const filter = createFilterOptions({
    stringify: (option) => option.name,
  });

  const testAttribute = useCatch(async () => {
    const query = new URLSearchParams({ deviceId });
    const url = `/api/attributes/computed/test?${query.toString()}`;
    const response = await fetchOrThrow(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    setResult(await response.text());
  });

  const validate = () => item && item.description && item.expression;

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
      endpoint="attributes/computed"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedComputedAttribute']}
    >
      {item && (
        <>
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
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                label={t('sharedDescription')}
                sx={inputStyle}
              />
              <Autocomplete
                freeSolo
                size="small"
                fullWidth
                value={
                  options.find((option) => option.key === item.attribute) || item.attribute || null
                }
                onChange={(_, option) => {
                  const attribute = option ? option.key || option.inputValue || option : null;
                  if (option && (option.type || option.inputValue)) {
                    setItem({ ...item, attribute, type: option.type });
                  } else {
                    setItem({ ...item, attribute });
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  if (
                    params.inputValue &&
                    !options.some((x) => (typeof x === 'object' ? x.key : x) === params.inputValue)
                  ) {
                    filtered.push({
                      inputValue: params.inputValue,
                      name: `${t('sharedAdd')} "${params.inputValue}"`,
                    });
                  }
                  return filtered;
                }}
                options={options}
                getOptionLabel={(option) =>
                  typeof option === 'object' ? option.inputValue || option.name : option
                }
                renderOption={(props, option) => <li {...props}>{option.name || option}</li>}
                renderInput={(params) => (
                  <TextField {...params} label={t('sharedAttribute')} sx={inputStyle} />
                )}
              />
              <TextField
                fullWidth
                size="small"
                value={item.expression || ''}
                onChange={(e) => setItem({ ...item, expression: e.target.value })}
                label={t('sharedExpression')}
                multiline
                rows={4}
                sx={inputStyle}
              />
              <FormControl fullWidth size="small" disabled={item.attribute in positionAttributes} sx={inputStyle}>
                <InputLabel>{t('sharedType')}</InputLabel>
                <Select
                  label={t('sharedType')}
                  value={item.type || ''}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <MenuItem value="string">{t('sharedTypeString')}</MenuItem>
                  <MenuItem value="number">{t('sharedTypeNumber')}</MenuItem>
                  <MenuItem value="boolean">{t('sharedTypeBoolean')}</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                value={item.priority || 0}
                onChange={(e) => setItem({ ...item, priority: Number(e.target.value) })}
                label={t('sharedPriority')}
                sx={inputStyle}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedTest')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <SelectField
                fullWidth
                size="small"
                value={deviceId}
                onChange={(e) => setDeviceId(Number(e.target.value))}
                endpoint="/api/devices"
                label={t('sharedDevice')}
                sx={inputStyle}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={testAttribute}
                disabled={!deviceId}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  px: 2.5,
                  alignSelf: 'flex-start',
                }}
              >
                {t('sharedTestExpression')}
              </Button>
              <Snackbar
                open={!!result}
                onClose={() => setResult(null)}
                autoHideDuration={snackBarDurationLongMs}
                message={result}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default ComputedAttributePage;
