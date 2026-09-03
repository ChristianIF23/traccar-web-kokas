import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import BaseCommandView from './components/BaseCommandView';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const CommandDevicePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const [savedId, setSavedId] = useState(0);
  const [item, setItem] = useState({});

  const handleSend = useCatch(async () => {
    let command;
    if (savedId) {
      const response = await fetchOrThrow(`/api/commands/${savedId}`);
      command = await response.json();
    } else {
      command = item;
    }

    command.deviceId = parseInt(id, 10);

    await fetchOrThrow('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    navigate(-1);
  });

  const validate = () => savedId || (item && item.type);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
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
          <AccordionDetails className={classes.details} sx={{ p: 3 }}>
            <BaseCommandView
              deviceId={id}
              item={item}
              setItem={setItem}
              includeSaved
              savedId={savedId}
              setSavedId={setSavedId}
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
            onClick={handleSend}
            disabled={!validate()}
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
            {t('commandSend')}
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default CommandDevicePage;
