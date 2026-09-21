import { useState, useMemo, useEffect } from 'react';
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
import { alpha } from '@mui/material/styles';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { useTranslation } from '../../common/components/LocalizationProvider';

const AddAttributeDialog = ({ open, onResult, definitions = {} }) => {
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

  const [key, setKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [type, setType] = useState('string');

  useEffect(() => {
    if (!open) {
      setKey('');
      setInputValue('');
      setType('string');
    }
  }, [open]);

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={() => onResult(null)}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '16px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.9)
                : alpha(theme.palette.background.paper, 0.96),
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.08)
                  : alpha(theme.palette.common.black, 0.06)
              }`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                : '0 12px 32px rgba(15, 23, 42, 0.08)',
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          {t('sharedAddAttribute') || t('sharedAttributes')}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          px: 2.5,
          py: 1.5,
        }}
      >
        <Autocomplete
          freeSolo
          size="small"
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
            setKey(newInputValue);
          }}
          onChange={(_, option) => {
            if (option && typeof option === 'object') {
              const selectedKey = option.key ?? option.inputValue ?? '';
              setKey(selectedKey);
              if (option.type) {
                setType(option.type);
              }
            } else if (typeof option === 'string') {
              setKey(option);
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
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.inputValue || option.name || option.key || '';
          }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.92)
                    : alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.08)
                      : alpha(theme.palette.common.black, 0.06)
                  }`,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                    : '0 8px 32px rgba(15, 23, 42, 0.08)',
              },
            },
          }}
          renderOption={(props, option) => {
            const { key: optionKey, ...otherProps } = props;
            return (
              <li key={optionKey || option.key || option.inputValue || option} {...otherProps}>
                <Typography variant="body2" fontWeight={500}>
                  {option.name || option}
                </Typography>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label={t('sharedAttribute')} sx={inputStyle} />
          )}
        />

        <FormControl
          fullWidth
          size="small"
          disabled={Boolean(key && key in definitions)}
          sx={inputStyle}
        >
          <InputLabel>{t('sharedType')}</InputLabel>
          <Select
            label={t('sharedType')}
            value={type || 'string'}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="string">{t('sharedTypeString')}</MenuItem>
            <MenuItem value="number">{t('sharedTypeNumber')}</MenuItem>
            <MenuItem value="boolean">{t('sharedTypeBoolean')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => onResult(null)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 0.8,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          {t('sharedCancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!key.trim()}
          onClick={() => onResult({ key: key.trim(), type })}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 0.8,
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
            '&:hover': {
              boxShadow: (theme) => `0 6px 18px ${alpha(theme.palette.primary.main, 0.45)}`,
            },
          }}
        >
          {t('sharedAdd')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAttributeDialog;
