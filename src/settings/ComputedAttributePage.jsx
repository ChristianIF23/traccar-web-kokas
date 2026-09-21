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
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { useCatch } from '../reactHelper';
import { snackBarDurationLongMs } from '../common/util/duration';
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
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const validate = () => Boolean(item && item.description && item.expression);

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
      endpoint="attributes/computed"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedComputedAttribute']}
    >
      {item && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* 1. Pengaturan Wajib Atribut */}
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
                filterOptions={(opts, params) => {
                  const filtered = filter(opts, params);
                  if (
                    params.inputValue &&
                    !opts.some((x) => (typeof x === 'object' ? x.key : x) === params.inputValue)
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
                sx={{
                  ...inputStyle,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                  },
                }}
              />
              <FormControl
                fullWidth
                size="small"
                disabled={item.attribute in positionAttributes}
                sx={inputStyle}
              >
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

          {/* 2. Pengaturan Ekstra */}
          <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
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
                {t('sharedExtra')}
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
                type="number"
                value={item.priority || 0}
                onChange={(e) => setItem({ ...item, priority: Number(e.target.value) })}
                label={t('sharedPriority')}
                sx={inputStyle}
              />
            </AccordionDetails>
          </Accordion>

          {/* 3. Pengujian Formula / Expression */}
          <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
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
                {t('sharedTest')}
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
                onClick={testAttribute}
                disabled={!deviceId}
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 0.9,
                  px: 2.5,
                  alignSelf: 'flex-start',
                  borderColor: '#1d4ed8',
                  color: '#1d4ed8',
                  '&:hover': {
                    borderColor: '#1e40af',
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                  },
                }}
              >
                {t('sharedTestExpression')}
              </Button>
              <Snackbar
                open={Boolean(result)}
                onClose={() => setResult(null)}
                autoHideDuration={snackBarDurationLongMs}
                message={result}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </EditItemView>
  );
};

export default ComputedAttributePage;
