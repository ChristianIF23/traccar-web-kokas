import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Skeleton,
  Chip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import CellTowerIcon from '@mui/icons-material/CellTower';
import WifiIcon from '@mui/icons-material/Wifi';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f8fafc',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 960,
  },
}));

const getRssiColor = (rssi) => {
  if (rssi === undefined || rssi === null) return 'default';
  if (rssi >= -65) return 'success';
  if (rssi >= -80) return 'warning';
  return 'error';
};

const NetworkPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const { positionId } = useParams();

  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);

  useAsyncTask(
    async ({ signal }) => {
      if (positionId) {
        setLoading(true);
        try {
          const response = await fetchOrThrow(`/api/positions?id=${positionId}`, { signal });
          const positions = await response.json();
          if (positions.length > 0) {
            setItem(positions[0]);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Failed to fetch position data:', error);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [positionId],
  );

  const deviceName = useSelector((state) => {
    if (item?.deviceId) {
      return state.devices?.items?.[item.deviceId]?.name || null;
    }
    return null;
  });

  const cellTowers = item.network?.cellTowers || [];
  const wifiPoints = item.network?.wifiAccessPoints || [];

  return (
    <div className={classes.root}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {deviceName || (loading ? <Skeleton width={130} /> : t('positionNetwork'))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID Posisi: #{positionId}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={classes.content}>
        {/* Cell Towers Table */}
        <Box className={classes.wrapper}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box
              sx={{
                p: 2,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              }}
            >
              <CellTowerIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                Cell Towers (BTS)
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    '& .MuiTableCell-root': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      py: 1.8,
                      px: 2.5,
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  <TableCell>MCC</TableCell>
                  <TableCell>MNC</TableCell>
                  <TableCell>LAC</TableCell>
                  <TableCell>CID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))
                ) : cellTowers.length > 0 ? (
                  cellTowers.map((cell, idx) => (
                    <TableRow
                      key={cell.cellId || idx}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '& .MuiTableCell-root': {
                          py: 1.5,
                          px: 2.5,
                          fontSize: '0.875rem',
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                        {cell.mobileCountryCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                        {cell.mobileNetworkCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                        {cell.locationAreaCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                        {cell.cellId}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Wi-Fi Access Points Table */}
        <Box className={classes.wrapper}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box
              sx={{
                p: 2,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              }}
            >
              <WifiIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                Wi-Fi Access Points
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    '& .MuiTableCell-root': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      py: 1.8,
                      px: 2.5,
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  <TableCell>MAC Address</TableCell>
                  <TableCell>Signal Strength (RSSI)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))
                ) : wifiPoints.length > 0 ? (
                  wifiPoints.map((wifi, idx) => (
                    <TableRow
                      key={wifi.macAddress || idx}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '& .MuiTableCell-root': {
                          py: 1.5,
                          px: 2.5,
                          fontSize: '0.875rem',
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                        {wifi.macAddress}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${wifi.signalStrength} dBm`}
                          color={getRssiColor(wifi.signalStrength)}
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            fontFamily: 'monospace',
                            height: 22,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </div>
  );
};

export default NetworkPage;
