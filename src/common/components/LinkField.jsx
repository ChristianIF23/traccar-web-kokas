import { Autocomplete, Snackbar, Alert, TextField } from '@mui/material';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { useCatchCallback, useAsyncTask } from '../../reactHelper';
import { snackBarDurationShortMs } from '../util/duration';
import { useTranslation } from './LocalizationProvider';
import fetchOrThrow from '../util/fetchOrThrow';

const defaultTitleGetter = (item) => item.name;

const LinkField = ({
  label,
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
  titleGetter = defaultTitleGetter,
}) => {
  const t = useTranslation();
  const [active, setActive] = useState(false);
  const [items, setItems] = useState();
  const [linked, setLinked] = useState();
  const [updated, setUpdated] = useState(false);

  useAsyncTask(
    async ({ signal }) => {
      if (active) {
        const response = await fetchOrThrow(endpointAll, { signal });
        setItems(await response.json());
      }
    },
    [active, endpointAll],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (active) {
        const response = await fetchOrThrow(endpointLinked, { signal });
        setLinked(await response.json());
      }
    },
    [active, endpointLinked],
  );

  const onChange = useCatchCallback(
    async (value) => {
      const createBody = (linkId) => ({ [keyBase]: baseId, [keyLink]: linkId });
      const oldValue = linked.map((it) => it.id);
      const newValue = value.map((it) => it.id);
      if (!newValue.find((it) => it < 0)) {
        const results = [];
        newValue
          .filter((it) => !oldValue.includes(it))
          .forEach((added) => {
            results.push(
              fetchOrThrow('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createBody(added)),
              }),
            );
          });
        oldValue
          .filter((it) => !newValue.includes(it))
          .forEach((removed) => {
            results.push(
              fetchOrThrow('/api/permissions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createBody(removed)),
              }),
            );
          });
        await Promise.all(results);
        setUpdated(results.length > 0);
        setLinked(value);
      }
    },
    [linked, baseId, keyBase, keyLink],
  );

  return (
    <>
      <Autocomplete
        size="small"
        loading={active && !items}
        isOptionEqualToValue={(i1, i2) => i1.id === i2.id}
        options={items || []}
        getOptionLabel={(item) => titleGetter(item)}
        slotProps={{
          chip: {
            size: 'small',
            sx: {
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.75rem',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.25) : alpha('#1d4ed8', 0.08),
              color: '#1d4ed8',
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.4) : alpha('#1d4ed8', 0.2)
                }`,
              '& .MuiChip-deleteIcon': {
                color: '#1d4ed8',
                '&:hover': {
                  color: '#1e40af',
                },
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={!active ? t('reportShow') : null}
            onFocus={() => setActive(true)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                transition: 'all 0.2s ease',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#0f172a', 0.5) : '#ffffff',
                '& fieldset': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(15, 23, 42, 0.12)',
                },
                '&:hover fieldset': {
                  borderColor: '#1d4ed8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1d4ed8',
                  borderWidth: 1.5,
                },
              },
            }}
            slotProps={{
              ...params.slotProps,
              inputLabel: {
                ...params.slotProps?.inputLabel,
                shrink: !active || params.slotProps?.inputLabel?.shrink,
              },
            }}
          />
        )}
        value={(items && linked) || []}
        onChange={(_, value) => onChange(value)}
        multiple
      />

      <Snackbar
        open={Boolean(updated)}
        onClose={() => setUpdated(false)}
        autoHideDuration={snackBarDurationShortMs}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          elevation={0}
          onClose={() => setUpdated(false)}
          severity="success"
          sx={{
            borderRadius: '14px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.84rem',
            boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
            '& .MuiAlert-action': {
              color: '#ffffff',
            },
          }}
        >
          {t('sharedSaved')}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LinkField;
