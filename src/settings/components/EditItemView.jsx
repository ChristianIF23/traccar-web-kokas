import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import { useCatch, useAsyncTask } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import PageLayout from '../../common/components/PageLayout';
import useSettingsStyles from '../common/useSettingsStyles';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const EditItemView = ({
  children,
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  useAsyncTask(
    async ({ signal }) => {
      if (!item) {
        if (id) {
          const response = await fetchOrThrow(`/api/${endpoint}/${id}`, { signal });
          setItem(await response.json());
        } else {
          setItem(defaultItem || {});
        }
      }
    },
    [id, item, defaultItem, endpoint, setItem],
  );

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }

    const response = await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (onItemSaved) {
      onItemSaved(await response.json());
    }
    navigate(-1);
  });

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      <Container maxWidth={false} className={classes.container} sx={{ py: 2 }}>
        {item ? (
          children
        ) : (
          <Accordion
            defaultExpanded
            disableGutters
            elevation={0}
            sx={{
              borderRadius: '14px !important',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary>
              <Typography variant="subtitle1" fontWeight={600}>
                <Skeleton width="10em" height={28} />
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={-i} width="100%" height={56} sx={{ borderRadius: '10px' }}>
                  <TextField fullWidth />
                </Skeleton>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

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
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={!item}
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
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!item || !validate()}
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
      </Container>
    </PageLayout>
  );
};

export default EditItemView;
