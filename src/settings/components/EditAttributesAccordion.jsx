import { useState } from 'react';
import {
  Button,
  Checkbox,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
} from '@mui/material';
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
import useSettingsStyles from '../common/useSettingsStyles';

const EditAttributesAccordion = ({
  attribute,
  attributes,
  setAttributes,
  definitions,
  focusAttribute,
}) => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const features = useFeatures();

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

  return (
    <Accordion
      defaultExpanded={!!attribute}
      disableGutters
      elevation={0}
      sx={{
        borderRadius: '12px !important',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        '&::before': { display: 'none' },
        overflow: 'hidden',
        mt: 1.5,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
          minHeight: 48,
          '&.Mui-expanded': { minHeight: 48 },
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          {t('sharedAttributes')}
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {convertToList(attributes).map(({ key, value, type, dataType }) => {
          if (type === 'boolean') {
            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  px: 1.5,
                  borderRadius: '10px',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value}
                      onChange={(e) => updateAttribute(key, e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {getAttributeName(key, dataType)}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
                <IconButton
                  size="small"
                  onClick={() => deleteAttribute(key)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
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
                sx={{ borderRadius: '10px' }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => deleteAttribute(key)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' },
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
          color="primary"
          onClick={() => setAddDialogShown(true)}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            alignSelf: 'flex-start',
            px: 2,
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
