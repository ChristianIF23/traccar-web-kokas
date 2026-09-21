import dayjs from 'dayjs';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileInput from '../common/components/FileInput';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { prefixString } from '../common/util/stringUtils';
import { calendarsActions } from '../store';
import { useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

const formatCalendarTime = (time) => {
  const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `TZID=${tzid}:${time.locale('en').format('YYYYMMDDTHHmmss')}`;
};

const parseRule = (rule) => {
  if (rule.endsWith('COUNT=1')) {
    return { frequency: 'ONCE' };
  }
  const fragments = rule.split(';');
  const frequency = fragments[0].substring(11);
  const by = fragments.length > 1 ? fragments[1].split('=')[1].split(',') : null;
  return { frequency, by };
};

const formatRule = (rule) => {
  const by = rule.by && rule.by.join(',');
  switch (rule.frequency) {
    case 'DAILY':
      return `RRULE:FREQ=${rule.frequency}`;
    case 'WEEKLY':
      return `RRULE:FREQ=${rule.frequency};BYDAY=${by || 'SU'}`;
    case 'MONTHLY':
      return `RRULE:FREQ=${rule.frequency};BYMONTHDAY=${by || 1}`;
    default:
      return 'RRULE:FREQ=DAILY;COUNT=1';
  }
};

const updateCalendar = (lines, index, element) =>
  window.btoa(lines.map((e, i) => (i !== index ? e : element)).join('\n'));

const simpleCalendar = () =>
  window.btoa(
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Traccar//NONSGML Traccar//EN',
      'BEGIN:VEVENT',
      'UID:00000000-0000-0000-0000-000000000000',
      `DTSTART;${formatCalendarTime(dayjs())}`,
      `DTEND;${formatCalendarTime(dayjs().add(1, 'hours'))}`,
      'RRULE:FREQ=DAILY',
      'SUMMARY:Event',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n'),
  );

const CalendarPage = () => {
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [item, setItem] = useState();
  const [file, setFile] = useState(null);

  const decoded = item && item.data && window.atob(item.data);
  const simple = decoded && decoded.indexOf('//Traccar//') > 0;
  const lines = decoded && decoded.split('\n');
  const rule = simple && parseRule(lines[7]);

  const handleFileChange = (newFile) => {
    setFile(newFile);
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { result } = event.target;
        setItem({ ...item, data: result.slice(result.indexOf(',') + 1) });
      };
      reader.readAsDataURL(newFile);
    }
  };

  const onItemSaved = useCatch(async () => {
    const response = await fetchOrThrow('/api/calendars');
    dispatch(calendarsActions.refresh(await response.json()));
  });

  const validate = () => Boolean(item && item.name && item.data);

  const accordionCardStyle = {
    borderRadius: '18px !important',
    border: (th) =>
      `1px solid ${
        th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
      }`,
    backgroundColor: (th) => (th.palette.mode === 'dark' ? '#162447' : '#ffffff'),
    boxShadow: (th) =>
      th.palette.mode === 'dark'
        ? '0 12px 30px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(15, 23, 42, 0.04)',
    overflow: 'hidden',
    mb: 2,
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: (th) => (th.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#ffffff'),
      '& fieldset': {
        borderColor: (th) =>
          th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
      },
      '&:hover fieldset': {
        borderColor: '#1d4ed8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1d4ed8',
      },
    },
  };

  return (
    <EditItemView
      endpoint="calendars"
      item={item}
      setItem={setItem}
      defaultItem={{ data: simpleCalendar() }}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedCalendar']}
    >
      {item && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* 1. Pengaturan Wajib Kalender */}
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionCardStyle}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
              sx={{
                px: 3,
                py: 1,
                borderBottom: `1px solid ${
                  isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'
                }`,
                '& .MuiAccordionSummary-content': { my: 1 },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                p: { xs: 2.5, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
                sx={inputStyle}
              />
              <FormControl fullWidth size="small" sx={inputStyle}>
                <InputLabel>{t('sharedType')}</InputLabel>
                <Select
                  label={t('sharedType')}
                  value={simple ? 'simple' : 'custom'}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      data: e.target.value === 'simple' ? simpleCalendar() : null,
                    })
                  }
                >
                  <MenuItem value="simple">{t('calendarSimple')}</MenuItem>
                  <MenuItem value="custom">{t('reportCustom')}</MenuItem>
                </Select>
              </FormControl>
              {simple ? (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label={t('reportFrom')}
                      type="datetime-local"
                      value={dayjs(lines[5].slice(-15)).locale('en').format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        const time = formatCalendarTime(dayjs(e.target.value, 'YYYY-MM-DDTHH:mm'));
                        setItem({ ...item, data: updateCalendar(lines, 5, `DTSTART;${time}`) });
                      }}
                      sx={inputStyle}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label={t('reportTo')}
                      type="datetime-local"
                      value={dayjs(lines[6].slice(-15)).locale('en').format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        const time = formatCalendarTime(dayjs(e.target.value, 'YYYY-MM-DDTHH:mm'));
                        setItem({ ...item, data: updateCalendar(lines, 6, `DTEND;${time}`) });
                      }}
                      sx={inputStyle}
                    />
                  </Box>
                  <FormControl fullWidth size="small" sx={inputStyle}>
                    <InputLabel>{t('calendarRecurrence')}</InputLabel>
                    <Select
                      label={t('calendarRecurrence')}
                      value={rule.frequency}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          data: updateCalendar(lines, 7, formatRule({ frequency: e.target.value })),
                        })
                      }
                    >
                      {['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'].map((it) => (
                        <MenuItem key={it} value={it}>
                          {t(prefixString('calendar', it.toLowerCase()))}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {['WEEKLY', 'MONTHLY'].includes(rule.frequency) && (
                    <FormControl fullWidth size="small" sx={inputStyle}>
                      <InputLabel>{t('calendarDays')}</InputLabel>
                      <Select
                        multiple
                        fullWidth
                        label={t('calendarDays')}
                        value={rule.by || []}
                        onChange={(e) =>
                          setItem({
                            ...item,
                            data: updateCalendar(
                              lines,
                              7,
                              formatRule({ ...rule, by: e.target.value }),
                            ),
                          })
                        }
                      >
                        {rule.frequency === 'WEEKLY'
                          ? [
                              'sunday',
                              'monday',
                              'tuesday',
                              'wednesday',
                              'thursday',
                              'friday',
                              'saturday',
                            ].map((it) => (
                              <MenuItem key={it} value={it.substring(0, 2).toUpperCase()}>
                                {t(prefixString('calendar', it))}
                              </MenuItem>
                            ))
                          : Array.from({ length: 31 }, (_, i) => i + 1).map((it) => (
                              <MenuItem key={it} value={String(it)}>
                                {it}
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              ) : (
                <FileInput
                  placeholder={t('sharedSelectFile')}
                  value={file}
                  onChange={handleFileChange}
                />
              )}
            </AccordionDetails>
          </Accordion>

          {/* 2. Atribut Kustom Kalender */}
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
        </Box>
      )}
    </EditItemView>
  );
};

export default CalendarPage;
