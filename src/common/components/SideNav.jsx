import { Fragment } from 'react';
import {
  List,
  ListItemText,
  ListItemIcon,
  Divider,
  ListSubheader,
  ListItemButton,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const SideNav = ({ routes }) => {
  const location = useLocation();

  return (
    <List disablePadding sx={{ py: 1.5 }}>
      {routes.map((route) =>
        route.subheader ? (
          <Fragment key={route.subheader}>
            <Divider sx={{ my: 1.5, opacity: 0.6 }} />
            <ListSubheader
              disableSticky
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: '28px',
                color: 'text.secondary',
                px: 2.5,
                backgroundColor: 'transparent',
              }}
            >
              {route.subheader}
            </ListSubheader>
          </Fragment>
        ) : (
          <ListItemButton
            key={route.href}
            component={Link}
            to={route.href}
            selected={location.pathname.match(route.match || route.href) !== null}
            sx={{
              mx: 1.5,
              my: 0.3,
              px: 1.5,
              py: 0.9,
              borderRadius: '10px',
              transition: 'all 0.15s ease-in-out',
              color: 'text.secondary',
              '& .MuiListItemIcon-root': {
                color: 'text.secondary',
                minWidth: 38,
                transition: 'color 0.15s ease-in-out',
              },
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                color: 'text.primary',
                '& .MuiListItemIcon-root': {
                  color: 'text.primary',
                },
              },
              '&.Mui-selected': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(59, 130, 246, 0.16)'
                    : 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
                fontWeight: 600,
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.22)'
                      : 'rgba(25, 118, 210, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon>{route.icon}</ListItemIcon>
            <ListItemText
              primary={route.name}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: location.pathname.match(route.match || route.href) !== null ? 600 : 500,
              }}
            />
          </ListItemButton>
        ),
      )}
    </List>
  );
};

export default SideNav;
