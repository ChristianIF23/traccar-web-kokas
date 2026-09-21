import { useState, useEffect, useRef } from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  handle: {
    height: 12,
    cursor: 'ns-resize',
    backgroundColor: 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    transition: 'background-color 0.2s ease',
    '&:hover, &.Mui-active': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme.palette.divider,
      transform: 'translateY(-50%)',
      zIndex: 1,
    },
  },
  gripBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.text.disabled,
    zIndex: 2,
    transition: 'background-color 0.2s ease, width 0.2s ease',
    // Perbaikan selector CSS agar efisien dan terbaca
    '.Mui-active &, div:hover > &': {
      backgroundColor: theme.palette.primary.main,
      width: 44,
    },
  },
}));

const ResizeHandle = () => {
  const { classes } = useStyles();
  const [isDragging, setIsDragging] = useState(false);
  const animationFrameRef = useRef(null);

  const onPointerDown = (event) => {
    event.preventDefault();
    setIsDragging(true);

    const container = event.currentTarget.parentElement;
    if (!container) return;

    const containerRectangle = container.getBoundingClientRect();

    const onMove = (moveEvent) => {
      // Menggunakan requestAnimationFrame agar penggeseran terasa smooth
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const offset = moveEvent.clientY - containerRectangle.top;
        const percentage = Math.max(10, Math.min(90, (offset / containerRectangle.height) * 100));
        document.documentElement.style.setProperty('--report-map-height', `${percentage}%`);
      });
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Cleanup jika komponen ter-unmount saat dragging
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`${classes.handle} ${isDragging ? 'Mui-active' : ''}`}
      onPointerDown={onPointerDown}
    >
      <span className={classes.gripBar} />
    </div>
  );
};

export default ResizeHandle;
