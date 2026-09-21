import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import FileInput from '../common/components/FileInput';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useManager } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const DevicePage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const manager = useManager();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [searchParams] = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);
  const [showQr, setShowQr] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleFileInput = useCatch(async (newFile) => {
    setImageFile(newFile);
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: newFile,
      });
      setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
    } else if (!newFile) {
      // eslint-disable-next-line no-unused-vars
      const { deviceImage, ...remainingAttributes } = item.attributes || {};
      setItem({ ...item, attributes: remainingAttributes });
    }
  });

  const validate = () => Boolean(item && item.name && item.uniqueId);

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
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* 1. Pengaturan Wajib Perangkat */}
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
              <TextField
                fullWidth
                size="small"
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                helperText={t('deviceIdentifierHelp')}
                disabled={Boolean(uniqueId)}
                sx={{
                  ...inputStyle,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.86rem',
                  },
                }}
              />
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
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                }}
              >
                <SelectField
                  fullWidth
                  size="small"
                  value={item.groupId}
                  onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                  endpoint="/api/groups"
                  label={t('groupParent')}
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={item.phone || ''}
                  onChange={(event) => setItem({ ...item, phone: event.target.value })}
                  label={t('sharedPhone')}
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={item.model || ''}
                  onChange={(event) => setItem({ ...item, model: event.target.value })}
                  label={t('deviceModel')}
                  sx={inputStyle}
                />
                <TextField
                  fullWidth
                  size="small"
                  value={item.contact || ''}
                  onChange={(event) => setItem({ ...item, contact: event.target.value })}
                  label={t('deviceContact')}
                  sx={inputStyle}
                />
                <SelectField
                  fullWidth
                  size="small"
                  value={item.category || 'default'}
                  onChange={(event) => setItem({ ...item, category: event.target.value })}
                  data={deviceCategories
                    .map((category) => ({
                      id: category,
                      name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name))}
                  label={t('deviceCategory')}
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
              </Box>

              <TextField
                fullWidth
                size="small"
                label={t('userExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!manager}
                sx={inputStyle}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  pt: 0.5,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(item.disabled)}
                      onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                    />
                  }
                  label={<Typography variant="body2">{t('sharedDisabled')}</Typography>}
                  disabled={!manager}
                />

                <Button
                  variant="outlined"
                  startIcon={<QrCode2Icon />}
                  onClick={() => setShowQr(true)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 0.8,
                    px: 2.5,
                    borderColor: '#1d4ed8',
                    color: '#1d4ed8',
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: isDark ? alpha('#1d4ed8', 0.1) : alpha('#1d4ed8', 0.04),
                    },
                  }}
                >
                  {t('sharedQrCode')}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* 3. Foto / Gambar Perangkat */}
          {item.id && (
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
                  {t('attributeDeviceImage')}
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
                <FileInput
                  placeholder={t('attributeDeviceImage')}
                  value={imageFile}
                  onChange={handleFileInput}
                  slotProps={{ htmlInput: { accept: 'image/*' } }}
                />
              </AccordionDetails>
            </Accordion>
          )}

          {/* 4. Atribut Kustom Perangkat */}
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </Box>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
