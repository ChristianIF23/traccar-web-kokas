import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import { useAttributePreference } from '../common/util/preferences';
import { distanceFromMeters, distanceToMeters, distanceUnitString } from '../common/util/converter';
import fetchOrThrow from '../common/util/fetchOrThrow';

const AccumulatorsPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const distanceUnit = useAttributePreference('distanceUnit');

  const { deviceId } = useParams();
  const position = useSelector((state) => state.session.positions[deviceId]);

  const [item, setItem] = useState();

  useEffect(() => {
    if (position && !item) {
      setItem({
        deviceId: parseInt(deviceId, 10),
        hours: position.attributes.hours || 0,
        totalDistance: position.attributes.totalDistance || 0,
      });
    }
  }, [deviceId, position, item]);

  const handleSave = useCatch(async () => {
    await fetchOrThrow(`/api/devices/${deviceId}/accumulators`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    navigate(-1);
  });

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? alpha('#0f172a', 0.8) : '#ffffff',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedDeviceAccumulators']}>
      <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto' }}>
        {item && (
          <>
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              sx={{
                borderRadius: '18px !important',
                border: `1px solid ${
                  isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                }`,
                backgroundColor: isDark ? '#162447' : '#ffffff',
                boxShadow: isDark
                  ? '0 12px 30px rgba(0, 0, 0, 0.45)'
                  : '0 8px 24px rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                mb: 2.5,
                '&:before': { display: 'none' },
              }}
            >
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
                  type="number"
                  value={item.hours / 3600000}
                  onChange={(event) =>
                    setItem({ ...item, hours: Number(event.target.value) * 3600000 })
                  }
                  label={t('positionHours')}
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={distanceFromMeters(item.totalDistance, distanceUnit)}
                  onChange={(event) =>
                    setItem({
                      ...item,
                      totalDistance: distanceToMeters(Number(event.target.value), distanceUnit),
                    })
                  }
                  label={`${t('deviceTotalDistance')} (${distanceUnitString(distanceUnit, t)})`}
                  sx={inputStyle}
                />
              </AccordionDetails>
            </Accordion>

            {/* Footer Tombol Aksi Bawah */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: 'flex-end',
                pt: 1,
                pb: 2,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.14)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    color: '#1d4ed8',
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                  },
                }}
              >
                {t('sharedCancel')}
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(29, 78, 216, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#1e40af',
                    boxShadow: '0 6px 18px rgba(29, 78, 216, 0.4)',
                  },
                }}
              >
                {t('sharedSave')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default AccumulatorsPage;
