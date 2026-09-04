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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import { useAttributePreference } from '../common/util/preferences';
import { distanceFromMeters, distanceToMeters, distanceUnitString } from '../common/util/converter';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const AccumulatorsPage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

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

  const accordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    mb: 2.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedDeviceAccumulators']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          {item && (
            <>
              <Accordion
                defaultExpanded
                disableGutters
                elevation={0}
                sx={accordionStyle}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('sharedRequired')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.details}
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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

              <Box
                className={classes.buttons}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: 'flex-end',
                  mt: 3,
                  pt: 2,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
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
                  type="button"
                  color="primary"
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3.5,
                    py: 1,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {t('sharedSave')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default AccumulatorsPage;
