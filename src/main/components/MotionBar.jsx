import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      width: theme.spacing(14),
      height: 6,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: isDark
        ? alpha(theme.palette.common.white, 0.08)
        : alpha(theme.palette.common.black, 0.06),
      border: `1px solid ${
        isDark ? alpha(theme.palette.common.white, 0.06) : alpha(theme.palette.common.black, 0.04)
      }`,
      verticalAlign: 'middle',
      boxSizing: 'border-box',
    },
    segment: {
      height: '100%',
      transition: 'opacity 0.15s ease',
      '&:hover': {
        opacity: 0.85,
      },
    },
    moving: {
      backgroundColor: theme.palette.success.main,
    },
    stopped: {
      backgroundColor: isDark ? alpha(theme.palette.error.main, 0.75) : theme.palette.error.light,
    },
  };
});

const MotionBar = ({ deviceId }) => {
  const { classes, cx } = useStyles();
  const t = useTranslation();
  const segments = useSelector((state) => state.motion?.items?.[deviceId] || []);

  if (!segments.length) {
    return null;
  }

  return (
    <Tooltip title={t('reportEvents') || 'Motion Timeline'} arrow enterDelay={400}>
      <span className={classes.root}>
        {segments.map((segment, segmentIndex) => (
          <span
            key={segmentIndex}
            style={{
              flexGrow: segment.value,
              minWidth: segments.length > 16 ? 0 : 3,
            }}
            className={cx(classes.segment, classes[segment.type])}
          />
        ))}
      </span>
    </Tooltip>
  );
};

export default MotionBar;
