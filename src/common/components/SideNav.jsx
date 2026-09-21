import { Fragment } from 'react';
import {
  List,
  ListItemText,
  ListItemIcon,
  Divider,
  ListSubheader,
  ListItemButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

const SideNav = ({ routes }) => {
  const location = useLocation();

  return (
    <List disablePadding sx={{ py: 1.5 }}>
      {routes.map((route) =>
        route.subheader ? (
          <Fragment key={route.subheader}>
            <Divider
              sx={{
                my: 1.5,
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(15, 23, 42, 0.06)',
              }}
            />
            <ListSubheader
              disableSticky
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                lineHeight: '28px',
                color: (theme) => (theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8'),
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
              mx: 1.25,
              my: 0.4,
              px: 1.75,
              py: 1,
              borderRadius: '14px',
              transition: 'all 0.2s ease',
              color: (theme) => (theme.palette.mode === 'dark' ? '#94a3b8' : '#475569'),
              '& .MuiListItemIcon-root': {
                color: 'inherit',
                minWidth: 36,
                transition: 'color 0.2s ease',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.25rem',
                },
              },
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha('#1d4ed8', 0.12)
                    : 'rgba(29, 78, 216, 0.06)',
                color: '#1d4ed8',
                transform: 'translateX(3px)',
                '& .MuiListItemIcon-root': {
                  color: '#1d4ed8',
                },
              },
              '&.Mui-selected': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : 'rgba(29, 78, 216, 0.1)',
                color: '#1d4ed8',
                '& .MuiListItemIcon-root': {
                  color: '#1d4ed8',
                },
                '&:hover': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha('#1d4ed8', 0.28)
                      : 'rgba(29, 78, 216, 0.15)',
                },
              },
            }}
          >
            <ListItemIcon>{route.icon}</ListItemIcon>
            <ListItemText
              primary={route.name}
              primaryTypographyProps={{
                fontSize: '0.86rem',
                fontWeight: location.pathname.match(route.match || route.href) !== null ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            />
          </ListItemButton>
        ),
      )}
    </List>
  );
};

export default SideNav;
