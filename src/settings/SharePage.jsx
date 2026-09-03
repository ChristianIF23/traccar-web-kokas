import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  TextField,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatchCallback } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const SharePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { type, id } = useParams();

  const item = useSelector((state) =>
    type === 'group' ? state.groups.items[id] : state.devices.items[id],
  );

  const [expiration, setExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [link, setLink] = useState();

  const handleShare = useCatchCallback(async () => {
    const expirationTime = dayjs(expiration).toISOString();
    const response = await fetchOrThrow(`/api/share/${type}`, {
      method: 'POST',
      body: new URLSearchParams(`${type}Id=${id}&expiration=${expirationTime}`),
    });
    const token = await response.text();
    setLink(`${window.location.origin}?token=${token}`);
  }, [id, expiration, type, setLink]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedShare']}>
      <Container maxWidth="sm" className={classes.container} sx={{ py: 2 }}>
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '16px !important',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 3,
              py: 0.5,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              value={item?.name || ''}
              label={t(type === 'group' ? 'groupDialog' : 'sharedDevice')}
              disabled
              fullWidth
            />
            <TextField
              label={t('userExpirationTime')}
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleShare}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                py: 1,
              }}
            >
              {t('reportShow')}
            </Button>
            <TextField
              value={link || ''}
              onChange={(e) => setLink(e.target.value)}
              label={t('sharedLink')}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
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
            onClick={() => navigator.clipboard?.writeText(link)}
            disabled={!link}
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
            {t('sharedCopy')}
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default SharePage;
