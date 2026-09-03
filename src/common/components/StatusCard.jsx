import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  TableFooter,
  Link,
  Tooltip,
  Box,
  Divider,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.2, 1.5, 1.2, 2),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'move',
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    '& > div': {
      color: theme.palette.common.white,
      mixBlendMode: 'difference',
    },
  },
  content: {
    padding: theme.spacing(1.5, 2),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflowY: 'auto',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 6,
      paddingBottom: 6,
    },
    '& .MuiTableCell-sizeSmall:first-of-type': {
      paddingRight: theme.spacing(1.5),
      width: '45%',
    },
  },
  cell: {
    borderBottom: `1px dashed ${theme.palette.divider}`,
  },
  actions: {
    justifyContent: 'space-around',
    padding: theme.spacing(0.75, 1),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fcfcfd',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  actionButton: {
    borderRadius: '8px',
    padding: 6,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },
  },
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  },
}));

const StatusRow = ({ name, content }) => {
  const { classes } = useStyles({ desktopPadding: 0 });

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary" fontWeight={500}>
          {name}
        </Typography>
      </TableCell>
      <TableCell className={classes.cell} align="right">
        <Typography variant="body2" fontWeight={600} color="textPrimary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    'positionItems',
    'fixTime,address,speed,totalDistance',
  );

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position, t]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: 'auto', height: 'auto' }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <Card elevation={0} className={classes.card}>
              <CardMedia
                className={`draggable-header ${deviceImage ? classes.media : ''}`}
                image={deviceImage && `/api/media/${device.uniqueId}/${deviceImage}`}
              >
                <div className={classes.header}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: device.status === 'online' ? '#22c55e' : '#94a3b8',
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={700} color="textPrimary">
                      {device.name}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              </CardMedia>

              {position && (
                <CardContent className={classes.content}>
                  <Table size="small" className={classes.table}>
                    <TableBody>
                      {positionItems
                        .split(',')
                        .filter(
                          (key) =>
                            position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key),
                        )
                        .map((key) => (
                          <StatusRow
                            key={key}
                            name={positionAttributes[key]?.name || key}
                            content={
                              <PositionValue
                                position={position}
                                property={position.hasOwnProperty(key) ? key : null}
                                attribute={position.hasOwnProperty(key) ? null : key}
                              />
                            }
                          />
                        ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ borderBottom: 'none', pt: 1.5, textAlign: 'center' }}>
                          <Link
                            component={RouterLink}
                            to={`/position/${position.id}`}
                            sx={{
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {t('sharedShowDetails')}
                          </Link>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              )}

              <CardActions className={classes.actions} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    className={classes.actionButton}
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <PendingIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('reportReplay')}>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <RouteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('commandTitle')}>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedEdit')}>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedRemove')}>
                  <IconButton
                    className={classes.actionButton}
                    color="error"
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Rnd>
        )}
      </div>

      {position && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 170,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
              p: 0.5,
            },
          }}
        >
          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
            sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {t('linkLiveVideo')}
          </MenuItem>

          {!readonly && (
            <MenuItem onClick={handleGeofence} sx={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              {t('sharedCreateGeofence')}
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.google.com/?q=${position.latitude},${position.longitude}`}
            sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
            sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.google.com/maps?q=&layer=c&cbll=${position.latitude},${position.longitude}&cbp=11,${position.course},0,0,0`}
            sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {t('linkStreetView')}
          </MenuItem>

          {navigationAppTitle && navigationAppLink && (
            <MenuItem
              component="a"
              target="_blank"
              href={navigationAppLink
                .replace('{latitude}', position.latitude)
                .replace('{longitude}', position.longitude)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              {navigationAppTitle}
            </MenuItem>
          )}

          {!shareDisabled && !user.temporary && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                sx={{ borderRadius: '8px', fontSize: '0.85rem', color: 'primary.main', fontWeight: 600 }}
              >
                {t('sharedShare')}
              </MenuItem>
            </>
          )}
        </Menu>
      )}

      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
