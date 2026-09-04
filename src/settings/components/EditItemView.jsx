import { useNavigate, useParams } from 'react-router-dom';
import {
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

  const skeletonAccordionStyle = {
    borderRadius: '16px !important',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    mb: 2.5,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    '&:before': { display: 'none' },
  };

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      {/* Kontainer Utama Pengatur Lebar & Padding Halaman */}
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        {/* Batas Konten 960px Simetris di Tengah */}
        <Box sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          {item ? (
            children
          ) : (
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              sx={skeletonAccordionStyle}
            >
              <AccordionSummary>
                <Typography variant="subtitle1" fontWeight={600}>
                  <Skeleton width="10em" height={28} />
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                className={classes.details}
                sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={-i} width="100%" height={44} sx={{ borderRadius: '10px' }}>
                    <TextField fullWidth size="small" />
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
              type="button"
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
              type="button"
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
        </Box>
      </Box>
    </PageLayout>
  );
};

export default EditItemView;
