import { useEffect, useState } from 'react';
import { Autocomplete, TextField, Chip, Paper, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useAsyncTask } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()(() => ({
  autocompleteMultiple: {
    '& .MuiAutocomplete-inputRoot': {
      flexWrap: 'nowrap',
      overflow: 'hidden',
    },
    '& .MuiAutocomplete-input': {
      minWidth: '1px !important',
    },
    '& .MuiAutocomplete-tag .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

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
  const { classes } = useStyles();
  const [items, setItems] = useState();

  const findOption = (option) => {
    if (typeof option === 'object') {
      return option;
    }
    return items.find((obj) => keyGetter(obj) === option);
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
        className={multiple && singleLine ? classes.autocompleteMultiple : undefined}
        options={items}
        getOptionLabel={getOptionLabel}
        PaperComponent={(paperProps) => (
          <Paper
            elevation={0}
            {...paperProps}
            sx={{
              mt: 0.75,
              borderRadius: '12px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              py: 0.5,
              ...paperProps.sx,
            }}
          />
        )}
        renderOption={({ key, ...optionProps }, option) => (
          <li
            key={keyGetter(option) || key}
            {...optionProps}
            style={{ ...optionProps.style, fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Typography variant="body2" noWrap>
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
                    variant="outlined"
                    sx={{
                      minWidth: 0,
                      height: 24,
                      borderRadius: '6px',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderColor: (theme) => theme.palette.divider,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                    }}
                  />
                  {tagValue.length > 1 && (
                    <Chip
                      label={`+${tagValue.length - 1}`}
                      size="small"
                      color="primary"
                      sx={{
                        flexShrink: 0,
                        height: 24,
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.725rem',
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
                borderRadius: '10px',
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
