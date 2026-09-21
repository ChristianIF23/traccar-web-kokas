import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';

const ColumnSelect = ({ columns = [], setColumns, columnsArray = [], rawValues, disabled }) => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  // Helper untuk mendapatkan label yang sudah diterjemahkan
  const getColumnLabel = (key) => {
    const item = columnsArray.find(([k]) => k === key);
    if (!item) return key;
    const [, string] = item;
    return rawValues ? string : t(string);
  };

  return (
    <div className={classes.filterItem}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="column-select-label">{t('sharedColumns')}</InputLabel>
        <Select
          labelId="column-select-label"
          label={t('sharedColumns')}
          value={Array.isArray(columns) ? columns : []}
          onChange={(e) => setColumns(e.target.value)}
          multiple
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={getColumnLabel(value)}
                  size="small"
                  sx={{ borderRadius: '6px', height: '22px', fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
          sx={{
            borderRadius: '10px',
            '& .MuiSelect-select': {
              py: '8.5px',
            },
          }}
        >
          {columnsArray.map(([key, string]) => {
            const isChecked = columns.includes(key);
            const labelText = rawValues ? string : t(string);

            return (
              <MenuItem key={key} value={key}>
                <Checkbox checked={isChecked} size="small" />
                <ListItemText primary={labelText} />
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default ColumnSelect;
