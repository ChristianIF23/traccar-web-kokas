import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useRestriction } from '../../common/util/permissions';
import { useAsyncTask } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import { prefixString } from '../../common/util/stringUtils';
import useCommandAttributes from '../../common/attributes/useCommandAttributes';

const BaseCommandView = ({
  deviceId,
  item,
  setItem,
  includeSaved = false,
  savedId,
  setSavedId,
}) => {
  const t = useTranslation();
  const limitCommands = useRestriction('limitCommands');

  const textEnabled = useSelector((state) => state.session.server.textEnabled);

  const availableAttributes = useCommandAttributes(t);

  const [attributes, setAttributes] = useState([]);
  const [options, setOptions] = useState([]);

  useAsyncTask(
    async ({ signal }) => {
      if (includeSaved) {
        const savedResponse = await fetchOrThrow(`/api/commands/send?deviceId=${deviceId}`, {
          signal,
        });
        const saved = await savedResponse.json();
        let combined = saved.map((it) => ({ ...it, optionType: 'saved', key: `saved-${it.id}` }));
        if (!limitCommands) {
          const typesResponse = await fetchOrThrow(
            `/api/commands/types?${new URLSearchParams({ deviceId }).toString()}`,
            { signal },
          );
          const types = await typesResponse.json();
          combined = combined.concat(
            types.map((it) => ({ ...it, optionType: 'type', key: `type-${it.type}` })),
          );
        }
        setOptions(combined);
      } else {
        const typesResponse = await fetchOrThrow('/api/commands/types', { signal });
        const types = await typesResponse.json();
        setOptions(types.map((it) => ({ ...it, optionType: 'type', key: `type-${it.type}` })));
      }
    },
    [deviceId, includeSaved, limitCommands],
  );

  useEffect(() => {
    if (item && item.type) {
      setAttributes(availableAttributes[item.type] || []);
    } else {
      setAttributes([]);
    }
  }, [availableAttributes, item]);

  const handleSelect = (_, value) => {
    if (value?.optionType === 'saved') {
      setSavedId?.(value.id);
      setItem({});
    } else if (value?.type) {
      setSavedId?.(0);
      const defaults = {};
      availableAttributes[value.type]?.forEach((attribute) => {
        switch (attribute.type) {
          case 'boolean':
            defaults[attribute.key] = false;
            break;
          case 'number':
            defaults[attribute.key] = 0;
            break;
          default:
            defaults[attribute.key] = '';
            break;
        }
      });
      setItem({ ...item, type: value.type, attributes: defaults });
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      <Autocomplete
        size="small"
        fullWidth
        options={options}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
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
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                  : '0 8px 32px rgba(15, 23, 42, 0.08)',
            },
          },
        }}
        groupBy={
          includeSaved
            ? (option) =>
                option.optionType === 'saved' ? t('sharedSavedCommands') : t('sharedType')
            : null
        }
        getOptionLabel={(option) =>
          option.optionType === 'saved'
            ? option.description
            : t(prefixString('command', option.type))
        }
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key || option.key} {...optionProps}>
              <Typography variant="body2" fontWeight={500}>
                {option.optionType === 'saved'
                  ? option.description
                  : t(prefixString('command', option.type))}
              </Typography>
            </li>
          );
        }}
        isOptionEqualToValue={(option, value) => option.key === value?.key}
        value={
          savedId
            ? options.find((it) => it.optionType === 'saved' && it.id === savedId) || null
            : options.find((it) => it.optionType === 'type' && it.type === item.type) || null
        }
        onChange={handleSelect}
        renderInput={(params) => <TextField {...params} label={t('sharedType')} sx={inputStyle} />}
      />

      {(!includeSaved || !savedId) &&
        attributes.map(({ key, name, type }) => {
          if (type === 'boolean') {
            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 0.75,
                  px: 2,
                  borderRadius: '10px',
                  border: (theme) =>
                    `1px solid ${
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.08)
                        : alpha(theme.palette.common.black, 0.06)
                    }`,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.03)
                      : alpha(theme.palette.common.black, 0.02),
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(item.attributes?.[key])}
                      onChange={(e) => {
                        const updateItem = { ...item, attributes: { ...item.attributes } };
                        updateItem.attributes[key] = e.target.checked;
                        setItem(updateItem);
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {name}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
            );
          }
          return (
            <TextField
              key={key}
              size="small"
              type={type === 'number' ? 'number' : 'text'}
              value={item.attributes?.[key] ?? ''}
              onChange={(e) => {
                const updateItem = { ...item, attributes: { ...item.attributes } };
                const val = e.target.value;
                updateItem.attributes[key] =
                  type === 'number' ? (val === '' ? '' : Number(val)) : val;
                setItem(updateItem);
              }}
              label={name}
              fullWidth
              sx={inputStyle}
            />
          );
        })}

      {(textEnabled || !item.textChannel) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}>
          {textEnabled && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.textChannel)}
                  onChange={(e) => setItem({ ...item, textChannel: e.target.checked })}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {t('commandSendSms')}
                </Typography>
              }
            />
          )}

          {!item.textChannel && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(item.attributes?.noQueue)}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      attributes: { ...item?.attributes, noQueue: e.target.checked },
                    })
                  }
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {t('commandNoQueue')}
                </Typography>
              }
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default BaseCommandView;
