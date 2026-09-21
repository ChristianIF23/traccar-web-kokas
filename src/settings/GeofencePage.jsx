import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditLocationAltRoundedIcon from '@mui/icons-material/EditLocationAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useGeofenceAttributes from '../common/attributes/useGeofenceAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { geofencesActions } from '../store';

const GeofencePage = () => {
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const geofenceAttributes = useGeofenceAttributes(t);
  const [item, setItem] = useState();

  const onItemSaved = (result) => {
    dispatch(geofencesActions.update([result]));
  };

  const validate = () => Boolean(item && item.name);

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
    mb: 2.5,
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
      endpoint="geofences"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedGeofence']}
    >
      {item && (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 1. Pengaturan Utama & Pratinjau Wilayah */}
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
                placeholder="Contoh: Area Gudang Distribusi 1"
                sx={inputStyle}
              />

              {/* Area Gambar Batas Wilayah Peta yang Terpadu */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  p: 2,
                  borderRadius: '14px',
                  backgroundColor: isDark ? alpha('#0f172a', 0.6) : '#ffffff',
                  border: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                  }`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapRoundedIcon sx={{ color: '#1d4ed8', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      Batas Geografis Peta
                    </Typography>
                  </Box>

                  {item.area ? (
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                      ✓ Koordinat Area Terdefinisi
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Belum ada koordinat area
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Tentukan batas zona digital untuk memantau waktu masuk dan keluar armada secara
                  otomatis.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditLocationAltRoundedIcon />}
                    onClick={() => {
                      // Simpan draft sementara dan alihkan ke mode floating atau editor peta
                      sessionStorage.setItem('pendingGeofence', JSON.stringify(item));
                      window.location.href = `/?geofenceEdit=${item.id || 'new'}`;
                    }}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#1d4ed8',
                      color: '#1d4ed8',
                      '&:hover': {
                        borderColor: '#1e40af',
                        backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                      },
                    }}
                  >
                    {item.area ? 'Ubah Bentuk Wilayah' : 'Tentukan Bentuk di Peta'}
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* 2. Pengaturan Ekstra */}
          <Accordion elevation={0} disableGutters sx={accordionCardStyle}>
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
                {t('sharedExtra')}
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
                value={item.description || ''}
                onChange={(event) => setItem({ ...item, description: event.target.value })}
                label={t('sharedDescription')}
                sx={inputStyle}
              />

              <SelectField
                fullWidth
                size="small"
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
                sx={inputStyle}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={Boolean(item.attributes?.hide)}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        attributes: { ...item.attributes, hide: e.target.checked },
                      })
                    }
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    {t('sharedFilterMap')}
                  </Typography>
                }
                sx={{ pt: 0.5 }}
              />
            </AccordionDetails>
          </Accordion>

          {/* 3. Atribut Kustom Geofence */}
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={geofenceAttributes}
          />
        </Box>
      )}
    </EditItemView>
  );
};

export default GeofencePage;
