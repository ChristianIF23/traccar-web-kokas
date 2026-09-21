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
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme, { desktopPadding }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    root: {
      pointerEvents: 'none',
      position: 'fixed',
      zIndex: 12,
      left: '50%',
      [theme.breakpoints.up('md')]: {
        left: `calc(50% + ${desktopPadding}px / 2)`,
        bottom: 32,
      },
      [theme.breakpoints.down('md')]: {
        left: '50%',
        bottom: `calc(24px + ${theme.dimensions?.bottomBarHeight || 56}px)`,
      },
      transform: 'translateX(-50%)',
    },
    card: {
      pointerEvents: 'auto',
      width: theme.dimensions?.popupMaxWidth || 340,
      borderRadius: 22,
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
      backgroundColor: isDark ? alpha('#162447', 0.94) : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      boxShadow: isDark
        ? '0 20px 40px -8px rgba(0, 0, 0, 0.75)'
        : '0 16px 36px -6px rgba(22, 36, 71, 0.12)',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px 12px 18px',
      backgroundColor: isDark ? alpha('#0f172a', 0.5) : '#f8fafc',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
      cursor: 'move',
    },
    media: {
      height: theme.dimensions?.popupImageHeight || 140,
    },
    content: {
      padding: '14px 18px !important',
      maxHeight: theme.dimensions?.cardContentMaxHeight || 280,
      overflowY: 'auto',
    },
    actions: {
      justifyContent: 'space-between',
      padding: '8px 14px',
      backgroundColor: isDark ? alpha('#0f172a', 0.4) : '#f8fafc',
      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
    },
    actionButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      padding: 0,
      color: isDark ? '#94a3b8' : '#64748b',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: '#1d4ed8',
        backgroundColor: isDark ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 10,
      color: isDark ? '#94a3b8' : '#64748b',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: '#ef4444',
        backgroundColor: alpha('#ef4444', 0.1),
      },
    },
  };
});

const StatusRow = ({ name, content }) => (
  <TableRow>
    <TableCell
      sx={{
        py: 0.8,
        px: 0,
        pr: 1.5,
        width: '45%',
        borderBottom: (th) =>
          `1px dashed ${
            th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }`,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.82rem',
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        {name}
      </Typography>
    </TableCell>
    <TableCell
      align="right"
      sx={{
        py: 0.8,
        px: 0,
        borderBottom: (th) =>
          `1px dashed ${
            th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
          }`,
      }}
    >
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontSize: '0.84rem',
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {content}
      </Typography>
    </TableCell>
  </TableRow>
);

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

  const isOnline = device?.status === 'online';

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
                        backgroundColor: isOnline ? '#10b981' : '#94a3b8',
                        boxShadow: isOnline ? '0 0 6px #10b981' : 'none',
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: 'text.primary',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {device.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    className={classes.closeButton}
                    onClick={onClose}
                    onTouchStart={onClose}
                    title="Tutup"
                  >
                    <CloseRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </div>
              </CardMedia>

              {position && (
                <CardContent className={classes.content}>
                  <Table size="small">
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
                        <TableCell
                          colSpan={2}
                          sx={{
                            borderBottom: 'none',
                            pt: 1.5,
                            pb: 0.25,
                            textAlign: 'center',
                          }}
                        >
                          <Link
                            component={RouterLink}
                            to={`/position/${position.id}`}
                            underline="hover"
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#1d4ed8',
                              transition: 'color 0.2s ease',
                              '&:hover': { color: '#1e40af' },
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
                <Tooltip title={t('sharedExtra')} arrow>
                  <IconButton
                    className={classes.actionButton}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('reportReplay')} arrow>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <RouteRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('commandTitle')} arrow>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    <SendRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedEdit')} arrow>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditRoundedIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedRemove')} arrow>
                  <IconButton
                    className={classes.actionButton}
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                    sx={{
                      '&:hover': {
                        color: '#ef4444 !important',
                        backgroundColor: `${alpha('#ef4444', 0.1)} !important`,
                      },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
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
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                mt: 1,
                borderRadius: '16px',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(15, 23, 42, 0.08)'
                  }`,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#162447' : '#ffffff'),
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 16px 36px -4px rgba(0, 0, 0, 0.7)'
                    : '0 16px 36px -4px rgba(15, 23, 42, 0.12)',
                minWidth: 180,
                p: 0.75,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
            sx={{
              borderRadius: '10px',
              fontSize: '0.84rem',
              py: 1,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                color: '#1d4ed8',
              },
            }}
          >
            {t('linkLiveVideo')}
          </MenuItem>

          {!readonly && (
            <MenuItem
              onClick={handleGeofence}
              sx={{
                borderRadius: '10px',
                fontSize: '0.84rem',
                py: 1,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: (th) =>
                    th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                  color: '#1d4ed8',
                },
              }}
            >
              {t('sharedCreateGeofence')}
            </MenuItem>
          )}

          <Divider
            sx={{
              my: 0.5,
              borderColor: (th) =>
                th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
            }}
          />

          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.google.com/?q=${position.latitude},${position.longitude}`}
            sx={{
              borderRadius: '10px',
              fontSize: '0.84rem',
              py: 1,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                color: '#1d4ed8',
              },
            }}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
            sx={{
              borderRadius: '10px',
              fontSize: '0.84rem',
              py: 1,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                color: '#1d4ed8',
              },
            }}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.google.com/maps?q=&layer=c&cbll=${position.latitude},${position.longitude}&cbp=11,${position.course},0,0,0`}
            sx={{
              borderRadius: '10px',
              fontSize: '0.84rem',
              py: 1,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                color: '#1d4ed8',
              },
            }}
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
              sx={{
                borderRadius: '10px',
                fontSize: '0.84rem',
                py: 1,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: (th) =>
                    th.palette.mode === 'dark' ? alpha('#1d4ed8', 0.15) : 'rgba(29, 78, 216, 0.08)',
                  color: '#1d4ed8',
                },
              }}
            >
              {navigationAppTitle}
            </MenuItem>
          )}

          {!shareDisabled && !user.temporary && (
            <>
              <Divider
                sx={{
                  my: 0.5,
                  borderColor: (th) =>
                    th.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(15, 23, 42, 0.06)',
                }}
              />
              <MenuItem
                onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                sx={{
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  py: 1,
                  px: 1.5,
                  color: '#1d4ed8',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: (th) =>
                      th.palette.mode === 'dark'
                        ? alpha('#1d4ed8', 0.15)
                        : 'rgba(29, 78, 216, 0.08)',
                  },
                }}
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
