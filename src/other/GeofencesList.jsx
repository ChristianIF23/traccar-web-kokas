import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List, ListItemButton, ListItemText, Typography } from '@mui/material';

import { geofencesActions } from '../store';
import CollectionActions from '../settings/components/CollectionActions';
import { useCatchCallback } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()(() => ({
  list: {
    flexGrow: 1,
    overflow: 'auto',
    padding: '8px 4px',
  },
}));

const GeofencesList = ({ onGeofenceSelected }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.geofences?.items || {});

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetchOrThrow('/api/geofences');
    const data = await response.json();
    dispatch(geofencesActions.refresh(data));
  }, [dispatch]);

  const itemsList = Object.values(items);

  if (!itemsList.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        —
      </Typography>
    );
  }

  return (
    <List className={classes.list} disablePadding>
      {itemsList.map((item) => (
        <ListItemButton
          key={item.id}
          onClick={() => onGeofenceSelected?.(item.id)}
          sx={{
            mx: 1.5,
            my: 0.5,
            px: 2,
            py: 1,
            borderRadius: '10px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
            transition: 'all 0.15s ease-in-out',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
              borderColor: 'text.secondary',
            },
          }}
        >
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              noWrap: true,
            }}
          />
          <CollectionActions
            itemId={item.id}
            editPath="/settings/geofence"
            endpoint="geofences"
            onReload={refreshGeofences}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

export default GeofencesList;
