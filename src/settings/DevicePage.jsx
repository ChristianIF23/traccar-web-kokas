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
} from '@mui/material';
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
import useSettingsStyles from './common/useSettingsStyles';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const DevicePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

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

  const validate = () => item && item.name && item.uniqueId;

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
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <>
          <Accordion defaultExpanded elevation={0} disableGutters sx={accordionStyle}>
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
                sx={inputStyle}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion elevation={0} disableGutters sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              className={classes.details}
              sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={item.disabled}
                    onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                  />
                }
                label={<Typography variant="body2">{t('sharedDisabled')}</Typography>}
                disabled={!manager}
                sx={{ pt: 0.5 }}
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<QrCode2Icon />}
                onClick={() => setShowQr(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  px: 2.5,
                  alignSelf: 'flex-start',
                }}
              >
                {t('sharedQrCode')}
              </Button>
            </AccordionDetails>
          </Accordion>

          {item.id && (
            <Accordion elevation={0} disableGutters sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('attributeDeviceImage')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                className={classes.details}
                sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
