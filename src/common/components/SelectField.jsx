import { useEffect, useState } from 'react';
import { Autocomplete, TextField, Chip, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAsyncTask } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';

const SelectField = ({
  label,
  fullWidth,
  multiple,
  value = null,
  emptyValue = null,
  emptyTitle = '',
  onChange,
  endpoint,
  data,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
  helperText,
  placeholder,
  singleLine,
  allValue,
  sx,
  ...props
}) => {
  const [items, setItems] = useState();

  const findOption = (option) => {
    if (typeof option === 'object') {
      return option;
    }
    return items?.find((obj) => keyGetter(obj) === option);
  };

  const getOptionLabel = (option) => {
    option = findOption(option);
    return option ? titleGetter(option) : emptyTitle;
  };

  useEffect(() => setItems(data), [data]);

  useAsyncTask(
    async ({ signal }) => {
      if (endpoint) {
        const response = await fetchOrThrow(endpoint, { signal });
        setItems(await response.json());
      }
    },
    [endpoint],
  );

  if (items) {
    const autocompleteValue = multiple
      ? (value || []).map((it) => findOption(it)).filter((it) => it != null)
      : findOption(value) || null;

    return (
      <Autocomplete
        size={singleLine ? 'small' : 'medium'}
        multiple={multiple}
        options={items}
        getOptionLabel={getOptionLabel}
        PaperComponent={(paperProps) => (
          <Paper
            elevation={0}
            {...paperProps}
            sx={{
              mt: 1,
              borderRadius: '16px',
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(15, 23, 42, 0.08)'
                }`,
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#162447' : '#ffffff'),
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 16px 36px -4px rgba(0, 0, 0, 0.7)'
                  : '0 16px 36px -4px rgba(15, 23, 42, 0.12)',
              overflow: 'hidden',
              py: 0.75,
              ...paperProps.sx,
            }}
          />
        )}
        renderOption={({ key, ...optionProps }, option) => (
          <li
            key={keyGetter(option) || key}
            {...optionProps}
            style={{
              ...optionProps.style,
              fontSize: '0.86rem',
              padding: '9px 16px',
              borderRadius: '8px',
              margin: '2px 6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
              {titleGetter(option)}
            </Typography>
          </li>
        )}
        isOptionEqualToValue={(option, selectedOption) =>
          keyGetter(option) === keyGetter(selectedOption)
        }
        value={autocompleteValue}
        onChange={(_, selectedValue) => {
          if (multiple) {
            let nextValue = selectedValue.map((item) => keyGetter(item));
            if (allValue && nextValue.length > 1) {
              const previousHadAll = (value || []).includes(allValue);
              if (nextValue.includes(allValue)) {
                nextValue = previousHadAll ? nextValue.filter((it) => it !== allValue) : [allValue];
              }
            }
            onChange({ target: { value: nextValue } });
          } else {
            onChange({ target: { value: selectedValue ? keyGetter(selectedValue) : emptyValue } });
          }
        }}
        renderValue={
          multiple && singleLine
            ? (tagValue, getItemProps) => {
                if (!tagValue.length) {
                  return null;
                }
                return (
                  <>
                    <Chip
                      key={keyGetter(tagValue[0])}
                      {...getItemProps({ index: 0 })}
                      label={titleGetter(tagValue[0])}
                      size="small"
                      sx={{
                        minWidth: 0,
                        height: 24,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.74rem',
                        color: '#1d4ed8',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha('#1d4ed8', 0.2)
                            : alpha('#1d4ed8', 0.08),
                        border: (theme) =>
                          `1px solid ${
                            theme.palette.mode === 'dark'
                              ? alpha('#1d4ed8', 0.35)
                              : alpha('#1d4ed8', 0.18)
                          }`,
                      }}
                    />
                    {tagValue.length > 1 && (
                      <Chip
                        label={`+${tagValue.length - 1}`}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          height: 24,
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          backgroundColor: '#1d4ed8',
                          color: '#ffffff',
                          px: 0.5,
                        }}
                      />
                    )}
                  </>
                );
              }
            : undefined
        }
        fullWidth={fullWidth}
        disableCloseOnSelect={multiple}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            helperText={helperText}
            placeholder={multiple && !autocompleteValue.length ? placeholder : undefined}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
                transition: 'all 0.2s ease',
                '& fieldset': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(15, 23, 42, 0.12)',
                },
                '&:hover fieldset': {
                  borderColor: '#1d4ed8',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.12)',
                  '& fieldset': {
                    borderColor: '#1d4ed8',
                    borderWidth: 1.5,
                  },
                },
              },
              ...sx,
            }}
            slotProps={{
              ...params.slotProps,
              inputLabel: {
                ...params.slotProps?.inputLabel,
                shrink:
                  (multiple && !autocompleteValue.length && Boolean(placeholder)) ||
                  params.slotProps?.inputLabel?.shrink,
              },
            }}
          />
        )}
        {...props}
      />
    );
  }
  return null;
};

export default SelectField;
