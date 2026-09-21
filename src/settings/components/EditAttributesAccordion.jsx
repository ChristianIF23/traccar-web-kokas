import { useState } from 'react';
import {
  Button,
  Checkbox,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddAttributeDialog from './AddAttributeDialog';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAttributePreference } from '../../common/util/preferences';
import {
  distanceFromMeters,
  distanceToMeters,
  distanceUnitString,
  speedFromKnots,
  speedToKnots,
  speedUnitString,
  volumeFromLiters,
  volumeToLiters,
  volumeUnitString,
} from '../../common/util/converter';
import useFeatures from '../../common/util/useFeatures';

const EditAttributesAccordion = ({
  attribute,
  attributes,
  setAttributes,
  definitions = {},
  focusAttribute,
}) => {
  const t = useTranslation();
  const features = useFeatures();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [addDialogShown, setAddDialogShown] = useState(false);

  const updateAttribute = (key, value, type, dataType) => {
    const updatedAttributes = { ...attributes };
    switch (dataType) {
      case 'speed':
        updatedAttributes[key] = speedToKnots(Number(value), speedUnit);
        break;
      case 'distance':
        updatedAttributes[key] = distanceToMeters(Number(value), distanceUnit);
        break;
      case 'volume':
        updatedAttributes[key] = volumeToLiters(Number(value), volumeUnit);
        break;
      default:
        updatedAttributes[key] = type === 'number' ? Number(value) : value;
        break;
    }
    setAttributes(updatedAttributes);
  };

  const deleteAttribute = (key) => {
    const updatedAttributes = { ...attributes };
    delete updatedAttributes[key];
    setAttributes(updatedAttributes);
  };

  const getAttributeName = (key, dataType) => {
    const definition = definitions[key];
    const name = definition ? definition.name : key;
    switch (dataType) {
      case 'speed':
        return `${name} (${speedUnitString(speedUnit, t)})`;
      case 'distance':
        return `${name} (${distanceUnitString(distanceUnit, t)})`;
      case 'volume':
        return `${name} (${volumeUnitString(volumeUnit, t)})`;
      default:
        return name;
    }
  };

  const getAttributeType = (value) => {
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    return 'string';
  };

  const getAttributeDataType = (key) => {
    const definition = definitions[key];
    return definition && definition.dataType;
  };

  const getDisplayValue = (value, dataType) => {
    if (value) {
      switch (dataType) {
        case 'speed':
          return speedFromKnots(value, speedUnit);
        case 'distance':
          return distanceFromMeters(value, distanceUnit);
        case 'volume':
          return volumeFromLiters(value, volumeUnit);
        default:
          return value;
      }
    }
    return '';
  };

  const convertToList = (attributesList) => {
    const booleanList = [];
    const otherList = [];
    const excludeAttributes = [
      'speedUnit',
      'distanceUnit',
      'altitudeUnit',
      'volumeUnit',
      'timezone',
    ];
    Object.keys(attributesList || [])
      .filter((key) => !excludeAttributes.includes(key))
      .forEach((key) => {
        const value = attributesList[key];
        const type = getAttributeType(value);
        const dataType = getAttributeDataType(key);
        if (type === 'boolean') {
          booleanList.push({
            key,
            value,
            type,
            dataType,
          });
        } else {
          otherList.push({
            key,
            value,
            type,
            dataType,
          });
        }
      });
    return [...otherList, ...booleanList];
  };

  const handleAddResult = (definition) => {
    setAddDialogShown(false);
    if (definition) {
      switch (definition.type) {
        case 'number':
          updateAttribute(definition.key, 0);
          break;
        case 'boolean':
          updateAttribute(definition.key, false);
          break;
        default:
          updateAttribute(definition.key, '');
          break;
      }
    }
  };

  if (features.disableAttributes) {
    return null;
  }

  const attributeList = convertToList(attributes);

  return (
    <Accordion
      defaultExpanded={Boolean(attribute)}
      disableGutters
      elevation={0}
      sx={{
        borderRadius: '16px !important',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: isDark
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px -4px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
        sx={{
          px: 3,
          py: 1,
          '& .MuiAccordionSummary-content': { my: 1 },
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {t('sharedAttributes')}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: 3,
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {attributeList.map(({ key, value, type, dataType }) => {
          if (type === 'boolean') {
            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  px: 2,
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(value)}
                      onChange={(e) => updateAttribute(key, e.target.checked)}
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&.Mui-checked': { color: '#1d4ed8' },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {getAttributeName(key, dataType)}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
                <IconButton
                  size="small"
                  onClick={() => deleteAttribute(key)}
                  title="Remove"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          }

          return (
            <FormControl key={key} fullWidth size="small">
              <InputLabel>{getAttributeName(key, dataType)}</InputLabel>
              <OutlinedInput
                label={getAttributeName(key, dataType)}
                type={type === 'number' ? 'number' : 'text'}
                value={getDisplayValue(value, dataType)}
                onChange={(e) => updateAttribute(key, e.target.value, type, dataType)}
                autoFocus={focusAttribute === key}
                sx={{ borderRadius: '12px' }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => deleteAttribute(key)}
                      title="Remove"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main',
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          );
        })}

        <Button
          variant="outlined"
          onClick={() => setAddDialogShown(true)}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            alignSelf: 'flex-start',
            px: 2.5,
            py: 0.8,
            borderColor: '#1d4ed8',
            color: '#1d4ed8',
            '&:hover': {
              borderColor: '#1e40af',
              backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.05),
            },
          }}
        >
          {t('sharedAdd')}
        </Button>

        <AddAttributeDialog
          open={addDialogShown}
          onResult={handleAddResult}
          definitions={definitions}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default EditAttributesAccordion;
