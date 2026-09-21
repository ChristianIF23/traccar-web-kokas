import { makeStyles } from 'tss-react/mui';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles()((theme) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    button: {
      borderRadius: 14,
      margin: theme.spacing(0.5, 1),
      padding: theme.spacing(1, 1.75),
      position: 'relative',
      transition: 'all 0.2s ease',
      color: isDark ? '#94a3b8' : '#475569',
      '&:hover': {
        color: '#1d4ed8',
        backgroundColor: isDark ? alpha('#1d4ed8', 0.12) : 'rgba(29, 78, 216, 0.06)',
        transform: 'translateX(3px)',
        '& .MuiListItemIcon-root': {
          color: '#1d4ed8',
        },
      },
      '&.Mui-selected': {
        color: '#1d4ed8',
        backgroundColor: isDark ? alpha('#1d4ed8', 0.2) : 'rgba(29, 78, 216, 0.1)',
        '&:hover': {
          backgroundColor: isDark ? alpha('#1d4ed8', 0.28) : 'rgba(29, 78, 216, 0.15)',
        },
        '& .MuiListItemIcon-root': {
          color: '#1d4ed8',
        },
        '& .MuiListItemText-primary': {
          color: '#1d4ed8',
          fontWeight: 700,
        },
      },
    },
    icon: {
      minWidth: 36,
      color: 'inherit',
      transition: 'color 0.2s ease',
      '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
      },
    },
    menuItemText: {
      whiteSpace: 'nowrap',
      '& .MuiListItemText-primary': {
        fontSize: '0.86rem',
        fontWeight: 500,
        transition: 'color 0.2s ease, font-weight 0.2s ease',
      },
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: '20%',
      bottom: '20%',
      width: 3.5,
      borderRadius: '0 4px 4px 0',
      backgroundColor: '#1d4ed8',
    },
  };
});

const MenuItem = ({ title, link, icon, selected }) => {
  const { classes } = useStyles();

  return (
    <ListItemButton
      key={link}
      component={Link}
      to={link}
      selected={selected}
      className={classes.button}
    >
      {selected && <div className={classes.activeIndicator} />}
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText primary={title} className={classes.menuItemText} />
    </ListItemButton>
  );
};

export default MenuItem;
