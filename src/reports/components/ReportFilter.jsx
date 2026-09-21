import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';
import { deviceEquality } from '../../common/util/deviceEquality';

export const updateReportParams = (searchParams, setSearchParams, key, values) => {
  const newParams = new URLSearchParams(searchParams);
  newParams.delete(key);
  newParams.delete('from');
  newParams.delete('to');

  const valueList = Array.isArray(values) ? values : [values];
  valueList.forEach((value) => {
    if (value !== undefined && value !== null && value !== '') {
      newParams.append(key, value);
    }
  });

  setSearchParams(newParams, { replace: true });
};

const ReportFilter = ({ children, onShow, onExport, onSchedule, deviceType, loading, formats }) => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));
  const groups = useSelector((state) => state.groups.items);

  const deviceList = useMemo(
    () => [
      { id: 'all', name: t('notificationAlways') },
      ...Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)),
    ],
    [devices, t],
  );

  const groupList = useMemo(
    () => Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );

  const deviceIds = useMemo(
    () => searchParams.getAll('deviceId').map((it) => (it === 'all' ? it : Number(it))),
    [searchParams],
  );

  const groupIds = useMemo(() => searchParams.getAll('groupId').map(Number), [searchParams]);

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState(() =>
    dayjs().subtract(1, 'hour').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [customTo, setCustomTo] = useState(() => dayjs().locale('en').format('YYYY-MM-DDTHH:mm'));
  const [selectedOption, setSelectedOption] = useState('json');

  const [description, setDescription] = useState('');
  const [calendarId, setCalendarId] = useState();

  const evaluateDisabled = useCallback(() => {
    if (deviceType === 'single' && !deviceIds.length) {
      return true;
    }
    if (deviceType === 'multiple' && !deviceIds.length && !groupIds.length) {
      return true;
    }
    if (selectedOption === 'schedule' && (!description || !calendarId)) {
      return true;
    }
    return loading;
  }, [
    deviceType,
    deviceIds.length,
    groupIds.length,
    selectedOption,
    description,
    calendarId,
    loading,
  ]);

  const disabled = evaluateDisabled();
  const loaded = Boolean(from && to && !loading);

  const evaluateOptions = useCallback(() => {
    const result = {
      json: t('reportShow'),
    };
    if (onExport && loaded && formats) {
      formats.forEach((format) => {
        result[format] = `${t('reportExport')} (${format.toUpperCase()})`;
      });
      result.print = t('reportPrint');
    }
    if (onSchedule && !readonly) {
      result.schedule = t('reportSchedule');
    }
    return result;
  }, [t, onExport, loaded, formats, onSchedule, readonly]);

  const options = evaluateOptions();

  const serializedDeviceIds = JSON.stringify(deviceIds);
  const serializedGroupIds = JSON.stringify(groupIds);

  useEffect(() => {
    if (from && to) {
      const filteredDeviceIds = deviceIds.filter((it) => it !== 'all');
      onShow({ deviceIds: filteredDeviceIds, groupIds, from, to });
    }
    // eslint-disable-next-deps
  }, [serializedDeviceIds, serializedGroupIds, from, to]);

  const showReport = () => {
    let selectedFrom;
    let selectedTo;
    switch (period) {
      case 'today':
        selectedFrom = dayjs().startOf('day');
        selectedTo = dayjs().endOf('day');
        break;
      case 'yesterday':
        selectedFrom = dayjs().subtract(1, 'day').startOf('day');
        selectedTo = dayjs().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        selectedFrom = dayjs().startOf('week');
        selectedTo = dayjs().endOf('week');
        break;
      case 'previousWeek':
        selectedFrom = dayjs().subtract(1, 'week').startOf('week');
        selectedTo = dayjs().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        selectedFrom = dayjs().startOf('month');
        selectedTo = dayjs().endOf('month');
        break;
      case 'previousMonth':
        selectedFrom = dayjs().subtract(1, 'month').startOf('month');
        selectedTo = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        selectedFrom = dayjs(customFrom, 'YYYY-MM-DDTHH:mm');
        selectedTo = dayjs(customTo, 'YYYY-MM-DDTHH:mm');
        break;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set('from', selectedFrom.toISOString());
    newParams.set('to', selectedTo.toISOString());
    setSearchParams(newParams, { replace: true });
  };

  const onSelected = (type) => {
    switch (type) {
      case 'xlsx':
      case 'csv':
      case 'gpx':
      case 'kml':
      case 'kmz':
        if (onExport) {
          onExport({
            deviceIds: deviceIds.filter((it) => it !== 'all'),
            groupIds,
            from,
            to,
            format: type,
          });
        }
        break;
      case 'print':
        window.print();
        break;
      default:
        setSelectedOption(type);
        break;
    }
  };

  const onClick = (type) => {
    switch (type) {
      case 'schedule':
        if (onSchedule) {
          onSchedule(
            deviceIds.filter((it) => it !== 'all'),
            groupIds,
            {
              description,
              calendarId,
              attributes: {},
            },
          );
        }
        break;
      case 'json':
      default:
        showReport();
        break;
    }
  };

  // Style tombol Dark Navy yang tegas dan pas tinggi-lebarnya
  const buttonStyle = {
    height: 40,
    borderRadius: '10px',
    boxShadow: 'none',
    backgroundColor: '#1a2b4c',
    color: '#ffffff !important',
    textTransform: 'none',
    fontWeight: 700,
    px: 2,
    '&:hover': {
      backgroundColor: '#121e36',
      boxShadow: 'none',
    },
    '& .MuiButton-root': {
      height: '100%',
      backgroundColor: '#1a2b4c',
      color: '#ffffff !important',
      fontWeight: 700,
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: '#121e36',
        boxShadow: 'none',
      },
    },
    '& .MuiButtonGroup-grouped:not(:last-of-type)': {
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '& .MuiSvgIcon-root': {
      color: '#ffffff',
    },
  };

  return (
    <div
      className={classes.filter}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      {deviceType !== 'none' && (
        <div className={classes.filterItem} style={{ minWidth: 160, flex: 1 }}>
          <SelectField
            label={t(deviceType === 'multiple' ? 'deviceTitle' : 'reportDevice')}
            data={
              deviceType === 'multiple' ? deviceList : deviceList.filter((it) => it.id !== 'all')
            }
            value={deviceType === 'multiple' ? deviceIds : (deviceIds[0] ?? '')}
            allValue="all"
            onChange={(e) => {
              const values =
                deviceType === 'multiple' ? e.target.value : [e.target.value].filter(Boolean);
              updateReportParams(searchParams, setSearchParams, 'deviceId', values);
            }}
            multiple={deviceType === 'multiple'}
            singleLine={deviceType === 'multiple'}
            fullWidth
          />
        </div>
      )}
      {deviceType === 'multiple' && (
        <div className={classes.filterItem} style={{ minWidth: 160, flex: 1 }}>
          <SelectField
            label={t('settingsGroups')}
            data={groupList}
            value={groupIds}
            onChange={(e) => {
              const values = e.target.value;
              updateReportParams(searchParams, setSearchParams, 'groupId', values);
            }}
            multiple
            singleLine
            fullWidth
          />
        </div>
      )}
      {selectedOption !== 'schedule' ? (
        <>
          <div className={classes.filterItem} style={{ minWidth: 140, flex: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('reportPeriod')}</InputLabel>
              <Select
                label={t('reportPeriod')}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                sx={{ borderRadius: '10px', height: 40 }}
              >
                <MenuItem value="today">{t('reportToday')}</MenuItem>
                <MenuItem value="yesterday">{t('reportYesterday')}</MenuItem>
                <MenuItem value="thisWeek">{t('reportThisWeek')}</MenuItem>
                <MenuItem value="previousWeek">{t('reportPreviousWeek')}</MenuItem>
                <MenuItem value="thisMonth">{t('reportThisMonth')}</MenuItem>
                <MenuItem value="previousMonth">{t('reportPreviousMonth')}</MenuItem>
                <MenuItem value="custom">{t('reportCustom')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem} style={{ minWidth: 180, flex: 1 }}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                size="small"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 40 } }}
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem} style={{ minWidth: 180, flex: 1 }}>
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                size="small"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 40 } }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem} style={{ minWidth: 180, flex: 1 }}>
            <TextField
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              label={t('sharedDescription')}
              size="small"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 40 } }}
            />
          </div>
          <div className={classes.filterItem} style={{ minWidth: 180, flex: 1 }}>
            <SelectField
              value={calendarId ?? ''}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t('sharedCalendar')}
              fullWidth
            />
          </div>
        </>
      )}
      {children}

      {/* Tombol Show sejajar di ujung kanan baris filter */}
      <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
        {Object.keys(options).length === 1 ? (
          <Button
            variant="contained"
            disabled={disabled}
            onClick={() => onClick(selectedOption)}
            sx={{ ...buttonStyle, minWidth: '130px' }}
          >
            <Typography variant="button" noWrap sx={{ color: '#ffffff', fontWeight: 700 }}>
              {t(loading ? 'sharedLoading' : 'reportShow')}
            </Typography>
          </Button>
        ) : (
          <SplitButton
            variant="contained"
            disabled={disabled}
            onClick={onClick}
            selected={selectedOption}
            setSelected={onSelected}
            options={options}
            sx={{ ...buttonStyle, minWidth: '150px' }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
