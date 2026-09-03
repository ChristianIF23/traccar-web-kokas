import { useState, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const AddAttributeDialog = ({ open, onResult, definitions }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const filter = createFilterOptions({
    stringify: (option) =>
      typeof option === 'object' ? `${option.name} ${option.key || ''}` : option,
  });

  const options = useMemo(
    () =>
      Object.entries(definitions)
        .map(([key, value]) => ({
          key,
          name: value.name || key,
          type: value.type,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [definitions],
  );

  const [key, setKey] = useState();
  const [type, setType] = useState('string');

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '16px',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          {t('sharedAddAttribute') || t('sharedAttributes')}
        </Typography>
      </DialogTitle>

      <DialogContent className={classes.details}>
        <Autocomplete
          freeSolo
          size="small"
          onChange={(_, option) => {
            setKey(
              option && typeof option === 'object' ? (option.key ?? option.inputValue) : option,
            );
            if (option && (option.type || option.inputValue)) {
              setType(option.type);
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
            option && typeof option === 'object' ? option.inputValue || option.name : option
          }
          renderOption={(props, option) => (
            <li {...props}>
              <Typography variant="body2">{option.name || option}</Typography>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('sharedAttribute')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          )}
        />

        <FormControl fullWidth size="small" disabled={key in definitions}>
          <InputLabel>{t('sharedType')}</InputLabel>
          <Select
            label={t('sharedType')}
            value={type || 'string'}
            onChange={(e) => setType(e.target.value)}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="string">{t('sharedTypeString')}</MenuItem>
            <MenuItem value="number">{t('sharedTypeNumber')}</MenuItem>
            <MenuItem value="boolean">{t('sharedTypeBoolean')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onResult(null)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: (theme) => theme.palette.divider,
          }}
        >
          {t('sharedCancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!key}
          onClick={() => onResult({ key, type })}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          {t('sharedAdd')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAttributeDialog;
