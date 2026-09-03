import dayjs from 'dayjs';
import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatchCallback } from '../reactHelper';
import { useAttributePreference } from '../common/util/preferences';
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  speedToKnots,
  volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const ChartReportPage = () => {
  const { classes } = useReportStyles();
  const theme = useTheme();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['speed']);
  const [selectedTypes, setSelectedTypes] = useState(['speed']);
  const [timeType, setTimeType] = useState('fixTime');

  const values = items.map((it) =>
    selectedTypes.map((type) => it[type]).filter((value) => value != null),
  );
  const minValue = values.length ? Math.min(...values.flat()) : 0;
  const maxValue = values.length ? Math.max(...values.flat()) : 100;
  const valueRange = maxValue - minValue;

  const onShow = useCatchCallback(
    async ({ deviceIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      const response = await fetchOrThrow(`/api/reports/route?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const positions = await response.json();
      const keySet = new Set();
      const keyList = [];
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = dayjs(position.fixTime).valueOf();
        formatted.deviceTime = dayjs(position.deviceTime).valueOf();
        formatted.serverTime = dayjs(position.serverTime).valueOf();
        Object.keys(data)
          .filter((key) => !['id', 'deviceId'].includes(key))
          .forEach((key) => {
            const value = data[key];
            if (typeof value === 'number') {
              keySet.add(key);
              const definition = positionAttributes[key] || {};
              switch (definition.dataType) {
                case 'speed':
                  if (key === 'obdSpeed') {
                    formatted[key] = speedFromKnots(speedToKnots(value, 'kmh'), speedUnit).toFixed(2);
                  } else {
                    formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                  }
                  break;
                case 'altitude':
                  formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                  break;
                case 'distance':
                  formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                  break;
                case 'volume':
                  formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                  break;
                case 'hours':
                  formatted[key] = (value / 1000).toFixed(2);
                  break;
                default:
                  formatted[key] = value;
                  break;
              }
            }
          });
        return formatted;
      });
      Object.keys(positionAttributes).forEach((key) => {
        if (keySet.has(key)) {
          keyList.push(key);
          keySet.delete(key);
        }
      });
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
    },
    [positionAttributes, speedUnit, altitudeUnit, distanceUnit, volumeUnit],
  );

  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.text.secondary,
  ];

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <div className={classes.header}>
        <ReportFilter onShow={onShow} onExport={() => { }} deviceType="single" formats={[]}>
          <div className={classes.filterItem}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('reportChartType')}</InputLabel>
              <Select
                label={t('reportChartType')}
                value={selectedTypes}
                onChange={(e) => setSelectedTypes(e.target.value)}
                multiple
                disabled={!items.length}
                sx={{ borderRadius: '10px' }}
              >
                {types.map((key) => (
                  <MenuItem key={key} value={key}>
                    {positionAttributes[key]?.name || key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.filterItem}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('reportTimeType')}</InputLabel>
              <Select
                label={t('reportTimeType')}
                value={timeType}
                onChange={(e) => setTimeType(e.target.value)}
                disabled={!items.length}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="fixTime">{t('positionFixTime')}</MenuItem>
                <MenuItem value="deviceTime">{t('positionDeviceTime')}</MenuItem>
                <MenuItem value="serverTime">{t('positionServerTime')}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </ReportFilter>
      </div>

      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, pt: 0, width: '100%', flexGrow: 1, minHeight: 0 }}>
        {items.length > 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              height: 'calc(100vh - 210px)',
              minHeight: 450,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={items}
                margin={{
                  top: 15,
                  right: 35,
                  left: 10,
                  bottom: 10,
                }}
              >
                <XAxis
                  stroke={theme.palette.text.secondary}
                  dataKey={timeType}
                  type="number"
                  tickFormatter={(value) => formatTime(value, 'time')}
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  type="number"
                  tickFormatter={(value) => parseFloat(value.toFixed(2))}
                  domain={[minValue - valueRange / 5, maxValue + valueRange / 5]}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: '10px',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(value, key) => [value, positionAttributes[key]?.name || key]}
                  labelFormatter={(value) => formatTime(value, 'seconds')}
                />
                <Brush
                  dataKey={timeType}
                  height={32}
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9'}
                  tickFormatter={() => ''}
                />
                {selectedTypes.map((type, index) => (
                  <Line
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={colorPalette[index % colorPalette.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 380,
              backgroundColor: theme.palette.background.paper,
              textAlign: 'center',
            }}
          >
            <ShowChartIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
              {t('sharedNoData')}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360, mt: 0.5 }}>
              Pilih perangkat dan rentang waktu pada filter di atas, lalu klik tampilkan untuk melihat grafik data.
            </Typography>
          </Paper>
        )}
      </Box>
    </PageLayout>
  );
};

export default ChartReportPage;
