import { makeStyles } from 'tss-react/mui';
import { ListItemButton, ListItemIcon, ListItemText, alpha } from '@mui/material';
import { Link } from 'react-router-dom';

const useStyles = makeStyles()((theme) => ({
  button: {
    borderRadius: '10px',
    margin: theme.spacing(0.5, 1.5),
    padding: theme.spacing(0.9, 1.5),
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
      transform: 'translateX(3px)',
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 3.5,
        borderRadius: '0 4px 4px 0',
        backgroundColor: theme.palette.primary.main,
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
      '& .MuiListItemText-primary': {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
    },
  },
  icon: {
    minWidth: 38,
    color: theme.palette.text.secondary,
    transition: 'color 0.2s ease',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  },
  menuItemText: {
    whiteSpace: 'nowrap',
    '& .MuiListItemText-primary': {
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'color 0.2s ease, font-weight 0.2s ease',
    },
  },
}));

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
      <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
      <ListItemText primary={title} className={classes.menuItemText} />
    </ListItemButton>
  );
};

export default MenuItem;
