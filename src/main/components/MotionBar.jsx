import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'inline-flex',
    width: theme.spacing(14),
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    verticalAlign: 'middle',
  },
  moving: {
    backgroundColor: theme.palette.success.main,
  },
  stopped: {
    backgroundColor: theme.palette.error.main,
  },
}));

const MotionBar = ({ deviceId }) => {
  const { classes } = useStyles();
  const segments = useSelector((state) => state.motion?.items?.[deviceId] || []);

  return (
    <span className={classes.root}>
      {segments.map((segment, segmentIndex) => (
        <span
          key={segmentIndex}
          style={{ flexGrow: segment.value, minWidth: segments.length > 16 ? 0 : 4 }}
          className={classes[segment.type]}
        />
      ))}
    </span>
  );
};

export default MotionBar;
