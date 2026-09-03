import Button from '@mui/material/Button';
import { Snackbar } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { snackBarDurationLongMs } from '../util/duration';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1.5)})`,
    },
    '& .MuiSnackbarContent-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#0f172a',
      color: '#f8fafc',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
      padding: theme.spacing(1, 2),
      fontSize: '0.9rem',
    },
  },
  button: {
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '4px 12px',
    color: '#f87171',
    '&:hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
  },
}));

const RemoveDialog = ({ open, endpoint, itemId, onResult }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const handleRemove = useCatch(async () => {
    await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    onResult(true);
  });

  return (
    <Snackbar
      className={classes.root}
      open={open}
      autoHideDuration={snackBarDurationLongMs}
      onClose={() => onResult(false)}
      message={t('sharedRemoveConfirm')}
      action={
        <Button
          size="small"
          className={classes.button}
          onClick={handleRemove}
        >
          {t('sharedRemove')}
        </Button>
      }
    />
  );
};

export default RemoveDialog;
